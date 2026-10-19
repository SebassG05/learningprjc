/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import ProgressBar from '../ui/ProgressBar';
import RelativeTime from '../ui/RelativeTime';
import StudentIdentity from '../ui/StudentIdentity';
import { courseName, studentName } from '../shared/adminFormat';
import ContactButton from './ContactButton';
import EnrollmentStatusBadge from './EnrollmentStatusBadge';
import { COPY } from './reservasCopy';

const Row = memo(function Row({ x }) {
  return (
    <tr className="border-b border-line [content-visibility:auto] [contain-intrinsic-size:auto_4.5rem] last:border-b-0">
      <td className="py-3 pl-5 pr-3"><StudentIdentity user={x.userId} size="sm" /></td>
      <td className={`max-w-0 truncate px-3 py-3 ${x.courseId ? 'text-ink' : 'italic text-ink-3'}`}>{courseName(x.courseId)}</td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-ink-2"><RelativeTime date={x.enrolledAt} /></td>
      <td className="px-3 py-3"><EnrollmentStatusBadge status={x.status} /></td>
      <td className="px-3 py-3"><ProgressBar value={x.progress} label={COPY.progressOf(studentName(x.userId))} /></td>
      <td className="py-3 pl-3 pr-4 text-right"><ContactButton user={x.userId} course={x.courseId} /></td>
    </tr>
  );
});

// Lista densa para ≥ 1024 px
const EnrollmentTable = memo(function EnrollmentTable({ items, busy }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface transition-opacity duration-200 ${busy ? 'opacity-60' : ''}`}>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Inscripciones</caption>
        <colgroup>
          <col className="w-[28%]" />
          <col />
          <col className="w-32" />
          <col className="w-36" />
          <col className="w-44" />
          <col className="w-40" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-footnote text-ink-3">
            <th scope="col" className="py-3 pl-5 pr-3 font-medium">{COPY.columns.student}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.course}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.date}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.status}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.progress}</th>
            <th scope="col" className="py-3 pl-3 pr-4 font-medium"><span className="sr-only">{COPY.columns.action}</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((x) => <Row key={x._id} x={x} />)}
        </tbody>
      </table>
    </div>
  );
});

export default EnrollmentTable;
