/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Constelación de los valores: una estrella por valor unidas por un trazo que se dibuja una vez al aparecer.
// Al pasar por un valor, su estrella se enciende (CSS :has() en .about-values, sin estado de React).
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, inView } from '../../lib/motion';

// Posiciones en el viewBox 0 0 320 300, en el orden de la lista
const STARS = [
  [58, 82],
  [166, 40],
  [270, 112],
  [204, 214],
  [84, 236],
];

const SEGMENTS = STARS.slice(1).map(([x, y], i) => `M${STARS[i][0]} ${STARS[i][1]} L${x} ${y}`);

export default function ValuesConstellation({ className = '' }) {
  const reduce = useReducedMotion();
  const draw = reduce
    ? {}
    : {
        initial: { pathLength: 0, opacity: 0 },
        whileInView: { pathLength: 1, opacity: 1 },
        viewport: inView,
      };

  return (
    <svg viewBox="0 0 320 300" aria-hidden="true" focusable="false" className={`pointer-events-none overflow-visible ${className}`}>
      <g className="about-constellation-lines" fill="none" strokeLinecap="round">
        {SEGMENTS.map((d, i) => (
          <motion.path
            key={d}
            d={d}
            {...draw}
            transition={{ duration: duration.reveal, ease: ease.outExpo, delay: 0.25 + i * 0.12 }}
          />
        ))}
      </g>
      {STARS.map(([x, y], i) => (
        <g key={i} className={`about-star about-star-${i + 1}`} style={{ transformOrigin: `${x}px ${y}px` }}>
          <circle cx={x} cy={y} r="20" className="about-star-glow" />
          <circle cx={x} cy={y} r="3.5" className="about-star-core" />
        </g>
      ))}
    </svg>
  );
}
