// Materiales nuevos de un curso privado se suben como «authenticated» (no tienen URL pública).
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);
process.env.CLOUDINARY_CLOUD_NAME = 'demo-cloud';
process.env.CLOUDINARY_API_KEY = '123';
process.env.CLOUDINARY_API_SECRET = 'secreto-de-prueba';

const { startMemoryMongo } = await import('./helpers/memoryMongo.js');
const fx = await import('./helpers/cohortFixtures.js');
const { uploadParams } = await import('../src/middleware/upload.js');

const pdf = (fieldname = 'archivo') => ({ fieldname, originalname: 'Guía tema 1.pdf', mimetype: 'application/pdf' });

describe('uploadParams', () => {
  let db;
  before(async () => {
    db = await startMemoryMongo();
  });
  after(() => db.stop());
  beforeEach(() => db.reset());

  test('material de un curso privado → raw authenticated', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    const params = await uploadParams({ params: { id: String(course._id) } }, pdf());
    assert.equal(params.resource_type, 'raw');
    assert.equal(params.type, 'authenticated');
    assert.equal(params.folder, 'learning-platform/materiales');
  });

  test('también la versión en inglés y las actividades optativas', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    assert.equal((await uploadParams({ params: { id: String(course._id) } }, pdf('archivoEn'))).type, 'authenticated');
  });

  test('material de un curso público → como siempre (upload)', async () => {
    const course = await fx.createCourse({ accessMode: 'public' });
    const params = await uploadParams({ params: { id: String(course._id) } }, pdf());
    assert.equal(params.type, undefined);
    assert.equal(params.resource_type, 'raw');
  });

  test('portadas y fotos siguen siendo públicas aunque el curso sea privado', async () => {
    const course = await fx.createCourse({ accessMode: 'private' });
    const params = await uploadParams({ params: { id: String(course._id) } }, { fieldname: 'image', originalname: 'portada.jpg' });
    assert.equal(params.type, undefined);
    assert.equal(params.resource_type, 'image');
  });
});
