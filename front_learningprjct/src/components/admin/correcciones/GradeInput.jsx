/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useState } from 'react';
import { GRADE_MAX, GRADE_MIN, GRADE_STEP, PASS_MARK, formatGrade, gradeTone, hasGrade } from '../shared/submissionStatus';
import { inputClass } from '../../ui/Field';
import { focusRing, tone } from '../ui/tones';
import { COPY } from './correccionesCopy';

const toText = (n) => (hasGrade(n) ? String(n).replace('.', ',') : '');

/**
 * Nota con campo numérico y deslizador sincronizados (0–10, paso 0,5).
 * El campo guarda el texto mientras se escribe («7,» no se pierde) y se normaliza al salir.
 * La marca del deslizador indica dónde empieza el aprobado.
 */
export default function GradeInput({ value, onChange }) {
  const id = useId();
  const hintId = useId();
  const [text, setText] = useState(toText(value));

  // Cambios desde fuera (deslizador, «Quitar nota»)
  useEffect(() => {
    setText((t) => {
      const parsed = Number(t.replace(',', '.'));
      return t !== '' && Number.isFinite(parsed) && hasGrade(value) && Math.abs(parsed - value) < GRADE_STEP / 2 ? t : toText(value);
    });
  }, [value]);

  const t = tone(gradeTone(value));
  const pct = hasGrade(value) ? (value / GRADE_MAX) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <label htmlFor={id} className="text-sm font-semibold text-ink">{COPY.drawer.grade}</label>
          <p id={hintId} className="text-footnote text-ink-3">{COPY.drawer.gradeHint}</p>
        </div>
        {hasGrade(value) ? (
          <button
            type="button"
            onClick={() => onChange(null)}
            className={`min-h-11 shrink-0 whitespace-nowrap rounded-full px-3 text-sm font-medium text-ink-2 hover:bg-white/[0.06] hover:text-ink ${focusRing}`}
          >
            {COPY.drawer.clearGrade}
          </button>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative w-24 shrink-0">
          <input
            id={id}
            type="text"
            inputMode="decimal"
            autoComplete="off"
            aria-describedby={hintId}
            value={text}
            placeholder="—"
            onChange={(e) => {
              const raw = e.target.value.replace(/[^\d.,]/g, '').slice(0, 4);
              setText(raw);
              const n = Number(raw.replace(',', '.'));
              onChange(raw === '' ? null : Number.isFinite(n) ? n : value);
            }}
            onBlur={() => setText(toText(value))}
            onKeyDown={(e) => {
              if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                e.preventDefault();
                const base = hasGrade(value) ? value : PASS_MARK;
                onChange(base + (e.key === 'ArrowUp' ? GRADE_STEP : -GRADE_STEP));
              }
            }}
            className={`${inputClass} pr-10 text-center text-lg font-semibold tabular-nums ${t.text}`}
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-ink-2">/10</span>
        </div>
        <div className="relative flex-1">
          <input
            type="range"
            min={GRADE_MIN}
            max={GRADE_MAX}
            step={GRADE_STEP}
            value={hasGrade(value) ? value : PASS_MARK}
            onChange={(e) => onChange(Number(e.target.value))}
            aria-label={`${COPY.drawer.grade} (deslizador)`}
            aria-valuetext={hasGrade(value) ? `${formatGrade(value)} sobre 10` : 'Sin nota'}
            className={`grade-range h-11 w-full cursor-pointer appearance-none bg-transparent ${focusRing} ${hasGrade(value) ? '' : 'opacity-50'}`}
            style={{ '--grade-pct': `${pct}%` }}
          />
          {/* Marca del aprobado */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 h-3 w-px -translate-y-1/2 bg-ink-3"
            style={{ left: `calc(${(PASS_MARK / GRADE_MAX) * 100}% )` }}
          />
          <span aria-hidden="true" className="pointer-events-none absolute -bottom-1 text-[0.6875rem] text-ink-3" style={{ left: `calc(${(PASS_MARK / GRADE_MAX) * 100}% - 0.25rem)` }}>
            {PASS_MARK}
          </span>
        </div>
      </div>
    </div>
  );
}
