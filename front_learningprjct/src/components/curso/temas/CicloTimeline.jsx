/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion, useReducedMotion } from 'framer-motion';
import { Check } from 'lucide-react';
import { HEADER_OFFSET, glideTo } from '../../../lib/smoothScroll';
import { spring } from '../../../lib/motion';
import { etapa } from './temasProgress';

const scrollToScene = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  // Posición absoluta (no el elemento): Lenis sumaría además el scroll-margin de la escena
  glideTo(el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET);
  // El foco acompaña al salto (teclado y lectores de pantalla): al título de la escena, sin volver a desplazar
  el.querySelector('h3')?.focus({ preventScroll: true });
};

/**
 * Recorrido del curso como ciclo del carbono: suelo → dinámica → modelos → práctica.
 * Escritorio: raíl vertical fijo junto a las escenas; el trazo se rellena hasta el tema actual.
 * Móvil y tableta: barra translúcida fija bajo la cabecera con los cuatro tramos, de borde a borde
 * (cancela el padding del contenedor de CursoDetalle: px-4 / sm:px-6).
 * Cada punto lleva a su escena; el actual se anuncia con aria-current="step". El nombre accesible es el texto
 * visible (WCAG 2.5.3) más lo que solo se lee («Tema», «vídeo visto»).
 */
export default function CicloTimeline({ temas, active, seen, sceneId, idioma, t }) {
  const reduce = useReducedMotion();
  const total = temas.length;
  const progress = total > 1 ? active / (total - 1) : 1;
  const fill = reduce ? { duration: 0 } : spring.glide;

  const items = temas.map((tema, i) => {
    const e = etapa(i);
    return { tema, i, e, label: idioma === 'en' ? e.en : e.es, isSeen: seen.has(String(tema._id)), isActive: i === active };
  });

  return (
    <nav aria-label={t.timelineLabel} className="sticky top-header z-30 -mx-4 mb-8 sm:-mx-6 lg:static lg:mx-0 lg:mb-0">
      {/* ---- Móvil / tableta ---- */}
      <div className="glass-nav lg:hidden">
        <ol className="relative flex px-2 sm:px-4">
          {items.map(({ tema, i, e, label, isSeen, isActive }) => (
            <li key={tema._id} className="flex-1">
              <button
                type="button"
                onClick={() => scrollToScene(sceneId(tema))}
                aria-current={isActive ? 'step' : undefined}
                style={{ '--accent': e.accent }}
                className="group relative flex h-14 w-full flex-col items-center justify-center gap-0.5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[var(--accent)]"
              >
                <span className={`flex items-center gap-1 text-footnote font-semibold tabular-nums transition-colors duration-200 ${isActive ? 'text-[var(--accent)]' : 'text-ink-3'}`}>
                  {isSeen ? <Check className="h-3 w-3" aria-hidden="true" /> : null}
                  <span className="sr-only">{t.temaWord} </span>
                  {String(tema.numeroTema).padStart(2, '0')}
                </span>
                <span className={`text-[0.75rem] leading-none transition-colors duration-200 ${isActive ? 'text-ink' : 'text-ink-3'}`}>
                  {label}
                  {isSeen ? <span className="sr-only">, {t.seen}</span> : null}
                </span>
                {/* Tramo del ciclo: se rellena con el acento al pasar por él */}
                <span aria-hidden="true" className="absolute inset-x-1 bottom-0 h-0.5 overflow-hidden rounded-full bg-white/[0.08]">
                  <motion.span
                    initial={false}
                    animate={{ scaleX: i <= active ? 1 : 0 }}
                    transition={fill}
                    className="block h-full origin-left rounded-full bg-[var(--accent)]"
                  />
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* ---- Escritorio ---- */}
      <div className="hidden h-full lg:block">
        <div className="sticky top-[calc(var(--spacing-header-lg)+2.5rem)]">
          <p className="eyebrow mb-6 text-ink-3">{t.timelineLabel}</p>
          <ol className="relative">
            {/* Trazo del ciclo: pista y relleno (scaleY, solo transform) */}
            <span aria-hidden="true" className="absolute bottom-6 left-[11px] top-6 w-0.5 rounded-full bg-white/[0.08]">
              <motion.span
                initial={false}
                animate={{ scaleY: progress }}
                transition={fill}
                style={{ backgroundImage: `linear-gradient(to bottom, ${items.map(({ e }) => e.accent).join(', ')})` }}
                className="absolute inset-0 origin-top rounded-full"
              />
            </span>
            {items.map(({ tema, e, label, isSeen, isActive }) => (
              <li key={tema._id} className="relative">
                <button
                  type="button"
                  onClick={() => scrollToScene(sceneId(tema))}
                  aria-current={isActive ? 'step' : undefined}
                  style={{ '--accent': e.accent }}
                  className="group flex min-h-12 w-full items-start gap-4 rounded-2xl py-3 pr-2 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                >
                  <span aria-hidden="true" className="relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center">
                    <motion.span
                      initial={false}
                      animate={{ scale: isActive ? 1 : 0.55 }}
                      transition={reduce ? { duration: 0 } : spring.snappy}
                      className={`absolute inset-0 rounded-full ring-2 ring-[var(--accent)] ${isActive ? 'bg-[color-mix(in_oklab,var(--accent)_22%,var(--color-canvas))]' : 'bg-canvas'}`}
                    />
                    {isSeen ? (
                      <span className="relative flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent)] text-on-brand">
                        <Check className="h-3.5 w-3.5" strokeWidth={3} />
                      </span>
                    ) : null}
                  </span>
                  <span className="min-w-0">
                    <span className={`block text-footnote font-semibold uppercase tracking-[0.14em] transition-colors duration-200 ${isActive ? 'text-[var(--accent)]' : 'text-ink-3 group-hover:text-ink-2'}`}>
                      {String(tema.numeroTema).padStart(2, '0')} · {label}
                    </span>
                    <span className={`mt-1 block text-callout leading-snug transition-colors duration-200 ${isActive ? 'text-ink' : 'text-ink-3 group-hover:text-ink-2'}`}>
                      {idioma === 'en' && tema.tituloEn ? tema.tituloEn : tema.titulo}
                      {isSeen ? <span className="sr-only">, {t.seen}</span> : null}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}
