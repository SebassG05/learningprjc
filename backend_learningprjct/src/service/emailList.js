import { isValidEmail, normalizeEmail } from '../utils/email.js';

// «Ana Pérez <ana@x.es>» (como lo copia un cliente de correo) → « ana@x.es »
const DISPLAY_NAME = /[^,;\n<>]*<([^<>]+)>/g;

/**
 * Lista de emails pegada en el panel: uno por línea o separados por comas, punto y coma o espacios.
 * Normaliza (trim + minúsculas) y deduplica, conservando el orden en que aparecen.
 * @returns {{ valid: string[], invalid: string[] }}
 */
export function parseEmailList(text) {
  if (typeof text !== 'string') return { valid: [], invalid: [] };
  const valid = new Set();
  const invalid = new Set();
  for (const token of text.replace(DISPLAY_NAME, ' $1 ').split(/[\s,;]+/)) {
    if (!token) continue;
    const email = normalizeEmail(token);
    (isValidEmail(email) ? valid : invalid).add(isValidEmail(email) ? email : token.trim());
  }
  return { valid: [...valid], invalid: [...invalid] };
}
