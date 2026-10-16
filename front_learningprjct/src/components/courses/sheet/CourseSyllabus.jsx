/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { ArrowRight, Lock, Plus } from 'lucide-react';
import { disclose, spring } from '../../../lib/motion';
import { MATERIAL_BADGE, PROVISIONAL, SHEET, STATS } from '../coursesCopy';
import { courseHours, formatHours, sortedTopics, topicText } from '../courseFormat';

// «1 PDF · 1 actividad»: lo que trae cada tema, sin exponer nada del material
function topicMeta(tema) {
  const counts = {};
  for (const m of tema.materiales ?? []) counts[m.tipo || 'pdf'] = (counts[m.tipo || 'pdf'] ?? 0) + 1;
  const parts = Object.entries(counts).map(([tipo, n]) => `${n} ${MATERIAL_BADGE[tipo] ?? tipo}`);
  const extra = tema.actividadesOptativas?.length ?? 0;
  if (extra) parts.push(`${extra} ${extra === 1 ? 'actividad' : 'actividades'}`);
  return parts.join(' · ');
}

function Topic({ tema, index, open, onToggle, lang, enrolled, courseId }) {
  const { title, description } = topicText(tema, lang);
  const buttonId = `tema-${tema._id ?? index}`;
  const panelId = `${buttonId}-panel`;
  const items = [
    ...(tema.materiales ?? []).map((m) => ({ ...m, optional: false })),
    ...(tema.actividadesOptativas ?? []).map((m) => ({ ...m, optional: true })),
  ];
  const meta = topicMeta(tema);

  return (
    <motion.li layout="position" transition={{ layout: spring.glide }} className={`border-b border-line last:border-b-0 ${open ? 'bg-surface' : ''}`}>
      <h3>
        <button
          id={buttonId}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center gap-4 px-5 py-5 text-left hover:bg-white/[0.03] focus-visible:bg-white/[0.04] sm:gap-6 sm:px-7 sm:py-6"
        >
          <span className="w-8 shrink-0 text-lg font-semibold tabular-nums text-brand sm:text-xl">{String(index + 1).padStart(2, '0')}</span>
          <span lang={lang} className="min-w-0 flex-1 text-base font-semibold text-ink sm:text-lg">{title || SHEET.topicLabel(index + 1)}</span>
          {meta ? <span className="hidden shrink-0 text-footnote font-medium text-ink-3 sm:block">{meta}</span> : null}
          <Plus className={`h-5 w-5 shrink-0 text-ink-2 transition-transform duration-300 ease-out-expo ${open ? 'rotate-45' : ''}`} aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div key="panel" id={panelId} role="region" aria-labelledby={buttonId} {...disclose} className="px-5 pb-6 sm:pl-[5.75rem] sm:pr-7">
            {description ? <p lang={lang} className="max-w-3xl text-callout text-ink-2">{description}</p> : null}
            {items.length > 0 ? (
              <ul className="mt-4 space-y-2">
                {items.map((m, i) => (
                  <li key={m._id ?? i} className="flex items-center gap-3 rounded-2xl bg-surface-2 px-4 py-3">
                    <span className="shrink-0 rounded-md bg-brand/10 px-2 py-0.5 text-[0.75rem] font-semibold text-brand">{MATERIAL_BADGE[m.tipo] ?? 'Doc'}</span>
                    <span className="min-w-0 flex-1 truncate text-callout text-ink">
                      {m.titulo || SHEET.materialFallback(m.tipo)}
                      {m.optional ? <span className="text-ink-3"> · {SHEET.optionalActivity}</span> : null}
                    </span>
                    {enrolled ? null : (
                      <span className="inline-flex shrink-0 items-center gap-1.5 text-footnote text-ink-3">
                        <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="hidden sm:inline">{SHEET.lockedMaterial}</span>
                        <span className="sr-only sm:hidden">{SHEET.lockedMaterial}</span>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : null}
            {!description && items.length === 0 ? <p className="text-callout text-ink-3">{SHEET.noTopicDetail}</p> : null}
            {enrolled ? (
              <Link to={`/curso/${courseId}`} className="mt-4 inline-flex items-center gap-1.5 text-callout font-semibold text-brand hover:text-brand-300">
                {SHEET.openInClassroom}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

// Escena 3 · Temario por módulos. Acordeón con botones reales (aria-expanded + región).
// Abrir anima opacidad y un pequeño desplazamiento; la altura no se anima: las filas de abajo
// se recolocan con layout (transform). Esta vista nunca enseña enlaces ni URLs del material.
export default function CourseSyllabus({ course, lang, enrolled }) {
  const topics = sortedTopics(course);
  const [open, setOpen] = useState(() => new Set());
  if (topics.length === 0) return null;
  const allOpen = open.size === topics.length;
  const hours = courseHours(course);
  const keyOf = (t, i) => String(t._id ?? i);

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  return (
    <section id="temario" aria-labelledby="curso-temario" className="scroll-mt-28 border-t border-line">
      <div className="mx-auto w-full max-w-site px-gutter py-24 lg:py-32">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="eyebrow">{PROVISIONAL.sheet.syllabusEyebrow}</p>
            <h2 id="curso-temario" className="mt-4 text-title-1 font-bold text-ink">{SHEET.syllabusTitle}</h2>
            <p className="mt-3 text-callout text-ink-3">
              {[`${topics.length} ${STATS.topics(topics.length)}`, hours && formatHours(hours)].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(allOpen ? new Set() : new Set(topics.map(keyOf)))}
            className="min-h-11 rounded-full px-4 py-2 text-callout font-semibold text-brand hover:bg-brand/[0.06]"
          >
            {allOpen ? SHEET.collapseAll : SHEET.expandAll}
          </button>
        </div>

        <LayoutGroup>
          <ul className="mt-10 overflow-hidden rounded-3xl border border-line">
            {topics.map((tema, i) => (
              <Topic
                key={keyOf(tema, i)}
                tema={tema}
                index={i}
                open={open.has(keyOf(tema, i))}
                onToggle={() => toggle(keyOf(tema, i))}
                lang={lang}
                enrolled={enrolled}
                courseId={course._id}
              />
            ))}
          </ul>
        </LayoutGroup>
      </div>
    </section>
  );
}
