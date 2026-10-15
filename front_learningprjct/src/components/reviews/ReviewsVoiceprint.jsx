/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Huella de voces: una barra por reseña, como la onda de una grabación. La altura sale de lo que
// escribió cada alumno y el brillo de su nota; de la más antigua (izquierda) a la más reciente.
// Cada barra está enlazada a su tarjeta (`activeId`). "Respira" muy despacio con un único motion
// value: sin re-render por frame, solo transform y opacidad; se pausa fuera de pantalla o con la
// pestaña oculta y queda quieta con reduced motion. Con `waiting`, línea plana y un cursor.
import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { spring } from '../../lib/motion';

export const MAX_VOICES = 40;
const STEP = 9; // ancho de barra + hueco
const BAR = 5;
const H = 120;
const MID = H / 2;
const BREATH = 9; // segundos por ciclo
const WIDTH = MAX_VOICES * STEP - (STEP - BAR);

// Altura por longitud del texto (raíz: los textos muy largos no lo aplastan todo)
const heightOf = (text) => 14 + Math.min(1, Math.sqrt(text.length / 420)) * (H - 24);

function useBreath(ref, still) {
  const t = useMotionValue(0);
  const visible = useInView(ref, { margin: '120px 0px' });
  useEffect(() => {
    if (still || !visible) return undefined;
    let controls;
    const run = () => {
      controls = animate(t, t.get() + Math.PI * 2, { duration: BREATH, ease: 'linear', repeat: Infinity });
    };
    const onVisibility = () => (document.hidden ? controls?.stop() : run());
    if (!document.hidden) run();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      controls?.stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [t, still, visible]);
  return t;
}

function Voice({ review, index, offset, t, active, onActivate, onDeactivate, onSelect }) {
  const scaleY = useTransform(t, (v) => 1 + 0.07 * Math.sin(v + index * 0.6));
  const h = heightOf(review.text);
  const x = offset + index * STEP;

  return (
    <g>
      <motion.g style={{ scaleY, transformBox: 'fill-box', transformOrigin: 'center' }}>
        <motion.rect
          x={x}
          y={MID - h / 2}
          width={BAR}
          height={h}
          rx={BAR / 2}
          fill="var(--color-brand-300)"
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: active ? 1 : 0.25 + review.rating * 0.11 }}
          transition={spring.gentle}
        />
      </motion.g>
      {/* Marca de la barra activa: un punto sobre ella */}
      <motion.circle
        cx={x + BAR / 2}
        cy={MID - h / 2 - 9}
        r="2.5"
        fill="var(--color-brand-200)"
        initial={false}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
      {/* Zona de puntero de toda la altura; el teclado llega por las tarjetas */}
      <rect
        x={x - (STEP - BAR) / 2}
        y="0"
        width={STEP}
        height={H}
        fill="transparent"
        className="cursor-pointer"
        onPointerEnter={() => onActivate(review.id)}
        onPointerLeave={() => onDeactivate(review.id)}
        onClick={() => onSelect(review.id)}
      />
    </g>
  );
}

export default function ReviewsVoiceprint({ reviews = [], waiting = false, activeId, onActivate, onDeactivate, onSelect, className = '' }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const t = useBreath(ref, reduce || waiting);

  if (waiting) {
    return (
      <svg ref={ref} viewBox={`-4 0 ${WIDTH + 8} ${H}`} className={`w-full ${className}`} aria-hidden="true" focusable="false">
        <line x1="-4" x2={WIDTH + 4} y1={MID} y2={MID} stroke="var(--color-brand-300)" strokeOpacity="0.35" strokeDasharray="2 6" strokeLinecap="round" />
        <rect x={WIDTH / 2 - 1.5} y={MID - 18} width="3" height="36" rx="1.5" fill="var(--color-brand-300)" className="reviews-caret" />
      </svg>
    );
  }

  // De la más antigua a la más reciente, alineadas a la derecha: la nueva entra por ese lado y la
  // escala no cambia con el número de reseñas
  const voices = reviews.slice(0, MAX_VOICES).reverse();
  const offset = (MAX_VOICES - voices.length) * STEP;

  return (
    <svg ref={ref} viewBox={`-4 0 ${WIDTH + 8} ${H}`} className={`w-full ${className}`} aria-hidden="true" focusable="false">
      <line x1="-4" x2={offset - 2} y1={MID} y2={MID} stroke="var(--color-brand-300)" strokeOpacity="0.3" strokeDasharray="2 6" strokeLinecap="round" />
      <line x1={offset - 2} x2={WIDTH + 4} y1={MID} y2={MID} stroke="var(--color-line-strong)" />
      {voices.map((review, i) => (
        <Voice
          key={review.id}
          review={review}
          index={i}
          offset={offset}
          t={t}
          active={review.id === activeId}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}
