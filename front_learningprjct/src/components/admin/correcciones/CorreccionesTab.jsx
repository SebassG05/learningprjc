import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Inbox, PartyPopper, SearchX } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import useMediaQuery from '../../../hooks/useMediaQuery';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import LoadMore from '../ui/LoadMore';
import Skeleton from '../ui/Skeleton';
import StatFilters from '../ui/StatFilters';
import useAdminCourses from '../shared/useAdminCourses';
import { studentName } from '../shared/adminFormat';
import { statusInfo } from '../shared/submissionStatus';
import SubmissionCards from './SubmissionCards';
import SubmissionTable from './SubmissionTable';
import SubmissionToolbar from './SubmissionToolbar';
import useDeferredGrades from './useDeferredGrades';
import useReviewShortcuts from './useReviewShortcuts';
import useSubmissionFilters from './useSubmissionFilters';
import useSubmissions from './useSubmissions';
import { COPY, STAT_FILTERS } from './correccionesCopy';

// El panel de corrección va en su propio chunk: se precarga en cuanto el navegador está libre
const loadDrawer = () => import('./SubmissionDrawer');
const SubmissionDrawer = lazy(loadDrawer);

const focusSubmission = (id) => {
  const el = document.querySelector(`[data-submission="${id}"]`);
  return el?.matches('button') ? el : el?.querySelector('button');
};

function ListSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando entregas" className="space-y-3">
      {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />)}
    </div>
  );
}

// Pestaña Correcciones: cifras que filtran, barra de filtros, lista y corrección en panel lateral.
export default function CorreccionesTab() {
  const { showToast } = useToast();
  const { filters, setFilters, clearFilters, active } = useSubmissionFilters();
  const { items, stats, total, status, hasMore, loadMore, patch, reload } = useSubmissions(filters);
  const { courses } = useAdminCourses();
  const desktop = useMediaQuery('(min-width: 1024px)');

  const [openId, setOpenId] = useState(null);
  const [confirm, setConfirm] = useState(null); // acción pendiente de «¿descartar cambios?»
  const dirtyRef = useRef(false);
  const apiRef = useRef(null);
  const lastIdRef = useRef(null);

  const index = useMemo(() => items.findIndex((x) => x._id === openId), [items, openId]);
  const current = index >= 0 ? items[index] : null;
  const hasNext = index >= 0 && (index < items.length - 1 || hasMore);

  const { schedule } = useDeferredGrades({
    apply: patch,
    onError: (label) => showToast(COPY.toast.failed(label), 'error', 5000),
  });

  // ---- Navegación (protegida si hay cambios sin guardar) ----
  const guard = useCallback((action) => {
    if (dirtyRef.current) setConfirm(() => action);
    else action();
  }, []);

  const open = useCallback((id) => {
    lastIdRef.current = id;
    dirtyRef.current = false;
    setOpenId(id);
  }, []);

  const close = useCallback(() => {
    dirtyRef.current = false;
    setOpenId(null);
  }, []);

  const goNext = useCallback(async () => {
    if (index < 0) return;
    if (index < items.length - 1) return open(items[index + 1]._id);
    if (hasMore) {
      const added = await loadMore();
      if (added?.length) return open(added[0]._id);
    }
    showToast(COPY.toast.end, 'info');
    close();
  }, [index, items, hasMore, loadMore, open, close, showToast]);

  const goPrev = useCallback(() => {
    if (index > 0) open(items[index - 1]._id);
  }, [index, items, open]);

  // ---- Guardar (diferido 6 s, con «Deshacer») ----
  const onSave = useCallback(
    (entrega, body, { next }) => {
      const name = studentName(entrega.userId);
      const undo = schedule(entrega._id, {
        before: { estado: entrega.estado, calificacion: entrega.calificacion, feedbackProfesor: entrega.feedbackProfesor },
        body,
        label: name,
      });
      dirtyRef.current = false;
      showToast(COPY.toast.saved(name, statusInfo(body.estado).label), 'success', 6000, {
        action: {
          label: COPY.toast.undo,
          onClick: () => {
            if (undo()) showToast(COPY.toast.undone, 'info');
          },
        },
      });
      if (next) goNext();
      else close();
    },
    [schedule, showToast, goNext, close]
  );

  // ---- Atajos de teclado ----
  const moveFocus = (delta) => {
    const nodes = [...document.querySelectorAll('[data-submission]')];
    const ids = nodes.map((n) => n.getAttribute('data-submission'));
    const at = ids.indexOf(document.activeElement?.closest('[data-submission]')?.getAttribute('data-submission'));
    const nextId = ids[Math.min(ids.length - 1, Math.max(0, at === -1 ? 0 : at + delta))];
    focusSubmission(nextId)?.focus();
  };

  useReviewShortcuts(!confirm, openId
    ? {
        onNext: () => guard(goNext),
        onPrev: () => guard(goPrev),
        onApprove: () => apiRef.current?.setEstado('aprobado'),
        onReject: () => apiRef.current?.setEstado('rechazado'),
        onSave: () => apiRef.current?.save(false),
        onSaveNext: () => apiRef.current?.save(true),
      }
    : { onNext: () => moveFocus(1), onPrev: () => moveFocus(-1) });

  // Si la entrega abierta deja de estar en la lista (otro filtro), se cierra el panel
  useEffect(() => {
    if (openId && status === 'ready' && index === -1) close();
  }, [openId, status, index, close]);

  const onDirtyChange = useCallback((d) => {
    dirtyRef.current = d;
  }, []);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const h = idle(() => loadDrawer());
    return () => cancel(h);
  }, []);

  // ---- Contenido ----
  const loading = status === 'loading';
  const onlyPending = filters.estado === 'enviado' && !filters.q && !filters.curso && !filters.fecha;
  let body;
  if (status === 'error' && items.length === 0) {
    body = (
      <EmptyState tone="error" icon={AlertCircle} title={COPY.empty.error.title} description={COPY.empty.error.description} action={{ label: COPY.empty.error.action, onClick: reload }} />
    );
  } else if (loading) {
    body = <ListSkeleton />;
  } else if (items.length === 0) {
    body = onlyPending ? (
      <EmptyState icon={PartyPopper} title={COPY.empty.pending.title} description={COPY.empty.pending.description} />
    ) : active ? (
      <EmptyState icon={SearchX} title={COPY.empty.filtered.title} description={COPY.empty.filtered.description} action={{ label: COPY.empty.filtered.action, onClick: clearFilters }} />
    ) : (
      <EmptyState icon={Inbox} title={COPY.empty.none.title} description={COPY.empty.none.description} />
    );
  } else {
    const List = desktop ? SubmissionTable : SubmissionCards;
    body = (
      <>
        <List items={items} activeId={openId} onOpen={(id) => guard(() => open(id))} busy={status === 'refreshing'} />
        <LoadMore hasMore={hasMore} loading={status === 'loadingMore'} onLoad={loadMore} label={COPY.loadMore} loadingLabel={COPY.loadingMore} />
      </>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <StatFilters
        items={STAT_FILTERS}
        stats={stats}
        value={filters.estado}
        onChange={(estado) => setFilters({ estado })}
        loading={loading}
        label={COPY.statsLabel}
      />
      <SubmissionToolbar
        filters={filters}
        onChange={setFilters}
        onClear={clearFilters}
        active={active}
        courses={courses}
        total={total}
        showTotal={!loading && status !== 'error'}
      />
      <div aria-busy={loading || status === 'refreshing'}>{body}</div>

      <Suspense fallback={null}>
        <SubmissionDrawer
          entrega={current}
          index={index}
          count={total}
          hasNext={hasNext}
          apiRef={apiRef}
          onPrev={() => guard(goPrev)}
          onNext={() => guard(goNext)}
          onClose={() => guard(close)}
          onSave={onSave}
          onDirtyChange={onDirtyChange}
          returnFocus={() => focusSubmission(lastIdRef.current)}
        />
      </Suspense>

      <ConfirmDialog
        open={Boolean(confirm)}
        title={COPY.discard.title}
        description={COPY.discard.description(current ? studentName(current.userId) : '')}
        confirmLabel={COPY.discard.confirm}
        cancelLabel={COPY.discard.cancel}
        destructive
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          const action = confirm;
          dirtyRef.current = false;
          setConfirm(null);
          action?.();
        }}
      />
    </div>
  );
}
