/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Momento de éxito: una señal sale de Sevilla y viaja en arco hasta un satélite (mismo lenguaje que
// el globo de la home, sin WebGL). Con reduced motion se muestra el estado final, sin recorrido.
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, spring } from '../../lib/motion';

const ARC = 'M 28 84 Q 150 -12 284 34';
const TRAVEL = 0.9;

export default function SentSignal({ className = '' }) {
  const reduce = useReducedMotion();

  return (
    <svg viewBox="0 0 320 100" className={className} aria-hidden="true" focusable="false">
      <motion.path
        d={ARC}
        fill="none"
        stroke="var(--color-brand-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 6"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: TRAVEL, ease: ease.outExpo }}
      />

      {/* Origen: Sevilla */}
      <circle cx="28" cy="84" r="10" fill="var(--color-brand-400)" opacity="0.15" />
      <circle cx="28" cy="84" r="4.5" fill="var(--color-brand-400)" />

      {/* Señal en camino */}
      {!reduce && (
        <circle r="3.5" fill="var(--color-brand-200)">
          <animateMotion
            dur={`${TRAVEL}s`}
            fill="freeze"
            path={ARC}
            calcMode="spline"
            keyPoints="0;1"
            keyTimes="0;1"
            keySplines={ease.outExpo.join(' ')}
          />
          <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur={`${TRAVEL}s`} fill="freeze" />
        </circle>
      )}

      {/* Destino: satélite */}
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: duration.fast } : { ...spring.pop, delay: TRAVEL * 0.8 }}
      >
        <g transform="rotate(-24 290 30)">
          <rect x="268" y="26" width="14" height="8" rx="1.5" fill="var(--color-ink-3)" />
          <rect x="298" y="26" width="14" height="8" rx="1.5" fill="var(--color-ink-3)" />
          <rect x="284" y="23" width="12" height="14" rx="3" fill="var(--color-ink)" />
          <circle cx="290" cy="30" r="2" fill="var(--color-brand-400)" />
        </g>
      </motion.g>
    </svg>
  );
}
