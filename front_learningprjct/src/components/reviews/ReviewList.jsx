/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Muro de reseñas: la más reciente arriba a gran tamaño y el resto en dos columnas (masonry con CSS
// columns: el orden del DOM y del tabulador sigue siendo el de lectura). Mientras carga, esqueletos con
// la misma silueta para que nada salte. Solo las tarjetas que entran en pantalla se animan. Al borrar
// una, primero se desvanece encogiendo en su sitio y después el resto cierra el hueco con una animación
// de layout (transform), sin saltos; con reduced motion, solo un fundido.
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import ReviewCard from './ReviewCard';
import { MAX_VOICES } from './ReviewsVoiceprint';
import { WALL_TITLE } from './reviewsCopy';
import { duration, ease, inView, spring, stagger } from '../../lib/motion';

const SKELETON_HEIGHTS = ['h-44', 'h-56', 'h-40', 'h-52'];

function Skeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-4">
      <div className="h-64 animate-pulse rounded-3xl bg-white/[0.035]" />
      <div className="gap-4 md:columns-2">
        {SKELETON_HEIGHTS.map((h) => (
          <div key={h} className={`mb-4 break-inside-avoid animate-pulse rounded-3xl bg-white/[0.035] ${h}`} />
        ))}
      </div>
    </div>
  );
}

export default function ReviewList({ reviews, loading, error, activeId, onActivate, onDeactivate, ownActions, children }) {
  const reduce = useReducedMotion();
  const enter = (i) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: inView,
    transition: {
      duration: reduce ? duration.fast : duration.scene,
      ease: ease.outExpo,
      delay: reduce ? 0 : (i % 4) * stagger.cards,
      layout: spring.gentle,
    },
  });
  const leave = reduce
    ? { opacity: 0, transition: { duration: duration.fast } }
    : { opacity: 0, scale: 0.92, y: -8, transition: { duration: duration.slow, ease: ease.exit } };

  return (
    <section aria-labelledby="reviews-wall-title" aria-busy={loading || undefined}>
      <h2 id="reviews-wall-title" tabIndex={-1} className="eyebrow mb-6 outline-none">
        {WALL_TITLE}
      </h2>
      {loading ? (
        <>
          <p className="sr-only" role="status">Cargando reseñas…</p>
          <Skeleton />
        </>
      ) : error ? (
        <p role="alert" className="rounded-3xl bg-white/[0.035] p-8 text-base text-danger">
          {error}
        </p>
      ) : reviews.length === 0 ? (
        children
      ) : (
        <ul aria-labelledby="reviews-wall-title" className="relative gap-x-6 md:columns-2">
          {/* Primero se va la tarjeta, en su sitio; después las demás cierran el hueco */}
          <AnimatePresence>
          {reviews.map((review, i) => (
            <motion.li
              key={review.id}
              layout={reduce ? false : 'position'}
              exit={leave}
              {...enter(i)}
              className={i === 0 ? 'mb-6 [column-span:all]' : 'mb-2 break-inside-avoid'}
            >
              <ReviewCard
                review={review}
                featured={i === 0}
                active={review.id === activeId}
                linked={i < MAX_VOICES}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                ownActions={review.mine ? ownActions : undefined}
              />
            </motion.li>
          ))}
          </AnimatePresence>
        </ul>
      )}
    </section>
  );
}
