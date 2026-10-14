/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Momento de éxito: un avión de papel lleva el mensaje en arco hasta el campus en Sevilla (un libro
// abierto). El vuelo lo mueve Motion punto a punto sobre el arco, así empieza justo al aparecer el
// panel. Con reduced motion se muestra el estado final, sin recorrido.
import { useEffect, useRef } from 'react';
import { animate, motion, useReducedMotion } from 'framer-motion';
import { BookOpen, Send } from 'lucide-react';
import { duration, ease, spring } from '../../lib/motion';

const ARC = 'M 30 80 Q 150 -14 262 46';
const TRAVEL = 1.2;

export default function SentSignal({ className = '' }) {
  const reduce = useReducedMotion();
  const arcRef = useRef(null);
  const planeRef = useRef(null);

  useEffect(() => {
    const arc = arcRef.current;
    const plane = planeRef.current;
    if (reduce || !arc || !plane) return undefined;
    const length = arc.getTotalLength();
    // Despega y aterriza suave (acelera y frena) para que el vuelo se lea entero
    const controls = animate(0, 1, {
      duration: TRAVEL,
      ease: ease.inOutQuart,
      onUpdate: (t) => {
        const at = t * length;
        const p = arc.getPointAtLength(at);
        const q = arc.getPointAtLength(Math.min(length, at + 1));
        const angle = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI;
        plane.setAttribute('transform', `translate(${p.x} ${p.y}) rotate(${angle})`);
        plane.setAttribute('opacity', t > 0.92 ? String(Math.max(0, (1 - t) / 0.08)) : '1');
      },
    });
    return () => controls.stop();
  }, [reduce]);

  return (
    <svg viewBox="0 0 320 100" className={className} aria-hidden="true" focusable="false">
      <path ref={arcRef} d={ARC} fill="none" stroke="none" />
      <motion.path
        d={ARC}
        fill="none"
        stroke="var(--color-brand-400)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeDasharray="1 6"
        initial={reduce ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.7 }}
        transition={{ duration: TRAVEL, ease: ease.inOutQuart }}
      />

      {/* Origen: quien escribe */}
      <circle cx="30" cy="80" r="4" fill="var(--color-ink-3)" />

      {/* El mensaje en vuelo: avión de papel orientado según el arco (el icono apunta a 45°) */}
      {!reduce && (
        <g ref={planeRef} transform="translate(30 80)">
          <g transform="rotate(45)">
            <Send x={-9} y={-9} width={18} height={18} color="var(--color-brand-200)" strokeWidth={1.8} />
          </g>
        </g>
      )}

      {/* Destino: el campus en Sevilla */}
      <motion.g
        initial={reduce ? false : { opacity: 0, scale: 0.4 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: duration.fast } : { ...spring.pop, delay: TRAVEL * 0.8 }}
      >
        <circle cx="282" cy="50" r="26" fill="var(--color-brand-400)" opacity="0.12" />
        <circle cx="282" cy="50" r="17" fill="var(--color-surface-3)" stroke="var(--color-brand-400)" strokeOpacity="0.5" />
        <BookOpen x={272} y={40} width={20} height={20} color="var(--color-brand-300)" strokeWidth={1.7} />
      </motion.g>
    </svg>
  );
}
