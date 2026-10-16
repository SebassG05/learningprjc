/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import useFocusTrap from '../../hooks/useFocusTrap';
import { overlay, panel } from '../../lib/motion';
import { LANGUAGE_DIALOG } from './coursesCopy';

// Elección de idioma para cursos bilingües. Foco atrapado, Escape cierra y el foco vuelve al disparador.
export default function LanguageDialog({ open, onSelect, onClose }) {
  const ref = useRef(null);
  useFocusTrap(ref, open, onClose);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          {...overlay}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-canvas/70 p-4"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            ref={ref}
            {...panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="lang-title"
            aria-describedby="lang-lead"
            className="w-full max-w-md rounded-3xl border border-line-strong bg-surface p-8 text-center shadow-overlay"
          >
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <Globe className="h-6 w-6" aria-hidden="true" />
            </span>
            <h2 id="lang-title" className="mt-5 text-title-3 font-semibold text-ink">{LANGUAGE_DIALOG.title}</h2>
            <p id="lang-lead" className="mt-2 text-callout text-ink-2">{LANGUAGE_DIALOG.lead}</p>
            <div className="mt-7 grid grid-cols-2 gap-3">
              {['es', 'en'].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  lang={lang}
                  onClick={() => onSelect(lang)}
                  className="flex flex-col items-center gap-1 rounded-2xl border border-line bg-white/[0.03] p-5 hover:border-brand/50 hover:bg-brand/[0.06]"
                >
                  <span className="font-semibold text-ink">{LANGUAGE_DIALOG[lang].label}</span>
                  <span className="text-footnote text-ink-3">{LANGUAGE_DIALOG[lang].hint}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 rounded-full px-4 py-2 text-callout text-ink-3 hover:text-ink"
            >
              {LANGUAGE_DIALOG.cancel}
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
