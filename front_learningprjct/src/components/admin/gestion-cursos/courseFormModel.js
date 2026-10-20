// Formulario de curso: valores, validación (mensajes por campo) y envío como FormData. Sin React.

export const MAX_IMAGE = 5 * 1024 * 1024;
export const LANGS = ['es', 'en'];

export const emptyCourseForm = () => ({
  idiomas: ['es'],
  title: '',
  titleEn: '',
  description: '',
  descriptionEn: '',
  duration: '',
  image: '',
  imageFile: null,
  category: [],
  objetivosGenerales: [],
  objetivosGeneralesEn: [],
  objetivosEspecificos: [],
  objetivosEspecificosEn: [],
  isOpen: false,
});

export const formFromCourse = (c) => ({
  ...emptyCourseForm(),
  idiomas: c.idiomasDisponibles?.length ? c.idiomasDisponibles.filter((l) => LANGS.includes(l)) : ['es'],
  title: c.title || '',
  titleEn: c.titleEn || '',
  description: c.description || '',
  descriptionEn: c.descriptionEn || '',
  duration: c.duration || '',
  image: c.image || '',
  category: c.category || [],
  objetivosGenerales: c.objetivosGenerales || [],
  objetivosGeneralesEn: c.objetivosGeneralesEn || [],
  objetivosEspecificos: c.objetivosEspecificos || [],
  objetivosEspecificosEn: c.objetivosEspecificosEn || [],
  isOpen: Boolean(c.isOpen),
});

const blank = (s) => !s || !String(s).trim();

/**
 * Errores por campo (mensaje en línea). Mismas reglas que el backend: con un idioma activo,
 * su título y su descripción son obligatorios. `catalogError` viene de catalogFieldsError.
 */
export function validateCourse(f, catalogError = null) {
  const e = {};
  if (!f.idiomas.length) e.idiomas = 'Elige al menos un idioma.';
  if (f.idiomas.includes('es')) {
    if (blank(f.title)) e.title = 'Escribe el título en español.';
    if (blank(f.description)) e.description = 'Escribe la descripción en español.';
  }
  if (f.idiomas.includes('en')) {
    if (blank(f.titleEn)) e.titleEn = 'Escribe el título en inglés.';
    if (blank(f.descriptionEn)) e.descriptionEn = 'Escribe la descripción en inglés.';
  }
  if (f.imageFile) {
    if (!f.imageFile.type?.startsWith('image/')) e.image = 'La portada tiene que ser una imagen (JPG, PNG o WebP).';
    else if (f.imageFile.size > MAX_IMAGE) e.image = 'La portada no puede superar los 5 MB.';
  }
  if (catalogError) e.profesorNombre = catalogError;
  return e;
}

// Orden de los campos en pantalla: el foco va al primero con error
export const FIELD_ORDER = ['idiomas', 'title', 'titleEn', 'description', 'descriptionEn', 'image', 'profesorNombre'];
export const firstError = (errors) => FIELD_ORDER.find((k) => errors[k]) ?? Object.keys(errors)[0] ?? null;

// Igual que antes: textos recortados, listas como JSON y la portada solo si hay archivo nuevo
export function courseFormData(f, appendCatalog) {
  const fd = new FormData();
  const put = (k, v) => {
    if (!blank(v)) fd.append(k, String(v).trim());
  };
  if (f.idiomas.includes('es')) {
    put('title', f.title);
    put('description', f.description);
  }
  if (f.idiomas.includes('en')) {
    put('titleEn', f.titleEn);
    put('descriptionEn', f.descriptionEn);
  }
  fd.append('duration', f.duration.trim() || '0 horas');
  fd.append('isOpen', String(f.isOpen));
  fd.append('category', JSON.stringify(f.category));
  fd.append('objetivosGenerales', JSON.stringify(f.objetivosGenerales));
  fd.append('objetivosGeneralesEn', JSON.stringify(f.objetivosGeneralesEn));
  fd.append('objetivosEspecificos', JSON.stringify(f.objetivosEspecificos));
  fd.append('objetivosEspecificosEn', JSON.stringify(f.objetivosEspecificosEn));
  fd.append('idiomasDisponibles', JSON.stringify(f.idiomas));
  appendCatalog?.(fd);
  if (f.imageFile) fd.append('image', f.imageFile);
  return fd;
}

// ¿Hay cambios sin guardar? (los archivos nuevos cuentan como cambio)
export const isDirty = (a, b) => JSON.stringify({ ...a, imageFile: null }) !== JSON.stringify({ ...b, imageFile: null }) || Boolean(a.imageFile);
