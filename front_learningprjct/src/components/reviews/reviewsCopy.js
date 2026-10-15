// Textos de la página de Reseñas. El titular habla a quien lee y a quien escribe.

export const PAGE_TITLE = 'Reseñas · Evenor-Tech Campus';
export const PAGE_DESCRIPTION = 'Opiniones de alumnos sobre los cursos de Evenor-Tech Campus y cómo dejar la tuya.';

// Dos propuestas de titular; `lead` va en blanco y `accent` en verde
export const HEADLINES = {
  a: { lead: 'Lo que cuentan quienes ya', accent: 'han estudiado aquí.' },
  b: { lead: 'Antes de empezar,', accent: 'escucha a quien ya llegó.' },
};
export const HEADLINE = HEADLINES.a;
export const SUBTITLE = 'Opiniones de alumnos del campus. Si ya has hecho un curso, deja la tuya.';

export const WALL_TITLE = 'Lo que cuentan los alumnos';
export const LATEST = 'La más reciente';
export const MINE = 'Tu reseña';
export const PREVIEW = 'Así se verá tu reseña';
export const NO_TEXT = 'Dejó su puntuación sin comentario.';

export const EMPTY = {
  title: 'Todavía nadie ha contado su experiencia.',
  body: 'Sé la primera persona en contar cómo te fue. Mientras tanto, echa un vistazo a los cursos.',
  waiting: 'Esperando la primera voz',
  cta: 'Ver cursos',
  write: 'Escribir la primera reseña',
};

export const INVITE = {
  eyebrow: 'Tu turno',
  title: '¿Has hecho un curso? Cuéntalo.',
  body: 'Accede para publicar tu reseña. Solo necesitas tu cuenta del campus.',
  cta: 'Iniciar sesión o registrarse',
};

export const COMPOSER = {
  eyebrow: 'Tu turno',
  title: 'Escribe tu reseña',
  as: 'Publicarás como',
  rating: 'Puntuación',
  ratingHint: 'Elige de 1 a 5 estrellas',
  text: 'Tu reseña',
  placeholder: '¿Qué te ha parecido el curso?',
  incomplete: 'Elige una puntuación y escribe tu reseña para publicarla.',
  submit: 'Publicar reseña',
  sending: 'Publicando…',
  success: 'Reseña publicada. Gracias por contarlo.',
  error: 'No se pudo enviar la reseña',
  count: (n, max) => `${n} / ${max}`,
};

// Tu reseña (una por persona): verla, editarla o borrarla
export const OWN = {
  eyebrow: 'Tu reseña',
  cooldownTitle: 'Ya has publicado hoy',
  cooldownBody: 'Puedes escribir una reseña al día. La siguiente, a partir de',
  latest: 'Tu última reseña',
  count: (n) => (n === 1 ? 'Tienes 1 reseña publicada.' : `Tienes ${n} reseñas publicadas.`),
  editWhich: 'tu reseña',
  edited: 'editada',
  show: 'Ver en el muro',
  edit: 'Editar',
  delete: 'Borrar',
  editTitle: 'Edita tu reseña',
  as: 'Publicada como',
  save: 'Guardar cambios',
  saving: 'Guardando…',
  cancel: 'Cancelar',
  confirm: '¿Borrar tu reseña? No se puede deshacer.',
  confirmYes: 'Sí, borrar',
  deleting: 'Borrando…',
  updated: 'Cambios guardados.',
  deleted: 'Reseña borrada.',
  updateError: 'No se pudieron guardar los cambios',
  deleteError: 'No se pudo borrar la reseña',
};

export const VOICES = {
  label: (n) => (n === 1 ? '1 voz' : `${n} voces`),
  hint: 'Una barra por reseña: la altura es lo que escribió cada alumno y el brillo, su nota. Pasa por una tarjeta para encontrar la suya.',
  more: (n) => ` Se muestran las ${n} más recientes.`,
};

export const SUMMARY_EMPTY = {
  title: 'Sin reseñas todavía',
  body: 'La media aparecerá con la primera. ¿Será la tuya?',
};
