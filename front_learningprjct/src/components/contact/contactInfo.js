// Datos de la página de Contacto. Los valores y destinos son los de siempre: no cambiarlos aquí sin
// decidirlo antes (el email del footer es otro: info@evenor-tech.com).

export const EMAIL = {
  value: 'campusevenor@gmail.com',
  href: 'mailto:campusevenor@gmail.com',
};

export const PHONE = {
  value: '+34 954 151 096',
  href: 'tel:+34954151096',
};

export const LINKEDIN = {
  label: 'Síguenos en LinkedIn',
  href: 'https://www.linkedin.com/company/evenor-tech/',
};

export const ADDRESS = {
  name: 'Evenor-Tech',
  street: 'Av. de la República Argentina, 27',
  city: '41011 Sevilla',
  mapsUrl:
    'https://www.google.com/maps/place/Evenor-Tech/@37.3774502,-6.0050107,1318m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd126dcad1bdd721:0xd80c106b41b3600e!8m2!3d37.377446!4d-6.0024358!16s%2Fg%2F11v68x5c3d?entry=ttu&g_ep=EgoyMDI1MDkwOC4wIKXMDSoASAFQAw%3D%3D',
  embedUrl:
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3170.456193220813!2d-6.005224583886922!3d37.377445979833104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126dcad1bdd721%3A0xd80c106b41b3600e!2sEvenor-Tech!5e0!3m2!1ses!2ses!4v1694347141372!5m2!1ses!2ses',
};

// Motivos habituales de un alumno: al elegir uno se escribe en "Asunto" (se puede editar)
export const TOPICS = [
  'Dudas sobre un curso',
  'Matrícula y pagos',
  'Acceso a la plataforma',
  'Certificados',
  'Formación para empresas',
];

// Contenido del campus que ya responde a muchas consultas
export const QUICK_ANSWERS = [
  {
    to: '/guia-usuario',
    title: 'Guía de uso del campus',
    text: 'Cómo registrarte, entrar y avanzar en tus cursos.',
  },
  {
    to: '/cursos',
    title: 'Catálogo de cursos',
    text: 'Temario, duración y matrícula de cada curso.',
  },
];

// Primera capa de información de protección de datos (texto legal: no editar sin revisión)
export const PRIVACY_SUMMARY = [
  ['Responsable', 'EVENOR TECH, S.L.U.'],
  ['Finalidad', 'Atender sus consultas y/o solicitudes.'],
  ['Derechos', 'Acceder, rectificar y suprimir los datos, así como otros derechos, como se explica en la información adicional.'],
];
