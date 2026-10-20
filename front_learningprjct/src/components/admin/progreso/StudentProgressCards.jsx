/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import GradeBadge from '../ui/GradeBadge';
import ProgressBar from '../ui/ProgressBar';
import StudentIdentity from '../ui/StudentIdentity';
import { studentName } from '../shared/adminFormat';
import StudentSubmissions from './StudentSubmissions';
import TopicSegments from './TopicSegments';
import ViewSubmissionsLink from './ViewSubmissionsLink';
import { rowUser } from './progresoQuery';
import { COPY } from './progresoCopy';

const Card = memo(function Card({ row, courseId }) {
  const user = rowUser(row);
  const name = studentName(user);
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 [content-visibility:auto] [contain-intrinsic-size:auto_11rem]">
      <div className="flex items-start justify-between gap-3">
        <StudentIdentity user={user} size="sm" />
        <GradeBadge nota={row.average} className="shrink-0 pt-1" />
      </div>
      <ProgressBar value={row.progress} label={COPY.progressOf(name)} />
      <TopicSegments flags={row.topicFlags} finalDone={row.finalDone} />
      <div className="flex items-center justify-between gap-3">
        <StudentSubmissions row={row} />
        <ViewSubmissionsLink row={row} courseId={courseId} name={name} compact />
      </div>
    </li>
  );
});

// Lista resumida para móvil y tableta (< 1024 px)
const StudentProgressCards = memo(function StudentProgressCards({ rows, courseId, busy }) {
  return (
    <ul aria-label="Progreso de los alumnos" className={`grid grid-cols-1 gap-3 transition-opacity duration-200 md:grid-cols-2 ${busy ? 'opacity-60' : ''}`}>
      {rows.map((r, i) => <Card key={r.userId ?? `sin-alumno-${i}`} row={r} courseId={courseId} />)}
    </ul>
  );
});

export default StudentProgressCards;
