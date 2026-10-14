/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Pestañas "Iniciar sesión / Registrarse": tablist con flechas, Inicio y Fin (tabindex itinerante).
// La activa se distingue por la píldora (forma), el peso de la letra y el color.
import { useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { spring } from '../../lib/motion';
import { panelId, tabId } from './tabIds';

const TABS = [
  { value: 'login', label: 'Iniciar sesión' },
  { value: 'register', label: 'Registrarse' },
];


export default function AuthTabs({ value, onChange, idPrefix }) {
  const reduce = useReducedMotion();
  const refs = useRef({});

  const onKeyDown = (e) => {
    const i = TABS.findIndex((t) => t.value === value);
    const last = TABS.length - 1;
    const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const target = TABS[next].value;
    onChange(target);
    refs.current[target]?.focus();
  };

  return (
    <div role="tablist" aria-label="Acceso al campus" className="grid grid-cols-2 rounded-full bg-canvas/50 p-1 ring-1 ring-inset ring-line" onKeyDown={onKeyDown}>
      {TABS.map((t) => {
        const selected = t.value === value;
        return (
          <button
            key={t.value}
            ref={(el) => { refs.current[t.value] = el; }}
            id={tabId(idPrefix, t.value)}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={panelId(idPrefix, t.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.value)}
            className={`relative min-h-11 rounded-full px-3 text-sm transition-colors duration-200 ${selected ? 'font-semibold text-ink' : 'font-medium text-ink-2 hover:text-ink'}`}
          >
            {selected && (
              <motion.span
                layoutId={`${idPrefix}-pill`}
                className="absolute inset-0 rounded-full bg-surface-3 shadow-card ring-1 ring-inset ring-line-strong"
                transition={reduce ? { duration: 0 } : spring.glide}
                aria-hidden="true"
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
