/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Momento de éxito: la reseña sube como una señal desde el formulario y entra en órbita alrededor
// del planeta. Cabe en el segundo que la página espera antes de volver al inicio. La señal la mueve
// Motion punto a punto sobre el arco (solo transform); con reduced motion se ve el estado final.
import { useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { duration, ease, spring } from '../../lib/motion';

const RISE = 'M 40 150 C 60 70 150 40 214 62';
const TRAVEL = 0.6;

export default function ReviewSent({ message }) {
  const reduce = useReducedMotion();
  const arcRef = useRef(null);
  const signalRef = useRef(null);

  useEffect(() => {
    const arc = arcRef.current;
    const signal = signalRef.current;
    if (reduce || !arc || !signal) return undefined;
    const length = arc.getTotalLength();
    const controls = animate(0, 1, {
      duration: TRAVEL,
      ease: ease.outExpo,
      onUpdate: (t) => {
        const p = arc.getPointAtLength(t * length);
        signal.style.transform = `translate(${p.x}px, ${p.y}px)`;
      },
    });
    return () => controls.stop();
  }, [reduce]);

  const end = { x: 214, y: 62 };

  return (
    <motion.div
      role="status"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: duration.fast, ease: ease.outExpo }}
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-6 rounded-3xl bg-surface px-6 text-center"
    >
      <svg viewBox="0 0 280 180" className="w-full max-w-72" aria-hidden="true" focusable="false">
        <path ref={arcRef} d={RISE} fill="none" stroke="var(--color-brand-300)" strokeOpacity="0.35" strokeDasharray="2 6" strokeLinecap="round" />
        <ellipse cx="190" cy="70" rx="72" ry="22" transform="rotate(-10 190 70)" fill="none" stroke="var(--color-brand-300)" strokeOpacity="0.3" strokeDasharray="2 6" />
        <circle cx="190" cy="70" r="16" fill="var(--color-night-teal)" stroke="var(--color-brand-200)" strokeOpacity="0.4" />
        {/* Llegada: un anillo que se abre donde la señal entra en órbita */}
        <motion.circle
          cx={end.x}
          cy={end.y}
          r="10"
          fill="none"
          stroke="var(--color-brand-200)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={{ scale: reduce ? 1 : 0.2, opacity: reduce ? 0.6 : 0 }}
          animate={{ scale: reduce ? 1 : [0.2, 1.8], opacity: reduce ? 0.6 : [0, 0.9, 0] }}
          transition={{ duration: duration.slow, delay: reduce ? 0 : TRAVEL * 0.85, ease: ease.outExpo }}
        />
        <g ref={signalRef} style={reduce ? { transform: `translate(${end.x}px, ${end.y}px)` } : { transform: 'translate(40px, 150px)' }}>
          <circle r="9" fill="var(--color-brand-400)" opacity="0.25" />
          <circle r="4" fill="var(--color-brand-200)" />
        </g>
      </svg>
      <motion.p
        className="font-display text-title-3 font-bold text-ink"
        initial={{ opacity: 0, y: reduce ? 0 : 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...spring.gentle, delay: reduce ? 0 : 0.15 }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
