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
