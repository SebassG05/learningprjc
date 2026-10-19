/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId, useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { inputClass } from '../../ui/Field';
import { focusRing } from './tones';

const iconBtn = `flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors duration-150 hover:bg-white/[0.08] hover:text-ink disabled:pointer-events-none disabled:opacity-30 ${focusRing}`;

/**
 * Lista de frases (p. ej. objetivos): se añaden con Enter o «Añadir», se reordenan con
 * subir/bajar y se quitan. Los botones dicen sobre qué elemento actúan.
 */
export default function ListInput({ label, value, onChange, placeholder }) {
  const id = useId();
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim();
    if (t) onChange([...value, t]);
    setText('');
  };
  const move = (i, d) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  const short = (s) => (s.length > 40 ? `${s.slice(0, 40)}…` : s);
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink-2">{label}</label>
      {value.length ? (
        <ol className="space-y-1.5">
          {value.map((v, i) => (
            <li key={`${i}-${v}`} className="flex items-start gap-1 rounded-xl border border-line bg-surface-2 py-1 pl-3 pr-1">
              <span className="mt-2.5 w-5 shrink-0 text-footnote tabular-nums text-ink-3">{i + 1}.</span>
              <span className="min-w-0 flex-1 py-2.5 text-sm text-ink">{v}</span>
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Subir «${short(v)}»`} className={iconBtn}>
                <ArrowUp className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label={`Bajar «${short(v)}»`} className={iconBtn}>
                <ArrowDown className="h-4 w-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Quitar «${short(v)}»`} className={`${iconBtn} hover:text-danger`}>
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      ) : null}
      <div className="flex gap-2">
        <input
          id={id}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className={inputClass}
        />
        <button type="button" onClick={add} disabled={!text.trim()} aria-label={`Añadir a ${label.toLowerCase()}`} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-white/[0.06] text-ink hover:bg-white/[0.1] disabled:opacity-40 ${focusRing}`}>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
