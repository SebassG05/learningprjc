/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../../lib/motion';
import { focusRing } from './tones';

/**
 * Conmutador de opciones excluyentes (p. ej. Lista / Calendario): grupo de radios con flechas.
 * El fondo de la opción activa se desplaza con un muelle corto (sin movimiento con reduced motion).
 */
export default function SegmentedControl({ options, value, onChange, label, layoutId }) {
  const refs = useRef({});
  const onKeyDown = (e) => {
    const i = options.findIndex((o) => o.value === value);
    const delta = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!delta) return;
    e.preventDefault();
    const next = options[(i + delta + options.length) % options.length].value;
    onChange(next);
    refs.current[next]?.focus();
  };
  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKeyDown} className="inline-flex gap-1 rounded-full border border-line bg-white/[0.03] p-1">
      {options.map(({ value: v, label: text, icon: Icon }) => {
        const active = v === value;
        return (
          <button
            key={v}
            ref={(el) => {
              refs.current[v] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(v)}
            className={`relative flex min-h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${focusRing} ${
              active ? 'text-ink' : 'text-ink-2 hover:text-ink'
            }`}
          >
            {active ? <motion.span layoutId={layoutId} transition={spring.glide} className="absolute inset-0 rounded-full bg-white/[0.1]" /> : null}
            <span className="relative flex items-center gap-2">
              {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
              {text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
