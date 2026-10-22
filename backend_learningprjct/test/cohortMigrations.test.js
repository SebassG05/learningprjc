// Migración de accessMode y alta de la cohorte de Carbono: simulacro por defecto, idempotentes, con vuelta atrás.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);

const { default: mongoose } = await import('mongoose');
const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Cohort } = await import('../src/models/Cohort.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { migrateAccessMode, setupCourseCohort, rollbackCourseCohort } = await import('../src/service/cohortMigrations.js');

const CARBONO = '69d50406663e8648d7ee1f08';
const START = new Date('2026-11-30T00:00:00+01:00');
const END = new Date('2027-03-31T23:59:00+02:00');
const plan = (extra = {}) => ({ courseId: CARBONO, name: 'Carbono – Noviembre 2026', startsAt: START, endsAt: END, afterEnd: 'readonly', ...extra });

describe('migraciones de cohortes', () => {
  let db;
  before(async () => {
    db = await startMemoryMongo();
  });
  after(() => db.stop());
  beforeEach(() => db.reset());

  // Cursos tal como están hoy en producción: sin accessMode ni cohorts
  const legacyCourse = async (_id, title = 'Curso') => {
    await Course.collection.insertOne({ _id: new mongoose.Types.ObjectId(_id), title, description: 'd', isOpen: true, temas: [] });
  };

  describe('migrateAccessMode', () => {
    test('simulacro: cuenta los cursos sin accessMode y no escribe', async () => {
      await legacyCourse(CARBONO);
      await legacyCourse('64b0000000000000000000aa');
      const r = await migrateAccessMode({ apply: false });
      assert.deepEqual(r, { pending: 2, updated: 0 });
      assert.equal(await Course.collection.countDocuments({ accessMode: { $exists: true } }), 0);
    });

    test('apply: pone public y cohorts vacío; la segunda vez no hace nada', async () => {
      await legacyCourse(CARBONO);
      assert.deepEqual(await migrateAccessMode({ apply: true }), { pending: 1, updated: 1 });
      const raw = await Course.collection.findOne({});
      assert.equal(raw.accessMode, 'public');
      assert.deepEqual(raw.cohorts, []);
      assert.deepEqual(await migrateAccessMode({ apply: true }), { pending: 0, updated: 0 });
    });

    test('no toca un curso que ya es privado', async () => {
      await legacyCourse(CARBONO);
      await Course.collection.updateOne({}, { $set: { accessMode: 'private' } });
      await migrateAccessMode({ apply: true });
      assert.equal((await Course.collection.findOne({})).accessMode, 'private');
    });
  });

  describe('setupCourseCohort', () => {
    test('simulacro: describe lo que haría y no escribe', async () => {
      await legacyCourse(CARBONO, 'Modelización Dinámica de Carbono');
      const r = await setupCourseCohort(plan({ apply: false }));
      assert.equal(r.course.title, 'Modelización Dinámica de Carbono');
      assert.equal(r.cohort.action, 'create');
      assert.equal(r.accessMode.from, 'public');
      assert.equal(r.accessMode.to, 'private');
      assert.equal(await Cohort.countDocuments(), 0);
      assert.equal((await Course.collection.findOne({})).accessMode, undefined);
    });

    test('apply: crea la cohorte, la enlaza y hace privado el curso', async () => {
      await legacyCourse(CARBONO);
      const r = await setupCourseCohort(plan({ apply: true }));
      assert.equal(r.cohort.action, 'create');
      const cohort = await Cohort.findOne().lean();
      assert.equal(cohort.name, 'Carbono – Noviembre 2026');
      assert.equal(cohort.afterEnd, 'readonly');
      assert.equal(cohort.startsAt.getTime(), START.getTime());
      const course = await Course.findById(CARBONO).lean();
      assert.equal(course.accessMode, 'private');
      assert.deepEqual(course.cohorts.map(String), [String(cohort._id)]);
    });

    test('idempotente: la segunda ejecución reutiliza la cohorte (sin duplicar) y actualiza fechas', async () => {
      await legacyCourse(CARBONO);
      await setupCourseCohort(plan({ apply: true }));
      const later = new Date('2026-12-01T09:00:00+01:00');
      const r = await setupCourseCohort(plan({ apply: true, startsAt: later }));
      assert.equal(r.cohort.action, 'update');
      assert.equal(await Cohort.countDocuments(), 1);
      assert.equal((await Cohort.findOne().lean()).startsAt.getTime(), later.getTime());
      assert.equal((await Course.findById(CARBONO).lean()).cohorts.length, 1);
    });

    test('añade emails como pendientes, sin duplicar, e informa de los inválidos', async () => {
      await legacyCourse(CARBONO);
      const r = await setupCourseCohort(plan({ apply: true, emails: 'a@x.es\nA@x.es, mal' }));
      assert.deepEqual(r.members, { added: ['a@x.es'], existing: [], invalid: ['mal'] });
      const again = await setupCourseCohort(plan({ apply: true, emails: 'a@x.es' }));
      assert.deepEqual(again.members.existing, ['a@x.es']);
      const ms = (await Cohort.findOne().lean()).members;
      assert.equal(ms.length, 1);
      assert.equal(ms[0].status, 'pending');
    });

    test('lista las inscripciones existentes (que perderán el acceso) sin tocarlas', async () => {
      await legacyCourse(CARBONO);
      const u = await fx.createUser({ email: 'prueba@x.es' });
      await UserProgress.create({ userId: u._id, courseId: CARBONO });
      const r = await setupCourseCohort(plan({ apply: true }));
      assert.deepEqual(r.enrollmentsWithoutCohort, ['prueba@x.es']);
      assert.equal(await UserProgress.countDocuments(), 1);
    });

    test('curso inexistente o fechas incoherentes → error y nada escrito', async () => {
      await assert.rejects(setupCourseCohort(plan({ apply: true })), /no existe/);
      await legacyCourse(CARBONO);
      await assert.rejects(setupCourseCohort(plan({ apply: true, endsAt: new Date('2026-01-01') })), /posterior/);
      assert.equal(await Cohort.countDocuments(), 0);
    });
  });

  describe('rollbackCourseCohort', () => {
    test('vuelve el curso a público y conserva la cohorte', async () => {
      await legacyCourse(CARBONO);
      await setupCourseCohort(plan({ apply: true }));
      const r = await rollbackCourseCohort({ courseId: CARBONO, apply: true });
      assert.deepEqual(r.accessMode, { from: 'private', to: 'public' });
      assert.equal((await Course.findById(CARBONO).lean()).accessMode, 'public');
      assert.equal(await Cohort.countDocuments(), 1);
    });
  });
});
