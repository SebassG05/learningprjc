// Términos de confidencialidad: la inscripción exige aceptar la versión vigente y la aceptación queda
// registrada (usuario, curso, versión, fecha, IP y navegador). Modelos simulados: sin base de datos.
// Ejecutar: npm test
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';

const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { default: TermsAcceptance } = await import('../src/models/TermsAcceptance.js');
const { TERMS } = await import('../src/content/terms.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');
const { default: termsRoutes } = await import('../src/routes/terms.routes.js');

const ANA = '64b000000000000000000001';
const CURSO = '64d000000000000000000001';
const CERRADO = '64d000000000000000000002';
let acceptances;
let enrollments;

const same = (a, b) => String(a) === String(b);
const match = (r, f) => same(r.userId, f.userId) && same(r.courseId, f.courseId) && r.termsVersion === f.termsVersion;

// Imita una consulta de Mongoose: se puede esperar directamente o encadenar .select().lean()
const query = (value) => ({ select: () => query(value), lean: async () => value, then: (ok, ko) => Promise.resolve(value).then(ok, ko) });
Course.findById = (id) => query(same(id, CURSO) ? { _id: CURSO, isOpen: true, idiomasDisponibles: ['es', 'en'] } : null);
Course.exists = async ({ _id }) => (same(_id, CURSO) ? { _id } : null);
UserProgress.findOne = async ({ userId, courseId }) => enrollments.find((e) => same(e.userId, userId) && same(e.courseId, courseId)) ?? null;
UserProgress.prototype.save = async function () {
  enrollments.push(this.toObject());
  return this;
};
TermsAcceptance.exists = async (f) => (acceptances.some((r) => match(r, f)) ? { _id: 'x' } : null);
TermsAcceptance.updateOne = async (f, update) => {
  if (!acceptances.some((r) => match(r, f))) acceptances.push({ ...update.$setOnInsert });
  return { acknowledged: true };
};
TermsAcceptance.findOne = (f) => ({ select: () => ({ lean: async () => acceptances.find((r) => match(r, f)) ?? null }) });

let server;
let base;
before(() => {
  const app = express();
  app.use(express.json());
  app.use('/api/users', userRoutes);
  app.use('/api/terms', termsRoutes);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => server.close());
beforeEach(() => {
  acceptances = [];
  enrollments = [];
});

let ip = 0;
const call = async (method, path, body, extra = {}) => {
  ip += 1;
  const res = await fetch(base + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${signToken({ id: ANA, email: 'ana@x.com' })}`,
      'X-Forwarded-For': `10.1.${Math.floor(ip / 250)}.${ip % 250}, 172.16.0.1`,
      'User-Agent': 'PruebaNavegador/1.0',
      ...extra,
    },
    body: body && JSON.stringify(body),
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
};

test('GET /terms/current: texto y versión, sin la marca interna de revisión legal', async () => {
  const r = await call('GET', '/terms/current');
  assert.equal(r.status, 200);
  assert.equal(r.body.version, TERMS.version);
  assert.equal(r.body.title, TERMS.title);
  assert.ok(r.body.sections.length >= 6);
  assert.equal(r.body.status, undefined);
});

test('inscribirse sin aceptar los términos: 428 TERMS_REQUIRED y nada guardado', async () => {
  const r = await call('POST', `/users/enroll/${CURSO}`, { preferredLanguage: 'es' });
  assert.equal(r.status, 428);
  assert.equal(r.body.code, 'TERMS_REQUIRED');
  assert.equal(r.body.termsVersion, TERMS.version);
  assert.equal(enrollments.length, 0);
  assert.equal(acceptances.length, 0);
});

test('acceptTerms tiene que ser true exactamente (no vale "true" ni 1)', async () => {
  for (const acceptTerms of ['true', 1, false]) {
    const r = await call('POST', `/users/enroll/${CURSO}`, { acceptTerms, termsVersion: TERMS.version });
    assert.equal(r.status, 428, String(acceptTerms));
  }
  assert.equal(enrollments.length, 0);
});

test('una versión distinta de la vigente se rechaza', async () => {
  const r = await call('POST', `/users/enroll/${CURSO}`, { acceptTerms: true, termsVersion: '0.9' });
  assert.equal(r.status, 428);
  assert.equal(enrollments.length, 0);
});

test('aceptando la vigente: guarda la aceptación con IP y navegador, e inscribe con su idioma', async () => {
  const r = await call('POST', `/users/enroll/${CURSO}`, { acceptTerms: true, termsVersion: TERMS.version, preferredLanguage: 'en' });
  assert.equal(r.status, 200);
  assert.equal(enrollments.length, 1);
  assert.equal(enrollments[0].preferredLanguage, 'en');
  assert.equal(acceptances.length, 1);
  const a = acceptances[0];
  assert.ok(same(a.userId, ANA) && same(a.courseId, CURSO));
  assert.equal(a.termsVersion, TERMS.version);
  assert.match(a.ip, /^10\.1\./);
  assert.match(a.forwardedFor, /172\.16\.0\.1/);
  assert.equal(a.userAgent, 'PruebaNavegador/1.0');
  assert.ok(a.acceptedAt instanceof Date);
});

test('IP: CF-Connecting-IP (Cloudflare) tiene prioridad sobre X-Forwarded-For', async () => {
  await call('POST', `/users/enroll/${CURSO}`, { acceptTerms: true, termsVersion: TERMS.version }, { 'CF-Connecting-IP': '203.0.113.7' });
  assert.equal(acceptances[0].ip, '203.0.113.7');
});

test('una aceptación previa de la versión vigente basta para inscribirse', async () => {
  acceptances.push({ userId: ANA, courseId: CURSO, termsVersion: TERMS.version, acceptedAt: new Date() });
  const r = await call('POST', `/users/enroll/${CURSO}`, {});
  assert.equal(r.status, 200);
  assert.equal(acceptances.length, 1);
});

test('cambio de versión: una aceptación antigua ya no vale', async () => {
  acceptances.push({ userId: ANA, courseId: CURSO, termsVersion: '0.9', acceptedAt: new Date() });
  const r = await call('POST', `/users/enroll/${CURSO}`, {});
  assert.equal(r.status, 428);
  const s = await call('GET', `/terms/status/${CURSO}`);
  assert.deepEqual([s.body.version, s.body.accepted], [TERMS.version, false]);
});

test('aceptar de nuevo (ya inscrito): POST /terms/accept registra y /status lo refleja; es idempotente', async () => {
  const bad = await call('POST', `/terms/accept/${CURSO}`, { accept: true });
  assert.equal(bad.status, 400);
  const ok1 = await call('POST', `/terms/accept/${CURSO}`, { acceptTerms: true, termsVersion: TERMS.version });
  const ok2 = await call('POST', `/terms/accept/${CURSO}`, { acceptTerms: true, termsVersion: TERMS.version });
  assert.deepEqual([ok1.status, ok2.status], [201, 201]);
  assert.equal(acceptances.length, 1);
  const s = await call('GET', `/terms/status/${CURSO}`);
  assert.equal(s.body.accepted, true);
});

test('aceptar para un curso inexistente o con id no válido', async () => {
  const body = { acceptTerms: true, termsVersion: TERMS.version };
  assert.equal((await call('POST', `/terms/accept/${CERRADO}`, body)).status, 404);
  assert.equal((await call('POST', '/terms/accept/123', body)).status, 400);
  assert.equal(acceptances.length, 0);
});

test('sin sesión no se puede aceptar ni consultar el estado', async () => {
  const res = await fetch(`${base}/terms/status/${CURSO}`);
  assert.equal(res.status, 401);
});
