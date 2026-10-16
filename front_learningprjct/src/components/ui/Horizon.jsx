/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Horizonte del planeta con la luz de amanecer de la home: atmósfera, planeta (con contenido opcional,
// p. ej. Sevilla en Contacto) y el fundido hacia el pie. Decorativo: va dentro de un fondo aria-hidden.
// Cada página fija la posición y el tamaño con clases (la atmósfera y el planeta se centran solos).
export default function Horizon({ atmosphereClassName = '', planetClassName = '', fadeClassName = 'h-40', children }) {
  return (
    <>
      <div className={`horizon-atmosphere absolute left-1/2 -translate-x-1/2 ${atmosphereClassName}`} />
      <div className={`horizon-planet absolute left-1/2 aspect-square -translate-x-1/2 rounded-full ${planetClassName}`}>{children}</div>
      <div className={`absolute inset-x-0 bottom-0 bg-linear-to-b from-transparent to-canvas ${fadeClassName}`} />
    </>
  );
}
