// Backend de la prueba de extremo a extremo de Dudas (front_learningprjct/e2e/dudas.spec.js).
// NO forma parte de `npm test`. Uso (desde backend_learningprjct): node scripts/e2e/dudasServer.mjs
//
// - Mongo en memoria (mongodb-memory-server, versión fijada en package.json): nunca una base real.
// - No lee el .env del backend: se arranca con el directorio de trabajo en scripts/e2e/.out (sin .env)
//   y se borra MONGODB_URI por si viniera del entorno.
// - Correo simulado: el transporte de nodemailer se sustituye ANTES de importar mailService y cada
//   mensaje se añade como una línea JSON a scripts/e2e/.out/mails.jsonl. No sale ningún correo.
// - Escucha en http://localhost:8551 (E2E_PORT). Rutas propias de la prueba (solo aquí):
//     GET  /__e2e/seed   → ids y datos sembrados
//     POST /__e2e/reset  → vacía la base y el registro de correos y vuelve a sembrar
// - Siembra dos cursos privados («Suelos vivos», «Agua y riego») y uno público («Compost en casa») con
//   un alumno inscrito (Pablo) y una profesora activa sin inscripción (Clara).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(here, '.out');
const MAIL_LOG = path.join(OUT, 'mails.jsonl');
fs.mkdirSync(OUT, { recursive: true });
// dotenv busca .env en el directorio de trabajo: aquí no hay ninguno
process.chdir(OUT);

const PORT = Number(process.env.E2E_PORT || 8551);
delete process.env.MONGODB_URI;
process.env.JWT_SECRET = 'e2e-dudas-secret-0123456789-abcdefghijklmnop';
process.env.NODE_ENV = 'development';
process.env.FRONTEND_URL = 'http://localhost:5175';
process.env.EMAIL_USER = 'campus@example.test';
process.env.EMAIL_PASS = '';
process.env.CONTACT_TO = 'campus@example.test';

// ---- Correo simulado (antes de que nada importe mailService) ----
const { default: nodemailer } = await import('nodemailer');
nodemailer.createTransport = () => ({
  sendMail: async (opts) => {
    const line = { at: new Date().toISOString(), to: opts.to, subject: opts.subject, text: opts.text ?? null, html: opts.html ?? null };
    fs.appendFileSync(MAIL_LOG, `${JSON.stringify(line)}\n`);
    return { messageId: `e2e-${Date.now()}` };
  },
  verify: async () => true,
});

const { default: mongoose } = await import('mongoose');
const { MongoMemoryServer } = await import('mongodb-memory-server');
const { default: bcrypt } = await import('bcryptjs');
const { default: express } = await import('express');

const mongod = await MongoMemoryServer.create();
await mongoose.connect(mongod.getUri(), { dbName: 'e2e-dudas' });
console.log(`[e2e] Mongo en memoria: ${mongod.getUri()}`);

const { default: User } = await import('../../src/models/User.js');
const { default: Course } = await import('../../src/models/Course.js');
const { default: Cohort } = await import('../../src/models/Cohort.js');
const { default: UserProgress } = await import('../../src/models/UserProgress.js');
const { default: TermsAcceptance } = await import('../../src/models/TermsAcceptance.js');
const { currentTermsVersion } = await import('../../src/service/termsService.js');
const { default: app } = await import('../../src/app.js');

export const PASSWORD = 'e2e-pass-123';
const DAY = 24 * 60 * 60 * 1000;
const HASH = bcrypt.hashSync(PASSWORD, 10);

const PEOPLE = {
  ana: { name: 'Ana Martín', email: 'ana@e2e.test' },
  bruno: { name: 'Bruno Ruiz', email: 'bruno@e2e.test' },
  laura: { name: 'Laura Pérez', email: 'laura@e2e.test' },
  oscar: { name: 'Óscar Gil', email: 'oscar@e2e.test' },
  marta: { name: 'Marta Soler', email: 'marta@e2e.test' }, // sin rol: se la invita como profesora en la prueba
  pablo: { name: 'Pablo Núñez', email: 'pablo@e2e.test' }, // inscrito en el curso público
  clara: { name: 'Clara Vidal', email: 'clara@e2e.test' }, // profesora del curso público, sin inscripción
  admin: { name: 'Admin E2E', email: 'admin@e2e.test', role: 'admin' },
};

async function insertUser({ name, email, role = 'usuario' }) {
  const { insertedId } = await User.collection.insertOne({
    name, email, password: HASH, role, activo: true, createdAt: new Date(),
  });
  return insertedId;
}

async function seed() {
  const users = {};
  for (const [key, person] of Object.entries(PEOPLE)) users[key] = await insertUser(person);

  const curso = await Course.create({
    title: 'Suelos vivos (E2E)',
    description: 'Curso privado de prueba para el recorrido de Dudas.',
    accessMode: 'private',
    isOpen: true,
    idiomasDisponibles: ['es'],
    temas: [
      {
        numeroTema: 1,
        titulo: 'Qué es el carbono del suelo',
        descripcion: 'Primer tema de prueba.',
        apartados: [{ titulo: 'Introducción', items: ['Ciclo del carbono', 'Materia orgánica'] }],
      },
      { numeroTema: 2, titulo: 'Medir el carbono', descripcion: 'Segundo tema de prueba.' },
    ],
  });
  const otroCurso = await Course.create({
    title: 'Agua y riego (E2E)',
    description: 'Otro curso privado: Óscar es su profesor.',
    accessMode: 'private',
    isOpen: true,
    idiomasDisponibles: ['es'],
    temas: [{ numeroTema: 1, titulo: 'Balance hídrico' }],
  });

  // Curso público: Pablo inscrito; Clara es su profesora activa y no está inscrita
  const cursoPublico = await Course.create({
    title: 'Compost en casa (E2E)',
    description: 'Curso público de prueba: dudas solo para inscritos y profesores.',
    accessMode: 'public',
    isOpen: true,
    idiomasDisponibles: ['es'],
    temas: [{ numeroTema: 1, titulo: 'Qué es el compost', descripcion: 'Tema del curso público.' }],
  });

  const profesorActivo = (userId, email) => ({
    _id: new mongoose.Types.ObjectId(), email, status: 'active', userId, tokenHash: null, redeemedTokenHash: null,
    tokenExpiresAt: null, lastSentAt: new Date(), addedBy: users.admin, addedAt: new Date(), linkedAt: new Date(),
  });
  await Course.updateOne({ _id: curso._id }, { $set: { profesores: [profesorActivo(users.laura, PEOPLE.laura.email)] } });
  await Course.updateOne({ _id: otroCurso._id }, { $set: { profesores: [profesorActivo(users.oscar, PEOPLE.oscar.email)] } });
  await Course.updateOne({ _id: cursoPublico._id }, { $set: { profesores: [profesorActivo(users.clara, PEOPLE.clara.email)] } });

  const member = (key) => ({ user: users[key], email: PEOPLE[key].email, status: 'active', source: 'email' });
  const abierta = await Cohort.create({
    name: 'Edición abierta', course: curso._id, afterEnd: 'readonly',
    startsAt: new Date(Date.now() - 10 * DAY), endsAt: new Date(Date.now() + 30 * DAY), members: [member('ana')],
  });
  const cerrada = await Cohort.create({
    name: 'Edición terminada', course: curso._id, afterEnd: 'readonly',
    startsAt: new Date(Date.now() - 60 * DAY), endsAt: new Date(Date.now() - 1 * DAY), members: [member('bruno')],
  });
  await Course.updateOne({ _id: curso._id }, { $set: { cohorts: [abierta._id, cerrada._id] } });

  await UserProgress.create([
    { userId: users.ana, courseId: curso._id },
    { userId: users.bruno, courseId: curso._id },
    { userId: users.pablo, courseId: cursoPublico._id },
  ]);

  // Condiciones aceptadas: Ana, Bruno y Laura en el curso. Óscar (en el suyo) y Marta, NO: así se
  // comprueba que a un profesor sin aceptación se le piden las condiciones la primera vez.
  const termsVersion = currentTermsVersion();
  await TermsAcceptance.create(['ana', 'bruno', 'laura'].map((k) => ({
    userId: users[k], courseId: curso._id, termsVersion, acceptedAt: new Date(), ip: '127.0.0.1', userAgent: 'e2e-seed',
  })));
  await TermsAcceptance.create(['pablo', 'clara'].map((k) => ({
    userId: users[k], courseId: cursoPublico._id, termsVersion, acceptedAt: new Date(), ip: '127.0.0.1', userAgent: 'e2e-seed',
  })));

  const temas = curso.temas.map((t) => ({ _id: String(t._id), numeroTema: t.numeroTema, titulo: t.titulo }));
  return {
    password: PASSWORD,
    courseId: String(curso._id),
    courseTitle: curso.title,
    otherCourseId: String(otroCurso._id),
    otherCourseTitle: otroCurso.title,
    temas,
    publicCourseId: String(cursoPublico._id),
    publicCourseTitle: cursoPublico.title,
    publicTemas: cursoPublico.temas.map((t) => ({ _id: String(t._id), numeroTema: t.numeroTema, titulo: t.titulo })),
    users: Object.fromEntries(Object.entries(PEOPLE).map(([k, p]) => [k, { ...p, id: String(users[k]) }])),
  };
}

async function reset() {
  const { collections } = mongoose.connection;
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})));
  fs.writeFileSync(MAIL_LOG, '');
  return seed();
}

let seeded = await reset();

const root = express();
root.get('/__e2e/seed', (req, res) => res.json(seeded));
root.post('/__e2e/reset', async (req, res, next) => {
  try {
    seeded = await reset();
    res.json(seeded);
  } catch (err) {
    next(err);
  }
});
root.use(app);

const server = root.listen(PORT, () => {
  console.log(`[e2e] Backend de Dudas en http://localhost:${PORT} · correos en ${MAIL_LOG}`);
});

const shutdown = async () => {
  server.close();
  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
