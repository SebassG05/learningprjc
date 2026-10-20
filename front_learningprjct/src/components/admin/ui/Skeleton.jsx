/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */

// Bloque de carga. Sin animación con reduced motion. El contenedor que lo usa anuncia la carga (aria-busy).
export default function Skeleton({ className = '' }) {
  return <span aria-hidden="true" className={`block animate-pulse rounded-lg bg-white/[0.06] motion-reduce:animate-none ${className}`} />;
}
