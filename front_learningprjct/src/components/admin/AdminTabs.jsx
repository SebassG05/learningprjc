/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../lib/motion';
import { ADMIN_TABS, panelId, tabId } from './shared/adminTabs';
import { focusRing } from './ui/tones';

/**
 * Pestañas accesibles (patrón WAI-ARIA con activación automática): flechas, Inicio y Fin mueven
 * el foco y cambian de pestaña; solo la activa está en el orden de tabulación.
 * En móvil la fila se desplaza en horizontal y la activa se mantiene a la vista.
 */
export default function AdminTabs({ value, onChange, label = 'Secciones del panel' }) {
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current?.querySelector('[aria-selected="true"]');
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [value]);

  const onKeyDown = (e) => {
    const i = ADMIN_TABS.findIndex((t) => t.key === value);
    const last = ADMIN_TABS.length - 1;
    const next = { ArrowRight: i === last ? 0 : i + 1, ArrowLeft: i === 0 ? last : i - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    const key = ADMIN_TABS[next].key;
    onChange(key);
    document.getElementById(tabId(key))?.focus();
  };

  return (
    <div className="-mx-4 overflow-x-auto px-4 scrollbar-hide sm:mx-0 sm:px-0 [mask-image:linear-gradient(to_right,transparent,#000_1rem,#000_calc(100%-1.5rem),transparent)] sm:[mask-image:none]">
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
        className="inline-flex gap-1 rounded-full border border-line bg-white/[0.03] p-1"
      >
        {ADMIN_TABS.map(({ key, label: text, icon: Icon }) => {
          const active = key === value;
          return (
            <button
              key={key}
              id={tabId(key)}
              type="button"
              role="tab"
              aria-selected={active}
              aria-controls={panelId(key)}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(key)}
              className={`relative flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-200 ${focusRing} ${
                active ? 'text-on-brand' : 'text-ink-2 hover:bg-white/[0.06] hover:text-ink'
              }`}
            >
              {active ? <motion.span layoutId="admin-tab" transition={spring.glide} className="absolute inset-0 rounded-full bg-brand" /> : null}
              <span className="relative flex items-center gap-2">
                <Icon className="h-4 w-4" aria-hidden="true" />
                {text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
