/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo, useId } from 'react';
import { Award } from 'lucide-react';
import { focusRing } from '../ui/tones';
import { COPY } from './progresoCopy';

/**
 * Tests superados por tema: barras horizontales de una sola serie con la cifra escrita al lado
 * (la lista es su propia vista en datos). Con muchos temas, la tarjeta tiene scroll propio.
 */
const TopicCompletion = memo(function TopicCompletion({ items, students }) {
  const titleId = useId();
  return (
    <section aria-labelledby={titleId} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5">
      <header className="mb-3">
        <h2 id={titleId} className="font-sans text-sm font-semibold text-ink">{COPY.topics.title}</h2>
        <p className="text-footnote text-ink-3">{COPY.topics.caption(students)}</p>
      </header>
      {/* Con scroll propio: enfocable para recorrerla con las flechas */}
      <ol data-lenis-prevent tabIndex={0} aria-labelledby={titleId} className={`-mr-2 max-h-[17rem] space-y-2.5 overflow-y-auto overscroll-contain rounded-lg pr-2 ${focusRing}`}>
        {items.map((t) => (
          <li key={t.key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
            <span className="flex min-w-0 items-center gap-2 text-sm text-ink-2">
              {t.number === null ? (
                <Award className="h-4 w-4 shrink-0 text-dawn" aria-hidden="true" />
              ) : (
                <span className="w-7 shrink-0 text-footnote tabular-nums text-ink-3">T{t.number}</span>
              )}
              <span className="truncate">{t.title}</span>
            </span>
            <span className="text-footnote tabular-nums text-ink-2">{COPY.topics.value(t.count, students, t.pct)}</span>
            <span aria-hidden="true" className="col-span-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
              <span className="block h-full origin-left rounded-full bg-brand-500" style={{ transform: `scaleX(${t.pct / 100})` }} />
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
});

export default TopicCompletion;
