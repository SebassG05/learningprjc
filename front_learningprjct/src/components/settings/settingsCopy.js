// Textos de la página de Ajustes. Los de las categorías de cookies son los de siempre:
// tienen implicaciones legales y solo se cambian con revisión.

export const PAGE_TITLE = 'Ajustes · Evenor-Tech Campus';
export const PAGE_DESCRIPTION =
  'Gestiona la contraseña y las preferencias de cookies de tu cuenta en Evenor-Tech Campus.';

export const HEADER = {
  title: 'Ajustes',
  subtitle: 'Tu cuenta en el campus',
  // Mismo respaldo que el menú del usuario del header
  fallbackName: 'Usuario',
  courses: 'Ir a cursos',
};

export const SECURITY = {
  title: 'Seguridad',
  password: {
    title: 'Contraseña',
    description: 'Te enviaremos un enlace por email para crear una nueva.',
    action: 'Restablecer contraseña',
  },
};

export const PRIVACY = {
  title: 'Privacidad',
  description: 'Gestiona tus preferencias de cookies. Las cookies esenciales siempre están activas.',
  policyLead: 'Más información en la',
  policyLink: 'Política de cookies',
  always: 'Siempre activas',
  examples: 'Ejemplos:',
  status: (active, total) => `${active} de ${total} tipos de cookies activos`,
  saved: 'Preferencias guardadas',
  unsaved: 'Cambios sin guardar',
  reject: 'Rechazar todas',
  accept: 'Aceptar todas',
  save: 'Guardar cambios',
  reset: 'Restablecer preferencias de cookies',
  resetConfirm:
    '¿Estás seguro de que quieres restablecer tus preferencias de cookies? Volverás a ver el banner de consentimiento.',
};

export const COOKIE_TYPES = [
  {
    id: 'necessary',
    name: 'Cookies esenciales',
    description: 'Necesarias para el funcionamiento básico de la web. No se pueden desactivar.',
    examples: 'Autenticación, sesión, seguridad',
    required: true,
  },
  {
    id: 'functional',
    name: 'Cookies funcionales',
    description: 'Permiten mejorar la funcionalidad y personalización del sitio.',
    examples: 'Preferencias de idioma, tema oscuro/claro',
    required: false,
  },
  {
    id: 'analytics',
    name: 'Cookies analíticas',
    description: 'Nos ayudan a entender cómo interactúas con nuestra web.',
    examples: 'Google Analytics, estadísticas de uso',
    required: false,
  },
  {
    id: 'marketing',
    name: 'Cookies de marketing',
    description: 'Se utilizan para mostrarte anuncios relevantes.',
    examples: 'Publicidad personalizada, remarketing',
    required: false,
  },
];
