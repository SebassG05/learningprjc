// Utilidades puras del acceso. No añaden reglas: leen la validación nativa del navegador
// (required, type="email") y la presentan.

// Google Identity Services acepta anchos de 200 a 400 px
const GOOGLE_MIN = 200;
const GOOGLE_MAX = 400;

export function googleButtonWidth(px) {
  if (!Number.isFinite(px)) return GOOGLE_MAX;
  return Math.round(Math.min(GOOGLE_MAX, Math.max(GOOGLE_MIN, px)));
}

// Mensaje a mostrar junto al campo ('' si es válido)
export function fieldMessage(el) {
  return el.validity?.valid === false ? el.validationMessage : '';
}

// Primer control inválido del formulario, en el orden del DOM
export function firstInvalid(form) {
  for (const el of form.elements) {
    if (el.validity?.valid === false) return el;
  }
  return null;
}

// Indicador informativo de "Repetir contraseña": no valida ni bloquea el envío
export function passwordMatch(password, confirm) {
  if (!confirm) return null;
  return password === confirm ? 'match' : 'mismatch';
}

// Textos propios para los fallos que ya detecta el navegador (required y type="email").
// Solo se usan cuando el campo ya es inválido de forma nativa: no hay reglas nuevas.
const MISSING = {
  name: 'Escribe tu nombre.',
  email: 'Escribe tu correo electrónico.',
  password: 'Escribe tu contraseña.',
  confirmPassword: 'Repite la contraseña.',
  // Formulario de Contacto
  subject: 'Escribe el asunto o elige un motivo.',
  message: 'Escribe tu mensaje.',
  privacy: 'Acepta la información de protección de datos para poder enviar el mensaje.',
};
const EMAIL_FORMAT = 'Revisa el correo: debe tener el formato nombre@dominio.com.';

export function customMessage(el) {
  const v = el.validity;
  if (!v || v.valid) return '';
  if (v.valueMissing) return MISSING[el.name] ?? '';
  if (v.typeMismatch && el.name === 'email') return EMAIL_FORMAT;
  return '';
}

// Hoja móvil: se cierra al soltarla lejos (px) o con un gesto rápido hacia abajo (px/s)
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 600;

export function shouldDismissSheet(offsetY, velocityY) {
  return offsetY > DISMISS_DISTANCE || (velocityY > DISMISS_VELOCITY && offsetY > 0);
}
