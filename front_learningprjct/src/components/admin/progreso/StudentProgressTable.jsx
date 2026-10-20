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

const Row = memo(function Row({ row, courseId }) {
  const user = rowUser(row);
  const name = studentName(user);
  return (
    <tr className="border-b border-line [content-visibility:auto] [contain-intrinsic-size:auto_4.5rem] last:border-b-0">
      <td className="py-3 pl-5 pr-3"><StudentIdentity user={user} size="sm" /></td>
      <td className="px-3 py-3"><ProgressBar value={row.progress} label={COPY.progressOf(name)} /></td>
      <td className="px-3 py-3"><TopicSegments flags={row.topicFlags} finalDone={row.finalDone} /></td>
      <td className="px-3 py-3"><StudentSubmissions row={row} /></td>
      <td className="px-3 py-3 text-right"><GradeBadge nota={row.average} /></td>
      <td className="py-3 pl-3 pr-4 text-right"><ViewSubmissionsLink row={row} courseId={courseId} name={name} /></td>
    </tr>
  );
});

// Alumnos del curso en ≥ 1024 px: avance, temas, entregas y nota media
const StudentProgressTable = memo(function StudentProgressTable({ rows, courseId, busy }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface transition-opacity duration-200 ${busy ? 'opacity-60' : ''}`}>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Progreso de los alumnos</caption>
        <colgroup>
          <col className="w-[24%]" />
          <col className="w-[18%]" />
          <col />
          <col className="w-[17%]" />
          <col className="w-24" />
          <col className="w-36" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-footnote text-ink-3">
            <th scope="col" className="py-3 pl-5 pr-3 font-medium">{COPY.columns.student}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.progress}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.topics}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.submissions}</th>
            <th scope="col" className="px-3 py-3 text-right font-medium">{COPY.columns.grade}</th>
            <th scope="col" className="py-3 pl-3 pr-4 font-medium"><span className="sr-only">{COPY.columns.action}</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => <Row key={r.userId ?? `sin-alumno-${i}`} row={r} courseId={courseId} />)}
        </tbody>
      </table>
    </div>
  );
});

export default StudentProgressTable;
