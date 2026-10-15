/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Órbita de reseñas: continúa la escena de la home (un satélite por reseña alrededor del planeta),
// en SVG y sin WebGL. Cada satélite está enlazado a su tarjeta (`activeId`). Gira con un único
// motion value: sin re-render por frame, solo transform y opacidad. Se pausa fuera de pantalla o con
// la pestaña oculta y queda quieta con reduced motion. Con `waiting` muestra un único satélite.
import { useEffect, useId, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { spring } from '../../lib/motion';

export const MAX_SATELLITES = 24;
const RX = 168;
const RY = 58;
const TILT = (-12 * Math.PI) / 180;
const LAP = 140; // segundos por vuelta: se nota, no distrae

// Posición en la elipse inclinada y profundidad (-1 detrás del planeta, 1 delante)
function place(turn) {
  const a = turn * Math.PI * 2;
  const x0 = RX * Math.cos(a);
  const y0 = RY * Math.sin(a);
  return {
    x: x0 * Math.cos(TILT) - y0 * Math.sin(TILT),
    y: x0 * Math.sin(TILT) + y0 * Math.cos(TILT),
    depth: Math.sin(a),
  };
}

function useOrbitPhase(ref, still) {
  const phase = useMotionValue(0);
  const visible = useInView(ref, { margin: '120px 0px' });
  useEffect(() => {
    if (still || !visible) return undefined;
    let controls;
    const run = () => {
      const from = phase.get();
      controls = animate(phase, from + 1, { duration: LAP, ease: 'linear', repeat: Infinity });
    };
    const onVisibility = () => (document.hidden ? controls?.stop() : run());
    if (!document.hidden) run();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      controls?.stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [phase, still, visible]);
  return phase;
}

function Satellite({ review, slot, phase, active, onActivate, onDeactivate, onSelect }) {
  const x = useTransform(phase, (p) => place(slot + p).x);
  const y = useTransform(phase, (p) => place(slot + p).y);
  // Detrás del planeta: más pequeño y tenue
  const scale = useTransform(phase, (p) => 0.78 + 0.22 * (place(slot + p).depth + 1) / 2);
  const opacity = useTransform(phase, (p) => 0.45 + 0.55 * (place(slot + p).depth + 1) / 2);
  const core = 2.2 + review.rating * 0.5;

  return (
    <motion.g style={{ x, y, scale, opacity }}>
      <motion.g initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={spring.pop}>
        <motion.circle r="13" fill="var(--color-brand-400)" initial={false} animate={{ opacity: active ? 0.22 : 0 }} transition={{ duration: 0.3 }} />
        <motion.circle
          r="7.5"
          fill="none"
          stroke="var(--color-brand-200)"
          strokeWidth="1"
          initial={false}
          animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.6 }}
          transition={spring.snappy}
        />
        <circle r={core} fill="var(--color-brand-300)" opacity={0.4 + review.rating * 0.12} />
        {/* Zona de puntero generosa; el teclado llega por las tarjetas */}
        <circle
          r="12"
          fill="transparent"
          className="cursor-pointer"
          onPointerEnter={() => onActivate(review.id)}
          onPointerLeave={() => onDeactivate(review.id)}
          onClick={() => onSelect(review.id)}
        />
      </motion.g>
    </motion.g>
  );
}

function Planet({ id }) {
  return (
    <g>
      <defs>
        <radialGradient id={`${id}-planet`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="var(--color-brand-700)" />
          <stop offset="0.55" stopColor="var(--color-night-teal)" />
          <stop offset="1" stopColor="var(--color-night-deep)" />
        </radialGradient>
        <radialGradient id={`${id}-air`} r="0.5">
          <stop offset="0.6" stopColor="var(--color-brand-400)" stopOpacity="0.22" />
          <stop offset="1" stopColor="var(--color-brand-400)" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle r="58" fill={`url(#${id}-air)`} />
      <circle r="34" fill={`url(#${id}-planet)`} stroke="var(--color-brand-200)" strokeOpacity="0.35" strokeWidth="0.8" />
    </g>
  );
}

const RING = `M ${-RX} 0 a ${RX} ${RY} 0 1 0 ${RX * 2} 0 a ${RX} ${RY} 0 1 0 ${-RX * 2} 0`;

export default function ReviewsOrbit({ reviews = [], waiting = false, activeId, onActivate, onDeactivate, onSelect, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const phase = useOrbitPhase(ref, reduce);
  const shown = reviews.slice(0, MAX_SATELLITES);
  const lone = place(0.62);

  return (
    <svg ref={ref} viewBox="-200 -100 400 200" className={`w-full overflow-visible ${className}`} aria-hidden="true" focusable="false">
      <path
        d={RING}
        transform={`rotate(${(TILT * 180) / Math.PI})`}
        fill="none"
        stroke="var(--color-brand-300)"
        strokeOpacity="0.3"
        strokeWidth="1"
        strokeDasharray="2 7"
        strokeLinecap="round"
      />
      <Planet id={id} />
      {waiting ? (
        <g transform={`translate(${lone.x} ${lone.y})`}>
          <circle r="4" fill="none" stroke="var(--color-brand-300)" strokeWidth="1" className="contact-pulse" />
          <circle r="4" fill="none" stroke="var(--color-brand-300)" strokeWidth="1" className="contact-pulse contact-pulse-late" />
          <circle r="3.2" fill="var(--color-brand-200)" />
        </g>
      ) : (
        shown.map((review, i) => (
          <Satellite
            key={review.id}
            review={review}
            slot={i / shown.length}
            phase={phase}
            active={review.id === activeId}
            onActivate={onActivate}
            onDeactivate={onDeactivate}
            onSelect={onSelect}
          />
        ))
      )}
    </svg>
  );
}
