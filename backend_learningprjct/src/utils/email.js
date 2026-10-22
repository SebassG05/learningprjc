// Un único criterio para comparar emails en todo el backend: sin espacios y en minúsculas
// (User.email ya se guarda así). Cohortes, invitaciones e interesados lo usan siempre.

export const normalizeEmail = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

// Forma básica (algo@dominio.tld, sin espacios). No pretende validar RFC 5322: solo filtra lo que
// claramente no es un email al pegar listas en el panel.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (value) => EMAIL_RE.test(normalizeEmail(value)) && normalizeEmail(value).length <= 254;
