// Formato de presentación de las reseñas. Nada de esto cambia los datos: solo cómo se leen.

const LOCALE = 'es-ES';
export const MAX_RATING = 5;

// Forma única que reciben las tarjetas y la órbita, venga la reseña del GET o del POST.
// El POST responde { message, review }; la página la guarda tal cual en la lista.
export function toReviewViewModel(item, index = 0) {
  const raw = item && typeof item === 'object' && item.review ? item.review : item ?? {};
  const name = typeof raw.user === 'string' && raw.user.trim() ? raw.user.trim() : (raw.name || '').trim() || 'Alumno del campus';
  const rating = Math.min(MAX_RATING, Math.max(0, Math.round(Number(raw.rating) || 0)));
  const text = typeof raw.description === 'string' ? raw.description.trim() : '';
  const date = raw.createdAt ? new Date(raw.createdAt) : null;
  return {
    id: raw._id ? String(raw._id) : `review-${index}`,
    name,
    initials: initialsOf(name),
    tone: toneOf(name),
    rating,
    text,
    date: date && !Number.isNaN(date.getTime()) ? date : null,
  };
}

// "María José Fernández" → "MF"; "ana.garcia@example.com" → "AG"; "Luis" → "L"
export function initialsOf(name) {
  const base = name.includes('@') ? name.split('@')[0].replace(/[._-]+/g, ' ') : name;
  const words = base.split(/\s+/).filter((w) => /\p{L}/u.test(w));
  if (words.length === 0) return '·';
  const first = words[0].match(/\p{L}/u)[0];
  const last = words.length > 1 ? words[words.length - 1].match(/\p{L}/u)[0] : '';
  return (first + last).toLocaleUpperCase(LOCALE);
}

// Tono del avatar, estable para cada nombre (índice dentro de AVATAR_TONES de la tarjeta)
export function toneOf(name, tones = 4) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.codePointAt(0)) >>> 0;
  return hash % tones;
}

const relative = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto' });
const full = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' });
const STEPS = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
];

// "hace 3 días", "ayer", "hace 2 meses"; menos de un minuto → "ahora"
export function formatRelativeDate(date, now = new Date()) {
  const seconds = Math.round((date.getTime() - now.getTime()) / 1000);
  for (const [unit, size] of STEPS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.trunc(seconds / size), unit);
  }
  return 'ahora';
}

export const formatFullDate = (date) => full.format(date);

const average = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
export const formatAverage = (value) => average.format(value);

// Cuántas reseñas hay de cada puntuación, de 5 a 1
export function ratingDistribution(reviews) {
  const counts = Array.from({ length: MAX_RATING }, () => 0);
  for (const r of reviews) if (r.rating >= 1) counts[r.rating - 1] += 1;
  return counts.map((count, i) => ({ stars: i + 1, count })).reverse();
}

export const reviewsLabel = (n) => (n === 1 ? '1 reseña' : `${new Intl.NumberFormat(LOCALE).format(n)} reseñas`);
export const starsLabel = (n) => `${n} de ${MAX_RATING} estrellas`;
