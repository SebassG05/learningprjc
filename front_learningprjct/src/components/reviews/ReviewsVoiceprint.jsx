/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Huella de voces: una barra por reseña, como la onda de una grabación. La altura sale de lo que
// escribió cada alumno y el brillo de su nota; de la más antigua (izquierda) a la más reciente.
// Cada barra está enlazada a su tarjeta (`activeId`). "Respira" muy despacio con un único motion
// value: sin re-render por frame, solo transform y opacidad; se pausa fuera de pantalla o con la
// pestaña oculta y queda quieta con reduced motion. Con `waiting`, línea plana y un cursor.
import { useEffect, useId, useRef } from 'react';
import { animate, motion, useInView, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import { spring } from '../../lib/motion';

export const MAX_VOICES = 40;
const MIN_SLOTS = 16; // con pocas reseñas la fila no se queda medio vacía
const STEP = 12; // ancho de barra + hueco
const BAR = 7;
const H = 180;
const MID = H / 2;
const BREATH = 9; // segundos por ciclo
const widthFor = (slots) => slots * STEP - (STEP - BAR);

// Altura por longitud del texto (raíz: los textos muy largos no lo aplastan todo)
const heightOf = (text) => 22 + Math.min(1, Math.sqrt(text.length / 320)) * (H - 40);

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

function Voice({ review, index, offset, t, gradientId, active, onActivate, onDeactivate, onSelect }) {
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
          fill={`url(#${gradientId})`}
          style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          initial={{ scaleY: 0, opacity: 0 }}
          animate={{ scaleY: 1, opacity: active ? 1 : 0.25 + review.rating * 0.11 }}
          // Al entrar, las barras suben en cadena; después, la opacidad responde al instante
          transition={{ scaleY: { ...spring.gentle, delay: 0.3 + index * 0.025 }, opacity: { duration: 0.25 } }}
        />
      </motion.g>
      {/* Marca de la barra activa: un punto sobre ella */}
      <motion.circle
        cx={x + BAR / 2}
        cy={MID - h / 2 - 11}
        r="3"
        fill="var(--color-dawn)"
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
  const gradientId = `voices-${useId().replace(/:/g, '')}`;

  if (waiting) {
    const WIDTH = widthFor(MIN_SLOTS * 2);
    return (
      <svg ref={ref} viewBox={`-4 0 ${WIDTH + 8} ${H}`} className={`w-full drop-shadow-[0_0_12px_rgb(161_219_135/0.45)] ${className}`} aria-hidden="true" focusable="false">
        <line x1="-4" x2={WIDTH + 4} y1={MID} y2={MID} stroke="var(--color-brand-300)" strokeOpacity="0.35" strokeDasharray="2 6" strokeLinecap="round" />
        <rect x={WIDTH / 2 - 2} y={MID - 26} width="4" height="52" rx="2" fill="var(--color-brand-200)" className="reviews-caret" />
      </svg>
    );
  }

  // De la más antigua a la más reciente, alineadas a la derecha: la nueva entra por ese lado
  const voices = reviews.slice(0, MAX_VOICES).reverse();
  const slots = Math.max(MIN_SLOTS, voices.length);
  const WIDTH = widthFor(slots);
  const offset = (slots - voices.length) * STEP;

  return (
    <svg ref={ref} viewBox={`-4 0 ${WIDTH + 8} ${H}`} className={`w-full drop-shadow-[0_0_14px_rgb(161_219_135/0.4)] ${className}`} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="var(--color-brand-100)" />
          <stop offset="0.5" stopColor="var(--color-brand-300)" />
          <stop offset="1" stopColor="var(--color-brand-500)" />
        </linearGradient>
      </defs>
      <line x1="-4" x2={offset - 2} y1={MID} y2={MID} stroke="var(--color-brand-300)" strokeOpacity="0.3" strokeDasharray="2 6" strokeLinecap="round" />
      <line x1={offset - 2} x2={WIDTH + 4} y1={MID} y2={MID} stroke="var(--color-line-strong)" />
      {voices.map((review, i) => (
        <Voice
          key={review.id}
          review={review}
          index={i}
          offset={offset}
          t={t}
          gradientId={gradientId}
          active={review.id === activeId}
          onActivate={onActivate}
          onDeactivate={onDeactivate}
          onSelect={onSelect}
        />
      ))}
    </svg>
  );
}
