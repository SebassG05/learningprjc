/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Mapa de puntos de la península con un pulso en Sevilla: continúa el lenguaje del globo de la home
// sin WebGL. Los puntos se calculan una sola vez al cargar el módulo (contorno simplificado).

// Contorno aproximado [lon, lat] de la península y de Mallorca
const IBERIA = [
  [-9.3, 43.0], [-8.0, 43.7], [-5.8, 43.6], [-3.8, 43.45], [-1.8, 43.4], [-1.4, 43.05], [0.0, 42.7],
  [1.5, 42.5], [3.2, 42.4], [3.2, 41.9], [2.2, 41.4], [0.9, 41.0], [0.2, 40.2], [-0.3, 39.5],
  [0.2, 38.8], [-0.5, 38.3], [-0.8, 37.6], [-1.6, 37.3], [-2.1, 36.7], [-3.0, 36.75], [-4.4, 36.7],
  [-5.3, 36.1], [-5.6, 36.0], [-6.0, 36.3], [-6.4, 36.8], [-7.0, 37.2], [-7.4, 37.2], [-8.0, 37.0],
  [-8.9, 37.0], [-8.8, 38.0], [-9.2, 38.4], [-9.5, 38.8], [-9.4, 39.4], [-8.9, 40.2], [-8.7, 41.2],
  [-8.9, 41.9], [-8.9, 42.5],
];
const MALLORCA = [[2.35, 39.6], [3.0, 39.95], [3.45, 39.7], [3.1, 39.3], [2.6, 39.45]];

const SCALE = 40;
const COS = Math.cos((40 * Math.PI) / 180);
const project = ([lon, lat]) => [(lon + 9.8) * COS * SCALE, (44 - lat) * SCALE];
const unproject = (x, y) => [x / (COS * SCALE) - 9.8, 44 - y / SCALE];

// Caja 16:10 con margen de mar alrededor de la península
const VIEW = { x: -100, y: -36, w: 640, h: 400 };
const STEP = 10;
export const SEVILLA = project([-5.99, 37.39]);

function inside([lon, lat], poly) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const LAND = [];
const SEA = [];
for (let y = VIEW.y + STEP / 2; y < VIEW.y + VIEW.h; y += STEP) {
  for (let x = VIEW.x + STEP / 2; x < VIEW.x + VIEW.w; x += STEP) {
    const p = unproject(x, y);
    (inside(p, IBERIA) || inside(p, MALLORCA) ? LAND : SEA).push([x, y]);
  }
}

export default function SevillaMap({ className = '' }) {
  const [sx, sy] = SEVILLA;
  return (
    <svg
      viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id="sevilla-glow">
          <stop offset="0" stopColor="var(--color-brand-400)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--color-brand-400)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g fill="var(--color-ink)">
        {SEA.map(([x, y]) => (
          <circle key={`s${x}-${y}`} cx={x} cy={y} r="1" opacity="0.07" />
        ))}
        {LAND.map(([x, y]) => (
          <circle key={`l${x}-${y}`} cx={x} cy={y} r="1.9" opacity="0.34" />
        ))}
      </g>
      <circle cx={sx} cy={sy} r="56" fill="url(#sevilla-glow)" />
      <g>
        <circle cx={sx} cy={sy} r="7" fill="none" stroke="var(--color-brand-400)" strokeWidth="1.5" className="contact-pulse" />
        <circle cx={sx} cy={sy} r="7" fill="none" stroke="var(--color-brand-400)" strokeWidth="1.5" className="contact-pulse contact-pulse-late" />
      </g>
      <circle cx={sx} cy={sy} r="5" fill="var(--color-brand-400)" />
      <circle cx={sx} cy={sy} r="2" fill="var(--color-on-brand)" />
    </svg>
  );
}
