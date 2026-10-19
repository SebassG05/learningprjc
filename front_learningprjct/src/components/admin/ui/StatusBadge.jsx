/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { CheckCircle2, Circle, Clock, PenLine, XCircle } from 'lucide-react';
import { statusInfo } from '../shared/submissionStatus';
import Badge from './Badge';

const ICON = { enviado: Clock, revisado: PenLine, aprobado: CheckCircle2, rechazado: XCircle };

/**
 * Estado de una entrega: icono + texto + color (nunca solo color).
 * `audience="student"` usa la etiqueta que ve el alumno («Enviado» en vez de «Pendiente»).
 */
const StatusBadge = memo(function StatusBadge({ estado, audience = 'admin', size = 'md', className = '' }) {
  const info = statusInfo(estado);
  return (
    <Badge
      icon={ICON[estado] ?? Circle}
      label={audience === 'student' ? info.studentLabel : info.label}
      toneName={info.tone}
      size={size}
      className={className}
    />
  );
});

export default StatusBadge;
