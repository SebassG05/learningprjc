/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check, ChevronDown, ClipboardCheck, Download, FileText, Loader } from 'lucide-react';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { fadeUp, inView, staggerGroup, stagger } from '../../../lib/motion';
import TemaPlayer from './TemaPlayer';
import { downloadTemario, temarioFilename, temarioRoute } from './temarioPdf';
import { etapa, numerarApartados, prefersNativePdf, totalApartados } from './temasProgress';

const NEAR_MARGIN = '800px 0px'; // las URLs del vídeo se piden un poco antes de que la escena llegue

const PRIMARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-callout font-semibold text-on-brand shadow-[0_10px_30px_-12px_var(--accent)] transition-[transform,filter,box-shadow] duration-200 ease-out-expo active:scale-[0.97] [@media(hover:hover)]:hover:brightness-110 [@media(hover:hover)]:hover:shadow-[0_14px_36px_-12px_var(--accent)] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)]';
const SECONDARY =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/[0.06] px-5 text-callout font-semibold text-ink ring-1 ring-inset ring-line-strong transition-[transform,background-color] duration-200 ease-out-expo active:scale-[0.97] [@media(hover:hover)]:hover:bg-white/[0.1] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--accent)] disabled:opacity-60';

// Material que hace de temario: el primer PDF del tema
const temarioDe = (tema) => (tema.materiales ?? []).find((m) => m.tipo === 'pdf') ?? tema.materiales?.[0] ?? null;

/**
 * Un tema como escena a pantalla completa: número grande, título, vídeo, conceptos clave, acciones del
 * temario y del test e índice plegable. Entra con fundido y desplazamiento al llegar a la pantalla.
 */
const TemaEscena = forwardRef(function TemaEscena(
  { tema, index, sceneId, cursoId, idioma, t, isSeen, onSeen, completed, onToggleCompleted, testInfo, testPassed, onOpenTest, onOpenTemario },
  ref,
) {
  const e = etapa(index);
  const nativePdf = prefersNativePdf({ coarse: useMediaQuery('(pointer: coarse)'), hoverNone: useMediaQuery('(hover: none)') });
  const localRef = useRef(null);
  const [near, setNear] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const titulo = idioma === 'en' && tema.tituloEn ? tema.tituloEn : tema.titulo;
  const descripcion = idioma === 'en' && tema.descripcionEn ? tema.descripcionEn : tema.descripcion;
  const material = temarioDe(tema);
  const apartados = numerarApartados(tema.apartados);
  const total = totalApartados(tema.apartados);
  const numero = String(tema.numeroTema).padStart(2, '0');
  const filename = temarioFilename(tema.numeroTema, tema.titulo);
  const label = idioma === 'en' ? e.en : e.es;
  const titleId = `${sceneId}-titulo`;

  // Una sola vez: cuando la escena se acerca, se piden las URLs del vídeo (y no se sueltan al alejarse)
  useEffect(() => {
    const el = localRef.current;
    if (!el || near) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return undefined;
    }
    const io = new IntersectionObserver(([entry]) => entry.isIntersecting && setNear(true), { rootMargin: NEAR_MARGIN });
    io.observe(el);
    return () => io.disconnect();
  }, [near]);

  const descargar = async () => {
    setDownloading(true);
    try {
      await downloadTemario(cursoId, material._id, filename);
    } catch (err) {
      console.error('No se pudo descargar el temario:', err);
    } finally {
      setDownloading(false);
    }
  };

  const setRefs = (node) => {
    localRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  return (
    <li
      ref={setRefs}
      id={sceneId}
      data-index={index}
      aria-labelledby={titleId}
      style={{ '--accent': e.accent }}
      className="relative flex min-h-[100svh] scroll-mt-[calc(var(--spacing-header)+4rem)] flex-col justify-center py-[clamp(3.5rem,10vh,7.5rem)] lg:scroll-mt-[var(--spacing-header-lg)]"
    >
      {/* Luz ambiental del tema: estática, solo color */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%] bg-[radial-gradient(50%_60%_at_30%_20%,color-mix(in_oklab,var(--accent)_10%,transparent),transparent_70%)]"
      />

      <motion.div variants={staggerGroup(stagger.cards)} initial="hidden" whileInView="show" viewport={inView} className="relative">
        {/* Cabecera de la escena */}
        <motion.div variants={fadeUp} className="flex items-end gap-5 sm:gap-8">
          <span
            aria-hidden="true"
            className="select-none pb-2 font-display text-[clamp(5.5rem,17vw,12.5rem)] font-extralight leading-[0.78] tracking-[-0.05em] text-[var(--accent)] tabular-nums"
          >
            {numero}
          </span>
          <p className="mb-3 flex flex-col gap-1 sm:mb-5">
            <span className="text-footnote font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{t.stage(tema.numeroTema, label)}</span>
            {isSeen ? (
              <span className="inline-flex items-center gap-1.5 text-footnote text-ink-2">
                <Check className="h-3.5 w-3.5 text-[var(--accent)]" aria-hidden="true" />
                {t.seen}
              </span>
            ) : null}
          </p>
        </motion.div>

        <motion.h3 variants={fadeUp} id={titleId} tabIndex={-1} className="tema-titulo mt-4 max-w-4xl text-balance text-title-1 font-semibold text-ink">
          {titulo}
        </motion.h3>
        {descripcion ? (
          <motion.p variants={fadeUp} className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-ink-2">
            {descripcion}
          </motion.p>
        ) : null}

        {/* Vídeo destacado */}
        {tema.video ? (
          <motion.div variants={fadeUp} className="mt-10 lg:mt-14">
            <TemaPlayer cursoId={cursoId} temaId={tema._id} numero={tema.numeroTema} titulo={titulo} near={near} onSeen={onSeen} t={t} />
          </motion.div>
        ) : null}

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-14">
          <motion.div variants={fadeUp} className="flex flex-col gap-8">
            {/* Conceptos clave */}
            {tema.conceptosClave?.length ? (
              <div>
                <h4 className="text-footnote font-semibold uppercase tracking-[0.14em] text-ink-3">{t.conceptos}</h4>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {tema.conceptosClave.map((c) => (
                    <li
                      key={c}
                      className="inline-flex min-h-9 items-center gap-2 rounded-full bg-white/[0.04] px-3.5 text-callout text-ink ring-1 ring-inset ring-line-strong backdrop-blur-md"
                    >
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Temario */}
            {material ? (
              <div className="flex flex-wrap gap-3">
                {nativePdf ? (
                  <a href={temarioRoute(cursoId, material._id)} target="_blank" rel="noopener" className={PRIMARY}>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {t.verTemario}
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                ) : (
                  <button type="button" onClick={() => onOpenTemario(tema, material)} aria-haspopup="dialog" className={PRIMARY}>
                    <FileText className="h-4 w-4" aria-hidden="true" />
                    {t.verTemario}
                  </button>
                )}
                <button type="button" onClick={descargar} disabled={downloading} aria-busy={downloading || undefined} className={SECONDARY}>
                  {downloading ? <Loader className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Download className="h-4 w-4" aria-hidden="true" />}
                  {t.descargar}
                </button>
              </div>
            ) : null}

            {/* Progreso: estudiado y test del tema */}
            <div className="flex flex-col gap-2 border-t border-line pt-6">
              {material ? (
                <button
                  type="button"
                  onClick={() => onToggleCompleted(material._id)}
                  aria-pressed={completed}
                  className="group flex min-h-12 items-center justify-between gap-4 rounded-2xl px-4 text-left transition-colors duration-200 [@media(hover:hover)]:hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <span className={`text-callout font-medium ${completed ? 'text-[var(--accent)]' : 'text-ink'}`}>{completed ? t.estudiado : t.marcar}</span>
                  <span
                    aria-hidden="true"
                    className={`flex h-7 w-7 items-center justify-center rounded-full ring-1 ring-inset transition-[background-color,box-shadow] duration-200 ${completed ? 'bg-[var(--accent)] text-on-brand ring-transparent' : 'text-transparent ring-line-strong'}`}
                  >
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                </button>
              ) : null}
              {testInfo ? (
                <button
                  type="button"
                  onClick={() => onOpenTest(tema)}
                  className="group flex min-h-12 items-center justify-between gap-4 rounded-2xl px-4 text-left transition-colors duration-200 [@media(hover:hover)]:hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
                >
                  <span className="flex items-center gap-3 text-callout font-medium text-ink">
                    <ClipboardCheck className={`h-5 w-5 ${testPassed ? 'text-[var(--accent)]' : 'text-ink-2'}`} aria-hidden="true" />
                    {testPassed ? t.testAprobado : t.test(testInfo)}
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-ink-3 transition-transform duration-200 ease-out-expo [@media(hover:hover)]:group-hover:-translate-y-0.5 [@media(hover:hover)]:group-hover:translate-x-0.5" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          </motion.div>

          {/* Índice del temario, plegable */}
          {total ? (
            <motion.div variants={fadeUp}>
              <details className="tema-indice group/indice rounded-3xl bg-surface/70 ring-1 ring-inset ring-line backdrop-blur-xl">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 rounded-3xl px-5 py-4 text-callout font-semibold text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center gap-3">
                    <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                    {t.indice(total)}
                  </span>
                  <ChevronDown className="h-5 w-5 shrink-0 text-ink-2 transition-transform duration-300 ease-out-expo group-open/indice:rotate-180" aria-hidden="true" />
                </summary>
                <div className="tema-indice-body px-5 pb-6 sm:px-6">
                  {apartados.map((a) => (
                    <section key={a.titulo} className="border-t border-line pt-4 first:border-t-0 first:pt-0 [&+&]:mt-4">
                      <h5 className="text-footnote font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{a.titulo}</h5>
                      <ol className="mt-2 space-y-1.5">
                        {a.items.map((item) => (
                          <li key={item.n} className="grid grid-cols-[2rem_minmax(0,1fr)] text-callout leading-snug text-ink-2">
                            <span className="tabular-nums text-ink-3">{item.n}</span>
                            <span>{item.titulo}</span>
                          </li>
                        ))}
                      </ol>
                    </section>
                  ))}
                </div>
              </details>
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </li>
  );
});

export default TemaEscena;
