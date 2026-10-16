// Textos de Sobre Nosotros. Misión, visión, valores, equipo y testimonios son los de la página
// anterior; solo la introducción y la meta son nuevas (aprobadas el 2026-10-16).
import { Accessibility, BadgeCheck, HeartHandshake, Lightbulb, ScanEye } from 'lucide-react';

export const PAGE_TITLE = 'Sobre nosotros · Evenor-Tech Campus';

export const INTRO =
  'Evenor-Tech ayuda a gestionar el territorio de forma sostenible con tecnología e innovación. En este campus compartimos ese conocimiento en cursos online, para que cualquier persona pueda aplicarlo.';

export const PAGE_DESCRIPTION = INTRO;

export const ESSENCE_TITLE = 'Misión, Visión y Valores';

export const PHOTO = {
  src: 'https://res.cloudinary.com/dgbmy60sc/image/upload/v1768909817/free-photo-of-naturaleza-animal-insecto-libelula_l4rvk6.jpg',
  // Describe la foto; el pie visible ya dice «Biodiversidad y sostenibilidad»
  alt: 'Libélula posada en una rama, vista de cerca',
  title: 'Biodiversidad y sostenibilidad',
  caption: 'Nuestro compromiso con el medio ambiente y la protección de recursos naturales',
};

// La primera frase de cada bloque se lee como titular; el resto, como párrafo
export const MISSION = {
  title: 'Misión',
  lead: 'Nuestra misión es ayudar a gestionar todo el uso del territorio de una manera sostenible y bajo herramientas sensibilizadas con la innovación, la calidad y el medio ambiente.',
  body: 'En Evenor-Tech aplicamos tecnologías avanzadas y metodologías innovadoras para promover una gestión territorial que respete los ecosistemas naturales, maximice la eficiencia de los recursos y contribuya a la mitigación del cambio climático a través de soluciones tecnológicas accesibles para todos.',
};

export const VISION = {
  title: 'Visión',
  lead: 'Nuestro objetivo es ser reconocido como una organización capaz de poner remedio a la deficiente gestión de los recursos naturales.',
  body: 'Evenor-Tech cree firmemente que se puede lograr una gestión del territorio en la que todas las personas tengan acceso a las últimas técnicas de gestión sostenible, adaptando para ello la información necesaria para el desarrollo de su actividad, mediante el uso de las TIC. Esto lograría realmente una gestión eficiente del territorio.',
};

export const VALUES_TITLE = 'Valores';

export const VALUES = [
  { icon: Lightbulb, title: 'Innovación', desc: 'Siempre a la vanguardia en tecnología educativa.' },
  { icon: HeartHandshake, title: 'Cercanía', desc: 'Acompañamos a cada alumno en su camino.' },
  { icon: BadgeCheck, title: 'Calidad', desc: 'Cursos y soporte de máxima calidad.' },
  { icon: Accessibility, title: 'Accesibilidad', desc: 'Formación para todos, sin barreras.' },
  { icon: ScanEye, title: 'Transparencia', desc: 'Comprometidos con la honestidad y claridad en todas nuestras acciones.' },
];

export const TEAM_TITLE = 'Nuestro equipo';

export const TEAM = [
  { name: 'Maria Anaya Romero', role: 'CEO & Fundador', linkedin: 'https://www.linkedin.com/in/mar%C3%ADa-anaya-romero-95005727/' },
  { name: 'Javier Bravo Garcia', role: 'Responsable en GIS, Teledetección y Medio Ambiente', linkedin: 'https://www.linkedin.com/in/javier-bravo-garc%C3%ADa-5158b720a/' },
  { name: 'Francisco José Blanco-Velázquez', role: 'Project Manager', linkedin: 'https://www.linkedin.com/in/francisco-jos%C3%A9-blanco-vel%C3%A1zquez-19138b103/' },
  { name: 'Sebastián Gandía Gutiérrez', role: 'Desarrollador Full Stack', linkedin: 'https://www.linkedin.com/in/sebasti%C3%A1n-gand%C3%ADa-guti%C3%A8rrez-7880662b5/' },
  { name: 'Jesús Manuel Vázquez Herrera', role: 'Desarrollador Full Stack', linkedin: 'https://www.linkedin.com/in/jes%C3%BAs-manuel-v%C3%A1zquez-herrera-8191462a3/' },
];

export const TESTIMONIALS_TITLE = 'Testimonios';
export const TESTIMONIALS_LANG = 'en';
export const REVIEWS_LINK = { to: '/reseñas', label: 'Lee las reseñas de alumnos del campus' };

export const TESTIMONIALS = [
  {
    text: 'I have been working with Evenor tech for several years and they have never disappointed me. Their solutions are reliable and efficient. The team is knowledgeable, responsive...',
    name: 'Amy Brenna',
    source: 'Trustburn',
    rating: 4,
  },
  {
    text: 'Evenor tech has exceeded my expectations. Their soil solutions are exceptional and have greatly improved the quality of my land.',
    name: 'Patricia Langford',
    source: 'Trustburn',
    rating: 4,
  },
  {
    text: 'I had a great experience with this company. The team was responsive and answered all my questions promptly. The solutions they offer for soil use and protection are innovative and effective.',
    name: 'Jeff Conley',
    source: 'Trustburn',
    rating: 5,
  },
  {
    text: 'Evenor tech is simply amazing! Their expertise in soil use and protection is unparalleled.',
    name: 'Gillianne Uvia',
    source: 'Trustburn',
    rating: 5,
  },
];

export const CLOSING = {
  title: '¿Quieres colaborar o tienes dudas?',
  email: 'info@evenor-tech.com',
  emailHref: 'https://outlook.live.com/mail/0/deeplink/compose?to=info@evenor-tech.com',
  emailTitle: 'Abrir Outlook para escribir a info@evenor-tech.com',
  start: 'Comenzar ahora',
  courses: 'Ver cursos',
};

// Iniciales de un nombre: primera letra del primer y del último nombre
export const initialsOf = (name) => {
  const parts = name.trim().split(/\s+/);
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
};
