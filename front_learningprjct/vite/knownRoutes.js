// Rutas que existen en la SPA (las de <Routes> en src/App.jsx), para que el servidor responda 404 a
// todo lo demás en vez de un 200 con la página de error (soft 404). Las comprueba
// knownRoutes.test.js contra App.jsx; deploy/nginx-404.conf lleva la misma lista para producción.
const ID = '[^/]+';

export const KNOWN_ROUTES = [
  /^\/$/,
  /^\/(reset-password|forgot-password|login|contacto|cursos|reseñas|ajustes|sobre)\/?$/,
  /^\/(cookies|politica-cookies|privacidad|terminos|aviso-legal|guia-usuario)\/?$/,
  /^\/admin\/correcciones\/?$/,
  new RegExp(`^/curso/${ID}(/(inscripcion|invitacion|estructura|tema-estudio))?/?$`),
  new RegExp(`^/curso/${ID}/temario/${ID}/?$`),
  new RegExp(`^/curso/${ID}/ejercicio/${ID}/entregar/?$`),
];

// `pathname` ya decodificado (ñ de /reseñas)
export const isKnownRoute = (pathname) => KNOWN_ROUTES.some((re) => re.test(pathname));
