/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, BookOpen, Copy, Lock, Plus, Unlock, UsersRound } from 'lucide-react';
import Button from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { fetchCourseInterest, setCourseAccess } from '../../../lib/adminApi';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import FilterBar from '../ui/FilterBar';
import RelativeTime from '../ui/RelativeTime';
import SegmentedControl from '../ui/SegmentedControl';
import SelectField from '../ui/SelectField';
import Skeleton from '../ui/Skeleton';
import useAdminCourses from '../shared/useAdminCourses';
import useUrlFilters from '../shared/useUrlFilters';
import { createUrlFilters, isObjectId } from '../shared/urlFilters';
import { courseName } from '../shared/adminFormat';
import { COPY } from './accesosCopy';
import CohortCard from './CohortCard';
import CohortForm from './CohortForm';
import useCohorts from './useCohorts';

// El curso elegido va en la URL (?tab=accesos&curso=…), como en Progreso
const accesosFilters = createUrlFilters({ defaults: { curso: '' }, valid: { curso: isObjectId }, ignore: ['curso'] });

const MODES = [
  { value: 'public', label: COPY.mode.public, icon: Unlock },
  { value: 'private', label: COPY.mode.private, icon: Lock },
];

// Pestaña Accesos: público / privado por curso, sus cohortes (miembros e invitaciones) e interesados
export default function AccesosTab() {
  const { showToast } = useToast();
  const { filters, setFilters } = useUrlFilters(accesosFilters);
  const { courses, status: coursesStatus, reload: reloadCourses, update: updateCourse } = useAdminCourses();
  const course = courses.find((c) => c._id === filters.curso) ?? courses[0] ?? null;
  const courseId = course?._id ?? null;
  const cohorts = useCohorts(courseId);

  const [creating, setCreating] = useState(false);
  const [pendingMode, setPendingMode] = useState(null);
  const [savingMode, setSavingMode] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const courseOptions = useMemo(() => courses.map((c) => ({ value: c._id, label: c.accessMode === 'private' ? `${courseName(c)} · privado` : courseName(c) })), [courses]);
  const mode = course?.accessMode === 'private' ? 'private' : 'public';

  useEffect(() => setCreating(false), [courseId]);

  if (coursesStatus === 'error') {
    return <EmptyState tone="error" icon={AlertCircle} title={COPY.errors.load.title} description={COPY.errors.load.description} action={{ label: COPY.errors.load.action, onClick: reloadCourses }} />;
  }
  if (coursesStatus === 'loading') return <Skeleton className="h-64 rounded-2xl" />;
  if (!course) return <EmptyState icon={BookOpen} title="No hay cursos" description="Crea un curso en Gestión de cursos." />;

  const saveMode = async () => {
    setSavingMode(true);
    try {
      const res = await setCourseAccess(courseId, pendingMode);
      updateCourse(courseId, { accessMode: res.accessMode });
      showToast(COPY.mode.saved(res.accessMode), 'success');
      setPendingMode(null);
    } catch (err) {
      showToast(err.message || COPY.errors.generic, 'error');
    } finally {
      setSavingMode(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await cohorts.remove(toDelete._id);
      showToast(COPY.cohorts.removed, 'success');
      setToDelete(null);
    } catch (err) {
      showToast(err.message || COPY.errors.generic, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const withToast = (fn, message) => async (...args) => {
    try {
      const result = await fn(...args);
      showToast(message, 'success');
      return result;
    } catch (err) {
      showToast(err.message || COPY.errors.generic, 'error');
      throw err;
    }
  };
  const actions = { ...cohorts, update: withToast(cohorts.update, COPY.cohorts.saved) };
  const modeCopy = pendingMode === 'private' ? COPY.mode.toPrivate : COPY.mode.toPublic;

  return (
    <div className="space-y-6 md:space-y-8">
      <FilterBar active={0} onClear={() => {}} label="Curso">
        <SelectField label={COPY.courseLabel} value={courseId} onChange={(curso) => setFilters({ curso })} options={courseOptions} className="md:w-auto md:max-w-md" />
      </FilterBar>

      <section aria-labelledby="acceso-modo" className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center md:p-6">
        <div className="min-w-0 flex-1">
          <h2 id="acceso-modo" className="font-semibold text-ink">{COPY.mode.label}</h2>
          <p className="mt-1 text-callout text-ink-2">{mode === 'private' ? COPY.mode.privateHint : COPY.mode.publicHint}</p>
          {mode === 'public' && cohorts.cohorts.length > 0 ? <p className="mt-1 text-footnote text-dawn">{COPY.mode.publicWithCohorts}</p> : null}
        </div>
        <SegmentedControl options={MODES} value={mode} onChange={(next) => next !== mode && setPendingMode(next)} label={COPY.mode.label} layoutId="acceso-modo" />
      </section>

      <section aria-labelledby="acceso-cohortes" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 id="acceso-cohortes" className="text-title-3 font-semibold text-ink">{COPY.cohorts.title}</h2>
          {creating ? null : (
            <Button onClick={() => setCreating(true)}>
              <Plus className="h-4 w-4" aria-hidden="true" />
              {COPY.cohorts.add}
            </Button>
          )}
        </div>

        {creating ? (
          <CohortForm
            onCancel={() => setCreating(false)}
            onSubmit={async (body) => {
              await withToast(cohorts.create, COPY.cohorts.created)(body);
              setCreating(false);
            }}
          />
        ) : null}

        {cohorts.status === 'loading' || cohorts.status === 'idle' ? (
          <Skeleton className="h-48 rounded-2xl" />
        ) : cohorts.status === 'error' ? (
          <EmptyState tone="error" icon={AlertCircle} title={COPY.errors.load.title} description={COPY.errors.load.description} action={{ label: COPY.errors.load.action, onClick: cohorts.reload }} />
        ) : cohorts.cohorts.length === 0 && !creating ? (
          <EmptyState icon={UsersRound} title={COPY.cohorts.empty.title} description={COPY.cohorts.empty.description} />
        ) : (
          <div className="space-y-4">
            {cohorts.cohorts.map((c) => <CohortCard key={c._id} cohort={c} actions={actions} onDelete={setToDelete} />)}
          </div>
        )}
      </section>

      {mode === 'private' ? <InterestList courseId={courseId} /> : null}

      <ConfirmDialog
        open={Boolean(pendingMode)}
        title={modeCopy.title}
        description={modeCopy.body}
        confirmLabel={modeCopy.confirm}
        busy={savingMode}
        onCancel={() => setPendingMode(null)}
        onConfirm={saveMode}
      />
      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete ? COPY.cohorts.removeConfirm.title(toDelete.name) : ''}
        description={toDelete ? COPY.cohorts.removeConfirm.body(toDelete.counts.active) : ''}
        confirmLabel={COPY.cohorts.removeConfirm.confirm}
        destructive
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function InterestList({ courseId }) {
  const { showToast } = useToast();
  const [state, setState] = useState({ status: 'loading', rows: [] });

  useEffect(() => {
    const ctrl = new AbortController();
    setState({ status: 'loading', rows: [] });
    fetchCourseInterest(courseId, ctrl.signal)
      .then((rows) => setState({ status: 'ready', rows }))
      .catch((err) => err.name !== 'AbortError' && setState({ status: 'error', rows: [] }));
    return () => ctrl.abort();
  }, [courseId]);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(state.rows.map((r) => r.email).join('\n'));
      showToast(COPY.interest.copied, 'success');
    } catch {
      showToast(COPY.errors.copy, 'error');
    }
  };

  return (
    <section aria-labelledby="acceso-interesados" className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <h2 id="acceso-interesados" className="text-title-3 font-semibold text-ink">
          {COPY.interest.title}
          {state.status === 'ready' ? <span className="ml-2 text-ink-3">{state.rows.length}</span> : null}
        </h2>
        {state.rows.length ? (
          <Button variant="secondary" size="sm" onClick={copyAll}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {COPY.interest.copyAll}
          </Button>
        ) : null}
      </div>
      {state.status === 'loading' ? (
        <Skeleton className="h-16 rounded-2xl" />
      ) : state.status === 'error' ? (
        <p role="alert" className="text-callout text-danger">{COPY.errors.generic}</p>
      ) : state.rows.length === 0 ? (
        <p className="text-callout text-ink-3">{COPY.interest.empty}</p>
      ) : (
        <ul className="divide-y divide-line rounded-2xl border border-line">
          {state.rows.map((r) => (
            <li key={r._id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="truncate font-medium text-ink">{r.email}</span>
              <span className="text-footnote text-ink-3">
                {r.hasAccount ? `${COPY.interest.account} · ` : ''}
                <RelativeTime date={r.createdAt} />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
