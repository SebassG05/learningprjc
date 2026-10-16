// Catálogo de cursos: áreas (el filtro principal de /cursos) y niveles.
// Las áreas se editan solo aquí: el front las pide a GET /api/courses/areas y no tiene ninguna escrita.
// Para añadir un área basta con sumar una entrada; el `slug` es lo que se guarda en cada curso, así que no se renombra.
export const COURSE_AREAS = Object.freeze([
  { slug: 'desarrollo-datos', label: 'Desarrollo y datos', labelEn: 'Development and data' },
  { slug: 'sostenibilidad', label: 'Sostenibilidad', labelEn: 'Sustainability' },
]);

export const AREA_SLUGS = COURSE_AREAS.map((a) => a.slug);

// El orden importa: es el del filtro y el de la ficha
export const COURSE_LEVELS = Object.freeze(['inicial', 'intermedio', 'avanzado']);

export const PROFESOR_LIMITS = Object.freeze({ nombre: 120, bio: 400 });
