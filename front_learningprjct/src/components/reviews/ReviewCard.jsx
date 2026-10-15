/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Tarjeta de reseña. El texto manda; la puntuación, el autor y la fecha lo acompañan.
// Enlazada a su barra de la huella de voces: al pasar o enfocar la tarjeta se ilumina su barra y al
// revés (estado `active`). El brillo es una capa aparte que solo cambia de opacidad.
import { memo } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import StarRating from './StarRating';
import { formatFullDate, formatRelativeDate, starsLabel } from './reviewFormat';
import { LATEST, MINE, NO_TEXT } from './reviewsCopy';
import OwnActions from './OwnActions';

const AVATAR_TONES = [
  'bg-brand-400/15 text-brand-200',
  'bg-night-teal text-brand-100',
  'bg-surface-3 text-ink',
  'bg-brand-800/50 text-brand-100',
];

// Avatar con iniciales; al pasar por la tarjeta, un anillo de luz gira a su alrededor
function Avatar({ initials, tone }) {
  return (
    <span aria-hidden="true" className="relative grid h-10 w-10 shrink-0 place-items-center">
      <span className="reviews-ring absolute -inset-0.5 rounded-full opacity-0 transition-opacity duration-300 group-hover/card:opacity-100 group-focus-visible/card:opacity-100" />
      <span className={`relative grid h-10 w-10 place-items-center rounded-full text-sm font-semibold tracking-wide ring-1 ring-white/10 ${AVATAR_TONES[tone]}`}>
        {initials}
      </span>
    </span>
  );
}

// Inclinación 3D y brillo que siguen al cursor: motion values (sin re-render), solo con ratón y sin
// reduced motion; en táctil la tarjeta queda plana.
const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

function useTilt(maxDeg) {
  const reduce = useReducedMotion();
  const rotateX = useSpring(0, { stiffness: 220, damping: 22 });
  const rotateY = useSpring(0, { stiffness: 220, damping: 22 });
  const glareX = useMotionValue(0);
  const glareY = useMotionValue(0);
  if (reduce || !canHover()) return null;
  return {
    style: { rotateX, rotateY, transformPerspective: 1000 },
    glare: { x: glareX, y: glareY },
    move: (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      rotateY.set((px - 0.5) * 2 * maxDeg);
      rotateX.set((0.5 - py) * 2 * maxDeg);
      glareX.set(e.clientX - r.left);
      glareY.set(e.clientY - r.top);
    },
    reset: () => {
      rotateX.set(0);
      rotateY.set(0);
    },
  };
}

function ReviewCard({ review, featured = false, active = false, linked = false, onActivate, onDeactivate, ownActions }) {
  const { id, name, initials, tone, rating, text, date, mine } = review;
  // Destacada: cita grande en display si es breve; si es larga, cuerpo amplio y legible
  const quote = featured && text.length <= 180;
  const enter = linked ? () => onActivate(id) : undefined;
  const leave = linked ? () => onDeactivate(id) : undefined;
  const tilt = useTilt(featured ? 2 : 4);

  return (
    <motion.article
      id={`review-${id}`}
      tabIndex={0}
      aria-labelledby={`review-${id}-author`}
      data-active={active || undefined}
      style={tilt?.style}
      onPointerEnter={enter}
      onPointerMove={tilt?.move}
      onPointerLeave={() => {
        leave?.();
        tilt?.reset();
      }}
      onFocus={enter}
      onBlur={leave}
      className={`group/card relative isolate scroll-mt-28 rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas ${
        featured ? 'reviews-station p-7 sm:p-10' : 'p-6 sm:p-7'
      }`}
    >
      {/* Superficie: cristal suave; la destacada, con más luz y borde de luz (reviews-station) */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 -z-10 rounded-3xl backdrop-blur-md ${
          featured ? 'bg-brand-400/[0.07] shadow-raised' : 'bg-white/[0.035] ring-1 ring-inset ring-white/[0.06]'
        }`}
      />
      {/* Brillo que sigue al cursor (recortado a la tarjeta) */}
      {tilt && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-3xl">
          <motion.span
            style={{ x: tilt.glare.x, y: tilt.glare.y, translateX: '-50%', translateY: '-50%' }}
            className="absolute left-0 top-0 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgb(201_236_183/0.14),transparent)] opacity-0 transition-opacity duration-300 group-hover/card:opacity-100"
          />
        </span>
      )}
      {/* Brillo enlazado con su barra: aparece solo al activarse (opacidad) */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 rounded-3xl bg-white/[0.04] opacity-0 shadow-glow transition-opacity duration-300 ease-out-expo group-data-active/card:opacity-100"
      />

      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <StarRating value={rating} label={starsLabel(rating)} size={featured ? 'h-5 w-5' : 'h-4 w-4'} />
          {featured && <span className="eyebrow">{LATEST}</span>}
          {mine && (
            <span className="rounded-full bg-brand-400/15 px-2.5 py-0.5 text-xs font-semibold text-brand-200 ring-1 ring-inset ring-brand-400/30">
              {MINE}
            </span>
          )}
        </div>
        {linked && (
          // Su barra en miniatura (solo donde se ve la huella de voces)
          <span aria-hidden="true" className="relative hidden h-4 w-1 lg:block">
            <span className="absolute inset-0 rounded-full bg-ink-3/60 transition-opacity duration-300 group-data-active/card:opacity-0" />
            <span className="absolute inset-0 rounded-full bg-brand-300 opacity-0 transition-opacity duration-300 group-data-active/card:opacity-100" />
          </span>
        )}
      </div>

      {text ? (
        <p
          className={`mt-5 max-w-[65ch] whitespace-pre-line break-words [overflow-wrap:anywhere] text-ink ${
            quote ? 'font-display text-title-2 font-bold' : featured ? 'text-xl leading-relaxed sm:text-2xl sm:leading-relaxed' : 'text-lg leading-relaxed'
          }`}
        >
          {text}
        </p>
      ) : (
        <p className="mt-5 text-base text-ink-3 italic">{NO_TEXT}</p>
      )}

      <footer className={`flex items-center gap-3 ${featured ? 'mt-8' : 'mt-6'}`}>
        <Avatar initials={initials} tone={tone} />
        <div className="min-w-0">
          <h3 id={`review-${id}-author`} className="line-clamp-2 break-words [overflow-wrap:anywhere] font-sans text-sm font-semibold text-ink">
            <span className="sr-only">Reseña de </span>
            {name}
          </h3>
          {date && (
            <time dateTime={date.toISOString()} title={formatFullDate(date)} className="text-sm text-ink-2">
              {formatRelativeDate(date)}
            </time>
          )}
        </div>
      </footer>
      {/* Tus reseñas: editar y borrar desde su propia tarjeta */}
      {mine && ownActions && (
        <div className="mt-5 border-t border-white/[0.06] pt-4">
          <OwnActions review={review} actions={ownActions} scope="card" size="sm" />
        </div>
      )}
    </motion.article>
  );
}

export default memo(ReviewCard);
