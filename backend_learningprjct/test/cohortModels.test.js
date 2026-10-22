// Modelos de cohortes: forma de los datos, normalización de emails e índices.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const { normalizeEmail, isValidEmail } = await import('../src/utils/email.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Cohort } = await import('../src/models/Cohort.js');
const { default: CohortInvite } = await import('../src/models/CohortInvite.js');
const { default: CourseInterest } = await import('../src/models/CourseInterest.js');

const COURSE = '69d50406663e8648d7ee1f08';
const cohortData = (extra = {}) => ({
  name: 'Carbono – Noviembre 2026',
  course: COURSE,
  startsAt: new Date('2026-11-30T00:00:00Z'),
  endsAt: new Date('2027-03-31T00:00:00Z'),
  ...extra,
});

describe('normalizeEmail / isValidEmail', () => {
  test('quita espacios y pasa a minúsculas', () => {
    assert.equal(normalizeEmail('  Ana@X.es '), 'ana@x.es');
  });
  test('valores no texto dan cadena vacía', () => {
    assert.equal(normalizeEmail(undefined), '');
    assert.equal(normalizeEmail(null), '');
  });
  test('valida forma básica', () => {
    assert.equal(isValidEmail('ana@x.es'), true);
    assert.equal(isValidEmail('mal'), false);
    assert.equal(isValidEmail('a@b'), false);
    assert.equal(isValidEmail('a b@x.es'), false);
  });
});

describe('Course.accessMode', () => {
  test('por defecto es public y sin cohortes', () => {
    const c = new Course({ title: 't', description: 'd' });
    assert.equal(c.accessMode, 'public');
    assert.deepEqual([...c.cohorts], []);
  });
  test('rechaza valores fuera de public/private', () => {
    const c = new Course({ title: 't', description: 'd', accessMode: 'secreto' });
    assert.ok(c.validateSync()?.errors?.accessMode);
  });
});

describe('Cohort', () => {
  test('datos válidos validan; afterEnd por defecto readonly', () => {
    const c = new Cohort(cohortData());
    assert.equal(c.validateSync(), undefined);
    assert.equal(c.afterEnd, 'readonly');
  });
  test('afterEnd solo admite revoke o readonly', () => {
    assert.ok(new Cohort(cohortData({ afterEnd: 'otro' })).validateSync()?.errors?.afterEnd);
  });
  test('endsAt debe ser posterior a startsAt', () => {
    const c = new Cohort(cohortData({ endsAt: new Date('2026-11-01T00:00:00Z') }));
    assert.ok(c.validateSync()?.errors?.endsAt);
  });
  test('normaliza el email de los miembros', async () => {
    const c = new Cohort(cohortData({ members: [{ email: '  Ana@X.es ', source: 'email' }] }));
    await c.validate();
    assert.equal(c.members[0].email, 'ana@x.es');
    assert.equal(c.members[0].status, 'pending');
    assert.equal(c.members[0].user, null);
  });
  test('rechaza un miembro con email inválido', () => {
    const c = new Cohort(cohortData({ members: [{ email: 'mal', source: 'email' }] }));
    assert.ok(c.validateSync());
  });
  test('tiene índices por curso, por usuario y por email de miembro', () => {
    const keys = Cohort.schema.indexes().map(([k]) => Object.keys(k).join(','));
    assert.ok(keys.includes('course'));
    assert.ok(keys.includes('members.user'));
    assert.ok(keys.includes('members.email'));
  });
});

describe('CohortInvite', () => {
  test('guarda solo el hash del token, único', () => {
    assert.equal(CohortInvite.schema.path('token'), undefined);
    assert.equal(CohortInvite.schema.path('tokenHash').options.unique, true);
  });
  test('maxUses por defecto 1 y uses 0', () => {
    const i = new CohortInvite({ cohort: COURSE, tokenHash: 'a'.repeat(64), expiresAt: new Date(), createdBy: COURSE });
    assert.equal(i.maxUses, 1);
    assert.equal(i.uses, 0);
    assert.equal(i.validateSync(), undefined);
  });
  test('maxUses mínimo 1', () => {
    const i = new CohortInvite({ cohort: COURSE, tokenHash: 'a'.repeat(64), expiresAt: new Date(), createdBy: COURSE, maxUses: 0 });
    assert.ok(i.validateSync()?.errors?.maxUses);
  });
});

describe('CourseInterest', () => {
  test('índice único por curso y email', () => {
    const idx = CourseInterest.schema.indexes().find(([k]) => k.course === 1 && k.email === 1);
    assert.ok(idx);
    assert.equal(idx[1].unique, true);
  });
});
