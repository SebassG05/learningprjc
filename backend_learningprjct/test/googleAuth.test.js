// Inicio de sesión con Google y con contraseña: el `sub` de Google nunca sirve como contraseña, Google
// solo entra con el correo verificado y, al vincularse, deja sin contraseña a quien se registró antes
// con ese correo. Mongo real en memoria; la verificación del token de Google se simula.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);

// El cliente de Google se crea al importar el servicio: se sustituye su verificación antes.
// En los tests el «token» es el propio payload en JSON.
const { OAuth2Client } = await import('google-auth-library');
OAuth2Client.prototype.verifyIdToken = async ({ idToken }) => ({ getPayload: () => JSON.parse(idToken) });

const { default: bcrypt } = await import('bcryptjs');
const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: User } = await import('../src/models/User.js');
const { default: PasswordResetToken } = await import('../src/models/PasswordResetToken.js');
const { default: userRoutes } = await import('../src/routes/user.routes.js');
const { looksLikeGoogleId } = await import('../src/utils/passwordPolicy.js');

const SUB = '109876543210987654321';
const googlePayload = (over = {}) => ({ sub: SUB, email: 'laura@uco.es', email_verified: true, name: 'Laura Martín', ...over });
const googleLogin = (api, payload) => api.call('POST', '/api/users/auth/google', { body: { credential: JSON.stringify(payload) } });
const passwordLogin = (api, email, password) => api.call('POST', '/api/users/login', { body: { email, password } });

describe('inicio de sesión con Google y contraseña', () => {
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
  beforeEach(() => db.reset());

  test('looksLikeGoogleId: solo dígitos de 15 a 30 caracteres', () => {
    assert.equal(looksLikeGoogleId(SUB), true);
    assert.equal(looksLikeGoogleId('123456789012345'), true);
    assert.equal(looksLikeGoogleId('12345678901234'), false);
    assert.equal(looksLikeGoogleId('1'.repeat(31)), false);
    assert.equal(looksLikeGoogleId('abc109876543210987654321'), false);
    assert.equal(looksLikeGoogleId(undefined), false);
  });

  test('cuenta nueva con Google: la contraseña no es el sub y queda marcada como vinculada', async () => {
    const r = await googleLogin(api, googlePayload());
    assert.equal(r.status, 200);
    const user = await User.findOne({ email: 'laura@uco.es' });
    assert.equal(await bcrypt.compare(SUB, user.password), false);
    assert.ok(user.googleLinkedAt instanceof Date);
  });

  test('cuenta nueva con Google: no se puede entrar con correo y sub', async () => {
    await googleLogin(api, googlePayload());
    const r = await passwordLogin(api, 'laura@uco.es', SUB);
    assert.equal(r.status, 401);
  });

  test('cuenta antigua con el sub como contraseña: el login con contraseña lo rechaza', async () => {
    await new User({ name: 'Laura', email: 'laura@uco.es', password: SUB }).save();
    const r = await passwordLogin(api, 'laura@uco.es', SUB);
    assert.equal(r.status, 401);
    assert.equal(r.body.error, 'Credenciales inválidas');
  });

  test('cuenta antigua con el sub como contraseña: al entrar con Google se cambia por una aleatoria', async () => {
    const legacy = await new User({ name: 'Laura', email: 'laura@uco.es', password: SUB }).save();
    const r = await googleLogin(api, googlePayload());
    assert.equal(r.status, 200);
    assert.equal(String(r.body.user.id), String(legacy._id));
    const user = await User.findById(legacy._id);
    assert.equal(await bcrypt.compare(SUB, user.password), false);
    assert.ok(user.googleLinkedAt instanceof Date);
  });

  test('Google verificado entra en una cuenta creada con contraseña y esa contraseña deja de servir', async () => {
    const owner = await new User({ name: 'Otro', email: 'laura@uco.es', password: 'contraseña-del-otro' }).save();
    assert.equal((await passwordLogin(api, 'laura@uco.es', 'contraseña-del-otro')).status, 200);

    const r = await googleLogin(api, googlePayload());
    assert.equal(r.status, 200);
    assert.equal(String(r.body.user.id), String(owner._id));
    assert.equal((await passwordLogin(api, 'laura@uco.es', 'contraseña-del-otro')).status, 401);
  });

  test('Google con el correo sin verificar: 401, no crea cuenta ni entra en la existente', async () => {
    const r1 = await googleLogin(api, googlePayload({ email_verified: false }));
    assert.equal(r1.status, 401);
    assert.equal(await User.countDocuments(), 0);

    await new User({ name: 'Laura', email: 'laura@uco.es', password: 'mi-contraseña' }).save();
    const r2 = await googleLogin(api, googlePayload({ email_verified: false }));
    assert.equal(r2.status, 401);
    assert.equal(r2.body.token, undefined);
    assert.equal((await passwordLogin(api, 'laura@uco.es', 'mi-contraseña')).status, 200);
  });

  test('una vez vinculada, otro inicio con Google no vuelve a cambiar la contraseña', async () => {
    await googleLogin(api, googlePayload());
    // La usuaria se pone una contraseña con «He olvidado mi contraseña»
    const user = await User.findOne({ email: 'laura@uco.es' });
    user.password = 'nueva-contraseña';
    await user.save();

    assert.equal((await googleLogin(api, googlePayload())).status, 200);
    assert.equal((await passwordLogin(api, 'laura@uco.es', 'nueva-contraseña')).status, 200);
  });

  test('el correo de Google se compara en minúsculas', async () => {
    const owner = await new User({ name: 'Laura', email: 'laura@uco.es', password: 'mi-contraseña' }).save();
    const r = await googleLogin(api, googlePayload({ email: 'Laura@UCO.es' }));
    assert.equal(String(r.body.user.id), String(owner._id));
    assert.equal(await User.countDocuments(), 1);
  });

  test('registro con una contraseña con forma de identificador de Google: 400', async () => {
    const r = await api.call('POST', '/api/users/register', {
      body: { name: 'Ana', email: 'ana@uco.es', password: SUB, confirmPassword: SUB },
    });
    assert.equal(r.status, 400);
    assert.equal(await User.countDocuments(), 0);
  });

  test('restablecer con una contraseña con forma de identificador de Google: 400 y no la cambia', async () => {
    const user = await new User({ name: 'Ana', email: 'ana@uco.es', password: 'la-de-siempre' }).save();
    await PasswordResetToken.create({ userId: user._id, token: 'token-valido', expiresAt: new Date(Date.now() + 60_000) });
    const r = await api.call('POST', '/api/users/reset-password', {
      body: { userId: String(user._id), token: 'token-valido', newPassword: SUB },
    });
    assert.equal(r.status, 400);
    assert.equal((await passwordLogin(api, 'ana@uco.es', 'la-de-siempre')).status, 200);
  });

  test('una contraseña normal sigue funcionando', async () => {
    await new User({ name: 'Ana', email: 'ana@uco.es', password: 'una-contraseña-normal' }).save();
    assert.equal((await passwordLogin(api, 'ana@uco.es', 'una-contraseña-normal')).status, 200);
  });
});
