/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import StatCard from '../ui/StatCard';
import { COPY, STAT_FILTERS } from './correccionesCopy';

/**
 * Cifras por estado que además filtran la lista. En móvil son chips en un carrusel horizontal;
 * desde 768 px, cinco tarjetas en fila. Pulsar la activa vuelve a «Todas».
 */
const SubmissionStats = memo(function SubmissionStats({ stats, estado, onChange, loading }) {
  return (
    <div role="group" aria-label={COPY.statsLabel}>
      {/* Móvil: chips desplazables */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide md:hidden">
        {STAT_FILTERS.map((s) => (
          <StatCard
            key={s.key}
            compact
            label={s.label}
            value={stats?.[s.key] ?? 0}
            toneName={s.tone}
            active={estado === s.estado}
            loading={loading}
            onClick={() => onChange(estado === s.estado ? '' : s.estado)}
          />
        ))}
      </div>
      {/* Tableta y escritorio: tarjetas */}
      <div className="hidden grid-cols-5 gap-3 md:grid">
        {STAT_FILTERS.map((s) => (
          <StatCard
            key={s.key}
            label={s.label}
            value={stats?.[s.key] ?? 0}
            toneName={s.tone}
            active={estado === s.estado}
            loading={loading}
            onClick={() => onChange(estado === s.estado ? '' : s.estado)}
          />
        ))}
      </div>
    </div>
  );
});

export default SubmissionStats;
