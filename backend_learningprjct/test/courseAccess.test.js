// Regla de acceso a cursos: función pura, una prueba por cada fila de la tabla del diseño.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const { resolveAccess, allows, redactCourse } = await import('../src/service/courseAccess.js');

const COURSE = '69d50406663e8648d7ee1f08';
const OTRO_CURSO = '64b0000000000000000000aa';
const ANA = '64b000000000000000000001';
const LUIS = '64b000000000000000000002';
const START = new Date('2026-11-30T00:00:00Z');
const END = new Date('2027-03-31T00:00:00Z');
const DURING = new Date('2027-01-15T12:00:00Z');
const BEFORE = new Date('2026-11-15T12:00:00Z');
const AFTER = new Date('2027-04-10T12:00:00Z');

const privateCourse = { _id: COURSE, accessMode: 'private' };
const publicCourse = { _id: COURSE, accessMode: 'public' };
const legacyCourse = { _id: COURSE }; // sin accessMode: cursos anteriores a la migración
const ana = { id: ANA, role: 'usuario' };

const cohort = (extra = {}) => ({
  course: COURSE,
  startsAt: START,
  endsAt: END,
  afterEnd: 'readonly',
  members: [{ user: ANA, email: 'ana@x.es', status: 'active' }],
  ...extra,
});

const access = (user, course, cohorts, now = DURING) => resolveAccess({ user, course, cohorts, now });

describe('resolveAccess', () => {
  test('admin entra con acceso completo aunque el curso sea privado y no tenga cohortes', () => {
    assert.deepEqual(access({ id: LUIS, role: 'admin' }, privateCourse, []), { level: 'full', reason: 'admin' });
    assert.equal(access({ id: LUIS, role: 'superadmin' }, privateCourse, []).level, 'full');
  });

  test('curso público: full/public para cualquiera, también sin sesión', () => {
    assert.deepEqual(access(null, publicCourse, []), { level: 'full', reason: 'public' });
    assert.deepEqual(access(ana, publicCourse, []), { level: 'full', reason: 'public' });
  });

  test('curso sin accessMode se trata como público', () => {
    assert.deepEqual(access(null, legacyCourse, []), { level: 'full', reason: 'public' });
  });

  test('privado sin sesión → denied/anonymous', () => {
    assert.deepEqual(access(null, privateCourse, [cohort()]), { level: 'denied', reason: 'anonymous' });
  });

  test('privado sin membresía → denied/not-member', () => {
    assert.deepEqual(access({ id: LUIS, role: 'usuario' }, privateCourse, [cohort()]), { level: 'denied', reason: 'not-member' });
  });

  test('miembro pending con el mismo user no cuenta', () => {
    const c = cohort({ members: [{ user: ANA, email: 'ana@x.es', status: 'pending' }] });
    assert.equal(access(ana, privateCourse, [c]).reason, 'not-member');
  });

  test('miembro de una cohorte de otro curso → denied', () => {
    assert.equal(access(ana, privateCourse, [cohort({ course: OTRO_CURSO })]).reason, 'not-member');
  });

  test('miembro activo antes de startsAt → denied/reserved con la fecha', () => {
    assert.deepEqual(access(ana, privateCourse, [cohort()], BEFORE), { level: 'denied', reason: 'reserved', startsAt: START, endsAt: END });
  });

  test('miembro activo dentro de la ventana → full/member', () => {
    assert.deepEqual(access(ana, privateCourse, [cohort()]), { level: 'full', reason: 'member', startsAt: START, endsAt: END });
  });

  test('now === startsAt ya es full', () => {
    assert.equal(access(ana, privateCourse, [cohort()], new Date(START)).level, 'full');
  });

  test('now === endsAt ya es fin de la ventana (readonly)', () => {
    assert.deepEqual(access(ana, privateCourse, [cohort()], new Date(END)), { level: 'readonly', reason: 'ended', startsAt: START, endsAt: END });
  });

  test('tras endsAt con afterEnd=revoke → denied/revoked', () => {
    assert.equal(access(ana, privateCourse, [cohort({ afterEnd: 'revoke' })], AFTER).reason, 'revoked');
    assert.equal(access(ana, privateCourse, [cohort({ afterEnd: 'revoke' })], AFTER).level, 'denied');
  });

  test('con varias cohortes gana la mejor: full sobre revoked', () => {
    const vieja = cohort({ startsAt: new Date('2025-01-01'), endsAt: new Date('2025-06-01'), afterEnd: 'revoke' });
    assert.equal(access(ana, privateCourse, [vieja, cohort()]).level, 'full');
  });

  test('con varias cohortes: readonly gana a reserved', () => {
    const vieja = cohort({ startsAt: new Date('2025-01-01'), endsAt: new Date('2025-06-01') });
    const futura = cohort({ startsAt: new Date('2027-09-01'), endsAt: new Date('2027-12-01') });
    assert.equal(access(ana, privateCourse, [futura, vieja]).reason, 'ended');
  });

  test('con varias cohortes: reserved gana a revoked', () => {
    const vieja = cohort({ startsAt: new Date('2025-01-01'), endsAt: new Date('2025-06-01'), afterEnd: 'revoke' });
    const futura = cohort({ startsAt: new Date('2027-09-01'), endsAt: new Date('2027-12-01') });
    assert.equal(access(ana, privateCourse, [vieja, futura]).reason, 'reserved');
  });

  test('ids como ObjectId-like (con toString) también comparan', () => {
    const oid = (s) => ({ toString: () => s });
    const c = cohort({ course: oid(COURSE), members: [{ user: oid(ANA), email: 'ana@x.es', status: 'active' }] });
    assert.equal(access({ id: oid(ANA), role: 'usuario' }, { _id: oid(COURSE), accessMode: 'private' }, [c]).level, 'full');
  });
});

describe('allows', () => {
  test('read admite full y readonly', () => {
    assert.equal(allows('full', 'read'), true);
    assert.equal(allows('readonly', 'read'), true);
    assert.equal(allows('denied', 'read'), false);
  });
  test('write solo full', () => {
    assert.equal(allows('full', 'write'), true);
    assert.equal(allows('readonly', 'write'), false);
    assert.equal(allows('denied', 'write'), false);
  });
  test('acción desconocida → false (fail-closed)', () => {
    assert.equal(allows('full', 'borrar-todo'), false);
  });
});

describe('redactCourse', () => {
  const course = {
    _id: COURSE,
    title: 'Carbono',
    temas: [{
      _id: 't1',
      titulo: 'Tema 1',
      materiales: [{ _id: 'm1', tipo: 'pdf', titulo: 'Guía', archivo: 'https://res.cloudinary.com/demo/raw/upload/guia.pdf', archivoEn: 'https://res.cloudinary.com/demo/raw/upload/guide.pdf' }],
      actividadesOptativas: [{ _id: 'a1', tipo: 'pdf', titulo: 'Extra', archivo: 'https://res.cloudinary.com/demo/raw/upload/extra.pdf' }],
    }],
  };

  test('quita todas las URLs de materiales y actividades', () => {
    const out = redactCourse(course);
    assert.equal(JSON.stringify(out).includes('cloudinary'), false);
  });
  test('conserva temario, títulos y conteos', () => {
    const out = redactCourse(course);
    assert.equal(out.title, 'Carbono');
    assert.equal(out.temas[0].titulo, 'Tema 1');
    assert.deepEqual(out.temas[0].materiales[0], { _id: 'm1', tipo: 'pdf', titulo: 'Guía' });
    assert.equal(out.temas[0].actividadesOptativas.length, 1);
  });
  test('no muta el original', () => {
    redactCourse(course);
    assert.ok(course.temas[0].materiales[0].archivo);
  });
  test('curso sin temas no rompe', () => {
    assert.deepEqual(redactCourse({ _id: COURSE }), { _id: COURSE });
  });
});
