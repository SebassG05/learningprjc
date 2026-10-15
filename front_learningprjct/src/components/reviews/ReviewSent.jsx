/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Momento de éxito: tu voz se suma a la huella. Las barras de los demás esperan quietas y la tuya
// sube con un muelle al final de la fila, más brillante. Cabe en el segundo que la página espera antes
// de volver al inicio. Solo transform y opacidad; con reduced motion, el estado final con un fundido.
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, spring } from '../../lib/motion';

// Alturas fijas de las voces de fondo (decorativas)
const OTHERS = [26, 44, 18, 58, 34, 70, 22, 48, 30, 62, 40];
const STEP = 14;
const H = 100;

export default function ReviewSent({ message }) {
  const reduce = useReducedMotion();
  const x = OTHERS.length * STEP;

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.fast, ease: ease.outExpo }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-3xl bg-surface px-6 text-center"
    >
      <svg viewBox={`0 0 ${x + 8} ${H}`} className="w-full max-w-56" aria-hidden="true" focusable="false">
        <line x1="0" x2={x + 8} y1={H / 2} y2={H / 2} stroke="var(--color-line-strong)" />
        {OTHERS.map((h, i) => (
          <rect key={i} x={i * STEP} y={(H - h) / 2} width="7" height={h} rx="3.5" fill="var(--color-brand-300)" opacity="0.3" />
        ))}
        <motion.rect
          x={x}
          y={(H - 84) / 2}
          width="7"
          height="84"
          rx="3.5"
          fill="var(--color-brand-200)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={{ scaleY: reduce ? 1 : 0, opacity: reduce ? 1 : 0 }}
          animate={{ scaleY: 1, opacity: 1 }}
          transition={reduce ? { duration: duration.fast } : { ...spring.pop, delay: 0.12 }}
        />
      </svg>
      <motion.p
        className="font-display text-title-3 font-bold text-ink"
        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: reduce ? 0 : 0.2 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
