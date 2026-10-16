/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Fondo de Contacto: una estación nocturna sobre el planeta. Cielo verde y petróleo, estrellas,
// auroras que derivan despacio, una órbita decorativa y, al final, el horizonte con la luz de Sevilla y
// los tipos de curso girando a su alrededor. Mismo universo que el globo de la home, sin WebGL (CSS + SVG).
import { useReducedMotion } from 'framer-motion';
import { BookOpen, CodeXml, GraduationCap, Lightbulb } from 'lucide-react';
import Horizon from '../ui/Horizon';

// Órbita decorativa alrededor del formulario (columna derecha): no cruza el texto de la izquierda
const ORBIT = 'M 700 430 a 520 250 0 1 0 1040 0 a 520 250 0 1 0 -1040 0';
const TILT = -9;

// Anillo del campus: los tipos de curso giran alrededor de Sevilla, sobre el horizonte
const RING = 'M -520 0 a 520 64 0 1 0 1040 0 a 520 64 0 1 0 -1040 0';
const LAP = 70; // segundos por vuelta
// Lectura, titulación, ideas y tecnología: lo que se aprende en el campus
const COURSE_ICONS = [BookOpen, GraduationCap, Lightbulb, CodeXml];

function CampusRing({ animate }) {
  return (
    <svg
      viewBox="-560 -110 1120 220"
      className="absolute left-1/2 top-0 hidden w-[min(70rem,92vw)] -translate-x-1/2 -translate-y-1/2 sm:block"
      focusable="false"
    >
      <path d={RING} fill="none" stroke="var(--color-brand-300)" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2 8" strokeLinecap="round" />
      {COURSE_ICONS.map((Icon, i) => {
        const at = i / COURSE_ICONS.length;
        return (
          <g key={Icon.displayName ?? i}>
            {animate ? (
              <animateMotion dur={`${LAP}s`} begin={`-${at * LAP}s`} repeatCount="indefinite" path={RING} />
            ) : (
              <animateMotion dur="1s" fill="freeze" keyPoints={`${at};${at}`} keyTimes="0;1" calcMode="linear" path={RING} />
            )}
            <circle r="30" fill="var(--color-brand-400)" opacity="0.08" />
            <circle r="19" fill="var(--color-night-deep)" stroke="var(--color-brand-400)" strokeOpacity="0.4" strokeWidth="1" />
            <Icon x={-10} y={-10} width={20} height={20} color="var(--color-brand-200)" strokeWidth={1.6} />
          </g>
        );
      })}
    </svg>
  );
}

function Orbit() {
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
      <g transform={`rotate(${TILT} 1220 430)`}>
        <path d={ORBIT} fill="none" stroke="url(#orbit-fade)" strokeWidth="1.2" strokeDasharray="2 9" strokeLinecap="round" />
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

      <Orbit />

      {/* Horizonte: asoma al final de la página, por debajo de la ubicación */}
      {/* El pie arranca sobre el lienzo: el horizonte se funde con él */}
      <Horizon
        atmosphereClassName="top-[calc(100%-16rem-9rem)] h-[18rem] w-[140vw]"
        planetClassName="top-[calc(100%-16rem)] w-[max(240vw,150rem)]"
      >
        <Sevilla />
        <CampusRing animate={!reduce} />
      </Horizon>

      <div className="contact-grain absolute inset-0" />
    </div>
  );
}
