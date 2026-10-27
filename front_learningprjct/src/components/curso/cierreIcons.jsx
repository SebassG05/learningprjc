/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Iconos de línea del cierre del curso (test final y ejercicios): rejilla de 24, trazo 1.5, extremos redondos.
// Decorativos por defecto (aria-hidden); el texto de al lado es el que nombra la acción.
const Icon = ({ className = 'size-5', children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true" focusable="false">
    {children}
  </svg>
);

export const IconLock = (p) => (
  <Icon {...p}>
    <rect x="5.5" y="10.5" width="13" height="9.5" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5M12 14.5v2" />
  </Icon>
);

export const IconCheck = (p) => (
  <Icon {...p}>
    <path d="M5.5 12.5l4 4 9-9" />
  </Icon>
);

// Sello de certificación: medalla con dos estratos dentro
export const IconSeal = (p) => (
  <Icon {...p}>
    <circle cx="12" cy="9.5" r="6" />
    <path d="M8.5 9h7M9.5 11.5h5M8.6 14.4 7.5 20.5l4.5-2.25 4.5 2.25-1.1-6.1" />
  </Icon>
);

export const IconChevronDown = (p) => (
  <Icon {...p}>
    <path d="M6.5 9.5 12 15l5.5-5.5" />
  </Icon>
);

export const IconArrowRight = (p) => (
  <Icon {...p}>
    <path d="M5 12h14M13.5 6.5 19 12l-5.5 5.5" />
  </Icon>
);

export const IconArrowUpRight = (p) => (
  <Icon {...p}>
    <path d="M7.5 16.5l9-9M9.5 7.5h7v7" />
  </Icon>
);

export const IconUpload = (p) => (
  <Icon {...p}>
    <path d="M12 15V4.5M7.5 9 12 4.5 16.5 9M5 14.5v3.75c0 .97.78 1.75 1.75 1.75h10.5c.97 0 1.75-.78 1.75-1.75V14.5" />
  </Icon>
);

export const IconRetry = (p) => (
  <Icon {...p}>
    <path d="M19.25 12a7.25 7.25 0 1 1-2.12-5.13M19.25 4.75v4.5h-4.5" />
  </Icon>
);

// Tipos de ejercicio (sustituyen a los emojis)
export const IconFlask = (p) => (
  <Icon {...p}>
    <path d="M9.5 3.5h5M10.5 3.5v5.5l-5 8.6a2 2 0 0 0 1.73 3h9.54a2 2 0 0 0 1.73-3l-5-8.6V3.5M7.6 14.5h8.8" />
  </Icon>
);

export const IconWrench = (p) => (
  <Icon {...p}>
    <path d="M14.7 5.3a4 4 0 0 0-5.2 5.2L4.5 15.5a2.12 2.12 0 0 0 3 3l5-5a4 4 0 0 0 5.2-5.2l-2.45 2.45-2.3-.7-.7-2.3z" />
  </Icon>
);

export const IconChart = (p) => (
  <Icon {...p}>
    <path d="M4.5 19.5h15M7.5 16v-3.5M12 16V8M16.5 16v-6" />
  </Icon>
);

export const IconSearch = (p) => (
  <Icon {...p}>
    <circle cx="10.5" cy="10.5" r="5.75" />
    <path d="m15 15 4.5 4.5" />
  </Icon>
);

export const IconDoc = (p) => (
  <Icon {...p}>
    <path d="M13.5 3.5h-6A1.5 1.5 0 0 0 6 5v14a1.5 1.5 0 0 0 1.5 1.5h9A1.5 1.5 0 0 0 18 19V8zM13.5 3.5V8H18M9 12.5h6M9 16h4" />
  </Icon>
);
