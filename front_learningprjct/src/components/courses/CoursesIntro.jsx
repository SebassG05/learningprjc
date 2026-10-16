/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef, useState } from 'react';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { ease } from '../../lib/motion';
import { PROVISIONAL, STATS } from './coursesCopy';
import { formatHours } from './courseFormat';

// Cifra que cuenta hacia arriba al entrar en pantalla, sin re-renders (escribe en el nodo).
// El lector de pantalla oye el valor final (aria-label), nunca los intermedios.
function CountUp({ value, format = String }) {
  const ref = useRef(null);
  const seen = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [start] = useState(() => (reduce ? value : 0));

  useEffect(() => {
    if (!seen || reduce || !ref.current) return undefined;
    const controls = animate(start, value, {
      duration: 1.1,
      ease: ease.outExpo,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [seen, reduce, start, value, format]);

  return (
    <span ref={ref} aria-hidden="true">
      {format(reduce ? value : start)}
    </span>
  );
}

function Stat({ value, label, format = String }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="order-2 text-footnote font-medium text-ink-3">{label}</dt>
      <dd className="order-1 text-stat font-bold tabular-nums text-ink">
        <span className="sr-only">{format(value)}</span>
        <CountUp value={value} format={format} />
      </dd>
    </div>
  );
}

// Escena 1 del listado. El titular se pinta visible desde el primer frame (es el LCP) y lo único
// que se mueve son las cifras. En móvil la escena llena la primera pantalla: si asomara la portada
// de la primera tarjeta, esa imagen (que llega tras el JS y la API) pasaría a ser el LCP.
export default function CoursesIntro({ stats }) {
  const { eyebrow, title, lead } = PROVISIONAL.listIntro;
  return (
    <section
      aria-labelledby="cursos-titulo"
      className="flex min-h-[calc(100svh-var(--spacing-header))] flex-col justify-center pb-12 pt-10 md:block md:min-h-0 md:pt-20 lg:pb-16 lg:pt-28"
    >
      <p className="eyebrow">{eyebrow}</p>
      <h1 id="cursos-titulo" className="mt-4 text-display font-bold text-ink">{title}</h1>
      <p className="mt-6 max-w-2xl text-lg text-ink-2">{lead}</p>
      {/* Altura reservada mientras cargan los datos: nada empuja a la rejilla (CLS 0) */}
      <div className="mt-10 min-h-[calc(var(--text-stat)+1.375rem)] sm:mt-12">
        {stats ? (
          <dl className="flex flex-wrap gap-x-12 gap-y-6">
            <Stat value={stats.courses} label={STATS.courses(stats.courses)} />
            {stats.topics > 0 ? <Stat value={stats.topics} label={STATS.topics(stats.topics)} /> : null}
            {stats.hours > 0 ? <Stat value={stats.hours} label={STATS.hours} format={formatHours} /> : null}
          </dl>
        ) : null}
      </div>
    </section>
  );
}
