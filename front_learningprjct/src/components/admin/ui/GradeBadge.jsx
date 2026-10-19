/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { formatGrade, gradeTone, hasGrade, PASS_MARK } from '../shared/submissionStatus';
import { tone } from './tones';

const RANGE = { danger: 'suspenso', dawn: 'aprobado justo', brand: 'buena nota' };

// Nota sobre 10 con color por rango. El rango también se anuncia en texto (no solo color).
const GradeBadge = memo(function GradeBadge({ nota, className = '' }) {
  if (!hasGrade(nota)) {
    return <span className={`text-sm text-ink-3 ${className}`} aria-label="Sin nota">—</span>;
  }
  const name = gradeTone(nota);
  return (
    <span
      className={`inline-flex items-baseline gap-0.5 font-semibold tabular-nums ${tone(name).text} ${className}`}
      title={`${RANGE[name]} (aprobado desde ${PASS_MARK})`}
    >
      <span className="text-base">{formatGrade(nota)}</span>
      <span className="text-xs text-ink-3">/10</span>
      <span className="sr-only">, {RANGE[name]}</span>
    </span>
  );
});

export default GradeBadge;
