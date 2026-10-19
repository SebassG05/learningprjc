// Textos de la pestaña Correcciones (en un solo sitio para revisarlos juntos).
import { MAX_REJECTIONS, PASS_MARK } from '../shared/submissionStatus.js';

export const STAT_FILTERS = [
  { value: '', label: 'Todas', tone: 'neutral', statKey: 'total' },
  { value: 'enviado', label: 'Pendientes', tone: 'neutral', statKey: 'enviado' },
  { value: 'revisado', label: 'Requieren cambios', tone: 'dawn', statKey: 'revisado' },
  { value: 'aprobado', label: 'Aprobadas', tone: 'brand', statKey: 'aprobado' },
  { value: 'rechazado', label: 'Rechazadas', tone: 'danger', statKey: 'rechazado' },
];

export const COPY = {
  statsLabel: 'Filtrar por estado',
  searchLabel: 'Buscar entregas',
  searchPlaceholder: 'Alumno, ejercicio o curso',
  courseLabel: 'Curso',
  allCourses: 'Todos los cursos',
  dateLabel: 'Fecha de entrega',
  sortLabel: 'Ordenar',
  results: (n) => (n === 1 ? '1 entrega' : `${n.toLocaleString('es-ES')} entregas`),
  loadMore: 'Cargar más',
  loadingMore: 'Cargando…',
  columns: { student: 'Alumno', exercise: 'Ejercicio y curso', course: 'Curso', date: 'Entregada', status: 'Estado', grade: 'Nota', action: 'Acción' },

  empty: {
    pending: { title: 'No hay entregas pendientes 🎉', description: 'Todo está corregido. Las nuevas entregas aparecerán aquí.' },
    none: { title: 'Todavía no hay entregas', description: 'Cuando un alumno entregue un ejercicio, lo verás aquí para corregirlo.' },
    filtered: { title: 'Ninguna entrega coincide', description: 'Prueba con otra búsqueda o quita algún filtro.', action: 'Limpiar filtros' },
    error: { title: 'No se han podido cargar las entregas', description: 'Comprueba la conexión y vuelve a intentarlo.', action: 'Reintentar' },
  },

  drawer: {
    close: 'Cerrar corrección',
    prev: 'Entrega anterior (K)',
    next: 'Entrega siguiente (J)',
    position: (i, n) => `${i} de ${n}`,
    preview: 'Entrega',
    previewTitle: (name) => `PDF de la entrega de ${name}`,
    openPdf: 'Abrir PDF',
    downloadPdf: 'Descargar',
    noFile: 'Esta entrega no tiene archivo adjunto.',
    student: 'Alumno',
    deliveredAt: 'Entregada',
    attempts: (n) => `Rechazos: ${n} de ${MAX_REJECTIONS}`,
    locked: 'Bloqueada: el alumno ya no puede volver a entregar.',
    comments: 'Comentario del alumno',
    grade: 'Nota',
    gradeHint: `Sobre 10, en pasos de 0,5. Aprobado desde ${PASS_MARK}.`,
    clearGrade: 'Quitar nota',
    status: 'Resultado',
    suggested: 'Sugerido por la nota',
    rejectWarning: (n) =>
      n + 1 >= MAX_REJECTIONS
        ? 'Este será su segundo rechazo: la entrega quedará bloqueada y no podrá volver a entregar.'
        : `Rechazar cuenta como intento (${n + 1} de ${MAX_REJECTIONS}). Al segundo, la entrega se bloquea.`,
    feedback: 'Comentario para el alumno',
    feedbackPlaceholder: 'Qué está bien y qué debe mejorar…',
    templates: 'Comentarios rápidos',
    saveTemplate: 'Guardar como comentario rápido',
    removeTemplate: (t) => `Quitar «${t.slice(0, 40)}» de los comentarios rápidos`,
    save: 'Guardar',
    saveNext: 'Guardar y siguiente',
    chooseStatus: 'Elige un resultado para guardar.',
    shortcuts: 'J/K navegar · A aprobar · R rechazar · Ctrl+Enter guardar',
    emailNote: 'El alumno recibe un email si cambian el resultado o la nota.',
  },

  discard: {
    title: '¿Descartar los cambios?',
    description: (name) => `La nota y el comentario que has escrito para ${name} no se guardarán.`,
    confirm: 'Descartar',
    cancel: 'Seguir editando',
  },

  toast: {
    saved: (name, label) => `${name}: ${label}`,
    undo: 'Deshacer',
    undone: 'Corrección deshecha',
    failed: (name) => `No se ha guardado la corrección de ${name}. Vuelve a intentarlo.`,
    end: 'No quedan más entregas en esta lista',
  },
};

export const DEFAULT_TEMPLATES = [
  'Buen trabajo: cumple todos los objetivos del ejercicio.',
  'Revisa los cálculos: hay errores que cambian el resultado final.',
  'Falta justificar las conclusiones con los datos obtenidos.',
  'La entrega está incompleta: faltan apartados del enunciado.',
  'Cuida la presentación: el documento es difícil de seguir.',
];
