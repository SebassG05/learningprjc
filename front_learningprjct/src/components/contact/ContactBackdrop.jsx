/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Fondo de Contacto: una estación nocturna sobre el planeta. Cielo verde y petróleo, estrellas,
// auroras que derivan despacio, una órbita con su satélite y, al final de la página, el horizonte
// con la luz de Sevilla. Mismo universo que el globo de la home, sin WebGL (CSS + SVG).
import { useReducedMotion } from 'framer-motion';

// Órbita en un sistema girado: el satélite recorre exactamente el trazo dibujado
// Rodea el formulario (columna derecha): no cruza el texto de la izquierda
const ORBIT = 'M 700 430 a 520 250 0 1 0 1040 0 a 520 250 0 1 0 -1040 0';

function Orbit({ animate }) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-x-0 top-0 hidden h-[100dvh] w-full lg:block"
      focusable="false"
    >
      <defs>
        <linearGradient id="orbit-fade" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--color-brand-300)" stopOpacity="0" />
          <stop offset="0.35" stopColor="var(--color-brand-300)" stopOpacity="0.35" />
          <stop offset="0.8" stopColor="var(--color-brand-300)" stopOpacity="0.18" />
          <stop offset="1" stopColor="var(--color-brand-300)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g transform="rotate(-9 1220 430)">
        <path d={ORBIT} fill="none" stroke="url(#orbit-fade)" strokeWidth="1.2" strokeDasharray="2 9" strokeLinecap="round" />
        <g>
          {animate ? (
            <animateMotion dur="80s" repeatCount="indefinite" rotate="auto" path={ORBIT} />
          ) : (
            <animateMotion dur="1s" fill="freeze" keyPoints="0.18;0.18" keyTimes="0;1" calcMode="linear" path={ORBIT} />
          )}
          <circle r="16" fill="var(--color-brand-400)" opacity="0.12" />
          <rect x="-15" y="-3" width="9" height="6" rx="1" fill="var(--color-ink-3)" />
          <rect x="6" y="-3" width="9" height="6" rx="1" fill="var(--color-ink-3)" />
          <rect x="-5" y="-5" width="10" height="10" rx="2.5" fill="var(--color-ink)" />
          <circle r="1.6" fill="var(--color-brand-400)" />
        </g>
      </g>
    </svg>
  );
}

// Luz de Sevilla en el borde del planeta, con sus coordenadas
function Sevilla() {
  return (
    <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center gap-3">
      <svg viewBox="-40 -40 80 80" className="h-20 w-20" focusable="false">
        <circle r="26" fill="var(--color-brand-400)" opacity="0.14" />
        <circle r="5" fill="none" stroke="var(--color-brand-300)" strokeWidth="1.2" className="contact-pulse" />
        <circle r="5" fill="none" stroke="var(--color-brand-300)" strokeWidth="1.2" className="contact-pulse contact-pulse-late" />
        <circle r="3.5" fill="var(--color-brand-200)" />
        {[[-14, 6], [12, 7], [-7, 11], [20, 12], [-22, 13], [5, 14]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="1.1" fill="var(--color-brand-200)" opacity="0.6" />
        ))}
      </svg>
      <p className="absolute left-full top-1/2 hidden -translate-y-1/2 whitespace-nowrap sm:block font-mono text-xs uppercase tracking-[0.18em] text-brand-200/70">
        Sevilla · 37°23′N 5°59′O
      </p>
    </div>
  );
}

export default function ContactBackdrop() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -top-header -z-10 overflow-hidden lg:-top-header-lg">
      <div className="contact-sky absolute inset-0" />
      <div className="contact-stars absolute inset-x-0 top-0 h-[120dvh]" />
      <div className="contact-stars contact-stars-far absolute inset-x-0 top-0 h-[120dvh]" />

      <div className="contact-aurora absolute -left-[10%] top-[-12%] h-[55vh] w-[60vw] bg-brand-700/25" />
      <div className="contact-aurora contact-aurora-late absolute -right-[12%] top-[8%] h-[50vh] w-[50vw] bg-night-teal/60" />

      <Orbit animate={!reduce} />

      {/* Horizonte: asoma al final de la página, por debajo de la ubicación */}
      <div className="contact-atmosphere absolute left-1/2 top-[calc(100%-16rem-9rem)] h-[18rem] w-[140vw] -translate-x-1/2" />
      <div className="contact-planet absolute left-1/2 top-[calc(100%-16rem)] aspect-square w-[max(240vw,150rem)] -translate-x-1/2 rounded-full">
        <Sevilla />
      </div>
      {/* Funde el planeta con el pie, que arranca sobre el lienzo */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-canvas" />

      <div className="contact-grain absolute inset-0" />
    </div>
  );
}
