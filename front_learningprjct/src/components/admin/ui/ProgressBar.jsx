/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';

/**
 * Progreso 0–100 con su cifra al lado. La barra se rellena con transform (sin animar anchuras)
 * y el valor se anuncia como progressbar.
 */
const ProgressBar = memo(function ProgressBar({ value = 0, label, showValue = true, className = '' }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label={label}
        className="h-1.5 min-w-12 flex-1 overflow-hidden rounded-full bg-surface-3"
      >
        <div
          className={`h-full origin-left rounded-full transition-transform duration-300 ease-standard ${pct === 100 ? 'bg-brand' : 'bg-brand-600'}`}
          style={{ transform: `scaleX(${pct / 100})` }}
        />
      </div>
      {showValue ? <span className="w-10 shrink-0 text-right text-sm tabular-nums text-ink-2">{pct}%</span> : null}
    </div>
  );
});

export default ProgressBar;
