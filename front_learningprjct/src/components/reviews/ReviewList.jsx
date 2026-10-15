/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Muro de reseñas: la más reciente arriba a gran tamaño y el resto en dos columnas (masonry con CSS
// columns: el orden del DOM y del tabulador sigue siendo el de lectura). Mientras carga, esqueletos con
// la misma silueta para que nada salte. Solo las tarjetas que entran en pantalla se animan.
import { motion, useReducedMotion } from 'framer-motion';
import ReviewCard from './ReviewCard';
import { MAX_SATELLITES } from './ReviewsOrbit';
import { WALL_TITLE } from './reviewsCopy';
import { duration, ease, inView, stagger } from '../../lib/motion';

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

export default function ReviewList({ reviews, loading, error, activeId, onActivate, onDeactivate, children }) {
  const reduce = useReducedMotion();
  const enter = (i) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: inView,
    transition: { duration: reduce ? duration.fast : duration.scene, ease: ease.outExpo, delay: reduce ? 0 : (i % 4) * stagger.cards },
  });

  return (
    <section aria-labelledby="reviews-wall-title" aria-busy={loading || undefined}>
      <h2 id="reviews-wall-title" className="eyebrow mb-6">
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
        <ul aria-labelledby="reviews-wall-title" className="gap-x-6 md:columns-2">
          {reviews.map((review, i) => (
            <motion.li
              key={review.id}
              {...enter(i)}
              className={i === 0 ? 'mb-6 [column-span:all]' : 'mb-2 break-inside-avoid'}
            >
              <ReviewCard
                review={review}
                featured={i === 0}
                active={review.id === activeId}
                orbitIndex={i < MAX_SATELLITES ? i : undefined}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
              />
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
