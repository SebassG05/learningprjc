/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Fragment, useState, useEffect, useId, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import { duration, ease, inView, spring } from '../../lib/motion';
import {
  IconArrowRight, IconArrowUpRight, IconChart, IconCheck, IconChevronDown, IconDoc, IconFlask, IconLock, IconRetry, IconSearch, IconUpload, IconWrench,
} from './cierreIcons';

const TIPOS = {
  simulacion: ['Simulación', IconFlask],
  practica: ['Práctica', IconWrench],
  analisis: ['Análisis', IconChart],
  investigacion: ['Investigación', IconSearch],
};
const NIVELES = { basico: ['Básico', 1], intermedio: ['Intermedio', 2], avanzado: ['Avanzado', 3] };
// Alto del expediente plegado: el contexto se corta con un fundido, sin puntos suspensivos
const PLEGADO = 132;

// Franjas de estrato del borde superior: el perfil del test final, a escala de expediente
const ESTRATOS = 'linear-gradient(to bottom, rgb(246 215 167 / 0.28) 0 1px, transparent 1px 4px, rgb(246 215 167 / 0.16) 4px 5px, transparent 5px 10px, rgb(246 215 167 / 0.09) 10px 11px, transparent 11px 17px, rgb(246 215 167 / 0.05) 17px 18px)';

// Fila del expediente: rótulo a la izquierda y contenido a la derecha (apilado en móvil)
const Apartado = ({ titulo, children }) => (
  <section className="grid gap-3 border-t border-line pt-6 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-10">
    <h4 className="font-sans text-footnote font-semibold uppercase tracking-[0.12em] text-ink-3">{titulo}</h4>
    <div className="min-w-0">{children}</div>
  </section>
);

// soloLectura: edición del curso privado ya cerrada (se ve todo, pero no se entrega)
export default function EjercicioOptativo({ ejercicio, cursoId, soloLectura = false }) {
  const [expandido, setExpandido] = useState(false);
  const [entrega, setEntrega] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();
  const reduce = useReducedMotion();
  const ids = useId();
  const glow = useRef(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    if (!user || !ejercicio?._id) return;
    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/api/entregas/ejercicio/${ejercicio._id}/usuario`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.entregado) setEntrega(data.entrega); })
      .catch(() => {});
  }, [user, ejercicio?._id]);

  if (!ejercicio) return null;

  const [tipo, TipoIcon] = TIPOS[ejercicio.tipo] ?? ['Ejercicio', IconDoc];
  const [nivel, nivelPasos] = NIVELES[ejercicio.dificultad] ?? [ejercicio.dificultad.charAt(0).toUpperCase() + ejercicio.dificultad.slice(1), 0];
  const calificada = entrega && (entrega.calificacion != null || entrega.estado === 'aprobado' || entrega.estado === 'rechazado' || entrega.estado === 'revisado');
  const notaColor = entrega?.calificacion == null
    ? 'text-[#f6d7a7]'
    : entrega.calificacion >= 9
      ? 'text-brand-300'
      : entrega.calificacion >= 7
        ? 'text-brand-400'
        : entrega.calificacion >= 5
          ? 'text-[#f6d7a7]'
          : 'text-danger';

  const entregar = () => navigate(`/curso/${cursoId}/ejercicio/${ejercicio._id}/entregar`, { state: { ejercicio } });

  // Luz que sigue al cursor (solo ratón): se mueve con transform, sin tocar el layout
  const moverLuz = (e) => {
    if (e.pointerType !== 'mouse' || !glow.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    glow.current.style.transform = `translate(${e.clientX - r.left}px, ${e.clientY - r.top}px) translate(-50%, -50%)`;
  };

  const primario = 'group/btn inline-flex items-center justify-center gap-4 rounded-full bg-brand py-1.5 pl-6 pr-1.5 text-button-lg font-semibold text-on-brand shadow-glow hover:bg-brand-300';
  const flecha = 'grid size-9 place-items-center rounded-full bg-black/10 transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/btn:translate-x-0.5';
  const nota = 'inline-flex items-center gap-2.5 rounded-full px-5 py-3 text-sm font-medium';

  const ficha = [
    ['Tipo', <Fragment key="tipo"><TipoIcon className="size-[1.125rem] text-[#f6d7a7]" />{tipo}</Fragment>],
    ['Nivel', (
      <Fragment key="nivel">
        {nivelPasos > 0 && (
          <span aria-hidden="true" className="flex items-end gap-[3px]">
            {[1, 2, 3].map((n) => (
              <span key={n} className={`w-[3px] rounded-full ${n <= nivelPasos ? 'bg-[#f6d7a7]' : 'bg-white/15'}`} style={{ height: `${6 + n * 3}px` }} />
            ))}
          </span>
        )}
        {nivel}
      </Fragment>
    )],
    ['Duración', ejercicio.duracionEstimada],
    ejercicio.esOptativo && ['Carácter', 'Optativo'],
    calificada && ['Calificación', (
      <span key="nota" className={`tabular-nums ${notaColor}`}>
        {entrega.calificacion != null
          ? (entrega.calificacion % 1 === 0 ? entrega.calificacion : Number(entrega.calificacion).toFixed(1))
          : '—'}
        <span className="text-ink-3"> / 10</span>
      </span>
    )],
  ].filter(Boolean);

  return (
    <motion.article
      data-expediente
      aria-labelledby={`${ids}-titulo`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={inView}
      transition={{ duration: duration.reveal, ease: ease.outExpo }}
      onPointerMove={moverLuz}
      className="group/exp relative isolate overflow-hidden rounded-[1.75rem] bg-surface shadow-card ring-1 ring-line transition-shadow duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] hover:ring-line-strong"
    >
      <div
        ref={glow}
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-0 -z-10 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(246_215_167/0.07),transparent)] opacity-0 transition-opacity duration-[var(--duration-slow)] ease-[var(--ease-out-expo)] group-hover/exp:opacity-100"
      />
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-[18px] [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]" style={{ backgroundImage: ESTRATOS }} />

      {/* Cabecera: título y ficha técnica */}
      <header className="px-6 pb-8 pt-12 sm:px-10 sm:pt-14">
        <h3 id={`${ids}-titulo`} className="max-w-[34ch] font-sans text-title-2 font-semibold text-ink">
          {ejercicio.titulo}
        </h3>
        <dl className="mt-8 grid grid-cols-2 gap-y-5 border-t border-line pt-5 sm:flex sm:gap-y-0">
          {ficha.map(([k, v], i) => (
            <div key={k} className={`min-w-0 pr-4 sm:pr-8 ${i ? 'sm:border-l sm:border-line sm:pl-8' : ''}`}>
              <dt className="text-footnote text-ink-3">{k}</dt>
              <dd className="mt-1.5 flex items-center gap-2 text-sm font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {/* Cuerpo: plegado muestra el contexto con un fundido; desplegado, el expediente entero */}
      <motion.div
        id={`${ids}-cuerpo`}
        initial={false}
        animate={{ height: expandido ? 'auto' : PLEGADO }}
        transition={reduce ? { duration: 0 } : spring.gentle}
        className="relative overflow-hidden"
      >
        <div className="space-y-8 px-6 pb-4 sm:px-10">
          <Apartado titulo="Contexto">
            <p className="max-w-[68ch] leading-relaxed text-ink-2">{ejercicio.contexto}</p>
          </Apartado>

          <div className="space-y-8" inert={expandido ? undefined : ''} aria-hidden={expandido ? undefined : true}>
            <Apartado titulo="Enunciado">
              <p className="max-w-[68ch] leading-relaxed text-ink-2">{ejercicio.enunciado}</p>
            </Apartado>

            {ejercicio.pasos && ejercicio.pasos.length > 0 && (
              <Apartado titulo="Pasos a seguir">
                <ol className="space-y-7">
                  {ejercicio.pasos.map((paso) => (
                    <li key={paso.numero} className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3">
                      <span className="pt-px text-sm font-semibold tabular-nums text-[#f6d7a7]">{String(paso.numero).padStart(2, '0')}</span>
                      <div>
                        <h5 className="font-sans font-semibold text-ink">{paso.titulo}</h5>
                        <p className="mt-1 text-sm text-ink-2">{paso.descripcion}</p>
                        {paso.detalles && paso.detalles.length > 0 && (
                          <ul className="mt-3 space-y-2">
                            {paso.detalles.map((detalle, idx) => (
                              <li key={idx} className="flex gap-3 text-sm leading-relaxed text-ink-2">
                                <span aria-hidden="true" className="mt-[0.7rem] h-px w-2.5 shrink-0 bg-[#f6d7a7]/60" />
                                <span className="max-w-[68ch]">{detalle}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </Apartado>
            )}

            {ejercicio.entregable && (
              <Apartado titulo="Entregable">
                <div className="rounded-2xl bg-white/[0.03] p-5 ring-1 ring-line sm:p-6">
                  <p className="max-w-[68ch] text-ink">{ejercicio.entregable.descripcion}</p>
                  {ejercicio.entregable.preguntas && ejercicio.entregable.preguntas.length > 0 && (
                    <ol className="mt-4 space-y-3">
                      {ejercicio.entregable.preguntas.map((pregunta, idx) => (
                        <li key={idx} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-2 text-sm leading-relaxed text-ink-2">
                          <span className="font-semibold tabular-nums text-ink-3">{idx + 1}.</span>
                          <span className="max-w-[68ch]">{pregunta}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                  {ejercicio.entregable.limiteCaracteres && (
                    <p className="mt-4 text-footnote text-ink-3">
                      Límite sugerido: {ejercicio.entregable.limiteCaracteres} caracteres (aprox. {Math.round(ejercicio.entregable.limiteCaracteres / 6)} palabras)
                    </p>
                  )}
                </div>
              </Apartado>
            )}

            {ejercicio.recursos && ejercicio.recursos.length > 0 && (
              <Apartado titulo="Recursos necesarios">
                <ul className="divide-y divide-line">
                  {ejercicio.recursos.map((recurso, idx) => (
                    <li key={idx}>
                      <a
                        href={recurso.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/rec flex items-start justify-between gap-4 rounded-lg py-3.5 first:pt-0"
                      >
                        <span className="min-w-0">
                          <span className="block font-medium text-ink underline decoration-transparent underline-offset-4 transition-[text-decoration-color] duration-[var(--duration-fast)] group-hover/rec:decoration-[#f6d7a7]/60">{recurso.titulo}</span>
                          {recurso.descripcion && <span className="mt-1 block text-sm text-ink-2">{recurso.descripcion}</span>}
                        </span>
                        <IconArrowUpRight className="mt-0.5 size-5 shrink-0 text-[#f6d7a7] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] group-hover/rec:-translate-y-0.5 group-hover/rec:translate-x-0.5" />
                      </a>
                    </li>
                  ))}
                </ul>
              </Apartado>
            )}

            {/* Acciones */}
            <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:flex-wrap sm:items-center">
              {/* Ejercicio bloqueado (2 rechazos) */}
              {soloLectura && entrega?.estado !== 'aprobado' ? (
                <div className={`${nota} bg-white/[0.04] text-ink-2 ring-1 ring-line-strong`}>
                  <IconLock className="size-[1.125rem]" />
                  <span>Edición cerrada — ya no se admiten entregas</span>
                </div>
              ) : entrega?.bloqueado ? (
                <div className={`${nota} bg-danger/10 text-danger ring-1 ring-danger/30`}>
                  <IconLock className="size-[1.125rem]" />
                  <span>Ejercicio bloqueado — intentos agotados</span>
                </div>
              ) : entrega?.estado === 'rechazado' ? (
                /* 1er rechazo: permitir reintentar */
                <button type="button" onClick={entregar} className={primario}>
                  Intentar de nuevo
                  <span className={flecha}><IconRetry className="size-[1.125rem]" /></span>
                </button>
              ) : !entrega || entrega.estado === 'enviado' || entrega.estado === 'revisado' || entrega.estado === 'aprobado' ? (
                /* Sin entrega, pendiente de corrección, o aprobado */
                !entrega || entrega.estado !== 'aprobado' ? (
                  <button type="button" onClick={entregar} className={primario}>
                    {entrega ? 'Entrega enviada — en revisión' : 'Entregar ejercicio'}
                    <span className={flecha}>{entrega ? <IconArrowRight className="size-[1.125rem]" /> : <IconUpload className="size-[1.125rem]" />}</span>
                  </button>
                ) : (
                  <div className={`${nota} bg-brand/10 text-brand-300 ring-1 ring-brand/30`}>
                    <IconCheck className="size-[1.125rem]" />
                    <span>¡Ejercicio aprobado!</span>
                  </div>
                )
              ) : null}

              {ejercicio.recursos && ejercicio.recursos.length > 0 && (
                <button
                  type="button"
                  onClick={() => window.open(ejercicio.recursos[0].url, '_blank')}
                  className="inline-flex items-center justify-center gap-2.5 rounded-full px-6 py-3 text-button-lg font-medium text-ink ring-1 ring-line-strong hover:bg-white/[0.05]"
                >
                  Abrir herramienta
                  <IconArrowUpRight className="size-[1.125rem] text-[#f6d7a7]" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Fundido sobre el texto cortado */}
        <motion.div
          aria-hidden="true"
          initial={false}
          animate={{ opacity: expandido ? 0 : 1 }}
          transition={{ duration: duration.base, ease: ease.outExpo }}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-linear-to-b from-transparent to-surface"
        />
      </motion.div>

      <div className="px-6 pb-7 pt-3 sm:px-10 sm:pb-9">
        <button
          type="button"
          aria-expanded={expandido}
          aria-controls={`${ids}-cuerpo`}
          onClick={() => setExpandido((v) => !v)}
          className="group/tg -mx-3 inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-[#f6d7a7] hover:bg-white/[0.04]"
        >
          {expandido ? 'Plegar el expediente' : 'Ver el expediente completo'}
          <IconChevronDown className={`size-[1.125rem] transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] ${expandido ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </motion.article>
  );
}
