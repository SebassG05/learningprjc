import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  formatAverage,
  formatRelativeDate,
  initialsOf,
  ratingDistribution,
  reviewsLabel,
  toReviewViewModel,
} from './reviewFormat.js';

test('toReviewViewModel: misma forma para la respuesta del GET y la del POST', () => {
  const review = { _id: 'x1', user: 'Luis', rating: 4, description: ' Muy útil ', createdAt: '2026-10-01T10:00:00Z' };
  const fromGet = toReviewViewModel(review);
  const fromPost = toReviewViewModel({ message: 'Reseña creada correctamente', review });
  assert.deepEqual(fromPost, fromGet);
  assert.equal(fromGet.text, 'Muy útil');
  assert.equal(fromGet.rating, 4);
});

test('toReviewViewModel: datos incompletos no rompen la tarjeta', () => {
  const vm = toReviewViewModel({ rating: '9', createdAt: 'no es fecha' }, 3);
  assert.equal(vm.id, 'review-3');
  assert.equal(vm.name, 'Alumno del campus');
  assert.equal(vm.rating, 5);
  assert.equal(vm.text, '');
  assert.equal(vm.date, null);
  assert.equal(vm.mine, false);
});

test('toReviewViewModel: marca las propias solo con mine === true', () => {
  assert.equal(toReviewViewModel({ review: { mine: true } }).mine, true);
  assert.equal(toReviewViewModel({ mine: 'true' }).mine, false);
});

test('initialsOf: nombres, correos y nombres de una palabra', () => {
  assert.equal(initialsOf('María José Fernández'), 'MF');
  assert.equal(initialsOf('ana.garcia@example.com'), 'AG');
  assert.equal(initialsOf('luis'), 'L');
  assert.equal(initialsOf('123'), '·');
});

test('formatRelativeDate: en español y con "ayer"', () => {
  const now = new Date('2026-10-15T12:00:00Z');
  assert.equal(formatRelativeDate(new Date('2026-10-14T12:00:00Z'), now), 'ayer');
  assert.equal(formatRelativeDate(new Date('2026-10-12T12:00:00Z'), now), 'hace 3 días');
  assert.equal(formatRelativeDate(new Date('2026-10-15T11:59:40Z'), now), 'ahora');
});

test('formatAverage y reviewsLabel', () => {
  assert.equal(formatAverage(4.2666), '4,3');
  assert.equal(reviewsLabel(1), '1 reseña');
  assert.equal(reviewsLabel(26), '26 reseñas');
});

test('ratingDistribution: de 5 a 1 estrellas', () => {
  const d = ratingDistribution([{ rating: 5 }, { rating: 5 }, { rating: 2 }]);
  assert.deepEqual(d.map((r) => r.stars), [5, 4, 3, 2, 1]);
  assert.deepEqual(d.map((r) => r.count), [2, 0, 0, 1, 0]);
});
