/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId, useRef } from 'react';
import { CheckCircle2, PenLine, XCircle } from 'lucide-react';
import { REVIEW_STATUSES, statusInfo } from '../shared/submissionStatus';
import { focusRing, tone } from '../ui/tones';

const ICON = { aprobado: CheckCircle2, revisado: PenLine, rechazado: XCircle };
const KEY_HINT = { aprobado: 'A', rechazado: 'R' };

/**
 * Resultado de la corrección: grupo de radios con forma de control segmentado.
 * Flechas para moverse (patrón radiogroup); cada opción lleva icono y texto, no solo color.
 */
export default function StatusPicker({ value, onChange, label, describedBy }) {
  const labelId = useId();
  const refs = useRef({});
  const focusable = value ?? REVIEW_STATUSES[0];

  const onKeyDown = (e) => {
    const i = REVIEW_STATUSES.indexOf(value ?? REVIEW_STATUSES[0]);
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = REVIEW_STATUSES[(i + delta + REVIEW_STATUSES.length) % REVIEW_STATUSES.length];
    onChange(next);
    refs.current[next]?.focus();
  };

  return (
    <div>
      <p id={labelId} className="mb-2 text-sm font-semibold text-ink">{label}</p>
      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={describedBy}
        onKeyDown={onKeyDown}
        className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-surface-2 p-1"
      >
        {REVIEW_STATUSES.map((estado) => {
          const info = statusInfo(estado);
          const Icon = ICON[estado];
          const checked = value === estado;
          const t = tone(info.tone);
          return (
            <button
              key={estado}
              ref={(el) => {
                refs.current[estado] = el;
              }}
              type="button"
              role="radio"
              aria-checked={checked}
              tabIndex={estado === focusable ? 0 : -1}
              onClick={() => onChange(estado)}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-center text-xs font-semibold leading-tight transition-[background-color,color,box-shadow] duration-150 active:scale-[0.97] sm:flex-row sm:gap-2 sm:text-sm ${focusRing} ${
                checked ? `bg-surface-3 ${t.text} shadow-raised ring-1 ring-inset ${t.ring}` : 'text-ink-2 hover:bg-white/[0.05] hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{info.label}</span>
              {KEY_HINT[estado] ? (
                <kbd aria-hidden="true" className="hidden rounded border border-line-strong px-1 font-sans text-[0.6875rem] text-ink-3 pointer-fine:lg:inline">
                  {KEY_HINT[estado]}
                </kbd>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
