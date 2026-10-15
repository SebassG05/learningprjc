/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Resumen honesto: media con un decimal en tipografía display, total y reparto por estrellas.
// Sin reseñas no hay nota: se muestra "—" y "Sin reseñas todavía", nunca "0.00 / 5".
// Las barras crecen al entrar (scaleX desde la izquierda); con reduced motion aparecen ya llenas.
import { motion, useReducedMotion } from 'framer-motion';
import StarRating, { StarShape } from './StarRating';
import { formatAverage, MAX_RATING, reviewsLabel } from './reviewFormat';
import { duration, ease, inView, stagger } from '../../lib/motion';

function Distribution({ rows, total, reduce }) {
  return (
    <ul aria-label="Reseñas por puntuación" className="flex flex-col gap-2.5">
      {rows.map(({ stars, count }, i) => (
        <li key={stars} className="grid grid-cols-[2.25rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="flex items-center gap-1 tabular-nums text-ink-2" aria-hidden="true">
            {stars}
            <StarShape fill={1} className="h-3.5 w-3.5 text-brand-400" />
          </span>
          <span className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
            <motion.span
              className="absolute inset-0 origin-left rounded-full bg-brand-400"
              initial={{ scaleX: reduce ? count / total : 0 }}
              whileInView={{ scaleX: count / total }}
              viewport={inView}
              transition={{ duration: duration.reveal, ease: ease.outExpo, delay: reduce ? 0 : i * stagger.list }}
            />
          </span>
          <span className="text-right tabular-nums text-ink-2" aria-hidden="true">
            {count}
          </span>
          <span className="sr-only">{`${stars} ${stars === 1 ? 'estrella' : 'estrellas'}: ${reviewsLabel(count)}`}</span>
        </li>
      ))}
    </ul>
  );
}

export default function ReviewsSummary({ count, average, distribution, loading, className = '' }) {
  const reduce = useReducedMotion();
  const empty = !loading && count === 0;

  return (
    <section aria-labelledby="reviews-summary-title" className={className}>
      <h2 id="reviews-summary-title" className="sr-only">
        Valoración de los alumnos
      </h2>
      <div className="grid grid-cols-1 items-end gap-x-12 gap-y-8 sm:grid-cols-[auto_1fr] lg:grid-cols-1 xl:grid-cols-[auto_1fr]">
        <div className="flex items-end gap-5" aria-busy={loading || undefined}>
          <p className="font-display text-display font-bold tabular-nums text-ink">
            {loading || empty ? (
              <span aria-hidden="true" className={`font-sans font-extralight text-ink-3 ${loading ? 'animate-pulse' : ''}`}>
                —
              </span>
            ) : (
              <>
                <span className="sr-only">Media: </span>
                {formatAverage(average)}
                <span className="sr-only"> de {MAX_RATING}</span>
              </>
            )}
          </p>
          <div className="flex flex-col gap-1.5 pb-2">
            {!loading && !empty && <StarRating value={average} size="h-5 w-5" />}
            <p className="text-base text-ink-2">
              {loading ? 'Cargando reseñas…' : empty ? 'Sin reseñas todavía' : (
                <>
                  <span aria-hidden="true">{`de ${MAX_RATING} · `}</span>
                  {reviewsLabel(count)}
                </>
              )}
            </p>
          </div>
        </div>
        {!loading && !empty && <Distribution rows={distribution} total={count} reduce={reduce} />}
      </div>
    </section>
  );
}
