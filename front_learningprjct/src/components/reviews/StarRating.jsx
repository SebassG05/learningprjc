/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Puntuación en estrellas (solo lectura). Admite decimales para la media: la última estrella se
// rellena en parte con un recorte. El texto accesible va aparte ("4 de 5 estrellas").
import { useId } from 'react';
import { MAX_RATING } from './reviewFormat';

const PATH =
  'M12 2.6l2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.03l-5.66 2.98 1.08-6.3L2.85 9.25l6.32-.92z';

export function StarShape({ fill = 1, className = '' }) {
  const clip = useId();
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      {/* Estrella vacía: contorno visible sobre oscuro (contraste ≥ 3:1) */}
      <path d={PATH} fill="none" stroke="var(--color-ink-3)" strokeWidth="1.4" strokeLinejoin="round" />
      {fill > 0 && (
        <>
          <clipPath id={clip}>
            <rect width={24 * Math.min(1, fill)} height="24" />
          </clipPath>
          <path d={PATH} fill="currentColor" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" clipPath={`url(#${clip})`} />
        </>
      )}
    </svg>
  );
}

// Sin `label` es decorativa (el número ya se lee al lado)
export default function StarRating({ value, size = 'h-4 w-4', label, className = '' }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': true };
  return (
    <span className={`inline-flex items-center gap-0.5 text-brand-400 ${className}`} {...a11y}>
      {Array.from({ length: MAX_RATING }, (_, i) => (
        <StarShape key={i} fill={Math.max(0, Math.min(1, value - i))} className={size} />
      ))}
    </span>
  );
}
