import { test } from 'node:test';
import assert from 'node:assert/strict';
import createRateLimit from '../src/middleware/rateLimit.js';

const run = (limit, req) => {
  let status = 200;
  const res = { set() {}, status(s) { status = s; return this; }, json() {} };
  limit(req, res, () => {});
  return status;
};

test('keyFn separa los contadores; sin keyFn cuenta por IP', () => {
  const byUser = createRateLimit({ windowMs: 1000, max: 1, message: 'x', keyFn: (req) => req.u });
  assert.equal(run(byUser, { u: 'a', headers: {} }), 200);
  assert.equal(run(byUser, { u: 'b', headers: {} }), 200);
  assert.equal(run(byUser, { u: 'a', headers: {} }), 429);

  const byIp = createRateLimit({ windowMs: 1000, max: 1, message: 'x' });
  const req = { headers: {}, ip: '5.5.5.5', socket: { remoteAddress: '5.5.5.5' } };
  assert.equal(run(byIp, req), 200);
  assert.equal(run(byIp, req), 429);
});
