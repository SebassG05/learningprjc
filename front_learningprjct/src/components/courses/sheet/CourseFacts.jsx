/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import Reveal from '../../ui/Reveal';
import { cloudinaryUrl } from '../../../lib/cloudinary';
import { PROVISIONAL, SHEET, STATS } from '../coursesCopy';
import { courseHours, courseLanguages, formatHours, levelLabel, resourceCount, topicCount } from '../courseFormat';

// Columnas en escritorio según cuántos datos hay: nunca queda uno huérfano en otra fila
const LG_COLS = { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5' };

function Fact({ label, value, wide }) {
  return (
    <Reveal.Item soft className={`flex min-h-36 flex-col justify-between gap-6 rounded-3xl border border-line bg-surface p-6 sm:min-h-44 sm:p-7 ${wide ? 'col-span-2 lg:col-span-1' : ''}`}>
      <dt className="text-footnote font-semibold uppercase tracking-[0.14em] text-ink-3">{label}</dt>
      <dd className={`font-bold text-ink ${String(value).length > 10 ? 'text-title-3' : 'text-title-2'}`}>{value}</dd>
    </Reveal.Item>
  );
}

// Escena 4 · Ficha técnica. Solo aparece lo que el curso tiene: sin nivel o sin profesor no hay
// huecos ni «N/D»; la rejilla se reparte con lo que queda.
export default function CourseFacts({ course }) {
  const hours = courseHours(course);
  const level = levelLabel(course.nivel);
  const topics = topicCount(course);
  const resources = resourceCount(course);
  const langs = courseLanguages(course).map((l) => SHEET.languageNames[l]);
  const profesor = course.profesor?.nombre ? course.profesor : null;

  const facts = [
    hours && { label: SHEET.facts.duration, value: formatHours(hours) },
    level && { label: SHEET.facts.level, value: level },
    topics > 0 && { label: SHEET.facts.topics, value: `${topics} ${STATS.topics(topics)}` },
    resources > 0 && { label: SHEET.facts.resources, value: SHEET.resources(resources) },
    langs.length > 0 && { label: SHEET.facts.languages, value: langs.join(' · ') },
  ].filter(Boolean);
  if (facts.length === 0 && !profesor) return null;

  return (
    <section aria-labelledby="curso-ficha" className="mx-auto w-full max-w-site px-gutter pb-24 lg:pb-32">
      <p className="eyebrow">{PROVISIONAL.sheet.factsEyebrow}</p>
      <h2 id="curso-ficha" className="sr-only">{SHEET.factsTitle}</h2>
      <Reveal as="dl" group soft className={`mt-6 grid grid-cols-2 gap-3 sm:gap-4 ${LG_COLS[Math.min(facts.length, 5)] ?? 'lg:grid-cols-4'}`}>
        {facts.map((f, i) => <Fact key={f.label} {...f} wide={facts.length % 2 === 1 && i === facts.length - 1} />)}
        {profesor ? (
          <Reveal.Item soft className="col-span-full flex flex-col gap-5 rounded-3xl border border-line bg-surface p-6 sm:flex-row sm:items-start sm:p-7">
            <dt className="sr-only">{SHEET.facts.teacher}</dt>
            <dd className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {profesor.foto ? (
                <img
                  src={cloudinaryUrl(profesor.foto, 192)}
                  alt=""
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-20 shrink-0 rounded-full object-cover ring-1 ring-line-strong sm:h-24 sm:w-24"
                />
              ) : null}
              <div>
                <p className="text-footnote font-semibold uppercase tracking-[0.14em] text-ink-3" aria-hidden="true">{SHEET.facts.teacher}</p>
                <p className="mt-2 text-title-3 font-semibold text-ink">{profesor.nombre}</p>
                {profesor.bio ? <p className="mt-2 max-w-prose text-callout text-ink-2">{profesor.bio}</p> : null}
              </div>
            </dd>
          </Reveal.Item>
        ) : null}
      </Reveal>
    </section>
  );
}
