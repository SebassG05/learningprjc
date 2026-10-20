/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { inputClass } from '../../ui/Field';
import { focusRing } from './tones';

/**
 * Etiquetas cortas (p. ej. categorías): Enter o «Añadir» las agrega, sin duplicados.
 * Cada etiqueta se quita con su botón (con nombre accesible).
 */
export default function TagInput({ label, hint, value, onChange, placeholder, max = 40 }) {
  const id = useId();
  const [text, setText] = useState('');
  const add = () => {
    const t = text.trim().slice(0, max);
    if (t && !value.some((v) => v.toLowerCase() === t.toLowerCase())) onChange([...value, t]);
    setText('');
  };
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink-2">{label}</label>
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
          aria-describedby={hint ? `${id}-hint` : undefined}
          className={inputClass}
        />
        <button type="button" onClick={add} disabled={!text.trim()} aria-label={`Añadir a ${label.toLowerCase()}`} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-line-strong bg-white/[0.06] text-ink hover:bg-white/[0.1] disabled:opacity-40 ${focusRing}`}>
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>
      {hint ? <p id={`${id}-hint`} className="text-footnote text-ink-3">{hint}</p> : null}
      {value.length ? (
        <ul className="flex flex-wrap gap-2" aria-label={label}>
          {value.map((v) => (
            <li key={v} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface-2 py-1 pl-3 pr-1 text-sm text-ink">
              {v}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Quitar «${v}»`} className={`-my-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-3 hover:bg-white/[0.08] hover:text-ink ${focusRing}`}>
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
