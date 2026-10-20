/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import StatCard from './StatCard';

/**
 * Cifras que además filtran la lista. En móvil son chips en un carrusel horizontal; desde 768 px,
 * tarjetas en fila. Pulsar la activa vuelve a «todas» (valor '').
 * `items`: [{ value, label, tone, statKey }] · `stats`: { [statKey]: número }
 */
const StatFilters = memo(function StatFilters({ items, stats, value, onChange, loading, label }) {
  const cards = (compact) =>
    items.map((s) => (
      <StatCard
        key={s.statKey}
        compact={compact}
        label={s.label}
        value={stats?.[s.statKey] ?? 0}
        toneName={s.tone}
        active={value === s.value}
        loading={loading}
        onClick={() => onChange(value === s.value ? '' : s.value)}
      />
    ));
  return (
    <div role="group" aria-label={label}>
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide md:hidden">{cards(true)}</div>
      <div className="hidden gap-3 md:grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {cards(false)}
      </div>
    </div>
  );
});

export default StatFilters;
