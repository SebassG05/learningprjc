/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId, useRef } from 'react';
import { BookmarkPlus, Plus, X } from 'lucide-react';
import { inputClass } from '../../ui/Field';
import { focusRing } from '../ui/tones';
import useFeedbackTemplates from './useFeedbackTemplates';
import { COPY } from './correccionesCopy';

const MAX = 1000;

const chip = `inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 text-left text-sm text-ink-2 transition-colors duration-150 hover:border-line-strong hover:text-ink active:scale-[0.98] ${focusRing}`;

/**
 * Comentario para el alumno con comentarios rápidos: pulsarlos añade el texto al final.
 * El profesor puede guardar el comentario actual como rápido (se recuerda en este navegador).
 */
export default function FeedbackField({ value, onChange }) {
  const id = useId();
  const countId = useId();
  const ref = useRef(null);
  const { defaults, custom, add, remove } = useFeedbackTemplates();
  const all = [...defaults, ...custom];
  const canSave = value.trim().length > 0 && !all.includes(value.trim());

  const insert = (t) => {
    const next = value.trim() ? `${value.trimEnd()}\n${t}` : t;
    onChange(next.slice(0, MAX));
    ref.current?.focus();
  };

  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm font-semibold text-ink">{COPY.drawer.feedback}</label>
      <textarea
        ref={ref}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        rows={5}
        maxLength={MAX}
        aria-describedby={countId}
        placeholder={COPY.drawer.feedbackPlaceholder}
        className={`${inputClass} h-auto min-h-32 resize-y py-3 leading-relaxed`}
      />
      <div className="flex items-center justify-between gap-3">
        <p id={countId} className={`text-footnote tabular-nums ${value.length > MAX * 0.9 ? 'text-dawn' : 'text-ink-3'}`}>
          {value.length}/{MAX}
        </p>
        {canSave ? (
          <button type="button" onClick={() => add(value)} className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-2 hover:bg-white/[0.06] hover:text-ink ${focusRing}`}>
            <BookmarkPlus className="h-4 w-4" aria-hidden="true" />
            {COPY.drawer.saveTemplate}
          </button>
        ) : null}
      </div>
      <div>
        <p className="mb-2 text-footnote font-medium text-ink-3">{COPY.drawer.templates}</p>
        <ul className="flex flex-wrap gap-2">
          {defaults.map((t) => (
            <li key={t} className="max-w-full">
              <button type="button" onClick={() => insert(t)} className={chip}>
                <Plus className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden="true" />
                <span className="truncate">{t}</span>
              </button>
            </li>
          ))}
          {custom.map((t) => (
            <li key={t} className="flex max-w-full items-center">
              <button type="button" onClick={() => insert(t)} className={`${chip} rounded-r-none border-r-0`}>
                <Plus className="h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden="true" />
                <span className="truncate">{t}</span>
              </button>
              <button
                type="button"
                onClick={() => remove(t)}
                aria-label={COPY.drawer.removeTemplate(t)}
                className={`inline-flex min-h-11 w-10 shrink-0 items-center justify-center rounded-r-full border border-line bg-surface-2 text-ink-3 hover:text-ink ${focusRing}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
