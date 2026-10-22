// Datos de prueba para los tests de cohortes (requieren startMemoryMongo()).
import express from 'express';
import User from '../../src/models/User.js';
import Course from '../../src/models/Course.js';
import Cohort from '../../src/models/Cohort.js';
import { signToken } from '../../src/config/jwt.js';

export const DAY = 24 * 60 * 60 * 1000;
export const MATERIAL_URL = 'https://res.cloudinary.com/demo-cloud/raw/upload/v1/learning-platform/materiales/guia.pdf';
export const MATERIAL_URL_EN = 'https://res.cloudinary.com/demo-cloud/raw/upload/v1/learning-platform/materiales/guide.pdf';

let seq = 0;
export async function createUser({ role = 'usuario', email, activo = true } = {}) {
  seq += 1;
  // La contraseña se guarda ya «hasheada» para no pagar bcrypt en cada test (pre('save') solo hashea si cambia)
  const user = await User.collection.insertOne({
    name: `Usuario ${seq}`,
    email: email ?? `user${seq}@x.es`,
    password: 'x',
    role,
    activo,
    createdAt: new Date(),
  });
  return User.findById(user.insertedId);
}

export const tokenFor = (user) => signToken({ id: user._id, email: user.email });
export const authHeader = (user) => ({ Authorization: `Bearer ${tokenFor(user)}` });

export async function createCourse({ accessMode = 'public', isOpen = true, title = 'Curso' } = {}) {
  return Course.create({
    title,
    description: 'Descripción',
    accessMode,
    isOpen,
    idiomasDisponibles: ['es'],
    temas: [{
      numeroTema: 1,
      titulo: 'Tema 1',
      materiales: [{ tipo: 'pdf', titulo: 'Guía', archivo: MATERIAL_URL, archivoEn: MATERIAL_URL_EN, idioma: 'both' }],
      actividadesOptativas: [{ tipo: 'pdf', titulo: 'Extra', archivo: MATERIAL_URL.replace('guia', 'extra') }],
    }],
  });
}

// Ventanas relativas a ahora: 'open' (en curso), 'future' (aún no empieza), 'ended' (ya terminó)
const WINDOWS = {
  open: () => ({ startsAt: new Date(Date.now() - 10 * DAY), endsAt: new Date(Date.now() + 30 * DAY) }),
  future: () => ({ startsAt: new Date(Date.now() + 10 * DAY), endsAt: new Date(Date.now() + 60 * DAY) }),
  ended: () => ({ startsAt: new Date(Date.now() - 60 * DAY), endsAt: new Date(Date.now() - 1 * DAY) }),
};

export async function createCohort(course, { window = 'open', afterEnd = 'readonly', members = [], name = 'Cohorte' } = {}) {
  const cohort = await Cohort.create({
    name,
    course: course._id,
    afterEnd,
    ...WINDOWS[window](),
    // Acepta usuarios (→ miembro activo) u objetos de miembro tal cual ({ email, status, user, … })
    members: members.map((m) => (m instanceof User
      ? { user: m._id, email: m.email, status: 'active', source: 'email' }
      : { status: 'active', source: 'email', user: null, ...m })),
  });
  await Course.updateOne({ _id: course._id }, { $addToSet: { cohorts: cohort._id } });
  return cohort;
}

// App mínima con las rutas indicadas: [['/api/courses', router], …]
export function listen(mounts) {
  const app = express();
  app.use(express.json());
  for (const [path, router] of mounts) app.use(path, router);
  const server = app.listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  const call = async (method, path, { headers = {}, body } = {}) => {
    const res = await fetch(base + path, {
      method,
      redirect: 'manual',
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch { /* no JSON */ }
    return { status: res.status, headers: res.headers, text, body: json };
  };
  return { server, call, close: () => new Promise((r) => server.close(r)) };
}
