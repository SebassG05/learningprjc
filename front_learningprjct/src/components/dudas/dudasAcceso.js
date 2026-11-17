// Reglas de acceso al aula y a las dudas, compartidas por CursoDetalle y la página de dudas. Pura.

// `access` del curso tal como lo manda el backend. Un backend anterior no lo enviaba en los cursos públicos:
// ahí se asume acceso completo sin rol de profesor (la inscripción la sigue decidiendo el servidor).
export function accesoDelCurso(curso) {
  if (!curso) return undefined;
  if (curso.access) return curso.access;
  if (curso.accessMode !== 'private') return { level: 'full', teacher: false };
  return undefined;
}

export const esAdmin = (user) => user?.role === 'admin' || user?.role === 'superadmin';

// Entra al aula quien está inscrito, el profesor activo del curso o un admin
export const puedeEntrarAlAula = ({ enrolled, access, admin }) => Boolean(enrolled || access?.teacher || admin);

// Publicar dudas: edición abierta, profesor del curso o admin (el servidor lo vuelve a comprobar)
export const puedePublicarDudas = ({ access, admin }) => access?.level === 'full' || access?.teacher === true || Boolean(admin);
