import { useCallback, useMemo } from 'react';
import { AlertCircle, CalendarDays, Inbox, List, SearchX } from 'lucide-react';
import useMediaQuery from '../../../hooks/useMediaQuery';
import EmptyState from '../ui/EmptyState';
import LoadMore from '../ui/LoadMore';
import SegmentedControl from '../ui/SegmentedControl';
import Skeleton from '../ui/Skeleton';
import StatFilters from '../ui/StatFilters';
import useAdminCourses from '../shared/useAdminCourses';
import useUrlFilters from '../shared/useUrlFilters';
import EnrollmentCalendar from './EnrollmentCalendar';
import EnrollmentCards from './EnrollmentCards';
import EnrollmentTable from './EnrollmentTable';
import ReservasToolbar from './ReservasToolbar';
import useEnrollmentMonth from './useEnrollmentMonth';
import useEnrollments from './useEnrollments';
import { monthKey, parseMonth, reservasFilters } from './reservasQuery';
import { COPY, STAT_FILTERS } from './reservasCopy';

const VIEWS = [
  { value: 'lista', label: COPY.views.list, icon: List },
  { value: 'calendario', label: COPY.views.calendar, icon: CalendarDays },
];

// Pestaña Reservas: quién se ha inscrito, en qué curso y cuándo. Lista o calendario; acción: contactar.
export default function ReservasTab() {
  const { filters, setFilters, clearFilters, active } = useUrlFilters(reservasFilters);
  const { courses } = useAdminCourses();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const calendar = filters.vista === 'calendario';
  const first = useMemo(() => parseMonth(filters.mes), [filters.mes]);

  const list = useEnrollments(filters, !calendar, courses);
  const month = useEnrollmentMonth(filters, first, calendar, courses);
  const source = calendar ? month : list;
  const loading = source.status === 'loading';

  const setMonth = useCallback((d) => setFilters({ mes: monthKey(d), dia: '' }), [setFilters]);

  let body;
  if (source.status === 'error' && (calendar || list.items.length === 0)) {
    body = <EmptyState tone="error" icon={AlertCircle} title={COPY.empty.error.title} description={COPY.empty.error.description} action={{ label: COPY.empty.error.action, onClick: source.reload }} />;
  } else if (calendar) {
    body = (
      <EnrollmentCalendar
        first={first}
        onMonthChange={setMonth}
        byDay={month.byDay}
        selected={filters.dia}
        onSelect={(dia) => setFilters({ dia })}
        status={month.status}
        total={month.total}
        truncated={month.truncated}
      />
    );
  } else if (loading) {
    body = (
      <div aria-busy="true" aria-label="Cargando inscripciones" className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-[4.5rem] rounded-2xl" />)}
      </div>
    );
  } else if (list.items.length === 0) {
    body = active ? (
      <EmptyState icon={SearchX} title={COPY.empty.filtered.title} description={COPY.empty.filtered.description} action={{ label: COPY.empty.filtered.action, onClick: clearFilters }} />
    ) : (
      <EmptyState icon={Inbox} title={COPY.empty.none.title} description={COPY.empty.none.description} />
    );
  } else {
    const View = desktop ? EnrollmentTable : EnrollmentCards;
    body = (
      <>
        <View items={list.items} busy={list.status === 'refreshing'} />
        <LoadMore hasMore={list.hasMore} loading={list.status === 'loadingMore'} onLoad={list.loadMore} label={COPY.loadMore} loadingLabel={COPY.loadingMore} />
      </>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      <StatFilters items={STAT_FILTERS} stats={source.stats} value={filters.estado} onChange={(estado) => setFilters({ estado })} loading={loading} label={COPY.statsLabel} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <ReservasToolbar
            filters={filters}
            onChange={setFilters}
            onClear={clearFilters}
            active={active}
            courses={courses}
            calendar={calendar}
            resultLabel={!loading && !calendar && list.status !== 'error' ? COPY.results(list.total) : null}
          />
        </div>
        <div className="self-start">
          <SegmentedControl options={VIEWS} value={filters.vista} onChange={(vista) => setFilters({ vista })} label={COPY.viewLabel} layoutId="reservas-vista" />
        </div>
      </div>
      <div aria-busy={loading || source.status === 'refreshing'}>{body}</div>
    </div>
  );
}
