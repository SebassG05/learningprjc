// Cursos: introducción con cifras, filtros fijados (búsqueda, área y nivel) y rejilla de tarjetas.
// La página solo compone escenas; los textos viven en components/courses/coursesCopy.js.
// Los filtros van en la URL (?q=&area=&nivel=): «atrás» y los enlaces compartidos los conservan.
import { useCallback, useDeferredValue, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthModal from '../components/auth/LazyAuthModal';
import { preloadAuthModal } from '../components/auth/loadAuthModal';
import CoursesIntro from '../components/courses/CoursesIntro';
import CourseFilters from '../components/courses/CourseFilters';
import CourseGrid from '../components/courses/CourseGrid';
import LanguageDialog from '../components/courses/LanguageDialog';
import useCourseCatalog from '../components/courses/useCourseCatalog';
import { LIST_HEADING, PROVISIONAL } from '../components/courses/coursesCopy';
import { buildSearchIndex, courseHours, filterCourses, isBilingual, saveLanguage, savedLanguage, topicCount } from '../components/courses/courseFormat';
import { useUser } from '../context/UserContext';
import usePageMeta from '../hooks/usePageMeta';

const shell = 'mx-auto w-full max-w-site px-gutter';
const PAGE_SIZE = 12;
const FILTER_KEYS = ['q', 'area', 'nivel'];

// Halo nocturno detrás de la introducción (estático, sin blur)
const HALO = {
  background:
    'radial-gradient(70% 100% at 15% 0%, color-mix(in oklab, var(--color-night-teal) 85%, transparent), transparent 70%)',
};

export default function Cursos() {
  usePageMeta(PROVISIONAL.pageTitle, PROVISIONAL.pageDescription);
  const navigate = useNavigate();
  const { user } = useUser();
  const { status, courses, catalog, progress, retry } = useCourseCatalog(user?._id ?? user?.id ?? user?.email ?? null);

  const [params, setParams] = useSearchParams();
  const filters = { q: params.get('q') ?? '', area: params.get('area') ?? '', nivel: params.get('nivel') ?? '' };
  const query = useDeferredValue(filters.q);
  // Sin catálogo (backend antiguo o caído) se ignoran área y nivel en vez de vaciar el listado
  const area = catalog ? filters.area : '';
  const nivel = catalog ? filters.nivel : '';

  const updateFilters = useCallback(
    (patch) =>
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(patch)) {
            if (value) next.set(key, value);
            else next.delete(key);
          }
          return next;
        },
        { replace: true }
      ),
    [setParams]
  );
  const clearFilters = useCallback(() => updateFilters(Object.fromEntries(FILTER_KEYS.map((k) => [k, '']))), [updateFilters]);

  const index = useMemo(() => buildSearchIndex(courses), [courses]);
  const visible = useMemo(() => filterCourses(courses, index, { q: query, area, nivel }), [courses, index, query, area, nivel]);
  const stats = useMemo(() => {
    if (status !== 'ready' || courses.length === 0) return null;
    let topics = 0;
    let hours = 0;
    for (const c of courses) {
      topics += topicCount(c);
      hours += courseHours(c) ?? 0;
    }
    return { courses: courses.length, topics, hours: Math.round(hours) };
  }, [status, courses]);

  // «Ver más» de 12 en 12; vuelve a 12 al cambiar los filtros
  const filterKey = `${query}|${area}|${nivel}`;
  const [page, setPage] = useState({ key: filterKey, size: PAGE_SIZE });
  const size = page.key === filterKey ? page.size : PAGE_SIZE;
  const showMore = useCallback(() => setPage({ key: filterKey, size: size + PAGE_SIZE }), [filterKey, size]);

  // Sin sesión se pide acceso; en cursos bilingües, el idioma antes de entrar (como hasta ahora).
  // Cmd/Ctrl-clic abre la ficha en otra pestaña sin interceptar.
  const [showLogin, setShowLogin] = useState(false);
  const [langCourse, setLangCourse] = useState(null);
  const handleOpen = useCallback(
    (e, course) => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      if (!user) {
        e.preventDefault();
        setShowLogin(true);
      } else if (isBilingual(course) && !savedLanguage(course._id)) {
        e.preventDefault();
        setLangCourse(course);
      }
    },
    [user]
  );
  const chooseLanguage = (lang) => {
    saveLanguage(langCourse._id, lang);
    const id = langCourse._id;
    setLangCourse(null);
    navigate(`/curso/${id}/inscripcion`);
  };

  const hasFilters = FILTER_KEYS.some((k) => filters[k]);

  return (
    <div className="relative isolate">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem]" style={HALO} />

      <div className={shell}>
        <CoursesIntro stats={stats} />

        {/* Se pinta ya mientras carga (con su altura): si apareciera al llegar los datos, empujaría la rejilla */}
        {status === 'loading' || courses.length > 0 ? (
          <CourseFilters catalog={catalog} loading={status === 'loading'} filters={filters} onChange={updateFilters} count={visible.length} />
        ) : null}

        <section
          aria-labelledby="cursos-listado"
          className="pb-16 pt-8 sm:pb-20 sm:pt-10"
          onPointerEnter={user ? undefined : preloadAuthModal}
        >
          <h2 id="cursos-listado" className="sr-only">{LIST_HEADING}</h2>
          <CourseGrid
            status={status}
            courses={visible.slice(0, size)}
            total={courses.length}
            catalog={catalog}
            progress={progress}
            query={filters.q}
            hasFilters={hasFilters}
            onClear={clearFilters}
            onRetry={retry}
            onOpen={handleOpen}
            hasMore={visible.length > size}
            onMore={showMore}
          />
        </section>
      </div>

      {showLogin ? <AuthModal open={showLogin} onClose={() => setShowLogin(false)} /> : null}
      <LanguageDialog open={Boolean(langCourse)} onSelect={chooseLanguage} onClose={() => setLangCourse(null)} />
    </div>
  );
}
