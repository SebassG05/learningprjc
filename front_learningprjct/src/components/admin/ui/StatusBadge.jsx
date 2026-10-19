/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { CheckCircle2, Circle, Clock, PenLine, XCircle } from 'lucide-react';
import { statusInfo } from '../shared/submissionStatus';
import { tone } from './tones';

const ICON = { enviado: Clock, revisado: PenLine, aprobado: CheckCircle2, rechazado: XCircle };

/**
 * Estado de una entrega: icono + texto + color (nunca solo color).
 * `audience="student"` usa la etiqueta que ve el alumno («Enviado» en vez de «Pendiente»).
 */
const StatusBadge = memo(function StatusBadge({ estado, audience = 'admin', size = 'md', className = '' }) {
  const info = statusInfo(estado);
  const Icon = ICON[estado] ?? Circle;
  const t = tone(info.tone);
  const pad = size === 'sm' ? 'h-6 px-2 text-xs gap-1' : 'h-7 px-2.5 text-xs gap-1.5';
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full border font-semibold whitespace-nowrap ${pad} ${t.badge} ${className}`}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {audience === 'student' ? info.studentLabel : info.label}
    </span>
  );
});

export default StatusBadge;
