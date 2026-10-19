// Textos de la pestaña Progreso.

export const COPY = {
  courseLabel: 'Curso',
  searchLabel: 'Buscar alumnos',
  searchPlaceholder: 'Nombre o email',
  sortLabel: 'Ordenar',
  results: (n) => (n === 1 ? '1 alumno' : `${n.toLocaleString('es-ES')} alumnos`),

  summary: {
    label: 'Resumen del curso',
    students: 'Alumnos',
    avgProgress: 'Progreso medio',
    completed: 'Han terminado',
    pending: 'Entregas por corregir',
    pendingLink: 'Corregir',
    avgGrade: 'Nota media',
  },

  histogram: {
    title: 'Cómo avanzan',
    caption: 'Alumnos por tramo de progreso',
    bar: (label, n) => `${label}: ${n === 1 ? '1 alumno' : `${n} alumnos`}`,
  },
  topics: {
    title: 'Tests superados por tema',
    caption: (n) => `De ${n === 1 ? '1 alumno' : `${n} alumnos`}`,
    value: (count, n, pct) => `${count} de ${n} · ${pct} %`,
    final: 'Test final',
  },

  columns: { student: 'Alumno', progress: 'Progreso', topics: 'Temas', submissions: 'Entregas', grade: 'Nota media', action: 'Acción' },
  progressOf: (name) => `Progreso de ${name}`,
  topicsDone: (done, total, final) => `${done} de ${total} temas${final ? ' y test final' : ''}`,
  delivered: (d, total) => (total ? `${d} de ${total}` : `${d}`),
  deliveredHint: (total) => (total ? `Ejercicios entregados de ${total}` : 'Ejercicios entregados'),
  pending: (n) => (n === 1 ? '1 por corregir' : `${n} por corregir`),
  viewSubmissions: 'Ver entregas',
  viewSubmissionsOf: (name) => `Ver las entregas de ${name} en Correcciones`,

  empty: {
    noCourses: { title: 'Todavía no hay cursos', description: 'Crea un curso en «Gestión de cursos» para seguir el progreso de sus alumnos.' },
    noStudents: { title: 'Nadie se ha inscrito en este curso', description: 'Cuando haya alumnos inscritos verás aquí su avance.' },
    filtered: { title: 'Ningún alumno coincide', description: 'Prueba con otro nombre o email.', action: 'Limpiar búsqueda' },
    error: { title: 'No se ha podido cargar el progreso', description: 'Comprueba la conexión y vuelve a intentarlo.', action: 'Reintentar' },
  },
};
