import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, MessagesSquare } from 'lucide-react';
import EmptyState from '../ui/EmptyState';
import FilterBar from '../ui/FilterBar';
import LoadMore from '../ui/LoadMore';
import SelectField from '../ui/SelectField';
import Skeleton from '../ui/Skeleton';
import { focusRing } from '../ui/tones';
import useAdminCourses from '../shared/useAdminCourses';
import { courseName } from '../shared/adminFormat';
import DudaItem from '../../dudas/DudaItem';
import useDudaAcciones from '../../dudas/useDudaAcciones';
import { temaLabel } from '../../dudas/dudasFormat';
import { fetchAdminDudas } from '../../../lib/adminApi';

const LIMIT = 20;
// Los componentes de dudas pintan con --accent; aquí, el verde de marca
const ACCENT_STYLE = { '--accent': '#a1db87' };

const COPY = {
  curso: 'Curso',
  todosCursos: 'Todos los cursos',
  estado: 'Estado',
  estados: [
    { value: '', label: 'Todas' },
    { value: 'abierta', label: 'Abiertas' },
    { value: 'respondida', label: 'Respondidas' },
    { value: 'resuelta', label: 'Resueltas' },
  ],
  reportadas: 'Solo reportadas',
  verEnCurso: 'Ver en el curso',
  vacio: { title: 'No hay dudas', description: 'Ninguna duda coincide con estos filtros.' },
  error: { title: 'No se han podido cargar las dudas', action: 'Reintentar' },
  cargando: 'Cargando dudas',
  resultados: (n) => (n === 1 ? '1 duda' : `${n} dudas`),
};

const INITIAL = { curso: '', estado: '', reportadas: false };

// Pestaña Dudas: las dudas de todos los cursos, con las acciones de moderación sobre cada una
export default function DudasTab() {
  const { courses } = useAdminCourses();
  const [filters, setFilters] = useState(INITIAL);
  const [dudas, setDudas] = useState([]);
  const [meta, setMeta] = useState({ page: 0, total: 0 });
  const [status, setStatus] = useState('loading'); // loading | refreshing | ready | loadingMore | error
  const [attempt, setAttempt] = useState(0);
  const ctrl = useRef(null);
  const { acciones } = useDudaAcciones({ setDudas, lang: 'es', conservarCurso: true });

  const coursesById = useMemo(() => new Map(courses.map((c) => [String(c._id), c])), [courses]);
  const courseOptions = useMemo(
    () => [{ value: '', label: COPY.todosCursos }, ...courses.map((c) => ({ value: c._id, label: courseName(c) }))],
    [courses],
  );

  const params = useCallback(
    (page) => ({
      estado: filters.estado,
      curso: filters.curso,
      reportadas: filters.reportadas ? 1 : '',
      page,
      limit: LIMIT,
    }),
    [filters],
  );

  useEffect(() => {
    ctrl.current?.abort();
    const c = new AbortController();
    ctrl.current = c;
    setStatus((s) => (s === 'loading' || s === 'error' ? 'loading' : 'refreshing'));
    fetchAdminDudas(params(1), c.signal)
      .then((r) => {
        setDudas(Array.isArray(r.items) ? r.items : []);
        setMeta({ page: r.page ?? 1, total: r.total ?? 0 });
        setStatus('ready');
      })
      .catch((err) => err.name !== 'AbortError' && setStatus('error'));
    return () => c.abort();
  }, [params, attempt]);

  const hasMore = meta.page * LIMIT < meta.total;

  const loadMore = useCallback(async () => {
    if (status !== 'ready' || !hasMore) return;
    setStatus('loadingMore');
    try {
      const r = await fetchAdminDudas(params(meta.page + 1));
      setDudas((list) => {
        const seen = new Set(list.map((d) => d._id));
        return [...list, ...(r.items ?? []).filter((d) => !seen.has(d._id))];
      });
      setMeta({ page: r.page ?? meta.page + 1, total: r.total ?? meta.total });
    } catch {
      // La lista ya cargada sigue ahí; el botón «Cargar más» permite reintentar
    } finally {
      setStatus('ready');
    }
  }, [status, hasMore, params, meta]);

  const accionDe = useCallback((id) => (nombre, ...args) => acciones[nombre](id, ...args), [acciones]);
  const active = (filters.curso ? 1 : 0) + (filters.estado ? 1 : 0) + (filters.reportadas ? 1 : 0);
  const resultLabel = status === 'ready' || status === 'loadingMore' ? COPY.resultados(meta.total) : undefined;

  return (
    <div className="space-y-6" style={ACCENT_STYLE}>
      <FilterBar active={active > 0} onClear={() => setFilters(INITIAL)} label="Filtros de dudas" resultLabel={resultLabel}>
        <SelectField label={COPY.curso} value={filters.curso} onChange={(curso) => setFilters((f) => ({ ...f, curso }))} options={courseOptions} className="md:w-auto md:max-w-xs" />
        <SelectField label={COPY.estado} value={filters.estado} onChange={(estado) => setFilters((f) => ({ ...f, estado }))} options={COPY.estados} className="md:w-auto" />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-callout text-ink">
          <input
            type="checkbox"
            checked={filters.reportadas}
            onChange={(e) => setFilters((f) => ({ ...f, reportadas: e.target.checked }))}
            className="h-5 w-5 shrink-0 accent-brand-400"
          />
          {COPY.reportadas}
        </label>
      </FilterBar>

      {status === 'loading' ? (
        <div aria-busy="true" aria-label={COPY.cargando} className="space-y-3">
          {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : status === 'error' ? (
        <EmptyState tone="error" icon={AlertCircle} title={COPY.error.title} action={{ label: COPY.error.action, onClick: () => setAttempt((n) => n + 1) }} />
      ) : dudas.length === 0 ? (
        <EmptyState icon={MessagesSquare} title={COPY.vacio.title} description={COPY.vacio.description} />
      ) : (
        <div className={`transition-opacity ${status === 'refreshing' ? 'opacity-60' : ''}`} aria-busy={status === 'refreshing' || undefined}>
          <ul className="space-y-4">
            {dudas.map((d) => {
              const cursoId = d.curso?._id ?? d.cursoId;
              const curso = coursesById.get(String(cursoId));
              const cursoTexto = courseName(d.curso?.title || d.curso?.titleEn ? d.curso : curso);
              const tema = curso?.temas ? ` · ${temaLabel(d.temaId, curso.temas, 'es')}` : '';
              return (
                <li key={d._id} className="rounded-2xl border border-line bg-surface px-5 pb-4 md:px-6">
                  <p className="pt-5 text-callout font-semibold text-ink">{`${cursoTexto}${tema}`}</p>
                  <ul>
                    <DudaItem duda={d} lang="es" puedePublicar onAccion={accionDe(d._id)} />
                  </ul>
                  <p>
                    <Link to={`/curso/${cursoId}/dudas#duda-${d._id}`} className={`rounded-lg text-callout font-semibold text-brand hover:text-ink ${focusRing}`}>
                      {COPY.verEnCurso}
                    </Link>
                  </p>
                </li>
              );
            })}
          </ul>
          <LoadMore hasMore={hasMore} loading={status === 'loadingMore'} onLoad={loadMore} />
        </div>
      )}
    </div>
  );
}
