/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo, useId } from 'react';
import { BookOpen, Clock, Pencil, Trash2 } from 'lucide-react';
import Switch from '../../ui/Switch';
import { focusRing } from '../ui/tones';
import { courseName } from '../shared/adminFormat';
import { COPY } from './gestionCopy';

const action = `inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-150 active:scale-[0.97] ${focusRing}`;

/**
 * Un curso en la lista: portada, título, datos, interruptor abierto/cerrado y acciones.
 * En móvil las acciones bajan a su propia fila; nada se recorta.
 */
const CourseRow = memo(function CourseRow({ course, onEdit, onDelete, onToggle, toggling }) {
  const title = courseName(course);
  const statusId = useId();
  return (
    <li className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-4 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <div className="flex aspect-[16/10] w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-2 sm:w-32">
          {course.image ? <img src={course.image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <BookOpen className="h-6 w-6 text-ink-3" aria-hidden="true" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 font-semibold text-ink">{title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-footnote text-ink-3">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {course.duration || COPY.noDuration}
            </span>
            <span>{COPY.topicsCount(course.temas?.length ?? 0)}</span>
            {course.category?.length ? <span className="truncate">{course.category.slice(0, 3).join(' · ')}</span> : null}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-line pt-3 sm:border-0 sm:pt-0">
        <div className="flex items-center gap-3">
          <Switch
            checked={Boolean(course.isOpen)}
            onCheckedChange={() => onToggle(course)}
            aria-label={COPY.openLabel(title)}
            aria-describedby={statusId}
            disabled={toggling}
          />
          <span id={statusId} className={`w-16 text-sm font-medium ${course.isOpen ? 'text-brand-300' : 'text-ink-3'}`}>
            {course.isOpen ? COPY.open : COPY.closed}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => onEdit(course)} aria-label={COPY.editLabel(title)} className={`${action} border border-line-strong bg-white/[0.04] text-ink hover:bg-white/[0.08]`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {COPY.edit}
          </button>
          <button type="button" onClick={() => onDelete(course)} aria-label={COPY.removeLabel(title)} className={`${action} w-11 justify-center px-0 text-ink-3 hover:bg-danger/10 hover:text-danger`}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </li>
  );
});

export default CourseRow;
