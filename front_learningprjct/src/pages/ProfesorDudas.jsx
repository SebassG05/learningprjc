// «Mis dudas pendientes»: dudas abiertas y reportadas de los cursos en los que el usuario es profesor.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Skeleton from '../components/admin/ui/Skeleton';
import EmptyState from '../components/admin/ui/EmptyState';
import DudaItem from '../components/dudas/DudaItem';
import { dudasCopy } from '../components/dudas/dudasCopy';
import { agruparPorCurso } from '../components/dudas/dudasFormat';
import { useUser } from '../context/UserContext';
import { useToast } from '../context/ToastContext';
import usePageMeta from '../hooks/usePageMeta';
import * as api from '../lib/dudasApi';

const c = dudasCopy('es');
const p = c.profesor;
// Los componentes de dudas pintan con --accent; aquí, el verde de marca
const ACCENT_STYLE = { '--accent': '#a1db87' };
const CONTENEDOR = 'mx-auto max-w-[1200px] px-4 pt-14 pb-24 sm:px-6 sm:pt-20 lg:px-8';

export default function ProfesorDudas() {
  const navigate = useNavigate();
  const { user, loading } = useUser();
  const { showToast } = useToast();
  usePageMeta(p.titulo);

  const [dudas, setDudas] = useState([]);
  const [cursos, setCursos] = useState(null);
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (loading) return undefined;
    if (!user) {
      navigate('/cursos', { replace: true });
      return undefined;
    }
    const ctrl = new AbortController();
    setEstado('cargando');
    api
      .fetchMisCursosProfesor(ctrl.signal)
      .then((lista) => {
        const cs = Array.isArray(lista) ? lista : [];
        setCursos(cs);
        if (!cs.length) return setEstado('listo');
        return api.fetchMisDudasProfesor(ctrl.signal).then((ds) => {
          setDudas(Array.isArray(ds) ? ds : []);
          setEstado('listo');
        });
      })
      .catch((err) => err?.name !== 'AbortError' && setEstado('error'));
    return () => ctrl.abort();
  }, [user, loading, navigate, intento]);

  // Mismas llamadas de dudasApi que useDudas; cada acción sustituye la duda que devuelve el servidor
  const acciones = useMemo(() => {
    const sustituir = (duda) => setDudas((l) => l.map((d) => (d._id === duda._id ? { ...d, ...duda, curso: d.curso } : d)));
    const run = async (peticion, aplicar = sustituir, { silencioso = false } = {}) => {
      try {
        const res = await peticion();
        aplicar(res);
        return res ?? true;
      } catch (err) {
        if (!silencioso) showToast(err?.body?.error || c.errorGuardar, 'error', 4000);
        return null;
      }
    };
    return {
      editar: (id, cambios) => run(() => api.updateDuda(id, cambios)),
      borrar: (id) =>
        run(
          () => api.deleteDuda(id),
          (res) => (res?.duda ? sustituir(res.duda) : setDudas((l) => l.filter((d) => d._id !== id))),
        ),
      responder: (id, texto) => run(() => api.addRespuesta(id, texto)),
      editarRespuesta: (id, rid, texto) => run(() => api.updateRespuesta(id, rid, texto)),
      borrarRespuesta: (id, rid) => run(() => api.deleteRespuesta(id, rid)),
      estado: (id, accion, rid) => run(() => api.setEstado(id, accion, rid)),
      marcarVista: (id) => run(() => api.marcarVista(id), sustituir, { silencioso: true }),
      reportar: (id, motivo) => run(() => api.reportar(id, motivo), () => showToast(c.reportado, 'success', 3500)),
    };
  }, [showToast]);

  const accionDe = useCallback((id) => (nombre, ...args) => acciones[nombre](id, ...args), [acciones]);
  const grupos = useMemo(() => agruparPorCurso(dudas), [dudas]);

  return (
    <div className={CONTENEDOR} style={ACCENT_STYLE}>
      <h1 className="max-w-4xl text-title-1 font-bold text-ink">{p.titulo}</h1>
      <p className="mt-3 max-w-2xl text-lg text-ink-2">{p.lead}</p>

      <div className="mt-10">
        {estado === 'cargando' ? (
          <div aria-busy="true" className="space-y-6">
            <p role="status" className="sr-only">{p.cargando}</p>
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : estado === 'error' ? (
          <EmptyState tone="error" title={p.error} action={{ label: c.reintentar, onClick: () => setIntento((n) => n + 1) }} className="py-10" />
        ) : cursos && cursos.length === 0 ? (
          <p role="status" className="max-w-2xl text-pretty text-base leading-relaxed text-ink-2">{p.sinCursos}</p>
        ) : dudas.length === 0 ? (
          <p role="status" className="max-w-2xl text-base text-ink-2">{p.vacio}</p>
        ) : (
          <div className="space-y-14">
            {grupos.map((g) => {
              const cursoId = g.curso?._id ?? g.dudas[0]?.cursoId;
              const headingId = `curso-${cursoId}`;
              return (
                <section key={cursoId} aria-labelledby={headingId}>
                  <h2 id={headingId} className="text-title-3 font-bold text-ink">{g.curso?.title || g.curso?.titleEn || ''}</h2>
                  <div className="mt-4">
                    {g.dudas.map((d) => (
                      <div key={d._id} className="border-t border-line first:border-t-0">
                        <ul>
                          <DudaItem duda={d} lang="es" puedePublicar onAccion={accionDe(d._id)} />
                        </ul>
                        <p className="pb-6">
                          <Link
                            to={`/curso/${cursoId}/dudas#duda-${d._id}`}
                            className="rounded-lg text-callout font-semibold text-brand hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400"
                          >
                            {p.verEnCurso}
                          </Link>
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
