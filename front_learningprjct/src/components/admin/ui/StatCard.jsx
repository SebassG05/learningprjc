/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../../lib/motion';
import { focusRing, tone } from './tones';

/**
 * Cifra que además filtra: un botón conmutable (aria-pressed). Fondo neutro común y un punto
 * de color por estado; la activa se destaca con el borde de su tono y el fondo elevado.
 * `compact` es la versión chip para móvil (carrusel horizontal).
 */
const StatCard = memo(function StatCard({ label, value, toneName = 'neutral', active = false, compact = false, onClick, loading = false }) {
  const t = tone(toneName);
  const base = `group relative flex shrink-0 rounded-2xl border text-left transition-[background-color,border-color] duration-200 ease-standard ${focusRing}`;
  const state = active ? `bg-surface-2 border-line-strong ring-1 ring-inset ${t.ring}` : 'bg-surface border-line hover:bg-surface-2/70 hover:border-line-strong';
  const layout = compact ? 'min-h-11 items-center gap-2 px-4 py-2' : 'min-h-24 flex-col justify-between gap-3 p-4';
  return (
    <motion.button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      transition={spring.snappy}
      className={`${base} ${state} ${layout}`}
    >
      <span className="flex items-center gap-2 text-sm font-medium text-ink-2">
        <span className={`h-2 w-2 shrink-0 rounded-full ${t.dot}`} aria-hidden="true" />
        {label}
      </span>
      <span className={`font-display tabular-nums text-ink ${compact ? 'text-base' : 'text-3xl leading-none'}`}>
        {loading ? <span className="inline-block h-[1em] w-8 animate-pulse rounded bg-white/[0.08] motion-reduce:animate-none" aria-hidden="true" /> : value}
      </span>
    </motion.button>
  );
});

export default StatCard;
