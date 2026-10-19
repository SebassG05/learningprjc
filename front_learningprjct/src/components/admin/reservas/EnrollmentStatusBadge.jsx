/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { CheckCircle2, PlayCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import { ENROLLMENT_STATUS } from './reservasQuery';

const ICON = { enrolled: PlayCircle, completed: CheckCircle2 };

const EnrollmentStatusBadge = memo(function EnrollmentStatusBadge({ status, size }) {
  const info = ENROLLMENT_STATUS[status] ?? ENROLLMENT_STATUS.enrolled;
  return <Badge icon={ICON[status] ?? PlayCircle} label={info.label} toneName={info.tone} size={size} />;
});

export default EnrollmentStatusBadge;
