/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { tone } from './tones';

// Pastilla de estado: icono + texto + color del tono (nunca solo color)
const Badge = memo(function Badge({ icon: Icon, label, toneName = 'neutral', size = 'md', className = '' }) {
  const pad = size === 'sm' ? 'h-6 px-2 text-xs gap-1' : 'h-7 px-2.5 text-xs gap-1.5';
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border font-semibold whitespace-nowrap ${pad} ${tone(toneName).badge} ${className}`}>
      {Icon ? <Icon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
      {label}
    </span>
  );
});

export default Badge;
