// Archivos del curso: pasarela de materiales, proxy de PDF y PDFs de entregas (Mongo real en memoria).
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: Ejercicio } = await import('../src/models/Ejercicio.js');
const { default: EntregaEjercicio } = await import('../src/models/EntregaEjercicio.js');
const { deps, isOwnCloudinaryUrl, cloudinaryRawAsset } = await import('../src/service/materialFiles.js');
const { default: express } = await import('express');
const { default: configureExpress } = await import('../src/loaders/express.js');

const PDF = Buffer.from('%PDF-1.4 contenido del material');
const UPLOADS = path.resolve('public/ejercicios');
const AUTH_URL = 'https://res.cloudinary.com/demo-cloud/raw/authenticated/v1/learning-platform/materiales/privado.pdf';

describe('archivos de curso', () => {
  let db;
  let api;
  let fetched; // URLs pedidas «a Cloudinary»
  const realFetch = deps.fetch;

  before(async () => {
    db = await startMemoryMongo();
    const app = express();
    configureExpress(app);
    const server = app.listen(0);
    const base = `http://127.0.0.1:${server.address().port}`;
    api = {
      close: () => new Promise((r) => server.close(r)),
      get: async (p, headers = {}, signal = AbortSignal.timeout(10000)) => {
        const res = await fetch(base + p, { headers, redirect: 'manual', signal });
        return { status: res.status, headers: res.headers, buf: Buffer.from(await res.arrayBuffer()) };
      },
      del: async (p, headers = {}) => {
        const res = await fetch(base + p, { method: 'DELETE', headers });
        return { status: res.status };
      },
    };
    deps.fetch = async (url) => {
      fetched.push(String(url));
      return new Response(PDF, { status: 200, headers: { 'Content-Type': 'application/pdf' } });
    };
  });
  after(async () => {
    deps.fetch = realFetch;
    await api.close();
    await db.stop();
  });
  beforeEach(async () => {
    fetched = [];
    await db.reset();
  });

  const json = (r) => JSON.parse(r.buf.toString());
  const setup = async (accessMode = 'private') => {
    const course = await fx.createCourse({ accessMode });
    const ana = await fx.createUser();
    const luis = await fx.createUser();
    await fx.createCohort(course, { members: [ana] });
    const tema = course.temas[0];
    return { course, ana, luis, material: tema.materiales[0], actividad: tema.actividadesOptativas[0] };
  };
  const materialPath = (course, id, q = '') => `/api/courses/${course._id}/materiales/${id}${q}`;

  describe('utilidades', () => {
    test('isOwnCloudinaryUrl solo acepta https://res.cloudinary.com/<nuestra cuenta>/…', () => {
      assert.equal(isOwnCloudinaryUrl(fx.MATERIAL_URL), true);
      assert.equal(isOwnCloudinaryUrl('https://evil.com/?cloudinary.com'), false);
      assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com.evil.com/demo-cloud/raw/upload/a.pdf'), false);
      assert.equal(isOwnCloudinaryUrl('http://res.cloudinary.com/demo-cloud/raw/upload/a.pdf'), false);
      assert.equal(isOwnCloudinaryUrl('https://res.cloudinary.com/otra-cuenta/raw/upload/a.pdf'), false);
      assert.equal(isOwnCloudinaryUrl('no es una url'), false);
    });

    test('cloudinaryRawAsset extrae tipo y public_id', () => {
      assert.deepEqual(cloudinaryRawAsset(AUTH_URL), { type: 'authenticated', publicId: 'learning-platform/materiales/privado.pdf' });
      assert.deepEqual(cloudinaryRawAsset(fx.MATERIAL_URL), { type: 'upload', publicId: 'learning-platform/materiales/guia.pdf' });
      assert.equal(cloudinaryRawAsset('https://res.cloudinary.com/demo-cloud/image/upload/v1/x.png'), null);
    });
  });

  describe('GET /api/courses/:id/materiales/:materialId', () => {
    test('sin sesión en curso privado → 401 y no se descarga nada', async () => {
      const { course, material } = await setup();
      const r = await api.get(materialPath(course, material._id));
      assert.equal(r.status, 401);
      assert.deepEqual(fetched, []);
    });

    test('no miembro → 403 y no se descarga nada', async () => {
      const { course, luis, material } = await setup();
      const r = await api.get(materialPath(course, material._id), fx.authHeader(luis));
      assert.equal(r.status, 403);
      assert.equal(r.buf.includes(PDF), false);
      assert.deepEqual(fetched, []);
    });

    test('miembro → 200 con el PDF, sin caché compartida y sin exponer la URL', async () => {
      const { course, ana, material } = await setup();
      const r = await api.get(materialPath(course, material._id), fx.authHeader(ana));
      assert.equal(r.status, 200);
      assert.deepEqual(r.buf, PDF);
      assert.equal(r.headers.get('content-type'), 'application/pdf');
      assert.match(r.headers.get('cache-control'), /private/);
      assert.match(r.headers.get('content-disposition'), /^inline/);
      assert.deepEqual(fetched, [fx.MATERIAL_URL]);
    });

    test('PDF subido sin extensión en el public_id (así sube upload.js) → se sirve como PDF', async () => {
      const { course, ana } = await setup();
      const sinExtension = 'https://res.cloudinary.com/demo-cloud/raw/upload/v1/learning-platform/materiales/Tema_1-1712345678-123';
      course.temas[0].materiales[0].archivo = sinExtension;
      await course.save();
      const ok = deps.fetch;
      // Cloudinary sirve los raw como octet-stream
      deps.fetch = async () => new Response(PDF, { status: 200, headers: { 'Content-Type': 'application/octet-stream' } });
      try {
        const r = await api.get(materialPath(course, course.temas[0].materiales[0]._id), fx.authHeader(ana));
        assert.equal(r.status, 200);
        assert.equal(r.headers.get('content-type'), 'application/pdf');
        assert.match(r.headers.get('content-disposition'), /filename="Tema_1-1712345678-123\.pdf"/);
      } finally {
        deps.fetch = ok;
      }
    });

    test('?lang=en sirve la versión en inglés', async () => {
      const { course, ana, material } = await setup();
      await api.get(materialPath(course, material._id, '?lang=en'), fx.authHeader(ana));
      assert.deepEqual(fetched, [fx.MATERIAL_URL_EN]);
    });

    test('también sirve actividades optativas', async () => {
      const { course, ana, actividad } = await setup();
      const r = await api.get(materialPath(course, actividad._id), fx.authHeader(ana));
      assert.equal(r.status, 200);
    });

    test('material en Cloudinary authenticated → se pide con URL firmada y caducidad', async () => {
      const { course, ana, material } = await setup();
      await Course.updateOne({ _id: course._id }, { $set: { 'temas.0.materiales.0.archivo': AUTH_URL } });
      const r = await api.get(materialPath(course, material._id), fx.authHeader(ana));
      assert.equal(r.status, 200);
      assert.equal(fetched.length, 1);
      assert.match(fetched[0], /^https:\/\/api\.cloudinary\.com\/v1_1\/demo-cloud\/raw\/download\?/);
      assert.match(fetched[0], /expires_at=\d+/);
      assert.match(fetched[0], /type=authenticated/);
      assert.match(fetched[0], /signature=/);
    });

    test('enlace externo → JSON con la URL (no se hace de proxy de webs ajenas)', async () => {
      const { course, ana, material } = await setup();
      await Course.updateOne({ _id: course._id }, { $set: { 'temas.0.materiales.0.archivo': 'https://example.org/recurso', 'temas.0.materiales.0.tipo': 'enlace' } });
      const r = await api.get(materialPath(course, material._id), fx.authHeader(ana));
      assert.equal(r.status, 200);
      assert.deepEqual(json(r), { url: 'https://example.org/recurso' });
      assert.deepEqual(fetched, []);
    });

    test('material inexistente → 404', async () => {
      const { course, ana } = await setup();
      const r = await api.get(materialPath(course, '64b0000000000000000000ff'), fx.authHeader(ana));
      assert.equal(r.status, 404);
    });

    test('Cloudinary falla → 502 sin filtrar detalles', async () => {
      const { course, ana, material } = await setup();
      const ok = deps.fetch;
      deps.fetch = async () => new Response('nope', { status: 404 });
      try {
        const r = await api.get(materialPath(course, material._id), fx.authHeader(ana));
        assert.equal(r.status, 502);
      } finally {
        deps.fetch = ok;
      }
    });

    test('si Cloudinary corta la descarga a mitad, el servidor sigue vivo', async () => {
      const { course, ana, material } = await setup();
      // En producción una excepción no capturada tumba el proceso; aquí se recoge para comprobar que no la hay
      const crashes = [];
      const onCrash = (err) => crashes.push(String(err));
      process.on('uncaughtException', onCrash);
      const ok = deps.fetch;
      deps.fetch = async () => new Response(new ReadableStream({
        start(controller) {
          controller.enqueue(new Uint8Array([37, 80, 68, 70]));
          setTimeout(() => controller.error(new Error('ECONNRESET')), 20);
        },
      }), { status: 200 });
      try {
        // La respuesta se corta: el cliente recibe un error o un cuerpo incompleto, pero no se queda colgado
        await api.get(materialPath(course, material._id), { ...fx.authHeader(ana) }, AbortSignal.timeout(3000)).catch(() => null);
      } finally {
        deps.fetch = ok;
      }
      await new Promise((r) => setTimeout(r, 100));
      process.off('uncaughtException', onCrash);
      assert.deepEqual(crashes, []);
      const after = await api.get(materialPath(course, material._id), fx.authHeader(ana));
      assert.equal(after.status, 200);
    });

    test('curso público → sin sesión también 200', async () => {
      const { course, material } = await setup('public');
      const r = await api.get(materialPath(course, material._id));
      assert.equal(r.status, 200);
    });
  });

  describe('GET /api/pdf-proxy', () => {
    const proxy = (url) => `/api/pdf-proxy?url=${encodeURIComponent(url)}`;

    test('URL fuera de nuestra cuenta de Cloudinary → 400', async () => {
      for (const url of ['https://evil.com/?cloudinary.com', 'https://res.cloudinary.com.evil.com/demo-cloud/raw/upload/a.pdf', 'https://res.cloudinary.com/otra/raw/upload/a.pdf']) {
        assert.equal((await api.get(proxy(url))).status, 400, url);
      }
      assert.deepEqual(fetched, []);
    });

    test('material de curso privado: sin sesión 401, no miembro 403, miembro 200', async () => {
      const { ana, luis } = await setup();
      assert.equal((await api.get(proxy(fx.MATERIAL_URL))).status, 401);
      assert.equal((await api.get(proxy(fx.MATERIAL_URL), fx.authHeader(luis))).status, 403);
      const ok = await api.get(proxy(fx.MATERIAL_URL), fx.authHeader(ana));
      assert.equal(ok.status, 200);
      assert.deepEqual(ok.buf, PDF);
    });

    test('la versión en inglés de un material privado también está protegida', async () => {
      await setup();
      assert.equal((await api.get(proxy(fx.MATERIAL_URL_EN))).status, 401);
    });

    test('nunca firma: una URL «authenticated» (exacta o retocada) → 400 y no se pide nada', async () => {
      const { course } = await setup();
      await Course.updateOne({ _id: course._id }, { $set: { 'temas.0.materiales.0.archivo': AUTH_URL } });
      const variants = [AUTH_URL, `${AUTH_URL}?x=1`, AUTH_URL.replace('/v1/', '/'), AUTH_URL.replace('/v1/', '/v2/')];
      for (const url of variants) {
        assert.equal((await api.get(proxy(url))).status, 400, url);
      }
      assert.deepEqual(fetched, []);
    });

    test('una variante de la URL de un material privado sigue protegida (se busca por public_id)', async () => {
      const { luis } = await setup();
      for (const url of [`${fx.MATERIAL_URL}?x=1`, fx.MATERIAL_URL.replace('/v1/', '/'), fx.MATERIAL_URL.replace('/v1/', '/v7/')]) {
        assert.equal((await api.get(proxy(url))).status, 401, url);
        assert.equal((await api.get(proxy(url), fx.authHeader(luis))).status, 403, url);
      }
      assert.deepEqual(fetched, []);
    });

    test('un archivo de nuestra cuenta que no es material de ningún curso → 404 (no es un proxy abierto)', async () => {
      await setup('public');
      const r = await api.get(proxy('https://res.cloudinary.com/demo-cloud/raw/upload/v1/otra-carpeta/secreto.pdf'));
      assert.equal(r.status, 404);
      assert.deepEqual(fetched, []);
    });

    test('material de curso público: igual que antes, sin sesión 200', async () => {
      await setup('public');
      const r = await api.get(proxy(fx.MATERIAL_URL));
      assert.equal(r.status, 200);
      assert.equal(r.headers.get('content-type'), 'application/pdf');
    });
  });

  describe('PDFs de entregas', () => {
    const writePdf = (name) => {
      fs.mkdirSync(UPLOADS, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS, name), PDF);
      return `/ejercicios/${name}`;
    };
    const crearEntrega = async (course, user, name = `test_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`) => {
      const ej = await Ejercicio.create({ cursoId: course._id, titulo: 'Ej', contexto: 'c', enunciado: 'e' });
      const url = writePdf(name);
      return EntregaEjercicio.create({ ejercicioId: ej._id, userId: user._id, cursoId: course._id, archivoPdf: { url, nombreOriginal: 'mi.pdf' } });
    };
    const cleanup = (entrega) => fs.rmSync(path.join(UPLOADS, path.basename(entrega.archivoPdf.url)), { force: true });

    test('ya no se sirven como estáticos', async () => {
      const { course, ana } = await setup();
      const entrega = await crearEntrega(course, ana);
      try {
        const r = await api.get(entrega.archivoPdf.url);
        assert.equal(r.status, 404);
        assert.equal(r.buf.includes(PDF), false);
      } finally {
        cleanup(entrega);
      }
    });

    test('el autor con acceso lo descarga; otro usuario no (404); un admin sí', async () => {
      const { course, ana, luis } = await setup();
      const admin = await fx.createUser({ role: 'admin' });
      const entrega = await crearEntrega(course, ana);
      try {
        const own = await api.get(`/api/entregas/${entrega._id}/archivo`, fx.authHeader(ana));
        assert.equal(own.status, 200);
        assert.deepEqual(own.buf, PDF);
        assert.match(own.headers.get('cache-control'), /private/);
        assert.equal((await api.get(`/api/entregas/${entrega._id}/archivo`, fx.authHeader(luis))).status, 404);
        assert.equal((await api.get(`/api/entregas/${entrega._id}/archivo`, fx.authHeader(admin))).status, 200);
        assert.equal((await api.get(`/api/entregas/${entrega._id}/archivo`)).status, 401);
      } finally {
        cleanup(entrega);
      }
    });

    test('el autor sin acceso al curso (edición revocada) → 403', async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      await fx.createCohort(course, { window: 'ended', afterEnd: 'revoke', members: [ana] });
      const entrega = await crearEntrega(course, ana);
      try {
        assert.equal((await api.get(`/api/entregas/${entrega._id}/archivo`, fx.authHeader(ana))).status, 403);
      } finally {
        cleanup(entrega);
      }
    });

    test('borrar una entrega borra también su PDF del disco', async () => {
      const { course, ana } = await setup();
      const entrega = await crearEntrega(course, ana);
      const file = path.join(UPLOADS, path.basename(entrega.archivoPdf.url));
      try {
        const del = await api.del(`/api/entregas/${entrega._id}`, fx.authHeader(ana));
        assert.equal(del.status, 200);
        assert.equal(fs.existsSync(file), false);
      } finally {
        cleanup(entrega);
      }
    });

    test('una url guardada con ../ no sale de la carpeta de entregas', async () => {
      const { course, ana } = await setup();
      const ej = await Ejercicio.create({ cursoId: course._id, titulo: 'Ej', contexto: 'c', enunciado: 'e' });
      const entrega = await EntregaEjercicio.create({ ejercicioId: ej._id, userId: ana._id, cursoId: course._id, archivoPdf: { url: '/ejercicios/../../package.json' } });
      const r = await api.get(`/api/entregas/${entrega._id}/archivo`, fx.authHeader(ana));
      assert.equal(r.status, 404);
    });
  });
});
