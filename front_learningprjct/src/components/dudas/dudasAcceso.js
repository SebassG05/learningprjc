// Reglas de acceso al aula y a las dudas, compartidas por CursoDetalle y la página de dudas. Pura.

export const esAdmin = (user) => user?.role === 'admin' || user?.role === 'superadmin';

// Entra al aula quien está inscrito, el profesor activo del curso o un admin
export const puedeEntrarAlAula = ({ enrolled, access, admin }) => Boolean(enrolled || access?.teacher || admin);

// Publicar dudas: edición abierta, profesor del curso o admin (el servidor lo vuelve a comprobar)
export const puedePublicarDudas = ({ access, admin }) => access?.level === 'full' || access?.teacher === true || Boolean(admin);
