// Textos de la página 404 («fuera de órbita»): qué ha pasado y cómo volver, sin culpar a nadie

export const PAGE_TITLE = 'Página no encontrada (404) · Evenor-Tech Campus';
export const PAGE_DESCRIPTION = 'Esta dirección no lleva a ninguna página del campus de Evenor-Tech.';

export const COPY = {
  eyebrow: 'Error 404',
  title: 'Esta página se ha salido de órbita',
  // La ruta pedida va entre `before` y `after`
  before: 'No encontramos nada en',
  after:
    '. Puede que el enlace esté roto, que la dirección tenga una errata o que la página haya cambiado de sitio. Desde aquí vuelves a terreno firme en un momento.',
  home: 'Volver al inicio',
  courses: 'Ver los cursos',
  support: 'Contactar con soporte',
  actions: 'Opciones para continuar',
  searchLabel: '¿Buscabas un curso?',
  searchPlaceholder: 'Carbono, suelos, agricultura…',
  searchSubmit: 'Buscar',
};

// Rutas muy largas se recortan al mostrarlas (la dirección completa sigue en la barra del navegador)
export const MAX_PATH_SHOWN = 64;
