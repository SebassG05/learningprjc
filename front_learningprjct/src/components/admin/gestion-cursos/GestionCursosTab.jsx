import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, BookOpen, Plus, SearchX } from 'lucide-react';
import Button from '../../ui/Button';
import { useToast } from '../../../context/ToastContext';
import { deleteCourse, toggleCourseOpen } from '../../../lib/adminApi';
import ConfirmDialog from '../ui/ConfirmDialog';
import EmptyState from '../ui/EmptyState';
import FilterBar from '../ui/FilterBar';
import SearchInput from '../ui/SearchInput';
import Skeleton from '../ui/Skeleton';
import useAdminCourses from '../shared/useAdminCourses';
import useUrlFilters from '../shared/useUrlFilters';
import { createUrlFilters } from '../shared/urlFilters';
import { courseName } from '../shared/adminFormat';
import CourseRow from './CourseRow';
import { COPY } from './gestionCopy';

// El editor (formulario, temas, reordenación) va en su propio chunk y se precarga en reposo
const loadEditor = () => import('./CourseEditor');
const CourseEditor = lazy(loadEditor);

const gestionFilters = createUrlFilters({ defaults: { q: '' }, valid: {} });
const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Pestaña Gestión de cursos: lista con estado abierto/cerrado, editor lateral y borrado confirmado.
export default function GestionCursosTab() {
  const { showToast } = useToast();
  const { filters, setFilters, clearFilters, active } = useUrlFilters(gestionFilters);
  const { courses, status, reload, update, upsert, removeLocal } = useAdminCourses();

  const [editor, setEditor] = useState({ open: false, course: null, key: 0 });
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const dirtyRef = useRef(false);

  useEffect(() => {
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 1200));
    const cancel = window.cancelIdleCallback ?? clearTimeout;
    const h = idle(() => loadEditor());
    return () => cancel(h);
  }, []);

  const visible = useMemo(() => {
    const q = norm(filters.q.trim());
    return q ? courses.filter((c) => norm(`${courseName(c)} ${c.titleEn ?? ''} ${(c.category ?? []).join(' ')}`).includes(q)) : courses;
  }, [courses, filters.q]);

  const openEditor = (course) => {
    dirtyRef.current = false;
    setEditor((e) => ({ open: true, course, key: e.key + 1 }));
  };
  const closeEditor = useCallback(() => {
    dirtyRef.current = false;
    setEditor((e) => ({ ...e, open: false }));
  }, []);
  const requestClose = () => (dirtyRef.current ? setConfirmClose(true) : closeEditor());
  const onDirtyChange = useCallback((d) => {
    dirtyRef.current = d;
  }, []);

  // Abrir/cerrar: optimista, y vuelve atrás si falla
  const toggle = async (course) => {
    setToggling(course._id);
    update(course._id, { isOpen: !course.isOpen });
    try {
      const r = await toggleCourseOpen(course._id);
      update(course._id, { isOpen: r.isOpen });
      showToast(COPY.toggled(r.isOpen), 'success');
    } catch {
      update(course._id, { isOpen: course.isOpen });
      showToast(COPY.toggleFailed, 'error', 5000);
    } finally {
      setToggling(null);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await deleteCourse(toDelete._id);
      removeLocal(toDelete._id);
      showToast(COPY.remove.done, 'success');
      setToDelete(null);
    } catch {
      showToast(COPY.remove.failed, 'error', 5000);
    } finally {
      setDeleting(false);
    }
  };

  let body;
  if (status === 'error') {
    body = <EmptyState tone="error" icon={AlertCircle} title={COPY.empty.error.title} description={COPY.empty.error.description} action={{ label: COPY.empty.error.action, onClick: reload }} />;
  } else if (status === 'loading') {
    body = (
      <div aria-busy="true" aria-label="Cargando cursos" className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
    );
  } else if (courses.length === 0) {
    body = <EmptyState icon={BookOpen} title={COPY.empty.none.title} description={COPY.empty.none.description} action={{ label: COPY.empty.none.action, onClick: () => openEditor(null), variant: 'primary' }} />;
  } else if (visible.length === 0) {
    body = <EmptyState icon={SearchX} title={COPY.empty.filtered.title} description={COPY.empty.filtered.description} action={{ label: COPY.empty.filtered.action, onClick: clearFilters }} />;
  } else {
    body = (
      <ul className="space-y-3" aria-label="Cursos">
        {visible.map((c) => (
          <CourseRow key={c._id} course={c} onEdit={openEditor} onDelete={setToDelete} onToggle={toggle} toggling={toggling === c._id} />
        ))}
      </ul>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <FilterBar active={active} onClear={clearFilters} resultLabel={status === 'ready' ? COPY.results(visible.length) : null} label="Buscar cursos">
            <SearchInput value={filters.q} onChange={(q) => setFilters({ q })} label={COPY.searchLabel} placeholder={COPY.searchPlaceholder} className="md:max-w-sm md:flex-1" />
          </FilterBar>
        </div>
        <Button onClick={() => openEditor(null)} className="self-start md:self-auto">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {COPY.newCourse}
        </Button>
      </div>

      <div aria-busy={status === 'loading'}>{body}</div>

      {editor.key > 0 ? (
        <Suspense fallback={null}>
          <CourseEditor
            key={editor.key}
            open={editor.open}
            course={editor.course}
            onClose={requestClose}
            onDirtyChange={onDirtyChange}
            onSaved={(c) => {
              upsert(c);
              setEditor((e) => ({ ...e, course: c }));
            }}
          />
        </Suspense>
      ) : null}

      <ConfirmDialog
        open={confirmClose}
        title={COPY.discard.title}
        description={COPY.discard.body}
        confirmLabel={COPY.discard.confirm}
        cancelLabel={COPY.discard.cancel}
        destructive
        onCancel={() => setConfirmClose(false)}
        onConfirm={() => {
          setConfirmClose(false);
          closeEditor();
        }}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete ? COPY.remove.title(courseName(toDelete)) : ''}
        description={COPY.remove.body}
        confirmLabel={COPY.remove.confirm}
        destructive
        busy={deleting}
        onCancel={() => setToDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
