/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Resumen honesto: media con un decimal en tipografía display, total y reparto por estrellas.
// Sin reseñas no hay nota: estrellas vacías y "Sin reseñas todavía", nunca "0.00 / 5".
// Las barras crecen al entrar (scaleX desde la izquierda); con reduced motion aparecen ya llenas.
import { useEffect, useRef } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'framer-motion';
import StarRating, { StarShape } from './StarRating';
import { formatAverage, MAX_RATING, reviewsLabel } from './reviewFormat';
import { duration, ease, inView, stagger } from '../../lib/motion';
import { SUMMARY_EMPTY } from './reviewsCopy';

// La media cuenta hacia arriba al entrar en pantalla (escribe en el nodo: sin re-render por frame)
function CountUp({ value }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const seen = useInView(ref, { once: true });
  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    if (reduce || !seen) {
      node.textContent = formatAverage(reduce || seen ? value : 0);
      return undefined;
    }
    const controls = animate(0, value, {
      duration: duration.reveal * 1.4,
      ease: ease.outExpo,
      onUpdate: (v) => (node.textContent = formatAverage(v)),
    });
    return () => controls.stop();
  }, [seen, value, reduce]);
  return <span ref={ref} aria-hidden="true">{formatAverage(reduce ? value : 0)}</span>;
}

// Las barras crecen al entrar. Se observa la lista, no cada barra: una barra a scaleX 0 mide 0 de
// ancho y el IntersectionObserver no la daría nunca por visible (pasaba en móvil).
function Distribution({ rows, total, reduce }) {
  const fill = {
    hidden: { scaleX: 0 },
    show: (i) => ({
      scaleX: rows[i].count / total,
      transition: { duration: duration.reveal, ease: ease.outExpo, delay: reduce ? 0 : i * stagger.list },
    }),
  };
  return (
    <motion.ul
      aria-label="Reseñas por puntuación"
      className="flex flex-col gap-2.5"
      initial={reduce ? 'show' : 'hidden'}
      whileInView="show"
      viewport={inView}
    >
      {rows.map(({ stars, count }, i) => (
        <li key={stars} className="grid grid-cols-[2.25rem_1fr_2.5rem] items-center gap-3 text-sm">
          <span className="flex items-center gap-1 tabular-nums text-gray-200" aria-hidden="true">
            {stars}
            <StarShape fill={1} className="h-3.5 w-3.5 text-brand-400" />
          </span>
          <span className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.08]" aria-hidden="true">
            <motion.span className="absolute inset-0 origin-left rounded-full bg-brand-400" variants={fill} custom={i} />
          </span>
          <span className="text-right tabular-nums text-gray-200" aria-hidden="true">
            {count}
          </span>
          <span className="sr-only">{`${stars} ${stars === 1 ? 'estrella' : 'estrellas'}: ${reviewsLabel(count)}`}</span>
        </li>
      ))}
    </motion.ul>
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
        {loading ? (
          <div aria-busy="true" className="flex items-end gap-5">
            <span className="sr-only">Cargando reseñas…</span>
            <span aria-hidden="true" className="h-[0.9em] w-[2.4em] animate-pulse rounded-2xl bg-white/[0.06] text-display" />
            <span aria-hidden="true" className="mb-2 h-4 w-32 animate-pulse rounded-full bg-white/[0.06]" />
          </div>
        ) : empty ? (
          // Sin reseñas no hay nota: estrellas vacías y una frase, nunca "0.00 / 5"
          <div className="flex flex-col gap-3">
            <span className="text-brand-300 [&_path:first-child]:stroke-brand-300/70">
              <StarRating value={0} size="h-7 w-7" />
            </span>
            <p className="font-display text-title-2 font-bold text-ink">{SUMMARY_EMPTY.title}</p>
            <p className="text-base text-gray-200">{SUMMARY_EMPTY.body}</p>
          </div>
        ) : (
          <div className="flex items-end gap-5">
            <p className="font-display text-display font-bold tabular-nums text-ink">
              <span className="sr-only">{`Media: ${formatAverage(average)} de ${MAX_RATING}`}</span>
              <CountUp value={average} />
            </p>
            <div className="flex flex-col gap-1.5 pb-2">
              <StarRating value={average} size="h-5 w-5" />
              <p className="text-base text-gray-200">
                <span aria-hidden="true">{`de ${MAX_RATING} · `}</span>
                {reviewsLabel(count)}
              </p>
            </div>
          </div>
        )}
        {!loading && !empty && <Distribution rows={distribution} total={count} reduce={reduce} />}
      </div>
    </section>
  );
}
