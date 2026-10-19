// Formulario de curso: validación por campo y envío. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { courseFormData, emptyCourseForm, firstError, formFromCourse, isDirty, validateCourse } from './courseFormModel.js';

test('con español activo, título y descripción en español son obligatorios', () => {
  const e = validateCourse(emptyCourseForm());
  assert.deepEqual(Object.keys(e).sort(), ['description', 'title']);
  assert.equal(firstError(e), 'title');
});

test('con inglés activo se piden también los campos en inglés; sin idiomas, error de idioma', () => {
  const f = { ...emptyCourseForm(), idiomas: ['es', 'en'], title: 'T', description: 'D' };
  assert.deepEqual(Object.keys(validateCourse(f)).sort(), ['descriptionEn', 'titleEn']);
  assert.equal(firstError(validateCourse({ ...f, idiomas: [] })), 'idiomas');
});

test('la portada debe ser imagen y como mucho 5 MB', () => {
  const base = { ...emptyCourseForm(), title: 'T', description: 'D' };
  assert.match(validateCourse({ ...base, imageFile: { type: 'application/pdf', size: 10 } }).image, /imagen/);
  assert.match(validateCourse({ ...base, imageFile: { type: 'image/png', size: 6 * 1024 * 1024 } }).image, /5 MB/);
  assert.deepEqual(validateCourse({ ...base, imageFile: { type: 'image/png', size: 1000 } }), {});
});

test('el error del catálogo (profesor) se muestra en su campo', () => {
  const base = { ...emptyCourseForm(), title: 'T', description: 'D' };
  assert.equal(validateCourse(base, 'Añade el nombre').profesorNombre, 'Añade el nombre');
});

test('desde un curso existente y detección de cambios', () => {
  const f = formFromCourse({ title: 'A', description: 'B', idiomasDisponibles: ['es', 'xx'], isOpen: 1, category: ['x'] });
  assert.deepEqual(f.idiomas, ['es']);
  assert.equal(f.isOpen, true);
  assert.equal(isDirty(f, { ...f }), false);
  assert.equal(isDirty({ ...f, title: 'A2' }, f), true);
  assert.equal(isDirty({ ...f, imageFile: {} }, f), true);
});

test('el envío solo incluye los textos de los idiomas activos y las listas como JSON', () => {
  const f = { ...emptyCourseForm(), title: ' T ', description: 'D', titleEn: 'ignored', category: ['a'] };
  const fd = courseFormData(f, (d) => d.append('area', 'x'));
  assert.equal(fd.get('title'), 'T');
  assert.equal(fd.get('titleEn'), null);
  assert.equal(fd.get('duration'), '0 horas');
  assert.equal(fd.get('category'), '["a"]');
  assert.equal(fd.get('idiomasDisponibles'), '["es"]');
  assert.equal(fd.get('area'), 'x');
  assert.equal(fd.get('image'), null);
});
