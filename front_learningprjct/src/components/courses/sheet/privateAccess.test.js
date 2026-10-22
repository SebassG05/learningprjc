import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { accessView, ctaState, formatCohortDate } from './privateAccess.js';

const priv = (access) => ({ accessMode: 'private', ...(access && { access }) });
const START = '2026-11-30T00:00:00.000Z';
const END = '2027-03-31T00:00:00.000Z';

describe('accessView', () => {
  test('curso público (o sin accessMode) → open', () => {
    assert.deepEqual(accessView({ accessMode: 'public' }), { view: 'open' });
    assert.deepEqual(accessView({}), { view: 'open' });
  });
  test('privado sin access (llegó del listado) → checking', () => {
    assert.deepEqual(accessView(priv()), { view: 'checking' });
  });
  test('sin sesión → invite-only y pide iniciar sesión', () => {
    assert.deepEqual(accessView(priv({ level: 'denied', reason: 'anonymous' })), { view: 'invite-only', needsLogin: true });
  });
  test('con sesión sin cohorte → invite-only sin pedir login', () => {
    assert.deepEqual(accessView(priv({ level: 'denied', reason: 'not-member' })), { view: 'invite-only', needsLogin: false });
  });
  test('plaza reservada → reserved con la fecha de inicio', () => {
    assert.deepEqual(accessView(priv({ level: 'denied', reason: 'reserved', startsAt: START, endsAt: END })), { view: 'reserved', startsAt: START });
  });
  test('miembro en fechas o admin → member', () => {
    assert.deepEqual(accessView(priv({ level: 'full', reason: 'member', startsAt: START, endsAt: END })), { view: 'member' });
    assert.deepEqual(accessView(priv({ level: 'full', reason: 'admin' })), { view: 'member' });
  });
  test('edición terminada en solo lectura → readonly con la fecha de fin', () => {
    assert.deepEqual(accessView(priv({ level: 'readonly', reason: 'ended', startsAt: START, endsAt: END })), { view: 'readonly', endsAt: END });
  });
  test('edición terminada y retirada → ended', () => {
    assert.deepEqual(accessView(priv({ level: 'denied', reason: 'revoked', endsAt: END })), { view: 'ended' });
  });
  test('cualquier respuesta desconocida → invite-only (fail-closed)', () => {
    assert.equal(accessView(priv({ level: 'raro' })).view, 'invite-only');
  });
});

describe('ctaState', () => {
  test('open y member no cambian el estado de siempre', () => {
    assert.equal(ctaState({ view: 'open' }, 'enroll'), 'enroll');
    assert.equal(ctaState({ view: 'member' }, 'reserved'), 'reserved');
  });
  test('sin invitación o edición retirada → interest (o interested si ya se apuntó)', () => {
    assert.equal(ctaState({ view: 'invite-only' }, 'enroll'), 'interest');
    assert.equal(ctaState({ view: 'ended' }, 'enroll'), 'interest');
    assert.equal(ctaState({ view: 'invite-only' }, 'enroll', { interested: true }), 'interested');
  });
  test('plaza reservada → cohort-reserved', () => {
    assert.equal(ctaState({ view: 'reserved' }, 'enroll'), 'cohort-reserved');
  });
  test('solo lectura: inscrito entra al aula; sin inscribir, edición cerrada', () => {
    assert.equal(ctaState({ view: 'readonly' }, 'enrolled'), 'enrolled');
    assert.equal(ctaState({ view: 'readonly' }, 'enroll'), 'closed');
  });
  test('comprobando → checking', () => {
    assert.equal(ctaState({ view: 'checking' }, 'enroll'), 'checking');
  });
});

describe('formatCohortDate', () => {
  test('fecha larga en español (hora de Madrid)', () => {
    assert.equal(formatCohortDate(START), '30 de noviembre de 2026');
  });
  test('sin fecha → cadena vacía', () => {
    assert.equal(formatCohortDate(undefined), '');
  });
});
