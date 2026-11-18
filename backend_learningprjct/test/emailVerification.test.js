// Verificación del correo al registrarse con contraseña: sin sesión hasta confirmar el código del correo.
// Mongo real en memoria; el correo y Google se simulan.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.FRONTEND_URL = 'https://campus.test';

const sent = [];
let mailFails = false;
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({
  sendMail: async (opts) => {
    if (mailFails) throw new Error('SMTP caído');
    sent.push(opts);
  },
});
const { OAuth2Client } = await import('google-auth-library');
OAuth2Client.prototype.verifyIdToken = async ({ idToken }) => ({ getPayload: () => JSON.parse(idToken) });

const { default: bcrypt } = await import('bcryptjs');
const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: User } = await import('../src/models/User.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Cohort } = await import('../src/models/Cohort.js');
const { default: PasswordResetToken } = await import('../src/models/PasswordResetToken.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');
const { enviarCodigo, verificarCodigo, MAX_INTENTOS } = await import('../src/service/emailVerification.js');

const PASS = 'secreta1';
const codeFrom = (mail) => /(\d{6})/.exec(mail.subject)[1];

describe('verificación del correo al registrarse', () => {
  let db;
  let api;
  before(async () => {
    db = await startMemoryMongo();
    api = fx.listen([['/api/users', userRoutes]]);
  });
  after(async () => {
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    await db.reset();
    sent.length = 0;
    mailFails = false;
  });

  const register = (email, { name = 'Ana Pérez', password = PASS } = {}) =>
    api.call('POST', '/api/users/register', { body: { name, email, password, confirmPassword: password } });
  const login = (email, password = PASS) => api.call('POST', '/api/users/login', { body: { email, password } });
  const verify = (email, codigo) => api.call('POST', '/api/users/verificar-correo', { body: { email, codigo } });
  const resend = (email) => api.call('POST', '/api/users/verificar-correo/reenviar', { body: { email } });
  // Como si el último código se hubiese mandado hace más de un minuto
  const ageLastSend = (email) => User.updateOne({ email }, { $set: { 'verificacionCorreo.enviadoAt': new Date(Date.now() - 120_000) } });

  test('registrarse no abre sesión y manda un código de 6 cifras al correo', async () => {
    const r = await register('Ana@X.es');
    assert.equal(r.status, 201);
    assert.equal(r.body.token, undefined);
    assert.equal(r.body.verificacionPendiente, true);
    assert.equal(r.body.email, 'ana@x.es');
    assert.equal(sent.length, 1);
    assert.equal(sent[0].to, 'ana@x.es');
    assert.match(sent[0].text, /\b\d{6}\b/);
    const user = await User.findOne({ email: 'ana@x.es' }).select('+verificacionCorreo').lean();
    assert.equal(user.emailPendiente, true);
    assert.notEqual(user.verificacionCorreo.codigoHash, codeFrom(sent[0])); // solo el hash
  });

  test('con el correo sin confirmar, el login con la contraseña correcta no da sesión', async () => {
    await register('ana@x.es');
    await ageLastSend('ana@x.es');
    const r = await login('ana@x.es');
    assert.equal(r.status, 403);
    assert.equal(r.body.code, 'email-pendiente');
    assert.equal(r.body.token, undefined);
    assert.equal(sent.length, 2); // código nuevo
  });

  test('con la contraseña mal no revela que la cuenta está pendiente', async () => {
    await register('ana@x.es');
    const r = await login('ana@x.es', 'otra-cosa');
    assert.equal(r.status, 401);
    assert.equal(r.body.code, undefined);
  });

  test('el código correcto confirma el correo y abre sesión; después el login funciona', async () => {
    await register('ana@x.es');
    const r = await verify('ana@x.es', codeFrom(sent[0]));
    assert.equal(r.status, 200);
    assert.ok(r.body.token);
    assert.equal(r.body.user.email, 'ana@x.es');
    const me = await api.call('GET', '/api/users/me', { headers: { Authorization: `Bearer ${r.body.token}` } });
    assert.equal(me.status, 200);
    const user = await User.findOne({ email: 'ana@x.es' }).select('+verificacionCorreo').lean();
    assert.equal(user.emailPendiente, undefined);
    assert.ok(user.emailVerificadoAt instanceof Date);
    assert.equal(user.verificacionCorreo, undefined);
    assert.equal((await login('ana@x.es')).status, 200);
  });

  test('el código vale una sola vez', async () => {
    await register('ana@x.es');
    const code = codeFrom(sent[0]);
    assert.equal((await verify('ana@x.es', code)).status, 200);
    const again = await verify('ana@x.es', code);
    assert.equal(again.status, 400);
    assert.equal(again.body.code, 'invalid');
  });

  test('código incorrecto: cuenta los intentos y a los 5 hay que pedir otro', async () => {
    await register('ana@x.es');
    const good = codeFrom(sent[0]);
    const bad = good === '000000' ? '111111' : '000000';
    for (let i = 1; i < MAX_INTENTOS; i += 1) {
      const r = await verify('ana@x.es', bad);
      assert.equal(r.status, 400);
      assert.equal(r.body.code, 'wrong');
      assert.equal(r.body.restantes, MAX_INTENTOS - i);
    }
    const last = await verify('ana@x.es', bad);
    assert.equal(last.body.code, 'too-many');
    const blocked = await verify('ana@x.es', good); // ni siquiera el bueno
    assert.equal(blocked.status, 400);
    assert.equal(blocked.body.code, 'too-many');
  });

  test('intentos a la vez no saltan el límite', async () => {
    await register('ana@x.es');
    const good = codeFrom(sent[0]);
    const bad = good === '000000' ? '111111' : '000000';
    await Promise.all(Array.from({ length: 12 }, () => verify('ana@x.es', bad)));
    const user = await User.findOne({ email: 'ana@x.es' }).select('+verificacionCorreo').lean();
    assert.equal(user.verificacionCorreo.intentos, MAX_INTENTOS);
  });

  test('un código caducado no sirve', async () => {
    await register('ana@x.es');
    await User.updateOne({ email: 'ana@x.es' }, { $set: { 'verificacionCorreo.expiresAt': new Date(Date.now() - 1000) } });
    const r = await verify('ana@x.es', codeFrom(sent[0]));
    assert.equal(r.body.code, 'expired');
  });

  test('reenviar: como mucho uno por minuto y anula el anterior', async () => {
    await register('ana@x.es');
    const first = codeFrom(sent[0]);
    const tooSoon = await resend('ana@x.es');
    assert.equal(tooSoon.status, 429);
    assert.equal(sent.length, 1);
    await ageLastSend('ana@x.es');
    const ok = await resend('ana@x.es');
    assert.equal(ok.status, 200);
    assert.equal(sent.length, 2);
    const second = codeFrom(sent[1]);
    if (first !== second) assert.equal((await verify('ana@x.es', first)).body.code, 'wrong');
    assert.equal((await verify('ana@x.es', second)).status, 200);
  });

  test('reenviar a un correo sin cuenta o ya confirmado responde igual y no manda nada', async () => {
    await fx.createUser({ email: 'vieja@x.es' });
    const a = await resend('nadie@x.es');
    const b = await resend('vieja@x.es');
    assert.equal(a.status, 200);
    assert.deepEqual(a.body, b.body);
    assert.equal(sent.length, 0);
  });

  test('el código no sirve para otra cuenta', async () => {
    await register('ana@x.es');
    await register('luis@x.es', { name: 'Luis' });
    const anaCode = codeFrom(sent[0]);
    const luisCode = codeFrom(sent[1]);
    if (anaCode !== luisCode) assert.equal((await verify('luis@x.es', anaCode)).body.code, 'wrong');
  });

  test('si alguien se registró con tu correo y no lo confirmó, al registrarte lo sustituyes', async () => {
    await register('ana@x.es', { name: 'Impostor', password: 'del-impostor' });
    await ageLastSend('ana@x.es');
    const r = await register('ana@x.es', { name: 'Ana Pérez', password: 'la-de-ana' });
    assert.equal(r.status, 201);
    assert.equal(await User.countDocuments({ email: 'ana@x.es' }), 1);
    const user = await User.findOne({ email: 'ana@x.es' });
    assert.equal(user.name, 'Ana Pérez');
    assert.equal(await bcrypt.compare('del-impostor', user.password), false);
    assert.equal((await verify('ana@x.es', codeFrom(sent[1]))).status, 200);
  });

  test('un correo ya confirmado o de antes de la verificación sigue dando 409', async () => {
    await fx.createUser({ email: 'vieja@x.es' });
    const r = await register('vieja@x.es');
    assert.equal(r.status, 409);
    assert.equal(sent.length, 0);
  });

  test('las cuentas de antes de la verificación entran como siempre', async () => {
    await new User({ name: 'Vieja', email: 'vieja@x.es', password: PASS }).save();
    const r = await login('vieja@x.es');
    assert.equal(r.status, 200);
    assert.ok(r.body.token);
  });

  test('si falla el correo, el registro se guarda y se puede pedir otro código', async () => {
    mailFails = true;
    const r = await register('ana@x.es');
    assert.equal(r.status, 201);
    assert.equal(r.body.codigoEnviado, false);
    mailFails = false;
    const again = await resend('ana@x.es');
    assert.equal(again.status, 200);
    assert.equal(sent.length, 1);
    assert.equal((await verify('ana@x.es', codeFrom(sent[0]))).status, 200);
  });

  test('entrar con Google (correo verificado) confirma un registro pendiente', async () => {
    await register('ana@x.es');
    const payload = { sub: '109876543210987654321', email: 'ana@x.es', email_verified: true, name: 'Ana' };
    const r = await api.call('POST', '/api/users/auth/google', { body: { credential: JSON.stringify(payload) } });
    assert.equal(r.status, 200);
    const user = await User.findOne({ email: 'ana@x.es' }).lean();
    assert.equal(user.emailPendiente, undefined);
    assert.ok(user.emailVerificadoAt);
  });

  test('restablecer la contraseña con el enlace del correo también lo confirma', async () => {
    await register('ana@x.es');
    const user = await User.findOne({ email: 'ana@x.es' });
    await PasswordResetToken.create({ userId: user._id, token: 'tok', expiresAt: new Date(Date.now() + 60_000) });
    const r = await api.call('POST', '/api/users/reset-password', { body: { userId: String(user._id), token: 'tok', newPassword: 'nueva-clave' } });
    assert.equal(r.status, 200);
    assert.equal((await login('ana@x.es', 'nueva-clave')).status, 200);
  });

  test('al confirmar, las plazas de cohorte y de profesor pendientes para ese correo se activan', async () => {
    const course = await fx.createCourse({ accessMode: 'private', title: 'Carbono' });
    const cohort = await fx.createCohort(course, { members: [{ email: 'ana@x.es', status: 'pending', user: null }] });
    await Course.updateOne({ _id: course._id }, { $push: { profesores: { email: 'ana@x.es', status: 'pending', tokenHash: 'h', tokenExpiresAt: new Date(Date.now() + 86_400_000), addedAt: new Date() } } });
    await register('ana@x.es');
    assert.equal(sent.length, 1); // solo el código: nada de enlaces de cohorte al registrarse
    const r = await verify('ana@x.es', codeFrom(sent[0]));
    assert.equal(r.status, 200);
    assert.deepEqual(r.body.cohortClaim, { activated: 1, emailed: 0 });
    const seat = (await Cohort.findById(cohort._id).lean()).members[0];
    assert.equal(seat.status, 'active');
    const c = await Course.findById(course._id).select('+profesores').lean();
    assert.equal(c.profesores[0].status, 'active');
    assert.equal(String(c.profesores[0].userId), r.body.user.id);
  });

  test('servicio: enviarCodigo no manda nada a una cuenta ya confirmada', async () => {
    const vieja = await fx.createUser({ email: 'vieja@x.es' });
    assert.deepEqual(await enviarCodigo(vieja), { sent: false, reason: 'not-pending' });
    await assert.rejects(verificarCodigo({ email: 'vieja@x.es', codigo: '123456' }), { code: 'invalid' });
  });
});
