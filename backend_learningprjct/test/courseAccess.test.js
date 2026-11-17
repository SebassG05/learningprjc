// Regla de acceso a cursos: función pura, una prueba por cada fila de la tabla del diseño.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const { resolveAccess, allows, redactCourse, isCourseTeacher, canPublish, canModerate, publicAccess } = await import('../src/service/courseAccess.js');

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
    assert.deepEqual(access({ id: LUIS, role: 'admin' }, privateCourse, []), { level: 'full', reason: 'admin', teacher: false });
    assert.equal(access({ id: LUIS, role: 'superadmin' }, privateCourse, []).level, 'full');
  });

  test('curso público: full/public para cualquiera, también sin sesión', () => {
    assert.deepEqual(access(null, publicCourse, []), { level: 'full', reason: 'public', teacher: false });
    assert.deepEqual(access(ana, publicCourse, []), { level: 'full', reason: 'public', teacher: false });
  });

  test('curso sin accessMode se trata como público', () => {
    assert.deepEqual(access(null, legacyCourse, []), { level: 'full', reason: 'public', teacher: false });
  });

  test('privado sin sesión → denied/anonymous', () => {
    assert.deepEqual(access(null, privateCourse, [cohort()]), { level: 'denied', reason: 'anonymous', teacher: false });
  });

  test('privado sin membresía → denied/not-member', () => {
    assert.deepEqual(access({ id: LUIS, role: 'usuario' }, privateCourse, [cohort()]), { level: 'denied', reason: 'not-member', teacher: false });
  });

  test('miembro pending con el mismo user no cuenta', () => {
    const c = cohort({ members: [{ user: ANA, email: 'ana@x.es', status: 'pending' }] });
    assert.equal(access(ana, privateCourse, [c]).reason, 'not-member');
  });

  test('miembro de una cohorte de otro curso → denied', () => {
    assert.equal(access(ana, privateCourse, [cohort({ course: OTRO_CURSO })]).reason, 'not-member');
  });

  test('miembro activo antes de startsAt → denied/reserved con la fecha', () => {
    assert.deepEqual(access(ana, privateCourse, [cohort()], BEFORE), { level: 'denied', reason: 'reserved', startsAt: START, endsAt: END, teacher: false });
  });

  test('miembro activo dentro de la ventana → full/member', () => {
    assert.deepEqual(access(ana, privateCourse, [cohort()]), { level: 'full', reason: 'member', startsAt: START, endsAt: END, teacher: false });
  });

  test('now === startsAt ya es full', () => {
    assert.equal(access(ana, privateCourse, [cohort()], new Date(START)).level, 'full');
  });

  test('now === endsAt ya es fin de la ventana (readonly)', () => {
    assert.deepEqual(access(ana, privateCourse, [cohort()], new Date(END)), { level: 'readonly', reason: 'ended', startsAt: START, endsAt: END, teacher: false });
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

describe('profesores del curso', () => {
  const teacherRow = (userId, status = 'active') => ({ email: 'p@x.es', status, userId });
  const withTeachers = (course, ...rows) => ({ ...course, profesores: rows });
  const prof = { id: LUIS, role: 'usuario' };

  test('isCourseTeacher: solo una fila activa con el userId del visitante', () => {
    assert.equal(isCourseTeacher(prof, withTeachers(privateCourse, teacherRow(LUIS))), true);
    assert.equal(isCourseTeacher(prof, withTeachers(privateCourse, teacherRow(LUIS, 'pending'))), false);
    assert.equal(isCourseTeacher(prof, withTeachers(privateCourse, teacherRow(null, 'pending'))), false);
    assert.equal(isCourseTeacher(prof, withTeachers(privateCourse, teacherRow(ANA))), false);
    assert.equal(isCourseTeacher(null, withTeachers(privateCourse, teacherRow(LUIS))), false);
    assert.equal(isCourseTeacher(prof, privateCourse), false);
  });

  test('profesor activo de curso privado sin cohorte → readonly/teacher', () => {
    const r = access(prof, withTeachers(privateCourse, teacherRow(LUIS)), []);
    assert.deepEqual(r, { level: 'readonly', reason: 'teacher', teacher: true });
  });

  test('profesor pendiente (userId null) → not-member', () => {
    const r = access(prof, withTeachers(privateCourse, teacherRow(null, 'pending')), []);
    assert.equal(r.reason, 'not-member');
    assert.notEqual(r.teacher, true);
  });

  test('profesor de otro curso (este curso no lo lista) → not-member', () => {
    const r = access(prof, privateCourse, []);
    assert.equal(r.reason, 'not-member');
    assert.notEqual(r.teacher, true);
  });

  test('profesor que además es miembro activo → full/member con teacher', () => {
    const c = cohort({ members: [{ user: LUIS, email: 'l@x.es', status: 'active' }] });
    const r = access(prof, withTeachers(privateCourse, teacherRow(LUIS)), [c]);
    assert.equal(r.level, 'full');
    assert.equal(r.reason, 'member');
    assert.equal(r.teacher, true);
  });

  test('profesor con cohorte ya terminada: la lectura de profesor gana a ended', () => {
    const c = cohort({ members: [{ user: LUIS, email: 'l@x.es', status: 'active' }] });
    const r = access(prof, withTeachers(privateCourse, teacherRow(LUIS)), [c], AFTER);
    assert.equal(r.reason, 'teacher');
    assert.equal(r.level, 'readonly');
  });

  test('profesor cuya única cohorte está reservada o revocada → readonly/teacher', () => {
    const mine = [{ user: LUIS, email: 'l@x.es', status: 'active' }];
    const course = withTeachers(privateCourse, teacherRow(LUIS));
    assert.deepEqual(access(prof, course, [cohort({ members: mine })], BEFORE), { level: 'readonly', reason: 'teacher', teacher: true });
    assert.deepEqual(access(prof, course, [cohort({ members: mine, afterEnd: 'revoke' })], AFTER), { level: 'readonly', reason: 'teacher', teacher: true });
  });

  test('curso público → full/public con teacher', () => {
    const r = access(prof, withTeachers(publicCourse, teacherRow(LUIS)), []);
    assert.deepEqual(r, { level: 'full', reason: 'public', teacher: true });
  });

  test('admin no profesor → full/admin sin teacher; admin profesor → teacher', () => {
    const admin = { id: LUIS, role: 'admin' };
    assert.notEqual(access(admin, privateCourse, []).teacher, true);
    assert.equal(access(admin, withTeachers(privateCourse, teacherRow(LUIS)), []).teacher, true);
  });

  test('publicAccess incluye teacher solo si es true', () => {
    assert.equal('teacher' in publicAccess({ level: 'full', reason: 'member' }), false);
    assert.equal('teacher' in publicAccess({ level: 'full', reason: 'member', teacher: false }), false);
    assert.equal(publicAccess({ level: 'readonly', reason: 'teacher', teacher: true }).teacher, true);
  });

  test('canPublish: falso para readonly/ended, verdadero para readonly/teacher, full y admin', () => {
    assert.equal(canPublish({ level: 'readonly', reason: 'ended' }, ana), false);
    assert.equal(canPublish({ level: 'readonly', reason: 'teacher', teacher: true }, prof), true);
    assert.equal(canPublish({ level: 'full', reason: 'member' }, ana), true);
    assert.equal(canPublish({ level: 'denied', reason: 'not-member' }, { id: LUIS, role: 'admin' }), true);
    assert.equal(canPublish({ level: 'denied', reason: 'not-member' }, null), false);
  });

  test('canModerate: falso para miembro, verdadero para profesor y admin', () => {
    assert.equal(canModerate({ level: 'full', reason: 'member' }, ana), false);
    assert.equal(canModerate({ level: 'full', reason: 'member', teacher: true }, prof), true);
    assert.equal(canModerate({ level: 'full', reason: 'member' }, { id: LUIS, role: 'superadmin' }), true);
  });
});
