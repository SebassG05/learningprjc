// Reglas puras de las dudas (sin base de datos): firma pública, rol, estado, retirada y vista pública.
import { isAdminViewer } from './courseAccess.js';

const words = (name) => String(name ?? '').trim().split(/\s+/).filter(Boolean);

/** Firma visible. Alumno: «Laura P.» (primer nombre + inicial de la última palabra). */
export function nombrePublico(name, rol) {
  const parts = words(name);
  if (rol === 'profesor') return parts.join(' ') || 'Profesor';
  if (rol === 'equipo') return parts.join(' ') || 'Equipo docente';
  if (parts.length === 0) return 'Alumno';
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${[...last][0].toUpperCase()}.`;
}

/** Rol con el que firma quien escribe: profesor del curso > admin (equipo) > alumno. */
export function rolDe({ access, viewer }) {
  if (access?.teacher === true) return 'profesor';
  if (isAdminViewer(viewer)) return 'equipo';
  return 'alumno';
}

/** Estado que corresponde a la duda. «resuelta» se mantiene; no muta. */
export function recalcularEstado(duda) {
  if (duda.estado === 'resuelta') return 'resuelta';
  const hayDocente = (duda.respuestas ?? []).some((r) => !r.oculta && r.rol !== 'alumno');
  return hayDocente ? 'respondida' : 'abierta';
}

/**
 * Retira la duda del autor. Sin respuestas se borra; con respuestas se vacía el contenido y la autoría
 * (null, no oculto) para que el hilo siga teniendo sentido. Muta la duda; quien llama la guarda.
 * @returns {'borrar'|'retirada'}
 */
export function retirarDuda(duda) {
  if (!duda.respuestas || duda.respuestas.length === 0) return 'borrar';
  duda.retirada = true;
  duda.titulo = null;
  duda.texto = null;
  duda.autorNombre = null;
  duda.autorId = null;
  return 'retirada';
}

const same = (a, b) => Boolean(a && b && String(a) === String(b));

/** Vista pública: nunca expone autorId ni reportes. null si la duda está oculta y no se modera. */
export function toPublic(duda, { viewerId, moderador } = {}) {
  const src = typeof duda?.toObject === 'function' ? duda.toObject() : duda;
  if (src.oculta && !moderador) return null;
  const { autorId, reportes, respuestas, __v, ...rest } = src;
  const visibles = (respuestas ?? []).filter((r) => moderador || !r.oculta);
  const out = {
    ...rest,
    mine: same(viewerId, autorId),
    puedeModerar: Boolean(moderador),
    respuestas: visibles.map(({ autorId: rAutor, ...r }) => ({ ...r, mine: same(viewerId, rAutor) })),
  };
  if (moderador) out.reportesCount = (reportes ?? []).length;
  return out;
}
