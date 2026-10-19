// Textos de la pestaña Reservas.

export const STAT_FILTERS = [
  { value: '', label: 'Todas', tone: 'neutral', statKey: 'total' },
  { value: 'enrolled', label: 'En curso', tone: 'neutral', statKey: 'enrolled' },
  { value: 'completed', label: 'Completadas', tone: 'brand', statKey: 'completed' },
];

export const COPY = {
  statsLabel: 'Filtrar por estado de la inscripción',
  viewLabel: 'Vista',
  views: { list: 'Lista', calendar: 'Calendario' },
  searchLabel: 'Buscar inscripciones',
  searchPlaceholder: 'Alumno o curso',
  courseLabel: 'Curso',
  allCourses: 'Todos los cursos',
  dateLabel: 'Fecha de inscripción',
  sortLabel: 'Ordenar',
  results: (n) => (n === 1 ? '1 inscripción' : `${n.toLocaleString('es-ES')} inscripciones`),
  loadMore: 'Cargar más',
  loadingMore: 'Cargando…',
  columns: { student: 'Alumno', course: 'Curso', date: 'Inscripción', status: 'Estado', progress: 'Progreso', action: 'Acción' },
  progressOf: (name) => `Progreso de ${name}`,

  contact: 'Contactar',
  contactLabel: (name) => `Contactar con ${name} por email`,
  noEmail: 'Sin email',
  contactSubject: (course) => `Tu inscripción en «${course}»`,

  calendar: {
    prev: 'Mes anterior',
    next: 'Mes siguiente',
    today: 'Hoy',
    weekdays: [
      ['L', 'lunes'], ['M', 'martes'], ['X', 'miércoles'], ['J', 'jueves'], ['V', 'viernes'], ['S', 'sábado'], ['D', 'domingo'],
    ],
    dayLabel: (date, n) => `${date}: ${n === 0 ? 'sin inscripciones' : n === 1 ? '1 inscripción' : `${n} inscripciones`}`,
    more: (n) => `+${n} más`,
    monthTotal: (n) => (n === 1 ? '1 inscripción este mes' : `${n} inscripciones este mes`),
    agendaTitle: (date) => `Inscripciones del ${date}`,
    agendaEmpty: 'Nadie se inscribió este día.',
    pickDay: 'Elige un día para ver quién se inscribió.',
    truncated: 'Hay más de 500 inscripciones este mes: filtra por curso para verlas todas.',
  },

  empty: {
    none: { title: 'Todavía no hay inscripciones', description: 'Cuando alguien se inscriba en un curso aparecerá aquí.' },
    filtered: { title: 'Ninguna inscripción coincide', description: 'Prueba con otra búsqueda o quita algún filtro.', action: 'Limpiar filtros' },
    error: { title: 'No se han podido cargar las inscripciones', description: 'Comprueba la conexión y vuelve a intentarlo.', action: 'Reintentar' },
  },
};
