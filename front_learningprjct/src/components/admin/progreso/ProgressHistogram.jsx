/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo, useId, useState } from 'react';
import { COPY } from './progresoCopy';

// Geometría en unidades del viewBox (el SVG escala al ancho de su tarjeta)
const W = 400;
const H = 168;
const TOP = 22; // hueco para la cifra encima de la barra
const BOTTOM = 26; // etiquetas del eje x
const GAP = 14;
const R = 4; // extremo redondeado (solo arriba: la base se ancla al eje)

const barPath = (x, y, w, h) => {
  if (h <= 0) return '';
  const r = Math.min(R, h, w / 2);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
};

/**
 * Distribución de alumnos por tramo de progreso: una sola serie (verde de la marca), sin leyenda;
 * cifras encima de cada barra, eje base sutil y tooltip al pasar o enfocar cada barra.
 * La tabla de alumnos de debajo es la vista en datos de este gráfico.
 */
const ProgressHistogram = memo(function ProgressHistogram({ bins }) {
  const titleId = useId();
  const [hover, setHover] = useState(null);
  const max = Math.max(1, ...bins.map((b) => b.count));
  const plotH = H - TOP - BOTTOM;
  const bw = (W - GAP * (bins.length - 1)) / bins.length;

  return (
    <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <figcaption id={titleId} className="mb-1">
        <span className="block text-sm font-semibold text-ink">{COPY.histogram.title}</span>
        <span className="block text-footnote text-ink-3">{COPY.histogram.caption}</span>
      </figcaption>
      <div className="relative mt-3 flex-1">
        <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-labelledby={titleId} className="block h-auto w-full overflow-visible">
          <line x1="0" x2={W} y1={H - BOTTOM} y2={H - BOTTOM} stroke="var(--color-line-strong)" strokeWidth="1" />
          {bins.map((b, i) => {
            const h = (b.count / max) * plotH;
            const x = i * (bw + GAP);
            const y = H - BOTTOM - h;
            const active = hover === i;
            return (
              <g
                key={b.label}
                tabIndex={0}
                role="img"
                aria-label={COPY.histogram.bar(b.label, b.count)}
                onPointerEnter={() => setHover(i)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                className="cursor-default outline-none [&:focus-visible>rect:first-child]:stroke-brand-400"
              >
                {/* Zona de interacción más grande que la barra */}
                <rect x={x} y={TOP - 18} width={bw} height={plotH + 18} fill="transparent" strokeWidth="2" rx="6" />
                <path d={barPath(x, y, bw, h)} fill={active ? 'var(--color-brand-300)' : 'var(--color-brand-500)'} className="transition-[fill] duration-150" />
                <text x={x + bw / 2} y={y - 6} textAnchor="middle" className="fill-ink text-[13px] font-semibold tabular-nums">
                  {b.count}
                </text>
                <text x={x + bw / 2} y={H - 8} textAnchor="middle" className="fill-ink-3 text-[11px]">
                  {b.label}
                </text>
              </g>
            );
          })}
        </svg>
        {hover !== null ? (
          <div
            aria-hidden="true"
            // Encima de la barra señalada (sobre su cifra); en las barras altas, dentro de la barra
            // para no subir hasta el título de la tarjeta
            className={`pointer-events-none absolute z-10 -translate-x-1/2 whitespace-nowrap rounded-lg border border-line-strong material-thick px-2.5 py-1.5 text-xs font-medium text-ink shadow-overlay ${
              bins[hover].count / max > 0.6 ? 'mt-2' : '-mt-7 -translate-y-full'
            }`}
            style={{
              left: `${((hover * (bw + GAP) + bw / 2) / W) * 100}%`,
              top: `${((H - BOTTOM - (bins[hover].count / max) * plotH) / H) * 100}%`,
            }}
          >
            {COPY.histogram.bar(bins[hover].label, bins[hover].count)}
          </div>
        ) : null}
      </div>
    </figure>
  );
});

export default ProgressHistogram;
