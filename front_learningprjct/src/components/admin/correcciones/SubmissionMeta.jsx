/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { Lock } from 'lucide-react';
import RelativeTime from '../ui/RelativeTime';
import StatusBadge from '../ui/StatusBadge';
import { absoluteDate } from '../shared/adminFormat';
import StudentIdentity from '../ui/StudentIdentity';
import { COPY } from './correccionesCopy';

// Quién entregó, cuándo, en qué estado está y lo que escribió el alumno
const SubmissionMeta = memo(function SubmissionMeta({ entrega }) {
  const intentos = entrega.intentos || 0;
  return (
    <section aria-label={COPY.drawer.student} className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StudentIdentity user={entrega.userId} />
        <StatusBadge estado={entrega.estado} />
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-ink-3">{COPY.drawer.deliveredAt}</dt>
        <dd className="text-right text-ink-2">
          <RelativeTime date={entrega.fechaEntrega} /> <span className="sr-only">({absoluteDate(entrega.fechaEntrega)})</span>
        </dd>
        {intentos > 0 ? (
          <>
            <dt className="text-ink-3">Intentos</dt>
            <dd className="text-right tabular-nums text-ink-2">{COPY.drawer.attempts(intentos)}</dd>
          </>
        ) : null}
      </dl>
      {entrega.bloqueado ? (
        <p className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {COPY.drawer.locked}
        </p>
      ) : null}
      {entrega.comentarios ? (
        <figure className="rounded-2xl bg-surface-2 p-4">
          <figcaption className="text-footnote font-medium text-ink-3">{COPY.drawer.comments}</figcaption>
          <blockquote className="mt-1.5 whitespace-pre-wrap text-callout text-ink">{entrega.comentarios}</blockquote>
        </figure>
      ) : null}
    </section>
  );
});

export default SubmissionMeta;
