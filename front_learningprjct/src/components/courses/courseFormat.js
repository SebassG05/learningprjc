// Lectura y formato de los datos de un curso (idioma, horas, nivel, área) y filtro del listado.
import { LANGUAGE_NAMES, LEVEL_LABELS, STATS } from './coursesCopy';

// Idioma elegido por curso (como antes: lang_<id> en localStorage). Sin almacenamiento, español.
export const savedLanguage = (id) => {
  try {
    return localStorage.getItem(`lang_${id}`);
  } catch {
    return null;
  }
};
export const saveLanguage = (id, lang) => {
  try {
    localStorage.setItem(`lang_${id}`, lang);
  } catch {
    /* sin almacenamiento: la elección dura lo que la página */
  }
};

export function courseLanguages(course) {
  const list = (course.idiomasDisponibles || []).filter((l) => l === 'es' || l === 'en');
  if (list.length) return [...new Set(list)];
  return [course.title && 'es', course.titleEn && 'en'].filter(Boolean);
}

// Mismo criterio que la versión anterior: idiomas declarados o título en los dos idiomas
export const isBilingual = (course) => {
  const list = course.idiomasDisponibles || [];
  return (list.includes('es') && list.includes('en')) || Boolean(course.title && course.titleEn);
};

export function courseText(course, lang = savedLanguage(course._id)) {
  if (lang === 'en' && course.titleEn) {
    return { title: course.titleEn, description: course.descriptionEn || course.description || '' };
  }
  return { title: course.title || course.titleEn || '', description: course.description || course.descriptionEn || '' };
}

// «30», «18 horas» o «20 h» → 30, 18, 20. Sin número → null (no se muestra)
export function courseHours(course) {
  const match = String(course.duration ?? '').match(/\d+(?:[.,]\d+)?/);
  const hours = match ? Number(match[0].replace(',', '.')) : NaN;
  return Number.isFinite(hours) && hours > 0 ? hours : null;
}

export const formatHours = (h) => `${String(h).replace('.', ',')} h`;

export const topicCount = (course) => course.temas?.length ?? 0;

export const levelLabel = (slug) => (slug ? LEVEL_LABELS[slug] ?? slug.charAt(0).toUpperCase() + slug.slice(1) : null);

export const areaLabel = (catalog, slug) => catalog?.areas?.find((a) => a.slug === slug)?.label ?? null;

// «30 h · 21 temas · ES / EN», omitiendo lo que falte
export function courseMeta(course) {
  const hours = courseHours(course);
  const topics = topicCount(course);
  const langs = courseLanguages(course).map((l) => LANGUAGE_NAMES[l]);
  return [
    hours && formatHours(hours),
    topics > 0 && `${topics} ${STATS.topics(topics)}`,
    langs.length > 0 && langs.join(' / '),
  ]
    .filter(Boolean)
    .join(' · ');
}

const normalize = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Texto de búsqueda de cada curso, calculado una vez por carga
export const buildSearchIndex = (courses) =>
  new Map(
    courses.map((c) => [
      c._id,
      normalize([c.title, c.titleEn, c.description, c.descriptionEn, ...(c.category || [])].join(' ')),
    ])
  );

export function filterCourses(courses, index, { q, area, nivel }) {
  const needle = normalize(q).trim();
  return courses.filter(
    (c) =>
      (!area || c.area === area) &&
      (!nivel || c.nivel === nivel) &&
      (!needle || (index.get(c._id) ?? '').includes(needle))
  );
}
