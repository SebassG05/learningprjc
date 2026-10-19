/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Clock } from 'lucide-react';
import Badge from '../ui/Badge';
import { COPY } from './progresoCopy';

// Entregas de un alumno: «3 de 5» y, si las hay, cuántas esperan corrección
const StudentSubmissions = memo(function StudentSubmissions({ row }) {
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className="text-sm tabular-nums text-ink" title={COPY.deliveredHint(row.exercises)}>
        {COPY.delivered(row.delivered, row.exercises)}
        <span className="sr-only"> {COPY.deliveredHint(row.exercises).toLowerCase()}</span>
      </span>
      {row.pending > 0 ? <Badge icon={Clock} label={COPY.pending(row.pending)} toneName="dawn" size="sm" /> : null}
    </span>
  );
});

export default StudentSubmissions;
