// Reglas de corrección de entregas: validación de la nota y el estado, intentos y aviso al alumno.

export const ESTADOS_ENTREGA = ['enviado', 'revisado', 'aprobado', 'rechazado'];
export const MAX_RECHAZOS = 2;

const LABEL_ESTADO = { revisado: 'Requiere cambios', aprobado: 'Aprobado', rechazado: 'Rechazado' };
export const etiquetaEstado = (estado) => LABEL_ESTADO[estado] ?? 'Enviado';

export class CorreccionError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.status = 400;
  }
}

// `null` borra la nota; `undefined` la deja como está
const leerCalificacion = (valor) => {
  if (valor === undefined) return undefined;
  if (valor === null || valor === '') return null;
  const n = typeof valor === 'number' ? valor : Number(valor);
  if (!Number.isFinite(n) || n < 0 || n > 10) {
    throw new CorreccionError('La calificación debe estar entre 0 y 10');
  }
  return n;
};

/**
 * Aplica una corrección sobre el documento (sin guardarlo).
 * Los intentos solo suben al pasar a «rechazado» desde otro estado: volver a guardar una
 * entrega ya rechazada (p. ej. para editar la nota) no cuenta como un rechazo nuevo.
 */
export function aplicarCorreccion(entrega, { calificacion, feedbackProfesor, estado } = {}) {
  const nota = leerCalificacion(calificacion);

  if (estado !== undefined && !ESTADOS_ENTREGA.includes(estado)) {
    throw new CorreccionError('Estado no válido');
  }

  if (nota === null) entrega.calificacion = undefined;
  else if (nota !== undefined) entrega.calificacion = nota;

  if (feedbackProfesor !== undefined) entrega.feedbackProfesor = feedbackProfesor;

  if (estado) {
    if (estado === 'rechazado' && entrega.estado !== 'rechazado') {
      entrega.intentos = (entrega.intentos || 0) + 1;
      if (entrega.intentos >= MAX_RECHAZOS) entrega.bloqueado = true;
    }
    entrega.estado = estado;
  }

  entrega.fechaRevision = new Date();
  return entrega;
}

const misma = (a, b) => (a ?? null) === (b ?? null);

// Solo se avisa si cambió el estado o la nota respecto a lo último notificado (y nunca por «enviado»)
export const debeNotificar = (entrega) =>
  entrega.estado !== 'enviado' &&
  !(misma(entrega.notificado?.estado, entrega.estado) && misma(entrega.notificado?.calificacion, entrega.calificacion));

export const marcarNotificado = (entrega) => {
  entrega.notificado = { estado: entrega.estado, calificacion: entrega.calificacion, fecha: new Date() };
};
