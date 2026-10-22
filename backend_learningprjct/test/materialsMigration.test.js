// Paso de los materiales de un curso a Cloudinary «authenticated» (y vuelta atrás). Cloudinary simulado.
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { default: Course } = await import('../src/models/Course.js');
const { migrateCourseMaterials } = await import('../src/service/materialsMigration.js');

const AUTH = (name) => `https://res.cloudinary.com/demo-cloud/raw/authenticated/v2/learning-platform/materiales/${name}`;

// Cloudinary falso: rename devuelve el asset con el tipo nuevo; `fail` hace fallar un public_id
function fakeCloudinary({ fail = null } = {}) {
  const calls = [];
  return {
    calls,
    rename: async (from, to, opts) => {
      calls.push({ from, to, ...opts });
      if (from === fail) throw new Error('boom');
      return { type: opts.to_type, secure_url: `https://res.cloudinary.com/demo-cloud/raw/${opts.to_type}/v2/${to}` };
    },
  };
}

describe('migrateCourseMaterials', () => {
  let db;
  before(async () => {
    db = await startMemoryMongo();
  });
  after(() => db.stop());
  beforeEach(() => db.reset());

  test('simulacro: lista los archivos públicos y no llama a Cloudinary', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    const api = fakeCloudinary();
    const r = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: false, api });
    assert.equal(r.files.length, 3); // archivo + archivoEn del material y archivo de la actividad
    assert.ok(r.files.every((f) => f.status === 'pending'));
    assert.deepEqual(api.calls, []);
    assert.equal((await Course.findById(course._id).lean()).temas[0].materiales[0].archivo, fx.MATERIAL_URL);
  });

  test('apply: renombra a authenticated (invalidando la CDN) y guarda las URLs nuevas', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    const api = fakeCloudinary();
    const r = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api });
    assert.equal(r.files.filter((f) => f.status === 'done').length, 3);
    assert.deepEqual(api.calls[0], {
      from: 'learning-platform/materiales/guia.pdf',
      to: 'learning-platform/materiales/guia.pdf',
      resource_type: 'raw',
      type: 'upload',
      to_type: 'authenticated',
      invalidate: true,
    });
    const m = (await Course.findById(course._id).lean()).temas[0].materiales[0];
    assert.equal(m.archivo, AUTH('guia.pdf'));
    assert.equal(m.archivoEn, AUTH('guide.pdf'));
  });

  test('idempotente: lo ya migrado se salta', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api: fakeCloudinary() });
    const api = fakeCloudinary();
    const r = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api });
    assert.ok(r.files.every((f) => f.status === 'skipped'));
    assert.deepEqual(api.calls, []);
  });

  test('un fallo no detiene el resto y no toca la URL de ese archivo', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    const api = fakeCloudinary({ fail: 'learning-platform/materiales/guide.pdf' });
    const r = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api });
    assert.equal(r.files.filter((f) => f.status === 'error').length, 1);
    assert.equal(r.files.filter((f) => f.status === 'done').length, 2);
    const m = (await Course.findById(course._id).lean()).temas[0].materiales[0];
    assert.equal(m.archivoEn, fx.MATERIAL_URL_EN);
    assert.equal(m.archivo, AUTH('guia.pdf'));
  });

  test('vuelta atrás: authenticated → upload', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: true, api: fakeCloudinary() });
    await migrateCourseMaterials({ courseId: course._id, to: 'upload', apply: true, api: fakeCloudinary() });
    const m = (await Course.findById(course._id).lean()).temas[0].materiales[0];
    assert.match(m.archivo, /\/raw\/upload\//);
  });

  test('ignora enlaces externos y URLs de otras cuentas', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    await Course.updateOne({ _id: course._id }, { $set: {
      'temas.0.materiales.0.archivo': 'https://example.org/x.pdf',
      'temas.0.materiales.0.archivoEn': 'https://res.cloudinary.com/otra/raw/upload/v1/x.pdf',
    } });
    const r = await migrateCourseMaterials({ courseId: course._id, to: 'authenticated', apply: false, api: fakeCloudinary() });
    assert.equal(r.files.length, 1); // solo la actividad
  });
});
