// Temario nuevo de Carbono: vídeo de cada tema (acceso por cohortes, URLs firmadas), PDFs subidos como
// image en la pasarela y en la migración a authenticated, y script de contenido idempotente.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { default: courseRoutes } = await import('../src/routes/course.routes.js');
const { temaVideoUrls, POSTER_WIDTHS } = await import('../src/service/courseVideoService.js');
const { cloudinaryFileAsset, upstreamUrl, deps } = await import('../src/service/materialFiles.js');
const { migrateCourseMaterials } = await import('../src/service/materialsMigration.js');
const { applyTemasContent } = await import('../src/service/temasContent.js');
const { CARBONO_TEMAS } = await import('../src/config/carbonoTemas.js');

const VIDEO = { publicId: 'tema01_mvwphs', version: 1793022076 };
const PDF_UP = 'https://res.cloudinary.com/demo-cloud/image/upload/v1793020848/Tema_1_axmsja.pdf';
const PDF_AUTH = 'https://res.cloudinary.com/demo-cloud/image/authenticated/v2/Tema_1_axmsja.pdf';

describe('temaVideoUrls', () => {
  test('upload: MP4 sd (≤720p) y hd con f_auto,q_auto y pósters a los 2 s en cada ancho', () => {
    const r = temaVideoUrls(VIDEO);
    assert.match(r.sd, /\/video\/upload\/c_limit,h_720\/f_auto,q_auto\/v1793022076\/tema01_mvwphs\.mp4$/);
    assert.match(r.hd, /\/video\/upload\/f_auto,q_auto\/v1793022076\/tema01_mvwphs\.mp4$/);
    assert.deepEqual(r.posters.map((p) => p.width), POSTER_WIDTHS);
    for (const p of r.posters) assert.match(p.url, new RegExp(`so_2/c_limit,f_auto,q_auto,w_${p.width}/v1793022076/tema01_mvwphs\\.jpg$`));
    assert.equal(r.poster, r.posters[1].url);
    assert.equal(r.hls, undefined);
  });

  test('authenticated: todas las URLs van firmadas', () => {
    const r = temaVideoUrls({ ...VIDEO, type: 'authenticated' });
    for (const url of [r.sd, r.hd, ...r.posters.map((p) => p.url)]) assert.match(url, /\/video\/authenticated\/s--[\w-]{8}--\//, url);
  });

  test('un tipo desconocido se trata como upload (sin firmar)', () => {
    assert.match(temaVideoUrls({ ...VIDEO, type: 'otro' }).hd, /\/video\/upload\//);
  });
});

describe('PDFs subidos como image', () => {
  test('cloudinaryFileAsset reconoce raw y PDFs image (sin la extensión en el public_id)', () => {
    assert.deepEqual(cloudinaryFileAsset(PDF_UP), { resourceType: 'image', type: 'upload', publicId: 'Tema_1_axmsja', format: 'pdf' });
    assert.deepEqual(cloudinaryFileAsset(PDF_AUTH), { resourceType: 'image', type: 'authenticated', publicId: 'Tema_1_axmsja', format: 'pdf' });
    assert.equal(cloudinaryFileAsset(fx.MATERIAL_URL).resourceType, 'raw');
    assert.equal(cloudinaryFileAsset('https://res.cloudinary.com/demo-cloud/image/upload/v1/foto.png'), null);
  });

  test('upstreamUrl firma la descarga de un PDF image authenticated con su formato', () => {
    const url = new URL(upstreamUrl(PDF_AUTH));
    assert.equal(url.hostname, 'api.cloudinary.com');
    assert.match(url.pathname, /\/demo-cloud\/image\/download$/);
    assert.equal(url.searchParams.get('public_id'), 'Tema_1_axmsja');
    assert.equal(url.searchParams.get('format'), 'pdf');
    assert.equal(url.searchParams.get('type'), 'authenticated');
    assert.equal(upstreamUrl(PDF_UP), PDF_UP);
  });
});

describe('con base de datos', () => {
  let db;
  let srv;
  const realFetch = deps.fetch;
  before(async () => {
    db = await startMemoryMongo();
    srv = fx.listen([['/api/courses', courseRoutes]]);
  });
  after(async () => {
    deps.fetch = realFetch;
    await srv.close();
    await db.stop();
  });
  beforeEach(() => db.reset());

  const withVideo = async (accessMode, video = { ...VIDEO, type: 'authenticated' }) => {
    const course = await fx.createCourse({ accessMode });
    course.temas[0].video = video;
    await course.save();
    return { course, tema: course.temas[0] };
  };
  const videoPath = (course, tema) => `/api/courses/${course._id}/temas/${tema._id}/video`;

  describe('GET /api/courses/:id/temas/:temaId/video', () => {
    test('curso privado: anónimo 401, no miembro 403, miembro 200 con URLs firmadas y sin caché compartida', async () => {
      const { course, tema } = await withVideo('private');
      const ana = await fx.createUser();
      const luis = await fx.createUser();
      await fx.createCohort(course, { members: [ana] });

      assert.equal((await srv.call('GET', videoPath(course, tema))).status, 401);
      assert.equal((await srv.call('GET', videoPath(course, tema), { headers: fx.authHeader(luis) })).status, 403);
      const ok = await srv.call('GET', videoPath(course, tema), { headers: fx.authHeader(ana) });
      assert.equal(ok.status, 200);
      assert.match(ok.body.hd, /\/video\/authenticated\/s--/);
      assert.match(ok.headers.get('cache-control'), /no-store/);
    });

    test('cohorte aún no empezada: 403; terminada en solo lectura: 200', async () => {
      const { course, tema } = await withVideo('private');
      const ana = await fx.createUser();
      const eva = await fx.createUser();
      await fx.createCohort(course, { window: 'future', members: [ana] });
      await fx.createCohort(course, { window: 'ended', members: [eva], name: 'Anterior' });
      assert.equal((await srv.call('GET', videoPath(course, tema), { headers: fx.authHeader(ana) })).status, 403);
      assert.equal((await srv.call('GET', videoPath(course, tema), { headers: fx.authHeader(eva) })).status, 200);
    });

    test('tema sin vídeo o id inexistente: 404', async () => {
      const course = await fx.createCourse();
      assert.equal((await srv.call('GET', videoPath(course, course.temas[0]))).status, 404);
      assert.equal((await srv.call('GET', `/api/courses/${course._id}/temas/64b0000000000000000000aa/video`)).status, 404);
      assert.equal((await srv.call('GET', `/api/courses/${course._id}/temas/nope/video`)).status, 404);
    });

    test('la ficha sin acceso no lleva el vídeo del tema', async () => {
      const { course } = await withVideo('private');
      const r = await srv.call('GET', `/api/courses/${course._id}`);
      assert.equal(r.status, 200);
      assert.equal(r.body.temas[0].video, undefined);
    });
  });

  test('la pasarela sirve un PDF image authenticated firmando la descarga', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    course.temas[0].materiales[0].archivo = PDF_AUTH;
    await course.save();
    const ana = await fx.createUser();
    await fx.createCohort(course, { members: [ana] });
    const fetched = [];
    deps.fetch = async (url) => {
      fetched.push(String(url));
      return new Response('%PDF-1.4', { status: 200, headers: { 'Content-Type': 'application/pdf' } });
    };
    const res = await srv.call('GET', `/api/courses/${course._id}/materiales/${course.temas[0].materiales[0]._id}`, { headers: fx.authHeader(ana) });
    assert.equal(res.status, 200);
    assert.match(fetched[0], /^https:\/\/api\.cloudinary\.com\/v1_1\/demo-cloud\/image\/download\?/);
  });

  describe('enlace de corta duración de un material (pestaña nueva en móvil)', () => {
    const setup = async () => {
      const course = await fx.createCourse({ accessMode: 'private' });
      const ana = await fx.createUser();
      const luis = await fx.createUser();
      const cohort = await fx.createCohort(course, { members: [ana] });
      deps.fetch = async () => new Response('%PDF-1.4', { status: 200, headers: { 'Content-Type': 'application/pdf' } });
      const [material, actividad] = [course.temas[0].materiales[0], course.temas[0].actividadesOptativas[0]];
      return { course, ana, luis, cohort, material, actividad };
    };
    const enlace = (course, id, headers = {}) => srv.call('POST', `/api/courses/${course._id}/materiales/${id}/enlace`, { headers });

    test('solo con acceso: anónimo 401, no miembro 403, miembro 200', async () => {
      const { course, ana, luis, material } = await setup();
      assert.equal((await enlace(course, material._id)).status, 401);
      assert.equal((await enlace(course, material._id, fx.authHeader(luis))).status, 403);
      const r = await enlace(course, material._id, fx.authHeader(ana));
      assert.equal(r.status, 200);
      assert.match(r.body.path, new RegExp(`^/api/courses/${course._id}/materiales/${material._id}\\?ticket=`));
    });

    test('el enlace sirve el PDF sin cabecera Authorization y sin Referer', async () => {
      const { course, ana, material } = await setup();
      const { body } = await enlace(course, material._id, fx.authHeader(ana));
      const pdf = await srv.call('GET', body.path);
      assert.equal(pdf.status, 200);
      assert.equal(pdf.headers.get('content-type'), 'application/pdf');
      assert.equal(pdf.headers.get('referrer-policy'), 'no-referrer');
      assert.match(pdf.headers.get('cache-control'), /no-store/);
    });

    test('el ticket solo vale para su material', async () => {
      const { course, ana, material, actividad } = await setup();
      const { body } = await enlace(course, material._id, fx.authHeader(ana));
      const ticket = new URL(body.path, 'http://x').searchParams.get('ticket');
      const otro = await srv.call('GET', `/api/courses/${course._id}/materiales/${actividad._id}?ticket=${encodeURIComponent(ticket)}`);
      assert.equal(otro.status, 401);
      assert.equal((await srv.call('GET', `/api/courses/${course._id}/materiales/${material._id}?ticket=basura`)).status, 401);
    });

    test('un ticket no vale como sesión ni una sesión como ticket', async () => {
      const { course, ana, material } = await setup();
      const { body } = await enlace(course, material._id, fx.authHeader(ana));
      const ticket = new URL(body.path, 'http://x').searchParams.get('ticket');
      const { verifyToken } = await import('../src/config/jwt.js');
      assert.throws(() => verifyToken(ticket));
      const sesion = encodeURIComponent(fx.tokenFor(ana));
      assert.equal((await srv.call('GET', `/api/courses/${course._id}/materiales/${material._id}?ticket=${sesion}`)).status, 401);
    });

    test('caducado → 401', async () => {
      const { course, ana, material } = await setup();
      const { default: jwt } = await import('jsonwebtoken');
      const viejo = jwt.sign(
        { id: String(ana._id), c: String(course._id), m: String(material._id), exp: Math.floor(Date.now() / 1000) - 5 },
        `${process.env.JWT_SECRET}|material-ticket`, { algorithm: 'HS256', audience: 'material-ticket' },
      );
      assert.equal((await srv.call('GET', `/api/courses/${course._id}/materiales/${material._id}?ticket=${viejo}`)).status, 401);
    });

    test('el acceso se vuelve a comprobar al usarlo: sin plaza activa → 403', async () => {
      const { course, ana, cohort, material } = await setup();
      const { body } = await enlace(course, material._id, fx.authHeader(ana));
      const { default: Cohort } = await import('../src/models/Cohort.js');
      await Cohort.updateOne({ _id: cohort._id }, { $set: { 'members.0.status': 'pending' } });
      assert.equal((await srv.call('GET', body.path)).status, 403);
    });
  });

  describe('migración a authenticated', () => {
    const fake = () => {
      const calls = [];
      return {
        calls,
        rename: async (from, to, opts) => {
          calls.push({ from, ...opts });
          const ext = opts.resource_type === 'image' ? '.pdf' : '';
          return { type: opts.to_type, version: 9, secure_url: `https://res.cloudinary.com/demo-cloud/${opts.resource_type}/${opts.to_type}/v9/${to}${ext}` };
        },
      };
    };

    test('mueve PDFs image y el vídeo del tema; repetirlo no hace nada', async () => {
      const { course } = await withVideo('private', VIDEO);
      course.temas[0].materiales[0].archivo = PDF_UP;
      await course.save();
      const api = fake();
      const r = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api });
      assert.ok(r.files.every((f) => f.status === 'done'), JSON.stringify(r.files));
      assert.deepEqual(api.calls.map((c) => c.resource_type).sort(), ['image', 'raw', 'raw', 'video']);
      const tema = (await Course.findById(course._id).lean()).temas[0];
      assert.equal(tema.materiales[0].archivo, 'https://res.cloudinary.com/demo-cloud/image/authenticated/v9/Tema_1_axmsja.pdf');
      assert.deepEqual(tema.video, { publicId: VIDEO.publicId, version: 9, type: 'authenticated' });

      const again = fake();
      const r2 = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api: again });
      assert.ok(r2.files.every((f) => f.status === 'skipped'));
      assert.deepEqual(again.calls, []);
    });
  });

  describe('applyTemasContent', () => {
    const cuatroTemas = () => Course.create({
      title: 'Carbono',
      description: 'd',
      temas: [1, 2, 3, 4].map((n) => ({
        numeroTema: n,
        titulo: `Antiguo ${n}`,
        materiales: [{ tipo: 'pdf', titulo: 'Viejo', archivo: `https://res.cloudinary.com/demo-cloud/raw/upload/v1/viejo${n}` }],
      })),
    });

    test('simulacro: lista los cambios y no escribe', async () => {
      const course = await cuatroTemas();
      const r = await applyTemasContent({ courseId: course._id, temas: CARBONO_TEMAS });
      assert.equal(r.changes.length, 4 * 6); // titulo, descripcion, apartados, conceptosClave, video, pdf
      assert.equal((await Course.findById(course._id).lean()).temas[0].titulo, 'Antiguo 1');
    });

    test('apply guarda el temario; repetirlo, también tras migrar a authenticated, no cambia nada', async () => {
      const course = await cuatroTemas();
      await applyTemasContent({ courseId: course._id, temas: CARBONO_TEMAS, apply: true });
      const t1 = (await Course.findById(course._id).lean()).temas[0];
      assert.equal(t1.titulo, 'Carbono del suelo');
      assert.equal(t1.materiales.length, 1);
      assert.equal(t1.materiales[0].archivo, CARBONO_TEMAS[0].pdf);
      assert.deepEqual(t1.video, { ...CARBONO_TEMAS[0].video, type: 'upload' });
      assert.ok(t1.apartados.length >= 4 && t1.conceptosClave.length >= 3);

      // Simula la migración: mismo public_id, URL authenticated y vídeo authenticated
      const doc = await Course.findById(course._id);
      for (const t of doc.temas) {
        t.materiales[0].archivo = t.materiales[0].archivo.replace('/image/upload/', '/image/authenticated/');
        t.video.type = 'authenticated';
      }
      await doc.save();
      const r = await applyTemasContent({ courseId: course._id, temas: CARBONO_TEMAS, apply: true });
      assert.deepEqual(r.changes, []);
      const after = (await Course.findById(course._id).lean()).temas[0];
      assert.match(after.materiales[0].archivo, /\/image\/authenticated\//);
      assert.equal(after.video.type, 'authenticated');
    });

    test('un tema que falta se informa y no se crea', async () => {
      const course = await Course.create({ title: 'C', description: 'd', temas: [{ numeroTema: 1, titulo: 'x' }] });
      const r = await applyTemasContent({ courseId: course._id, temas: CARBONO_TEMAS, apply: true });
      assert.deepEqual(r.missing, [2, 3, 4]);
      const temas = (await Course.findById(course._id).lean()).temas;
      assert.equal(temas.length, 1);
      assert.equal(temas[0].materiales[0].archivo, CARBONO_TEMAS[0].pdf); // sin material: se añade
    });
  });
});
