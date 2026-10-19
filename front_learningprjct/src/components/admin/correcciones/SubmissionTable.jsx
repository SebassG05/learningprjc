/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import GradeBadge from '../ui/GradeBadge';
import RelativeTime from '../ui/RelativeTime';
import StatusBadge from '../ui/StatusBadge';
import { focusRing } from '../ui/tones';
import { courseName, exerciseName } from '../shared/adminFormat';
import { isPending, primaryActionLabel } from '../shared/submissionStatus';
import StudentIdentity from './StudentIdentity';
import { COPY } from './correccionesCopy';

const Row = memo(function Row({ entrega, active, onOpen }) {
  const pending = isPending(entrega.estado);
  const course = courseName(entrega.cursoId);
  return (
    <tr
      data-submission={entrega._id}
      onClick={() => onOpen(entrega._id)}
      aria-current={active || undefined}
      // Cada fila reserva su altura sin pintarse fuera de pantalla (listas largas sin virtualizar)
      className={`group cursor-pointer border-b border-line transition-colors duration-150 [content-visibility:auto] [contain-intrinsic-size:auto_4.5rem] last:border-b-0 ${
        active ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'
      }`}
    >
      <td className="py-3 pl-5 pr-3">
        <StudentIdentity user={entrega.userId} size="sm" />
      </td>
      <td className="max-w-0 px-3 py-3">
        <span className={`block truncate ${entrega.ejercicioId ? 'text-ink' : 'italic text-ink-3'}`}>{exerciseName(entrega.ejercicioId)}</span>
        <span className={`block truncate text-footnote ${entrega.cursoId ? 'text-ink-3' : 'italic text-ink-3'}`}>{course}</span>
      </td>
      <td className="whitespace-nowrap px-3 py-3 text-sm text-ink-2">
        <RelativeTime date={entrega.fechaEntrega} />
      </td>
      <td className="px-3 py-3">
        <StatusBadge estado={entrega.estado} />
      </td>
      <td className="px-3 py-3 text-right">
        <GradeBadge nota={entrega.calificacion} />
      </td>
      <td className="py-3 pl-3 pr-4 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpen(entrega._id);
          }}
          className={`inline-flex min-h-11 items-center gap-1 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-[background-color,color] duration-150 active:scale-[0.97] ${focusRing} ${
            pending ? 'bg-brand text-on-brand hover:bg-brand-300' : 'text-ink-2 hover:bg-white/[0.06] hover:text-ink'
          }`}
        >
          {primaryActionLabel(entrega.estado)}
          {pending ? null : <ChevronRight className="h-4 w-4" aria-hidden="true" />}
        </button>
      </td>
    </tr>
  );
});

// Lista densa para ≥ 1024 px. La fila entera abre la corrección; el botón es el objetivo accesible.
const SubmissionTable = memo(function SubmissionTable({ items, activeId, onOpen, busy }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface transition-opacity duration-200 ${busy ? 'opacity-60' : ''}`}>
      <table className="w-full table-fixed border-collapse text-left">
        <caption className="sr-only">Entregas</caption>
        <colgroup>
          <col className="w-[26%]" />
          <col />
          <col className="w-32" />
          <col className="w-48" />
          <col className="w-24" />
          <col className="w-48" />
        </colgroup>
        <thead>
          <tr className="border-b border-line text-footnote font-medium text-ink-3">
            <th scope="col" className="py-3 pl-5 pr-3 font-medium">{COPY.columns.student}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.exercise}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.date}</th>
            <th scope="col" className="px-3 py-3 font-medium">{COPY.columns.status}</th>
            <th scope="col" className="px-3 py-3 text-right font-medium">{COPY.columns.grade}</th>
            <th scope="col" className="py-3 pl-3 pr-4 text-right font-medium"><span className="sr-only">{COPY.columns.action}</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((e) => (
            <Row key={e._id} entrega={e} active={e._id === activeId} onOpen={onOpen} />
          ))}
        </tbody>
      </table>
    </div>
  );
});

export default SubmissionTable;
