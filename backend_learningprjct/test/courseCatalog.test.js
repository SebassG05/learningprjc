// Catálogo de cursos (área, nivel y profesor): validación de campos y GET /api/courses/areas.
// Sin base de datos ni red externa. Ejecutar: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.JWT_SECRET = 'x'.repeat(40);

const { default: express } = await import('express');
const { parseCatalogFields, catalogFieldsForCreate, CatalogFieldError } = await import('../src/controller/courseCatalogFields.js');
const { COURSE_AREAS, COURSE_LEVELS } = await import('../src/config/courseCatalog.js');
const { default: router } = await import('../src/routes/course.routes.js');

let server;
let base;
before(() => {
  const app = express();
  app.use(express.json());
  app.use('/api/courses', router);
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}/api/courses`;
});
after(() => server.close());

test('campos ausentes: no se toca nada', () => {
  assert.deepEqual(parseCatalogFields({ title: 'x' }), { set: {}, unset: {} });
});

test('nivel y área válidos se guardan; vacíos se borran', () => {
  assert.deepEqual(parseCatalogFields({ nivel: 'intermedio', area: ' sostenibilidad ' }), {
    set: { nivel: 'intermedio', area: 'sostenibilidad' },
    unset: {},
  });
  assert.deepEqual(parseCatalogFields({ nivel: '', area: '' }), { set: {}, unset: { nivel: '', area: '' } });
});

test('nivel o área desconocidos se rechazan', () => {
  assert.throws(() => parseCatalogFields({ nivel: 'experto' }), CatalogFieldError);
  assert.throws(() => parseCatalogFields({ area: 'marketing' }), CatalogFieldError);
});

test('profesor: nombre, bio y foto subida', () => {
  const { set, unset } = parseCatalogFields(
    { profesorNombre: ' Ana Ruiz ', profesorBio: 'Ingeniera agrónoma.' },
    { profesorFoto: 'https://res.cloudinary.com/x/image/upload/ana.jpg' }
  );
  assert.deepEqual(set, {
    'profesor.nombre': 'Ana Ruiz',
    'profesor.bio': 'Ingeniera agrónoma.',
    'profesor.foto': 'https://res.cloudinary.com/x/image/upload/ana.jpg',
  });
  assert.deepEqual(unset, {});
});

test('profesor: vaciar el nombre borra el bloque entero (sin $set en conflicto)', () => {
  assert.deepEqual(parseCatalogFields({ profesorNombre: '', profesorBio: 'algo' }), { set: {}, unset: { profesor: '' } });
});

test('profesor: quitar foto y bio vacía', () => {
  const { set, unset } = parseCatalogFields({ profesorNombre: 'Ana', profesorBio: '', profesorQuitarFoto: 'true' });
  assert.deepEqual(set, { 'profesor.nombre': 'Ana' });
  assert.deepEqual(unset, { 'profesor.bio': '', 'profesor.foto': '' });
});

test('profesor: límites de longitud', () => {
  assert.throws(() => parseCatalogFields({ profesorNombre: 'a'.repeat(121) }), CatalogFieldError);
  assert.throws(() => parseCatalogFields({ profesorNombre: 'Ana', profesorBio: 'b'.repeat(401) }), CatalogFieldError);
});

test('crear: rutas con punto → documento anidado; profesor sin nombre no vale', () => {
  assert.deepEqual(catalogFieldsForCreate({ nivel: 'inicial', 'profesor.nombre': 'Ana', 'profesor.bio': 'Bio' }), {
    nivel: 'inicial',
    profesor: { nombre: 'Ana', bio: 'Bio' },
  });
  assert.throws(() => catalogFieldsForCreate({ 'profesor.bio': 'Bio' }), CatalogFieldError);
});

test('GET /areas devuelve el catálogo configurado, antes de /:id', async () => {
  const res = await fetch(`${base}/areas`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body.areas, COURSE_AREAS);
  assert.deepEqual(body.niveles, COURSE_LEVELS);
  assert.match(res.headers.get('cache-control'), /max-age=300/);
});

test('migración de áreas: sugerencias para los cursos actuales', async () => {
  const { suggestArea } = await import('../scripts/asignarAreas.js');
  const web = suggestArea({ title: 'Desarrollo de Aplicaciones Web y Análisis de Datos con IA Aplicada.', category: ['VSCode', 'React', 'Nodejs', 'IA'] });
  const anfora = suggestArea({ title: 'ANFORA: Gestión de la Huella Hídrica', category: ['footprint', 'soilwater', 'water'] });
  const carbono = suggestArea({ title: 'Modelización Dinámica de Carbono', category: ['Ciencia del Suelo', 'Modelización', 'Cambio Climático', 'Agricultura Sostenible'] });
  assert.equal(web.area, 'desarrollo-datos');
  assert.equal(anfora.area, 'sostenibilidad');
  assert.equal(carbono.area, 'sostenibilidad');
  assert.equal(suggestArea({ title: 'Curso', category: [] }).area, null);
});
