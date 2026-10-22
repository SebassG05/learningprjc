import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { cohortPhase, fromLocalInput, inviteUsage, sortMembers, summaryText, toLocalInput } from './accesosQuery.js';

describe('sortMembers', () => {
  test('activos primero y, dentro de cada grupo, los más recientes arriba', () => {
    const members = [
      { _id: 'a', status: 'pending', addedAt: '2026-10-01T10:00:00Z' },
      { _id: 'b', status: 'active', addedAt: '2026-10-02T10:00:00Z' },
      { _id: 'c', status: 'pending', addedAt: '2026-10-03T10:00:00Z' },
      { _id: 'd', status: 'active', addedAt: '2026-10-04T10:00:00Z' },
    ];
    assert.deepEqual(sortMembers(members).map((m) => m._id), ['d', 'b', 'c', 'a']);
  });
  test('filtra por estado y por texto (email o nombre)', () => {
    const members = [
      { _id: 'a', status: 'pending', email: 'ana@x.es' },
      { _id: 'b', status: 'active', email: 'luis@y.com', user: { name: 'Luis Pérez' } },
    ];
    assert.deepEqual(sortMembers(members, { status: 'active' }).map((m) => m._id), ['b']);
    assert.deepEqual(sortMembers(members, { q: 'pérez' }).map((m) => m._id), ['b']);
    assert.deepEqual(sortMembers(members, { q: 'ANA' }).map((m) => m._id), ['a']);
  });
  test('no muta la lista original', () => {
    const members = [{ _id: 'a', status: 'pending' }, { _id: 'b', status: 'active' }];
    sortMembers(members);
    assert.deepEqual(members.map((m) => m._id), ['a', 'b']);
  });
});

describe('cohortPhase', () => {
  const c = { startsAt: '2026-11-30T00:00:00Z', endsAt: '2027-03-31T00:00:00Z' };
  test('antes, durante y después', () => {
    assert.equal(cohortPhase(c, new Date('2026-11-01')), 'upcoming');
    assert.equal(cohortPhase(c, new Date('2027-01-01')), 'open');
    assert.equal(cohortPhase(c, new Date('2027-03-31T00:00:00Z')), 'ended');
  });
});

describe('inviteUsage', () => {
  test('usos y máximo', () => {
    assert.equal(inviteUsage({ uses: 3, maxUses: 25 }), '3 / 25 usos');
    assert.equal(inviteUsage({ uses: 0, maxUses: 1 }), '0 / 1 uso');
  });
});

describe('summaryText', () => {
  test('resume añadidos, ya existentes, inválidos y correos', () => {
    assert.equal(
      summaryText({ added: ['a', 'b'], existing: ['c'], invalid: ['x'], emailed: ['a', 'b'], emailFailed: [] }),
      '2 añadidos · 1 ya estaba · 1 inválido · 2 invitaciones enviadas'
    );
  });
  test('avisa de los correos que fallaron', () => {
    assert.equal(summaryText({ added: ['a'], existing: [], invalid: [], emailed: [], emailFailed: ['a'] }), '1 añadido · 1 correo sin enviar');
  });
  test('nada que hacer', () => {
    assert.equal(summaryText({ added: [], existing: ['a', 'b'], invalid: [], emailed: [], emailFailed: [] }), '2 ya estaban');
  });
});

describe('toLocalInput / fromLocalInput', () => {
  test('ida y vuelta conserva el instante', () => {
    const iso = '2026-11-30T08:30:00.000Z';
    assert.equal(fromLocalInput(toLocalInput(iso)), iso);
  });
  test('formato aceptado por <input type=datetime-local>', () => {
    assert.match(toLocalInput('2026-11-30T08:30:00.000Z'), /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/);
  });
  test('vacío o inválido', () => {
    assert.equal(toLocalInput(null), '');
    assert.equal(fromLocalInput(''), null);
    assert.equal(fromLocalInput('nada'), null);
  });
});
