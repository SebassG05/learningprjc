/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import ProgressBar from '../ui/ProgressBar';
import RelativeTime from '../ui/RelativeTime';
import StudentIdentity from '../ui/StudentIdentity';
import { courseName, studentName } from '../shared/adminFormat';
import ContactButton from './ContactButton';
import EnrollmentStatusBadge from './EnrollmentStatusBadge';
import { COPY } from './reservasCopy';

const Card = memo(function Card({ x }) {
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 [content-visibility:auto] [contain-intrinsic-size:auto_10rem]">
      <div className="flex items-start justify-between gap-3">
        <StudentIdentity user={x.userId} size="sm" />
        <ContactButton user={x.userId} course={x.courseId} compact />
      </div>
      <div className="min-w-0">
        <p className={`truncate font-medium ${x.courseId ? 'text-ink' : 'italic text-ink-3'}`}>{courseName(x.courseId)}</p>
        <p className="mt-0.5 text-footnote text-ink-3">
          {COPY.columns.date}: <RelativeTime date={x.enrolledAt} />
        </p>
      </div>
      <div className="flex items-center gap-3">
        <EnrollmentStatusBadge status={x.status} />
        <ProgressBar value={x.progress} label={COPY.progressOf(studentName(x.userId))} className="flex-1" />
      </div>
    </li>
  );
});

// Tarjetas para móvil y tableta (< 1024 px)
const EnrollmentCards = memo(function EnrollmentCards({ items, busy }) {
  return (
    <ul className={`grid grid-cols-1 gap-3 transition-opacity duration-200 md:grid-cols-2 ${busy ? 'opacity-60' : ''}`} aria-label="Inscripciones">
      {items.map((x) => <Card key={x._id} x={x} />)}
    </ul>
  );
});

export default EnrollmentCards;
