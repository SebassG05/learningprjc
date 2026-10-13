// Única fuente de los enlaces de navegación: la cabecera de escritorio y el menú móvil
// salen de aquí para que nunca vuelvan a divergir.

const baseLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/sobre', label: 'Sobre Nosotros' },
  { to: '/reseñas', label: 'Reseñas' },
  { to: '/contacto', label: 'Contacto' },
];

// Misma condición que ya usaba la cabecera: "Corrección" solo para admin y superadmin
export function getNavLinks(user) {
  if (user && (user.role === 'admin' || user.role === 'superadmin')) {
    return [...baseLinks, { to: '/admin/correcciones', label: 'Corrección' }];
  }
  return baseLinks;
}

// Acciones de cuenta del menú móvil sin sesión (destinos actuales, sin cambios)
export const accountLinks = [
  { to: '/login', label: 'Iniciar sesión' },
  { to: '/registro', label: 'Regístrate' },
];

export const isActivePath = (pathname, to) => (to === '/' ? pathname === '/' : pathname.startsWith(to));
