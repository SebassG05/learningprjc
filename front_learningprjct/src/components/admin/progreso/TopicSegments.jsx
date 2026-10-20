/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Award } from 'lucide-react';
import { COPY } from './progresoCopy';

/**
 * Temas superados por un alumno: un segmento por tema (separados 2 px) y la insignia del test final.
 * Sustituye a las 21 bolitas numeradas: ocupa una línea y se lee de un vistazo; la cifra va escrita.
 */
const TopicSegments = memo(function TopicSegments({ flags, finalDone, className = '' }) {
  const done = flags.filter(Boolean).length;
  const label = COPY.topicsDone(done, flags.length, finalDone);
  return (
    <div className={`flex min-w-0 items-center gap-2 ${className}`}>
      <span role="img" aria-label={label} className="flex h-1.5 min-w-12 flex-1 gap-0.5">
        {flags.map((f, i) => (
          <span key={i} className={`h-full flex-1 rounded-[2px] ${f ? 'bg-brand-500' : 'bg-surface-3'}`} />
        ))}
      </span>
      <span aria-hidden="true" className="shrink-0 text-footnote tabular-nums text-ink-2">
        {done}/{flags.length}
      </span>
      <Award aria-hidden="true" className={`h-4 w-4 shrink-0 ${finalDone ? 'text-dawn' : 'text-ink-3/50'}`} />
    </div>
  );
});

export default TopicSegments;
