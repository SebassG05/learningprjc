/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import { disclose } from '../../../lib/motion';
import { PROVISIONAL, SHEET } from '../coursesCopy';
import { courseSummary, splitObjective } from '../courseFormat';

function Objective({ text, lang }) {
  const { lead, rest } = splitObjective(text);
  return (
    <Reveal.Item as="li" soft className="flex gap-4 border-b border-line py-6 first:border-t">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Check className="h-4 w-4" aria-hidden="true" />
      </span>
      <p lang={lang} className="text-callout text-ink-2 sm:text-base">
        <span className="block text-lg font-semibold text-ink">{lead}</span>
        {rest ? <span className="mt-1 block">{rest}</span> : null}
      </p>
    </Reveal.Item>
  );
}

// Escena 2 · Qué aprenderás. La columna del título queda fija (lg) mientras pasan los objetivos.
// Los específicos van plegados: la escena no se hace eterna en cursos con muchos.
export default function CourseOutcomes({ description, objectives, lang }) {
  const [showSpecific, setShowSpecific] = useState(false);
  const panelId = useId();
  const { general, specific } = objectives;
  const summary = courseSummary(description);
  const fullDescription = description && description.length > summary.length ? description : null;
  if (general.length === 0 && specific.length === 0 && !fullDescription) return null;

  return (
    <section aria-labelledby="curso-objetivos" className="mx-auto grid w-full max-w-site gap-10 px-gutter py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-32">
      <div className="self-start lg:sticky lg:top-[calc(var(--spacing-header-lg)+2.5rem)]">
        <p className="eyebrow">{PROVISIONAL.sheet.outcomesEyebrow}</p>
        <h2 id="curso-objetivos" className="mt-4 text-title-1 font-bold text-ink">{SHEET.outcomesTitle}</h2>
        {general.length + specific.length > 0 ? (
          <p className="mt-4 text-callout text-ink-3">{SHEET.outcomesCount(general.length, specific.length)}.</p>
        ) : null}
        {fullDescription ? <p lang={lang} className="mt-8 max-w-prose text-callout text-ink-2">{fullDescription}</p> : null}
      </div>

      <div>
        {general.length > 0 ? (
          <Reveal as="ul" group soft>
            {general.map((t) => <Objective key={t} text={t} lang={lang} />)}
          </Reveal>
        ) : null}

        {specific.length > 0 ? (
          <div className="mt-8">
            <button
              type="button"
              aria-expanded={showSpecific}
              aria-controls={panelId}
              onClick={() => setShowSpecific((v) => !v)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 py-2 text-callout font-semibold text-brand ring-1 ring-inset ring-line hover:bg-brand/[0.06]"
            >
              {SHEET.specificToggle(specific.length, showSpecific)}
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ease-out-expo ${showSpecific ? 'rotate-180' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {showSpecific ? (
                <motion.div key="especificos" id={panelId} {...disclose} className="mt-6">
                  <h3 className="sr-only">{SHEET.specificTitle}</h3>
                  <ul>
                    {specific.map((t) => {
                      const { lead, rest } = splitObjective(t);
                      return (
                        <li key={t} lang={lang} className="flex gap-3 border-b border-line py-4 text-callout text-ink-2 first:border-t">
                          <span aria-hidden="true" className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                          <p>
                            <span className="font-semibold text-ink">{lead}</span>
                            {rest ? `: ${rest}` : null}
                          </p>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        ) : null}
      </div>
    </section>
  );
}
