// Vídeo del curso: el backend decide preview o completo y nunca entrega la URL completa a quien no está inscrito.
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.NODE_ENV = 'production';
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { default: express } = await import('express');
const { signToken } = await import('../src/config/jwt.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: UserProgress } = await import('../src/models/UserProgress.js');
const { COURSE_VIDEOS, videoFor } = await import('../src/config/courseVideos.js');
const { videoUrls } = await import('../src/service/courseVideoService.js');
const { default: courseRoutes } = await import('../src/routes/course.routes.js');

const CARBONO = '69d50406663e8648d7ee1f08';
const SIN_VIDEO = '64b0000000000000000000aa';
const VIDEO = { publicId: 'Carbono_modelos_con_intro_pyzhch', version: 1792652270 };

describe('videoUrls', () => {
  test('la preview recorta a 30 s y no coincide con la URL completa', () => {
    const preview = videoUrls(VIDEO, 'preview');
    const full = videoUrls(VIDEO, 'full');
    // El SDK ordena los parámetros alfabéticamente: eo_30,f_auto,q_auto,so_0
    assert.match(preview.src, /\/video\/upload\/eo_30,f_auto,q_auto,so_0\/v1792652270\/Carbono_modelos_con_intro_pyzhch\.mp4$/);
    assert.notEqual(preview.src, full.src);
    assert.match(full.src, /\/video\/upload\/f_auto,q_auto\/v1792652270\/Carbono_modelos_con_intro_pyzhch\.mp4$/);
  });

  test('el póster es el primer fotograma en jpg', () => {
    const { poster } = videoUrls(VIDEO, 'preview');
    assert.match(poster, /so_0/);
    assert.match(poster, /\.jpg$/);
  });

  test('con authenticated todas las URLs van firmadas y no se parecen a las públicas', () => {
    const pub = videoUrls(VIDEO, 'full', 'upload');
    const auth = videoUrls(VIDEO, 'full', 'authenticated');
    const prev = videoUrls(VIDEO, 'preview', 'authenticated');
    for (const url of [auth.src, auth.poster, prev.src, prev.poster]) {
      assert.match(url, /\/video\/authenticated\/s--[\w-]{8}--\//, url);
    }
    assert.notEqual(pub.src, auth.src);
    // La firma cubre la transformación: quitarla de la preview no da una URL válida del completo
    const peeled = prev.src.replace('eo_30,', '').replace(',so_0', '');
    assert.match(peeled, /\/s--[\w-]{8}--\/f_auto,q_auto\//);
    assert.notEqual(peeled, auth.src);
  });

  test('un modo desconocido cae en preview (fail-closed)', () => {
    assert.deepEqual(videoUrls(VIDEO, 'otra-cosa'), videoUrls(VIDEO, 'preview'));
  });
});

describe('courseVideos', () => {
  test('el curso de Carbono tiene vídeo y los demás no', () => {
    assert.deepEqual(videoFor(CARBONO), COURSE_VIDEOS[CARBONO]);
    assert.equal(videoFor(SIN_VIDEO), null);
    assert.equal(videoFor('constructor'), null);
  });
});

describe('GET /api/courses/:id/video', () => {
  let server;
  let base;
  const INSCRITA = '64b000000000000000000001';
  const SIN_INSCRIBIR = '64b000000000000000000002';
  const saved = {};
  let isOpen = true;
  let fullUrl;

  before(() => {
    saved.findById = Course.findById;
    saved.exists = UserProgress.exists;
    Course.findById = (id) => ({
      select: () => ({ lean: async () => (String(id) === CARBONO || String(id) === SIN_VIDEO ? { _id: id, isOpen } : null) }),
    });
    UserProgress.exists = async ({ userId, courseId }) => (String(userId) === INSCRITA && String(courseId) === CARBONO ? { _id: 'p1' } : null);
    fullUrl = videoUrls(videoFor(CARBONO), 'full').src;
    const app = express();
    app.use('/api/courses', courseRoutes);
    server = app.listen(0);
    base = `http://127.0.0.1:${server.address().port}/api/courses`;
  });
  after(() => {
    server.close();
    Course.findById = saved.findById;
    UserProgress.exists = saved.exists;
  });

  const get = async (id, token) => {
    const res = await fetch(`${base}/${id}/video`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const text = await res.text();
    return { res, text, body: text ? JSON.parse(text) : null };
  };
  const tokenOf = (id) => signToken({ id, email: 'a@x.es' });

  test('sin sesión → preview, sin rastro de la URL completa', async () => {
    const { res, body, text } = await get(CARBONO);
    assert.equal(res.status, 200);
    assert.equal(body.mode, 'preview');
    assert.match(body.src, /eo_30,f_auto,q_auto,so_0/);
    assert.ok(body.poster);
    assert.equal(text.includes(fullUrl), false);
    assert.deepEqual(Object.keys(body).sort(), ['mode', 'poster', 'src']);
  });

  test('token manipulado o caducado → se trata como anónimo', async () => {
    const { res, body } = await get(CARBONO, 'no-es-un-jwt');
    assert.equal(res.status, 200);
    assert.equal(body.mode, 'preview');
  });

  test('con sesión pero sin inscribir → preview', async () => {
    const { body, text } = await get(CARBONO, tokenOf(SIN_INSCRIBIR));
    assert.equal(body.mode, 'preview');
    assert.equal(text.includes(fullUrl), false);
  });

  test('inscrita y curso abierto → completo', async () => {
    const { body } = await get(CARBONO, tokenOf(INSCRITA));
    assert.equal(body.mode, 'full');
    assert.equal(body.src, fullUrl);
  });

  test('inscrita con el curso aún cerrado (plaza reservada) → preview', async () => {
    isOpen = false;
    try {
      const { body } = await get(CARBONO, tokenOf(INSCRITA));
      assert.equal(body.mode, 'preview');
    } finally {
      isOpen = true;
    }
  });

  test('la respuesta es personal: no se guarda en cachés compartidas', async () => {
    const { res } = await get(CARBONO);
    assert.match(res.headers.get('cache-control'), /private/);
    assert.match(res.headers.get('cache-control'), /no-store/);
    assert.match(res.headers.get('vary') ?? '', /Authorization/i);
  });

  test('curso sin vídeo, inexistente o id inválido → 404', async () => {
    assert.equal((await get(SIN_VIDEO)).res.status, 404);
    assert.equal((await get('64b0000000000000000000ff')).res.status, 404);
    assert.equal((await get('no-es-un-id')).res.status, 404);
  });
});
