/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useRef } from 'react';
import usePointerParallax from '../../hooks/usePointerParallax';

// «404» hecho con la escena: los cuatros son trazos de partículas de carbono y el cero es la Tierra
// cortada en un perfil de suelo, con una órbita que enlaza los tres y un satélite que se ha salido de
// ella. Capas SVG apiladas (cada una su capa de composición): el parallax y la deriva solo mueven
// transform y opacity. Decorativa: el mensaje está en el texto de la página.

const VIEW_BOX = '0 0 720 320';

// [x, y, radio] — dos grupos que parpadean desfasados
const STARS_A = [[28, 34, 1.2], [214, 22, 1], [312, 48, 1.4], [478, 18, 1], [702, 104, 1.2], [88, 292, 1], [452, 300, 1.3], [690, 286, 1]];
const STARS_B = [[120, 18, 1], [246, 120, 1], [404, 26, 1.1], [520, 64, 1], [16, 168, 1.3], [232, 286, 1.1], [566, 304, 1], [708, 210, 1.1]];

// Carbono en los horizontes A y B del perfil
const CARBON = [[312, 190], [338, 206], [372, 194], [402, 212], [326, 226], [360, 232], [394, 240], [418, 196], [300, 214], [348, 252], [380, 220]];

const FOUR = 'M140 262V58L32 200H182';
const ORBIT_BACK = 'M150 160A210 46 0 0 1 570 160';
const ORBIT_FRONT = 'M570 160A210 46 0 0 1 150 160';

function Layer({ className, children }) {
  return (
    <div className={`lost-layer ${className}`}>
      <svg viewBox={VIEW_BOX} className="h-full w-full overflow-visible" focusable="false">
        {children}
      </svg>
    </div>
  );
}

function Stars({ points }) {
  return points.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} className="fill-ink" />);
}

function Four({ x = 0 }) {
  return (
    <g transform={`translate(${x} 0)`} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={FOUR} className="stroke-brand-400/15" strokeWidth="2" />
      <path d={FOUR} className="stroke-brand-300" strokeWidth="10" strokeDasharray="0 19" />
    </g>
  );
}

function Earth() {
  return (
    <>
      <defs>
        <radialGradient id="lost-sphere" cx="38%" cy="28%" r="80%">
          <stop offset="0" className="[stop-color:var(--color-brand-200)]" />
          <stop offset="0.45" className="[stop-color:var(--color-brand-500)]" />
          <stop offset="1" className="[stop-color:var(--color-brand-900)]" />
        </radialGradient>
        <radialGradient id="lost-halo">
          <stop offset="0.55" className="[stop-color:var(--color-brand-400)]" stopOpacity="0.16" />
          <stop offset="1" className="[stop-color:var(--color-brand-400)]" stopOpacity="0" />
        </radialGradient>
        <clipPath id="lost-globe">
          <circle cx="360" cy="160" r="92" />
        </clipPath>
      </defs>

      <circle cx="360" cy="160" r="150" fill="url(#lost-halo)" />
      <g transform="rotate(-12 360 160)" fill="none" strokeWidth="1.5" strokeDasharray="2 9" strokeLinecap="round">
        <path d={ORBIT_BACK} className="stroke-ink-3/60" />
      </g>

      <g clipPath="url(#lost-globe)">
        <circle cx="360" cy="160" r="92" fill="url(#lost-sphere)" />
        {/* Perfil del suelo: horizontes O, A, B y C bajo la superficie */}
        <path d="M260 160q25-5 50 0t50 0 50 0 50 0V260H260z" className="fill-brand-950" />
        <path d="M260 178q25 5 50 0t50 0 50 0 50 0V260H260z" className="fill-brand-900" />
        <path d="M260 202q25-6 50 0t50 0 50 0 50 0V260H260z" className="fill-brand-800" />
        <path d="M260 232q25 5 50 0t50 0 50 0 50 0V260H260z" className="fill-brand-700" />
        {CARBON.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" className="fill-brand-300" />
        ))}
        <path d="M260 160q25-5 50 0t50 0 50 0 50 0" fill="none" strokeWidth="2" className="stroke-brand-200" />
      </g>
      <circle cx="360" cy="160" r="92" fill="none" strokeWidth="1.5" className="stroke-brand-200/40" />

      <g transform="rotate(-12 360 160)" fill="none" strokeWidth="1.5" strokeDasharray="2 9" strokeLinecap="round">
        <path d={ORBIT_FRONT} className="stroke-ink-2" />
      </g>
      {/* Estela del satélite desde el punto en que abandonó la órbita */}
      <path d="M565 116Q566 74 594 40" fill="none" strokeWidth="1.5" strokeDasharray="1 7" strokeLinecap="round" className="stroke-dawn/70" />
    </>
  );
}

function Satellite() {
  return (
    <g transform="translate(604 30) rotate(-24)">
      <rect x="-30" y="-6" width="20" height="12" rx="1.5" strokeWidth="1.5" className="fill-brand-800 stroke-brand-300" />
      <rect x="10" y="-6" width="20" height="12" rx="1.5" strokeWidth="1.5" className="fill-brand-800 stroke-brand-300" />
      <path d="M-20-6v12M20-6v12" strokeWidth="1" className="stroke-brand-300/60" />
      <path d="M-10 0h20" strokeWidth="2" className="stroke-ink-3" />
      <rect x="-8" y="-8" width="16" height="16" rx="3" className="fill-ink" />
      <path d="M0-8v-8" strokeWidth="1.5" className="stroke-ink" />
      <circle cx="0" cy="-17" r="2.5" className="fill-dawn" />
    </g>
  );
}

export default function OrbitScene() {
  const ref = useRef(null);
  usePointerParallax(ref);

  return (
    <div ref={ref} className="lost-scene" aria-hidden="true">
      <Layer className="lost-depth-1 lost-twinkle"><Stars points={STARS_A} /></Layer>
      <Layer className="lost-depth-1 lost-twinkle lost-twinkle-late"><Stars points={STARS_B} /></Layer>
      <Layer className="lost-depth-2">
        <Four />
        <Four x={500} />
      </Layer>
      <Layer className="lost-depth-3"><Earth /></Layer>
      <div className="lost-layer lost-depth-4">
        <div className="lost-adrift">
          <svg viewBox={VIEW_BOX} className="h-full w-full overflow-visible" focusable="false">
            <Satellite />
          </svg>
        </div>
      </div>
    </div>
  );
}
