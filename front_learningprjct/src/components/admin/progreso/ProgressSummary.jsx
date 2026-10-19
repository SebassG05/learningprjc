/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatGrade, gradeTone } from '../shared/submissionStatus';
import { focusRing, tone } from '../ui/tones';
import { COPY } from './progresoCopy';

const Item = ({ label, children, className = '' }) => (
  <div className={`flex min-w-0 flex-col gap-1 px-4 py-3 md:px-5 ${className}`}>
    <dt className="text-footnote text-ink-3">{label}</dt>
    <dd className="flex min-h-8 items-center gap-2 text-xl font-semibold tabular-nums text-ink">{children}</dd>
  </div>
);

// Cifras del curso en una sola franja (no son filtros: se leen, no se pulsan)
const ProgressSummary = memo(function ProgressSummary({ summary, courseId }) {
  const s = summary;
  return (
    <dl
      aria-label={COPY.summary.label}
      className="grid grid-cols-2 divide-line overflow-hidden rounded-2xl border border-line bg-surface md:grid-cols-5 md:divide-x [&>div]:border-line max-md:[&>div:nth-child(n+3)]:border-t max-md:[&>div:nth-child(even)]:border-l"
    >
      <Item label={COPY.summary.students}>{s.students}</Item>
      <Item label={COPY.summary.avgProgress}>{s.avgProgress === null ? '—' : `${s.avgProgress} %`}</Item>
      <Item label={COPY.summary.completed}>{s.completed}</Item>
      <Item label={COPY.summary.avgGrade}>
        <span className={s.avgGrade === null ? 'text-ink-3' : tone(gradeTone(s.avgGrade)).text}>{formatGrade(s.avgGrade)}</span>
      </Item>
      <Item label={COPY.summary.pending} className="col-span-2 md:col-span-1">
        {s.pending}
        {s.pending > 0 ? (
          <Link
            to={`/admin/correcciones?curso=${courseId}&estado=enviado`}
            className={`ml-auto inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-sm font-semibold text-brand-300 hover:bg-white/[0.06] ${focusRing}`}
          >
            {COPY.summary.pendingLink}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        ) : null}
      </Item>
    </dl>
  );
});

export default ProgressSummary;
