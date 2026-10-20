import { useMemo } from 'react';
import { AlertCircle, BookOpen, SearchX, Users } from 'lucide-react';
import useMediaQuery from '../../../hooks/useMediaQuery';
import EmptyState from '../ui/EmptyState';
import FilterBar from '../ui/FilterBar';
import SearchInput from '../ui/SearchInput';
import SelectField from '../ui/SelectField';
import Skeleton from '../ui/Skeleton';
import useAdminCourses from '../shared/useAdminCourses';
import useUrlFilters from '../shared/useUrlFilters';
import { courseName } from '../shared/adminFormat';
import ProgressHistogram from './ProgressHistogram';
import ProgressSummary from './ProgressSummary';
import StudentProgressCards from './StudentProgressCards';
import StudentProgressTable from './StudentProgressTable';
import TopicCompletion from './TopicCompletion';
import useCourseProgress from './useCourseProgress';
import { SORTS, filterAndSort, histogram, progresoFilters, sortedTopics, studentRow, summarize, topicCompletion } from './progresoQuery';
import { COPY } from './progresoCopy';

function LoadingState() {
  return (
    <div aria-busy="true" aria-label="Cargando progreso" className="space-y-4">
      <Skeleton className="h-20 rounded-2xl" />
      <div className="hidden gap-4 lg:grid lg:grid-cols-2">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
      {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />)}
    </div>
  );
}

// Pestaña Progreso del curso: cifras, cómo avanzan (gráficos en escritorio) y cada alumno.
export default function ProgresoTab() {
  const { filters, setFilters, clearFilters, active } = useUrlFilters(progresoFilters);
  const { courses, status: coursesStatus, reload: reloadCourses } = useAdminCourses();
  const desktop = useMediaQuery('(min-width: 1024px)');

  // Sin curso en la URL se muestra el primero (sin escribirlo: la URL queda limpia)
  const course = courses.find((c) => c._id === filters.curso) ?? courses[0] ?? null;
  const courseId = course?._id ?? null;
  const data = useCourseProgress(courseId);

  const topics = useMemo(() => sortedTopics(course), [course]);
  const rows = useMemo(() => data.enrollments.map((e) => studentRow(e, topics, data.exercises)), [data.enrollments, topics, data.exercises]);
  const summary = useMemo(() => summarize(rows), [rows]);
  const bins = useMemo(() => histogram(rows), [rows]);
  const topicItems = useMemo(() => topicCompletion(rows, topics), [rows, topics]);
  const visible = useMemo(() => filterAndSort(rows, filters), [rows, filters]);

  const courseOptions = useMemo(() => courses.map((c) => ({ value: c._id, label: courseName(c) })), [courses]);

  if (coursesStatus === 'error') {
    return <EmptyState tone="error" icon={AlertCircle} title={COPY.empty.error.title} description={COPY.empty.error.description} action={{ label: COPY.empty.error.action, onClick: reloadCourses }} />;
  }
  if (coursesStatus === 'ready' && courses.length === 0) {
    return <EmptyState icon={BookOpen} title={COPY.empty.noCourses.title} description={COPY.empty.noCourses.description} />;
  }

  const loading = coursesStatus === 'loading' || data.status === 'loading' || data.status === 'idle';
  const busy = data.status === 'refreshing';

  let body;
  if (data.status === 'error') {
    body = <EmptyState tone="error" icon={AlertCircle} title={COPY.empty.error.title} description={COPY.empty.error.description} action={{ label: COPY.empty.error.action, onClick: data.reload }} />;
  } else if (loading) {
    body = <LoadingState />;
  } else if (rows.length === 0) {
    body = <EmptyState icon={Users} title={COPY.empty.noStudents.title} description={COPY.empty.noStudents.description} />;
  } else {
    const List = desktop ? StudentProgressTable : StudentProgressCards;
    body = (
      <div className="space-y-5 md:space-y-6">
        <ProgressSummary summary={summary} courseId={courseId} />
        {desktop ? (
          <div className={`grid grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] gap-4 transition-opacity duration-200 ${busy ? 'opacity-60' : ''}`}>
            <ProgressHistogram bins={bins} />
            <TopicCompletion items={topicItems} students={rows.length} />
          </div>
        ) : null}
        {visible.length === 0 ? (
          <EmptyState icon={SearchX} title={COPY.empty.filtered.title} description={COPY.empty.filtered.description} action={{ label: COPY.empty.filtered.action, onClick: clearFilters }} />
        ) : (
          <List rows={visible} courseId={courseId} busy={busy} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <FilterBar active={active} onClear={clearFilters} resultLabel={loading ? null : COPY.results(visible.length)} label="Curso y filtros">
        <SelectField
          label={COPY.courseLabel}
          value={courseId ?? ''}
          onChange={(curso) => setFilters({ curso, q: '' })}
          options={courseOptions.length ? courseOptions : [{ value: '', label: '…' }]}
          className="md:w-auto md:max-w-sm"
        />
        <div className="grid grid-cols-1 gap-3 md:contents">
          <SearchInput value={filters.q} onChange={(q) => setFilters({ q })} label={COPY.searchLabel} placeholder={COPY.searchPlaceholder} className="md:min-w-56 md:flex-1 lg:max-w-xs" />
          <SelectField label={COPY.sortLabel} value={filters.orden} onChange={(orden) => setFilters({ orden })} options={SORTS} className="md:w-auto" />
        </div>
      </FilterBar>
      <div aria-busy={loading || busy}>{body}</div>
    </div>
  );
}
