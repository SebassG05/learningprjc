// Textos de Cursos (listado, ficha e inscripción) en un único sitio.
// Lo que describe cada curso (título, descripción, objetivos, temas…) no está aquí: sale de la API.

// ───────────────────────────────────────────────────────────────────────────────
// PROVISIONAL: textos pendientes de los definitivos (antes de cerrar la fase 2).
// Todo lo que hay en este bloque se puede cambiar sin tocar componentes.
// ───────────────────────────────────────────────────────────────────────────────
export const PROVISIONAL = {
  pageTitle: 'Cursos · Evenor-Tech Campus',
  pageDescription:
    'Cursos online prácticos de desarrollo, datos y sostenibilidad: temario por módulos, material propio y tu progreso siempre a la vista.',
  listIntro: {
    eyebrow: 'Cursos',
    title: 'Aprende haciendo.',
    lead: 'Formación práctica en desarrollo, datos y sostenibilidad. Material propio, temario por módulos y tu progreso siempre a la vista.',
  },
  sheet: {
    outcomesEyebrow: 'Lo que te llevas',
    syllabusEyebrow: 'Temario por módulos',
    factsEyebrow: 'Ficha técnica',
    closingTitle: 'Empieza cuando quieras.',
    closingLead: 'El temario completo se abre en cuanto confirmas la inscripción.',
    comingSoonLead: 'Este curso abre pronto. Reserva tu plaza y te avisaremos cuando empiece.',
  },
};
// ─── Fin de PROVISIONAL ────────────────────────────────────────────────────────

export const STATS = {
  courses: (n) => (n === 1 ? 'curso' : 'cursos'),
  topics: (n) => (n === 1 ? 'tema' : 'temas'),
  hours: 'de contenido',
};

export const LIST_HEADING = 'Listado de cursos';

export const LEVEL_LABELS = { inicial: 'Inicial', intermedio: 'Intermedio', avanzado: 'Avanzado' };

export const FILTERS = {
  region: 'Filtrar cursos',
  searchLabel: 'Buscar cursos',
  searchPlaceholder: 'Buscar cursos',
  clearSearch: 'Borrar búsqueda',
  areaGroup: 'Área',
  allAreas: 'Todas',
  levelLabel: 'Nivel',
  allLevels: 'Todos los niveles',
  count: (n) => (n === 1 ? '1 curso' : `${n} cursos`),
};

export const CARD = {
  comingSoon: 'Próximamente',
  view: 'Ver curso',
  resume: 'Continuar',
  progress: 'Tu progreso',
  completed: 'Completado',
  moreTags: (n) => `+${n}`,
};

export const STATES = {
  loading: 'Cargando cursos…',
  emptyTitle: (q) => (q ? `Ningún curso coincide con «${q}»` : 'Ningún curso coincide con estos filtros'),
  emptyLead: 'Prueba con otra área o nivel, o borra la búsqueda.',
  clearFilters: 'Borrar filtros',
  noneTitle: 'Todavía no hay cursos publicados',
  noneLead: 'Vuelve pronto: estamos preparando los primeros.',
  errorTitle: 'No hemos podido cargar los cursos',
  errorLead: 'Comprueba tu conexión e inténtalo de nuevo.',
  retry: 'Reintentar',
  more: 'Ver más cursos',
};

export const LANGUAGE_NAMES = { es: 'ES', en: 'EN' };

export const SHEET = {
  breadcrumb: 'Cursos',
  loading: 'Cargando el curso…',
  notFoundTitle: 'No encontramos este curso',
  notFoundLead: 'Puede que ya no esté publicado o que el enlace no sea correcto.',
  errorTitle: 'No hemos podido cargar el curso',
  backToList: 'Ver todos los cursos',
  coverAlt: (title) => `Portada del curso ${title}`,
  languageGroup: 'Idioma del curso',
  seeSyllabus: 'Ver temario',
  outcomesTitle: 'Qué aprenderás',
  outcomesCount: (g, e) => [g && `${g} ${g === 1 ? 'objetivo general' : 'objetivos generales'}`, e && `${e} ${e === 1 ? 'específico' : 'específicos'}`].filter(Boolean).join(' y '),
  specificToggle: (n, open) => (open ? 'Ocultar los objetivos específicos' : `Ver los ${n} objetivos específicos`),
  specificTitle: 'Objetivos específicos',
  syllabusTitle: 'Temario',
  expandAll: 'Desplegar todo',
  collapseAll: 'Plegar todo',
  topicLabel: (n) => `Tema ${n}`,
  noTopicDetail: 'El detalle de este tema estará disponible pronto.',
  lockedMaterial: 'Disponible al inscribirte',
  openInClassroom: 'Abrir en el aula',
  materialFallback: (tipo) => ({ pdf: 'Documento PDF', video: 'Vídeo', enlace: 'Enlace', documento: 'Documento' }[tipo] ?? 'Material'),
  optionalActivity: 'Actividad optativa',
  factsTitle: 'Ficha técnica',
  facts: { duration: 'Duración', level: 'Nivel', topics: 'Temas', resources: 'Recursos', languages: 'Idiomas', teacher: 'Profesorado' },
  resources: (n) => `${n} ${n === 1 ? 'recurso' : 'recursos'}`,
  languageNames: { es: 'Español', en: 'English' },
};

export const MATERIAL_BADGE = { pdf: 'PDF', video: 'Vídeo', enlace: 'Enlace', documento: 'Doc' };

// Botón principal según el estado del alumno con el curso
export const ENROLL = {
  enroll: 'Inscribirme',
  reserve: 'Reservar plaza',
  goToCourse: 'Ir al curso',
  reserved: 'Plaza reservada',
  sending: 'Un momento…',
  reservedLead: 'Te avisaremos cuando el curso abra.',
  comingSoon: 'Próximamente',
  error: 'No se pudo completar la inscripción. Inténtalo de nuevo.',
  done: 'Inscripción completada',
};

