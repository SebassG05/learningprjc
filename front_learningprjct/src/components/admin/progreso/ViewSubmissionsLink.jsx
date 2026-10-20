/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { focusRing } from '../ui/tones';
import { COPY } from './progresoCopy';

// Lleva a Correcciones filtrado por este curso y este alumno
const ViewSubmissionsLink = memo(function ViewSubmissionsLink({ row, courseId, name, compact = false }) {
  if (!row.userId || !row.email || row.email === 'N/A' || row.delivered === 0) return null;
  const to = `/admin/correcciones?curso=${courseId}&q=${encodeURIComponent(row.email)}`;
  return (
    <Link
      to={to}
      aria-label={COPY.viewSubmissionsOf(name)}
      className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full text-sm font-semibold text-ink-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink ${focusRing} ${
        compact ? 'w-11 justify-center' : 'px-3'
      }`}
    >
      {compact ? null : COPY.viewSubmissions}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
});

export default ViewSubmissionsLink;
