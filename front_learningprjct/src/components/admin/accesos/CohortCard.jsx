/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { lazy, Suspense, useState } from 'react';
import { CalendarRange, Pencil, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import SegmentedControl from '../ui/SegmentedControl';
import Skeleton from '../ui/Skeleton';
import { focusRing } from '../ui/tones';
import { COPY } from './accesosCopy';
import { cohortPhase } from './accesosQuery';
import CohortForm from './CohortForm';
import MembersPanel from './MembersPanel';

// Las invitaciones se piden al abrir su sección
const InvitesPanel = lazy(() => import('./InvitesPanel.jsx'));

const PHASE_TONE = { upcoming: 'dawn', open: 'brand', ended: 'neutral' };
const action = `inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors duration-150 ${focusRing}`;
const longDate = (value) => new Date(value).toLocaleString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const SECTIONS = [
  { value: 'members', label: COPY.cohorts.sections.members },
  { value: 'invites', label: COPY.cohorts.sections.invites },
];

// Una cohorte: nombre, fechas, fase y recuentos; editar / eliminar; miembros e invitaciones
export default function CohortCard({ cohort, actions, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [section, setSection] = useState('members');
  const phase = cohortPhase(cohort);

  if (editing) {
    return (
      <CohortForm
        cohort={cohort}
        onCancel={() => setEditing(false)}
        onSubmit={async (body) => {
          await actions.update(cohort._id, body);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <article aria-labelledby={`cohorte-${cohort._id}`} className="space-y-5 rounded-2xl border border-line bg-surface p-5 md:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 id={`cohorte-${cohort._id}`} className="text-title-3 font-semibold text-ink">{cohort.name}</h3>
            <Badge label={COPY.cohorts.phase[phase]} toneName={PHASE_TONE[phase]} size="sm" />
          </div>
          <p className="flex items-start gap-2 text-callout text-ink-2">
            <CalendarRange className="mt-0.5 h-4 w-4 shrink-0 text-ink-3" aria-hidden="true" />
            <span>{`${longDate(cohort.startsAt)} → ${longDate(cohort.endsAt)}`}</span>
          </p>
          <p className="text-footnote text-ink-3">{`${COPY.cohorts.counts(cohort.counts.active, cohort.counts.pending)} · ${COPY.cohorts.afterEnd[cohort.afterEnd]}`}</p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button type="button" onClick={() => setEditing(true)} className={`${action} text-ink-2 hover:bg-white/[0.06] hover:text-ink`}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            {COPY.cohorts.edit}
          </button>
          <button type="button" onClick={() => onDelete(cohort)} className={`${action} text-ink-2 hover:bg-white/[0.06] hover:text-danger`}>
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            {COPY.cohorts.remove}
          </button>
        </div>
      </header>

      <SegmentedControl options={SECTIONS} value={section} onChange={setSection} label={`Secciones de ${cohort.name}`} layoutId={`cohorte-seccion-${cohort._id}`} />

      {section === 'members' ? (
        <MembersPanel
          cohort={cohort}
          onAdd={(emails, sendEmail) => actions.addMembers(cohort._id, emails, sendEmail)}
          onRemove={(memberId) => actions.removeMember(cohort._id, memberId)}
        />
      ) : (
        <Suspense fallback={<Skeleton className="h-40 rounded-2xl" />}>
          <InvitesPanel cohort={cohort} />
        </Suspense>
      )}
    </article>
  );
}
