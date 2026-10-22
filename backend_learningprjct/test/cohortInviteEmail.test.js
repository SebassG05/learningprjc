// Email de invitación a una cohorte: HTML para clientes de correo + versión en texto.
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const { buildCohortInviteEmail } = await import('../src/service/cohortInviteEmailTemplate.js');

const base = {
  url: 'https://campus.evenor-tech.com/curso/69d50406663e8648d7ee1f08/invitacion?token=abc_DEF-123',
  courseTitle: 'Modelización Dinámica de Carbono',
  cohortName: 'Carbono – Noviembre 2026',
  startsAt: new Date('2026-11-30T08:00:00Z'),
  expiresAt: new Date('2026-11-05T22:59:59Z'),
};

describe('buildCohortInviteEmail', () => {
  test('asunto con el curso; invitación vs activación', () => {
    assert.equal(buildCohortInviteEmail(base).subject, 'Invitación al curso «Modelización Dinámica de Carbono»');
    assert.equal(buildCohortInviteEmail({ ...base, reason: 'claim' }).subject, 'Activa tu plaza en «Modelización Dinámica de Carbono»');
  });

  test('HTML: curso, edición, fecha de inicio, caducidad, botón y enlace alternativo', () => {
    const { html } = buildCohortInviteEmail(base);
    assert.match(html, /Modelización Dinámica de Carbono/);
    assert.match(html, /Carbono – Noviembre 2026/);
    assert.match(html, /30 de noviembre de 2026/);
    assert.match(html, /5 de noviembre de 2026/);
    assert.ok(html.includes('href="https://campus.evenor-tech.com/curso/69d50406663e8648d7ee1f08/invitacion?token=abc_DEF-123"'));
    assert.match(html, /Aceptar invitación/);
    assert.match(html, /<table/); // maquetación de email (Outlook no entiende flex/grid)
    assert.match(html, /lang="es"/);
  });

  test('texto preliminar oculto para la bandeja de entrada', () => {
    const { html } = buildCohortInviteEmail(base);
    assert.match(html, /display:none[^>]*>[^<]*Modelización Dinámica de Carbono/);
  });

  test('versión en texto con el enlace completo', () => {
    const { text } = buildCohortInviteEmail(base);
    assert.ok(text.includes(base.url));
    assert.match(text, /30 de noviembre de 2026/);
    assert.equal(/<[a-z]/i.test(text), false);
  });

  test('escapa el HTML de los textos que pone el admin', () => {
    const { html } = buildCohortInviteEmail({ ...base, courseTitle: 'Curso <script>x</script>', cohortName: 'A & B' });
    assert.equal(html.includes('<script>'), false);
    assert.match(html, /A &amp; B/);
  });

  test('sin fechas ni edición: no pinta líneas vacías', () => {
    const { html, text } = buildCohortInviteEmail({ url: base.url, courseTitle: 'Curso' });
    assert.equal(/undefined|null|Invalid Date/.test(html + text), false);
  });
});
