// Única fuente de verdad de los estados de una entrega y del umbral de aprobado.
// Sin dependencias de React: lo usan el panel de correcciones, la vista del alumno y los tests.

// Nota mínima para aprobar (decisión del 2026-10-19). El backend no la impone: es la guía del panel.
export const PASS_MARK = 5;
export const GRADE_MIN = 0;
export const GRADE_MAX = 10;
export const GRADE_STEP = 0.5;
// Al segundo rechazo el backend bloquea la entrega (el alumno ya no puede reentregar)
export const MAX_REJECTIONS = 2;

// `tone` se traduce a clases en StatusBadge/GradeBadge (solo colores de la paleta: neutro, dawn, brand, danger).
// «revisado» se muestra como «Requiere cambios» en todas partes (sin migrar datos).
export const SUBMISSION_STATUS = {
  enviado: { label: 'Pendiente', studentLabel: 'Enviado', tone: 'neutral', pending: true },
  revisado: { label: 'Requiere cambios', studentLabel: 'Requiere cambios', tone: 'dawn', pending: false },
  aprobado: { label: 'Aprobado', studentLabel: 'Aprobado', tone: 'brand', pending: false },
  rechazado: { label: 'Rechazado', studentLabel: 'Rechazado', tone: 'danger', pending: false },
};

export const STATUS_ORDER = ['enviado', 'revisado', 'aprobado', 'rechazado'];
// Estados que el profesor puede asignar al corregir
export const REVIEW_STATUSES = ['aprobado', 'revisado', 'rechazado'];

const UNKNOWN = { label: 'Desconocido', studentLabel: 'Desconocido', tone: 'neutral', pending: false };
export const statusInfo = (estado) => SUBMISSION_STATUS[estado] ?? UNKNOWN;
export const isPending = (estado) => statusInfo(estado).pending;

export const hasGrade = (nota) => typeof nota === 'number' && Number.isFinite(nota);

// Color por rango: suspenso (< 5), aprobado justo (5–6,5) y buena nota (≥ 7)
export function gradeTone(nota) {
  if (!hasGrade(nota)) return 'neutral';
  if (nota < PASS_MARK) return 'danger';
  if (nota < 7) return 'dawn';
  return 'brand';
}

// Acotada a 0–10 y redondeada al paso de 0,5. Devuelve null si no es un número.
export function normalizeGrade(value) {
  if (value === '' || value === null || value === undefined) return null;
  const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
  if (!Number.isFinite(n)) return null;
  const clamped = Math.min(GRADE_MAX, Math.max(GRADE_MIN, n));
  return Math.round(clamped / GRADE_STEP) * GRADE_STEP;
}

/**
 * Estado que se sugiere para una nota. Por debajo del umbral se sugiere «Requiere cambios» y no
 * «Rechazado»: rechazar consume un intento y al segundo se bloquea la entrega, así que esa decisión
 * debe tomarla el profesor de forma explícita.
 */
export function suggestStatus(nota) {
  if (!hasGrade(nota)) return null;
  return nota >= PASS_MARK ? 'aprobado' : 'revisado';
}

// Aviso (no bloquea) cuando el estado y la nota no encajan con el umbral
export function coherenceWarning(estado, nota) {
  if (estado === 'aprobado' && !hasGrade(nota)) return 'Vas a aprobar sin nota.';
  if (!hasGrade(nota)) return null;
  if (estado === 'aprobado' && nota < PASS_MARK) return `Aprobado con ${formatGrade(nota)}: el aprobado empieza en ${PASS_MARK}.`;
  if (estado === 'rechazado' && nota >= PASS_MARK) return `Rechazado con ${formatGrade(nota)}: es una nota de aprobado.`;
  return null;
}

// Acción principal según el estado: lo pendiente se corrige; lo calificado se consulta o se edita
export const primaryActionLabel = (estado) => (isPending(estado) ? 'Corregir' : 'Ver / Editar nota');

export const formatGrade = (nota) =>
  hasGrade(nota) ? nota.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 1 }) : '—';
