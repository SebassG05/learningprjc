/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion } from 'framer-motion';
import { spring } from '../../../lib/motion';
import { SHEET } from '../coursesCopy';

// Idioma del curso (solo bilingües): cambia el contenido de la ficha y es el que se guarda al inscribirse
export default function LanguageToggle({ value, onChange }) {
  return (
    <div role="group" aria-label={SHEET.languageGroup} className="inline-flex rounded-full bg-canvas/60 p-1 ring-1 ring-inset ring-line-strong">
      {['es', 'en'].map((lang) => {
        const active = value === lang;
        return (
          <button
            key={lang}
            type="button"
            lang={lang}
            aria-pressed={active}
            onClick={() => onChange(lang)}
            className={`relative isolate rounded-full px-3.5 py-1.5 text-footnote font-semibold pointer-coarse:min-h-11 pointer-coarse:px-4 ${active ? 'text-ink' : 'text-ink-3 hover:text-ink-2'}`}
          >
            {active ? (
              <motion.span layoutId="course-lang-pill" transition={spring.glide} className="absolute inset-0 -z-10 rounded-full bg-white/[0.12]" />
            ) : null}
            {SHEET.languageNames[lang]}
          </button>
        );
      })}
    </div>
  );
}
