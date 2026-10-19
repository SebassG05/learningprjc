/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { motion } from 'framer-motion';
import { spring } from '../../../lib/motion';
import GradeBadge from '../ui/GradeBadge';
import RelativeTime from '../ui/RelativeTime';
import StatusBadge from '../ui/StatusBadge';
import { focusRing } from '../ui/tones';
import { courseName, exerciseName } from '../shared/adminFormat';
import { primaryActionLabel } from '../shared/submissionStatus';
import StudentIdentity from './StudentIdentity';

const Card = memo(function Card({ entrega, active, onOpen }) {
  return (
    <li className="[content-visibility:auto] [contain-intrinsic-size:auto_9rem]">
      <motion.button
        type="button"
        data-submission={entrega._id}
        onClick={() => onOpen(entrega._id)}
        whileTap={{ scale: 0.985 }}
        transition={spring.snappy}
        className={`flex w-full flex-col gap-3 rounded-2xl border p-4 text-left transition-colors duration-150 ${focusRing} ${
          active ? 'border-line-strong bg-surface-2' : 'border-line bg-surface hover:bg-surface-2/70'
        }`}
      >
        <span className="flex w-full items-start justify-between gap-3">
          <StudentIdentity user={entrega.userId} size="sm" hideEmail />
          <GradeBadge nota={entrega.calificacion} className="shrink-0 pt-1" />
        </span>
        <span className="min-w-0">
          <span className={`block truncate font-medium ${entrega.ejercicioId ? 'text-ink' : 'italic text-ink-3'}`}>{exerciseName(entrega.ejercicioId)}</span>
          <span className="mt-0.5 block truncate text-footnote text-ink-3">
            {courseName(entrega.cursoId)} · <RelativeTime date={entrega.fechaEntrega} />
          </span>
        </span>
        <span className="flex items-center justify-between gap-3">
          <StatusBadge estado={entrega.estado} />
          <span className="text-sm font-semibold text-brand-300">{primaryActionLabel(entrega.estado)}</span>
        </span>
      </motion.button>
    </li>
  );
});

// Tarjetas compactas para móvil y tableta (< 1024 px). Toda la tarjeta es el objetivo táctil.
const SubmissionCards = memo(function SubmissionCards({ items, activeId, onOpen, busy }) {
  return (
    <ul className={`grid gap-3 transition-opacity duration-200 md:grid-cols-2 ${busy ? 'opacity-60' : ''}`} aria-label="Entregas">
      {items.map((e) => (
        <Card key={e._id} entrega={e} active={e._id === activeId} onOpen={onOpen} />
      ))}
    </ul>
  );
});

export default SubmissionCards;
