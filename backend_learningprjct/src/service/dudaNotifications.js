// Avisos por correo de Dudas. Se lanzan tras guardar y sin esperar en la respuesta HTTP: un fallo del
// correo nunca cambia el resultado de la petición. Cada aviso se reclama antes con un update condicional
// (at-most-once): si dos peticiones compiten o se vuelve a llamar, solo una envía.
import Course from '../models/Course.js';
import User from '../models/User.js';
import Duda from '../models/Duda.js';
import { sendDudaNuevaEmail, sendDudaRespuestaEmail } from './mailService.js';
import { frontendUrl } from './cohortInvites.js';

const same = (a, b) => Boolean(a && b && String(a) === String(b));

const dudaUrl = (duda) => `${frontendUrl()}/curso/${duda.cursoId}/dudas#duda-${duda._id}`;

// Títulos del curso y del tema en el idioma de la duda (con el otro idioma como respaldo)
async function titulos(duda) {
  const course = await Course.findById(duda.cursoId)
    .select('title titleEn temas._id temas.titulo temas.tituloEn temas.numeroTema').lean();
  const en = duda.lang === 'en';
  const pick = (es, enValue) => (en ? enValue || es : es || enValue) || '';
  const cursoTitulo = pick(course?.title, course?.titleEn);
  let temaTitulo = duda.temaId === 'general' ? 'General' : '';
  if (duda.temaId !== 'general') {
    const tema = course?.temas?.find((t) => String(t._id) === String(duda.temaId));
    temaTitulo = tema ? pick(tema.titulo, tema.tituloEn) || `Tema ${tema.numeroTema}` : '';
  }
  return { cursoTitulo, temaTitulo };
}

// Correos de los profesores con acceso activo; sin ninguno, la cuenta del campus
async function destinatariosProfesores(cursoId) {
  const course = await Course.findById(cursoId).select('+profesores').lean();
  const ids = (course?.profesores ?? []).filter((p) => p.status === 'active' && p.userId).map((p) => p.userId);
  const emails = new Set();
  for (const id of ids) {
    const user = await User.findById(id).select('email name').lean();
    if (user?.email) emails.add(user.email);
  }
  if (!emails.size && process.env.EMAIL_USER) emails.add(process.env.EMAIL_USER);
  return [...emails];
}

/**
 * Avisa a los profesores de una duda nueva (un correo por destinatario).
 * @returns {Promise<number>} correos enviados
 */
export async function notificarDudaNueva(duda) {
  const claim = await Duda.updateOne(
    { _id: duda._id, 'notificado.nuevaAt': null },
    { $set: { 'notificado.nuevaAt': new Date() } },
  );
  if (claim.modifiedCount !== 1) return 0;

  const [to, { cursoTitulo, temaTitulo }] = await Promise.all([destinatariosProfesores(duda.cursoId), titulos(duda)]);
  const data = {
    url: dudaUrl(duda), cursoTitulo, temaTitulo, titulo: duda.titulo, texto: duda.texto, autorNombre: duda.autorNombre,
  };
  const results = await Promise.allSettled(to.map((email) => sendDudaNuevaEmail({ to: email, ...data })));
  results.filter((r) => r.status === 'rejected').forEach((r) => console.error('Aviso de duda nueva no enviado:', r.reason?.message ?? r.reason));
  return results.filter((r) => r.status === 'fulfilled').length;
}

/**
 * Avisa al autor de que el profesorado ha respondido a su duda.
 * @returns {Promise<boolean>} true si se envió
 */
export async function notificarRespuesta(duda, respuestaId) {
  const respuesta = duda.respuestas?.id?.(respuestaId)
    ?? duda.respuestas?.find((r) => same(r._id, respuestaId));
  if (!respuesta || respuesta.rol === 'alumno' || respuesta.oculta) return false;
  if (duda.retirada || !duda.autorId || same(duda.autorId, respuesta.autorId)) return false;

  const claim = await Duda.updateOne(
    { _id: duda._id, respuestas: { $elemMatch: { _id: respuesta._id, notificadoAt: null } } },
    { $set: { 'respuestas.$.notificadoAt': new Date() } },
  );
  if (claim.modifiedCount !== 1) return false;

  const autor = await User.findById(duda.autorId).select('email').lean();
  if (!autor?.email) return false;
  const { cursoTitulo, temaTitulo } = await titulos(duda);
  await sendDudaRespuestaEmail({
    to: autor.email,
    url: dudaUrl(duda),
    cursoTitulo,
    temaTitulo,
    tituloDuda: duda.titulo,
    respuestaTexto: respuesta.texto,
    respondeNombre: respuesta.autorNombre,
  });
  return true;
}

// Avisos en vuelo: los tests esperan a que terminen en lugar de dormir
const enVuelo = new Set();

/** Lanza un aviso sin esperar: registra el error y nunca rechaza. */
export function lanzarAviso(promesa, etiqueta) {
  const p = Promise.resolve(promesa)
    .catch((err) => console.error(`Aviso de dudas (${etiqueta}) no enviado:`, err?.message ?? err))
    .finally(() => enVuelo.delete(p));
  enVuelo.add(p);
  return p;
}

/** Para tests: resuelve cuando no queda ningún aviso en vuelo. */
export async function esperarAvisos() {
  while (enVuelo.size) await Promise.all([...enVuelo]);
}
