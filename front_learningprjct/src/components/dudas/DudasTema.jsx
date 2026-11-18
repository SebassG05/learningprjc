/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import Button from '../ui/Button';
import Skeleton from '../admin/ui/Skeleton';
import EmptyState from '../admin/ui/EmptyState';
import DudaForm from './DudaForm';
import DudaItem from './DudaItem';
import useDudas from './useDudas';
import { dudasCopy } from './dudasCopy';
import { contarNuevas } from './dudasFormat';
import { duration, ease } from '../../lib/motion';

// La lista (y con ella el contador) se pide cuando el bloque se acerca a la pantalla
const NEAR_MARGIN = '400px 0px';

/**
 * «Dudas de este tema»: plegable con el mismo aspecto que el índice del temario. Una sola petición
 * (al acercarse) da el contador del resumen y la lista que se muestra al abrirlo.
 */
export default function DudasTema({ cursoId, temaId, lang = 'es', puedePublicar = false, esProfesor = false }) {
  const c = dudasCopy(lang);
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  const [open, setOpen] = useState(false);
  const [preguntando, setPreguntando] = useState(false);
  const { dudas, estado, reintentar, acciones } = useDudas({ cursoId, temaId, lang, enabled: near });

  useEffect(() => {
    const el = ref.current;
    if (!el || near) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: NEAR_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  // Acción del hook ligada a una duda (DudaItem protege con una ref lo que solo debe ocurrir una vez)
  const accionDe = (id) => (nombre, ...args) => acciones[nombre](id, ...args);

  const listo = estado === 'listo';
  const nuevas = listo ? contarNuevas(dudas) : 0;

  return (
    <details
      ref={ref}
      onToggle={(ev) => {
        const abierto = ev.currentTarget.open;
        setOpen(abierto);
        // Por si se abre antes de llegar el observador (p. ej. al saltar con el teclado)
        if (abierto) setNear(true);
      }}
      className="tema-dudas group/dudas rounded-3xl bg-surface/70 ring-1 ring-inset ring-line backdrop-blur-xl"
    >
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 text-base font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-7 [&::-webkit-details-marker]:hidden">
        <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--accent)]" />
          <span>{listo ? c.bloque(dudas.length) : c.bloqueSinNumero}</span>
          {nuevas ? (
            <span className="rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] px-2.5 py-0.5 text-footnote font-semibold text-[var(--accent)]">
              {c.respuestaNueva}
            </span>
          ) : null}
        </span>
        <ChevronDown className="h-5 w-5 shrink-0 text-ink-2 transition-transform duration-300 ease-out-expo group-open/dudas:rotate-180" aria-hidden="true" />
      </summary>

      {open ? (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? duration.instant : duration.base, ease: ease.outExpo }}
          className="px-5 pb-7 sm:px-7"
        >
          {/* Preguntar, o aviso de solo lectura */}
          {puedePublicar ? (
            preguntando ? (
              <div className="mb-6 rounded-2xl bg-white/[0.03] p-4 ring-1 ring-inset ring-line sm:p-6">
                <DudaForm
                  modo="duda"
                  lang={lang}
                  autoFocus
                  onCancel={() => setPreguntando(false)}
                  onSubmit={async (valores) => {
                    const ok = await acciones.crear(valores);
                    if (ok) setPreguntando(false);
                    return ok;
                  }}
                />
              </div>
            ) : (
              <Button variant="secondary" onClick={() => setPreguntando(true)} className="mb-6">
                <Plus className="h-4 w-4" aria-hidden="true" />
                {c.preguntar}
              </Button>
            )
          ) : !esProfesor ? (
            <p className="mb-6 text-callout text-ink-3">{c.soloLectura}</p>
          ) : null}

          {estado === 'cargando' ? (
            <div aria-busy="true" className="space-y-6">
              <p role="status" className="sr-only">{c.cargando}</p>
              {[0, 1].map((i) => (
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
            <p role="status" className="max-w-2xl text-pretty text-base leading-relaxed text-ink-2">{c.vacio}</p>
          ) : (
            <ul aria-label={c.bloque(dudas.length)}>
              {dudas.map((d) => (
                <DudaItem key={d._id} duda={d} lang={lang} puedePublicar={puedePublicar} onAccion={accionDe(d._id)} />
              ))}
            </ul>
          )}
        </motion.div>
      ) : null}
    </details>
  );
}
