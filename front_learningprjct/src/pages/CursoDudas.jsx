import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import useReducedMotion from '../hooks/useReducedMotion';
import { ArrowLeft, Plus } from 'lucide-react';
import { useUser } from '../context/UserContext';
import usePageMeta from '../hooks/usePageMeta';
import { fetchCourse, fetchEnrollmentStatus, readToken } from '../lib/coursesApi';
import Button from '../components/ui/Button';
import Skeleton from '../components/admin/ui/Skeleton';
import EmptyState from '../components/admin/ui/EmptyState';
import SelectField from '../components/admin/ui/SelectField';
import SegmentedControl from '../components/admin/ui/SegmentedControl';
import DudaForm from '../components/dudas/DudaForm';
import DudaItem from '../components/dudas/DudaItem';
import useDudas from '../components/dudas/useDudas';
import { dudasCopy } from '../components/dudas/dudasCopy';
import { temaLabel } from '../components/dudas/dudasFormat';
import { accesoDelCurso, esAdmin, puedeEntrarAlAula, puedePublicarDudas } from '../components/dudas/dudasAcceso';

const readLang = (id) => {
  try {
    return localStorage.getItem(`lang_${id}`) === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
};

// Los componentes de dudas pintan con --accent (en el temario lo fija cada tema); aquí, el verde de marca
const ACCENT_STYLE = { '--accent': '#a1db87' };
const CONTENEDOR = 'mx-auto max-w-[1200px] px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:px-8';

/** «Dudas del curso»: todas las dudas, con filtro por tema y estado. Mismo acceso que el aula. */
export default function CursoDudas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const reduce = useReducedMotion();
  const lang = readLang(id);
  const c = dudasCopy(lang);

  const [curso, setCurso] = useState(null);
  const [cursoError, setCursoError] = useState(false);
  const [enrollment, setEnrollment] = useState(undefined); // undefined = cargando
  const [temaFiltro, setTemaFiltro] = useState('todos');
  const [estadoFiltro, setEstadoFiltro] = useState('todas');
  const [preguntando, setPreguntando] = useState(false);

  const admin = esAdmin(user);
  const acceso = accesoDelCurso(curso);
  const entra = puedeEntrarAlAula({ enrolled: enrollment?.enrolled, access: acceso, admin });
  const puedePublicar = puedePublicarDudas({ access: acceso, admin });
  const esProfesor = Boolean(acceso?.teacher) && !enrollment?.enrolled;
  const tituloCurso = curso ? (lang === 'en' ? curso.titleEn || curso.title : curso.title || curso.titleEn) : '';

  usePageMeta(tituloCurso ? `${c.pagina.titulo} · ${tituloCurso}` : c.pagina.titulo, c.pagina.titulo);

  useEffect(() => {
    const token = readToken();
    if (!user || !token) {
      navigate('/cursos');
      return undefined;
    }
    const ctrl = new AbortController();
    setCursoError(false);
    fetchCourse(id, ctrl.signal)
      .then(setCurso)
      .catch((err) => err?.name !== 'AbortError' && setCursoError(true));
    fetchEnrollmentStatus(id, token, ctrl.signal)
      .then(setEnrollment)
      .catch((err) => err?.name !== 'AbortError' && setEnrollment(null));
    return () => ctrl.abort();
  }, [id, user, navigate]);

  // Sin inscripción solo pasan el profesor del curso y los admin
  useEffect(() => {
    if (!curso || enrollment === undefined) return;
    if (!entra) navigate(`/curso/${id}/inscripcion`, { replace: true });
  }, [curso, enrollment, entra, id, navigate]);

  const { dudas, estado, reintentar, acciones } = useDudas({ cursoId: id, lang, enabled: Boolean(curso) && entra });

  const temas = curso?.temas;
  const opcionesTema = useMemo(
    () => [...(temas ?? []).map((t) => ({ value: String(t._id), label: temaLabel(t._id, temas, lang) })), { value: 'general', label: 'General' }],
    [temas, lang],
  );
  const opcionesFiltro = useMemo(() => [{ value: 'todos', label: c.pagina.todosLosTemas }, ...opcionesTema], [opcionesTema, c.pagina.todosLosTemas]);
  const opcionesEstado = [
    { value: 'todas', label: c.estado.todas },
    { value: 'abierta', label: c.pagina.pendientes },
    { value: 'resuelta', label: c.pagina.resueltas },
  ];

  const visibles = useMemo(
    () =>
      dudas.filter(
        (d) => (temaFiltro === 'todos' || String(d.temaId) === temaFiltro) && (estadoFiltro === 'todas' || d.estado === estadoFiltro),
      ),
    [dudas, temaFiltro, estadoFiltro],
  );

  // Ancla del correo (#duda-{id}): al cargar la lista se muestra y recibe el foco (sin desplazamiento suave con reduced motion)
  const anclada = useRef(false);
  useEffect(() => {
    if (anclada.current || estado !== 'listo') return;
    anclada.current = true;
    const hash = window.location.hash;
    if (!hash.startsWith('#duda-')) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    el.setAttribute('tabindex', '-1');
    el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
    el.focus({ preventScroll: true });
  }, [estado, reduce]);

  const accionDe = (dudaId) => (nombre, ...args) => acciones[nombre](dudaId, ...args);

  if (cursoError) {
    return (
      <div className={CONTENEDOR} style={ACCENT_STYLE}>
        <EmptyState tone="error" title={c.pagina.noEncontrado} action={{ label: c.pagina.volver, onClick: () => navigate('/cursos') }} className="py-16" />
      </div>
    );
  }

  if (!curso || enrollment === undefined || !entra) {
    return (
      <div className={CONTENEDOR} style={ACCENT_STYLE} role="status" aria-busy="true">
        <span className="sr-only">{c.cargando}</span>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-6 h-12 w-2/3" />
        <Skeleton className="mt-10 h-12 w-full max-w-xl" />
      </div>
    );
  }

  return (
    <div className={CONTENEDOR} style={ACCENT_STYLE}>
      <Link
        to={`/curso/${id}`}
        className="group inline-flex items-center gap-2 rounded-lg text-callout font-semibold text-brand transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" aria-hidden="true" />
        {c.pagina.volver}
      </Link>
      <h1 className="mt-6 max-w-4xl text-title-1 font-bold text-ink">{c.pagina.titulo}</h1>
      {tituloCurso ? <p className="mt-3 text-lg text-ink-2">{tituloCurso}</p> : null}

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SelectField label={c.pagina.filtroTema} value={temaFiltro} onChange={setTemaFiltro} options={opcionesFiltro} className="sm:w-80" />
          <SegmentedControl label={c.pagina.filtroEstado} options={opcionesEstado} value={estadoFiltro} onChange={setEstadoFiltro} layoutId="dudas-estado" />
        </div>
        {puedePublicar && !preguntando ? (
          <Button variant="secondary" onClick={() => setPreguntando(true)}>
            <Plus className="h-4 w-4" aria-hidden="true" />
            {c.preguntar}
          </Button>
        ) : null}
      </div>

      {!puedePublicar && !esProfesor ? <p className="mt-6 text-callout text-ink-3">{c.soloLectura}</p> : null}

      {puedePublicar && preguntando ? (
        <div className="mt-8 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-line sm:p-6">
          <DudaForm
            modo="duda"
            lang={lang}
            autoFocus
            temas={opcionesTema}
            temaInicial={temaFiltro === 'todos' ? 'general' : temaFiltro}
            onCancel={() => setPreguntando(false)}
            onSubmit={async (valores) => {
              const ok = await acciones.crear(valores);
              if (ok) setPreguntando(false);
              return ok;
            }}
          />
        </div>
      ) : null}

      <div className="mt-10">
        {estado === 'cargando' ? (
          <div aria-busy="true" className="space-y-6">
            <p role="status" className="sr-only">{c.cargando}</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : estado === 'error' ? (
          <EmptyState tone="error" title={c.error} action={{ label: c.reintentar, onClick: reintentar }} className="py-10" />
        ) : dudas.length === 0 ? (
          <p role="status" className="max-w-2xl text-pretty text-base leading-relaxed text-ink-2">{c.pagina.vacio}</p>
        ) : visibles.length === 0 ? (
          <p role="status" className="max-w-2xl text-base text-ink-2">{c.pagina.sinResultados}</p>
        ) : (
          <ul aria-label={c.pagina.titulo}>
            {visibles.map((d) => (
              <DudaItem
                key={d._id}
                duda={d}
                lang={lang}
                puedePublicar={puedePublicar}
                temaTexto={temaLabel(d.temaId, temas, lang)}
                onAccion={accionDe(d._id)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
