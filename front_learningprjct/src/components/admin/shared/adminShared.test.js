// Estados, umbral y formato del panel de administración. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PASS_MARK, coherenceWarning, gradeTone, normalizeGrade, primaryActionLabel, statusInfo, suggestStatus,
} from './submissionStatus.js';
import { courseName, initials, relativeTime, studentName } from './adminFormat.js';

test('el umbral de aprobado es 5', () => {
  assert.equal(PASS_MARK, 5);
  assert.equal(suggestStatus(5), 'aprobado');
  assert.equal(suggestStatus(4.5), 'revisado');
  assert.equal(suggestStatus(null), null);
});

test('«revisado» se llama «Requiere cambios» para el admin y para el alumno', () => {
  assert.equal(statusInfo('revisado').label, 'Requiere cambios');
  assert.equal(statusInfo('revisado').studentLabel, 'Requiere cambios');
  assert.equal(statusInfo('enviado').label, 'Pendiente');
  assert.equal(statusInfo('raro').label, 'Desconocido');
});

test('color de la nota por rango', () => {
  assert.equal(gradeTone(4.5), 'danger');
  assert.equal(gradeTone(5), 'dawn');
  assert.equal(gradeTone(6.5), 'dawn');
  assert.equal(gradeTone(7), 'brand');
  assert.equal(gradeTone(undefined), 'neutral');
});

test('avisos de incoherencia entre estado y nota (no bloquean)', () => {
  assert.match(coherenceWarning('aprobado', 4), /empieza en 5/);
  assert.match(coherenceWarning('rechazado', 6), /nota de aprobado/);
  assert.match(coherenceWarning('aprobado', null), /sin nota/);
  assert.equal(coherenceWarning('aprobado', 6), null);
  assert.equal(coherenceWarning('revisado', 3), null);
});

test('la nota se acota a 0–10 y se redondea al paso de 0,5', () => {
  assert.equal(normalizeGrade('7,3'), 7.5);
  assert.equal(normalizeGrade(12), 10);
  assert.equal(normalizeGrade(-2), 0);
  assert.equal(normalizeGrade(''), null);
  assert.equal(normalizeGrade('abc'), null);
});

test('la acción principal depende del estado', () => {
  assert.equal(primaryActionLabel('enviado'), 'Corregir');
  assert.equal(primaryActionLabel('aprobado'), 'Ver / Editar nota');
});

test('fallbacks para referencias borradas', () => {
  assert.equal(studentName(null), 'Alumno eliminado');
  assert.equal(studentName({ email: 'a@b.es' }), 'a@b.es');
  assert.equal(courseName({ _id: 'x' }), 'Curso eliminado');
  assert.equal(courseName({ title: 'ANFORA' }), 'ANFORA');
});

test('iniciales', () => {
  assert.equal(initials('Lucía Romero Gil'), 'LG');
  assert.equal(initials('Lucía'), 'LU');
  assert.equal(initials('', 'pablo@x.es'), 'P');
  assert.equal(initials('', ''), '?');
});

test('fecha relativa en español', () => {
  const now = Date.parse('2026-10-19T12:00:00Z');
  assert.equal(relativeTime('2026-10-16T12:00:00Z', now), 'hace 3 días');
  assert.equal(relativeTime('2026-10-18T12:00:00Z', now), 'ayer');
  assert.equal(relativeTime('2026-10-19T11:59:40Z', now), 'ahora');
});
