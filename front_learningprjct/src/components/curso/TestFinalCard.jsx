/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, inView } from '../../lib/motion';
import { IconArrowRight, IconCheck, IconLock, IconSeal } from './cierreIcons';
import { tituloTema } from './temas/temasProgress';

// El progreso del curso como perfil del suelo: un horizonte por módulo, de la superficie hacia abajo,
// hasta el lecho, donde está la certificación. Más de seis módulos: se numeran y las bandas se estrechan.
const letras = (n) => (n <= 4 ? ['O', 'A', 'B', 'C'] : n <= 6 ? ['O', 'A', 'E', 'B', 'C', 'R'] : []);
// Grosor de cada horizonte (rem), escritorio / móvil: los profundos son más gruesos, como en un perfil real
const GROSOR = [[3, 2.25], [3.75, 2.5], [4.5, 2.75], [3.5, 2.5], [3.25, 2.25], [3, 2.25]];
const GROSOR_DENSO = [2.25, 2];
// Ámbar aprobado: del amanecer de la superficie al ámbar profundo (gradiente mínimo entre capas)
const ambar = (i, n) => `color-mix(in oklab, #d3933f ${Math.round((n > 1 ? i / (n - 1) : 0) * 100)}%, #f6d7a7)`;

// Test final de certificación: se desbloquea al aprobar los tests de todos los temas
export default function TestFinalCard({ cursoId, temas, completedTests, className = '' }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const tituloId = useId();
  const todosAprobados = temas.length > 0 && temas.every((t) => completedTests?.includes(t._id));
  const aprobado = Boolean(completedTests?.includes('test-final-certificacion'));

  const abrir = () => {
    if (!todosAprobados) return;
    navigate(`/curso/${cursoId}/tema-estudio`, {
      state: {
        tema: { _id: 'test-final-certificacion', titulo: 'Test Final de Certificación', numeroTema: temas.length + 1 },
        material: { titulo: 'Test Final de Certificación' },
        startPhase: 2,
        temaId: 'test-final-certificacion',
      },
    });
  };

  const hechos = temas.map((t) => Boolean(completedTests?.includes(t._id)));
  const nHechos = hechos.filter(Boolean).length;
  const faltan = temas.length - nHechos;
  const L = letras(temas.length);
  // Orden de tinte: solo cuentan los horizontes aprobados, de arriba abajo
  const ordenTinte = hechos.map((h, i) => (h ? hechos.slice(0, i).filter(Boolean).length : -1));
  // La secuencia completa dura lo mismo con 4 módulos que con 20
  const FILL_STEP = Math.min(0.14, 0.9 / Math.max(nHechos, 1));
  const revelarSello = (reduce ? 0 : nHechos * FILL_STEP + 0.35);

  const fill = {
    hidden: reduce ? { opacity: 0 } : { scaleY: 0 },
    show: (k) => ({
      ...(reduce ? { opacity: 1 } : { scaleY: 1 }),
      transition: { delay: k * FILL_STEP, duration: reduce ? duration.base : duration.scene, ease: ease.outExpo },
    }),
  };
  const fade = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: duration.reveal, ease: ease.outExpo } } };

  const estado = aprobado
    ? 'Certificación aprobada. Puedes volver a abrir el test cuando quieras.'
    : todosAprobados
      ? `Has aprobado los ${temas.length} módulos: el test final ya está disponible.`
      : `Llevas ${nHechos} de ${temas.length} módulos. Aprueba los tests de los ${temas.length} módulos para desbloquear el test final.`;

  return (
    <motion.section
      data-cierre
      aria-labelledby={tituloId}
      initial="hidden"
      whileInView="show"
      viewport={inView}
      className={`grid grid-cols-[minmax(0,1fr)] gap-y-10 [grid-template-areas:'head'_'perfil'_'accion'] lg:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] lg:gap-x-20 lg:gap-y-10 lg:[grid-template-areas:'perfil_head'_'perfil_accion'] xl:gap-x-28 ${className}`}
    >
      <motion.header variants={fade} className="[grid-area:head] lg:self-end">
        <h2 id={tituloId} className="font-sans text-title-2 font-semibold text-ink">
          Test final de certificación
        </h2>
        <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-ink-2">
          Evaluación final integradora sobre todos los contenidos del curso. Cubre los {temas.length} módulos del curso para obtener la certificación.
        </p>
      </motion.header>

      {/* Perfil del suelo: horizontes (módulos) sobre el lecho (certificación) */}
      <div className="[grid-area:perfil]">
        <ol aria-label={`Módulos aprobados: ${nHechos} de ${temas.length}`}>
          {temas.map((tema, i) => {
            const [hLg, hSm] = temas.length > 6 ? GROSOR_DENSO : GROSOR[i];
            const color = ambar(i, temas.length);
            return (
              <li
                key={tema._id}
                style={{ '--h': `${hLg}rem`, '--h-sm': `${hSm}rem` }}
                className="flex h-[var(--h-sm)] items-stretch gap-4 sm:h-[var(--h)] sm:gap-5"
              >
                <div
                  className={`relative w-14 shrink-0 overflow-hidden sm:w-20 ${i === 0 ? 'rounded-t-xl' : ''}`}
                  style={{ backgroundColor: `rgb(255 255 255 / ${0.075 - (i / Math.max(temas.length - 1, 1)) * 0.035})` }}
                >
                  {hechos[i] && (
                    <motion.span
                      aria-hidden="true"
                      variants={fill}
                      custom={ordenTinte[i]}
                      className="absolute inset-0 origin-top"
                      style={{ backgroundImage: `linear-gradient(to bottom, ${color}, color-mix(in oklab, ${color} 88%, black))` }}
                    />
                  )}
                  {i > 0 && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-black/35" />}
                </div>
                <div className={`flex min-w-0 flex-1 items-center gap-3 ${i === 0 ? '' : 'border-t border-line'}`}>
                  <span aria-hidden="true" className="w-4 shrink-0 text-[0.6875rem] font-semibold tabular-nums tracking-[0.06em] text-ink-3">
                    {L[i] ?? i + 1}
                  </span>
                  <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-sm text-ink [mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]">
                    <span className="sr-only">Módulo {i + 1}: </span>
                    {tituloTema(tema)}
                  </span>
                  <span className={`shrink-0 text-footnote ${hechos[i] ? 'text-[#f1c98a]' : 'text-ink-3'}`}>
                    {hechos[i] ? 'Aprobado' : 'Pendiente'}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Lecho: la certificación */}
        <div className="flex items-center gap-4 border-t border-line-strong pt-5 sm:gap-5">
          <div className="flex w-14 shrink-0 justify-center sm:w-20">
            <span
              className={`relative grid size-12 place-items-center rounded-full sm:size-14 ${
                aprobado
                  ? 'bg-[linear-gradient(to_bottom,#f6d7a7,#e4ad5b)] text-[#1a1206]'
                  : todosAprobados
                    ? 'bg-[#f6d7a7]/10 text-[#f6d7a7] ring-1 ring-[#f6d7a7]/45'
                    : 'bg-white/[0.045] text-ink-3 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]'
              }`}
            >
              {aprobado ? <IconCheck className="size-6" /> : todosAprobados ? <IconSeal className="size-6" /> : <IconLock className="size-5" />}
              {/* Al desbloquearse, el cristal esmerilado se aclara después de teñirse los horizontes */}
              {todosAprobados && (
                <motion.span
                  aria-hidden="true"
                  variants={{ hidden: { opacity: 1 }, show: { opacity: 0, transition: { delay: revelarSello, duration: duration.slow, ease: ease.outExpo } } }}
                  className="absolute inset-0 grid place-items-center rounded-full bg-[#1b1b1e] text-ink-3 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                >
                  <IconLock className="size-5" />
                </motion.span>
              )}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">Certificación</p>
            <p className="text-footnote text-ink-3">
              {aprobado ? 'Obtenida' : todosAprobados ? 'Disponible' : `Faltan ${faltan} ${faltan === 1 ? 'módulo' : 'módulos'}`}
            </p>
          </div>
        </div>
      </div>

      <motion.div variants={fade} className="[grid-area:accion] lg:self-start">
        <dl className="grid max-w-xl grid-cols-3 border-t border-line">
          {[
            ['Preguntas', '40'],
            ['Duración', '90 min'],
            ['Nota mínima', '70 %'],
          ].map(([k, v], i) => (
            <div key={k} className={`pt-4 ${i ? 'border-l border-line pl-4 sm:pl-6' : ''}`}>
              <dt className="text-footnote text-ink-3">{k}</dt>
              <dd className="mt-1 text-title-3 font-semibold tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 max-w-[52ch] text-sm text-ink-2">{estado}</p>

        <button
          type="button"
          onClick={abrir}
          aria-disabled={!todosAprobados || undefined}
          className={`group mt-6 inline-flex items-center gap-4 rounded-full py-1.5 pl-6 pr-1.5 text-button-lg font-semibold ${
            todosAprobados
              ? aprobado
                ? 'bg-white/[0.06] text-ink ring-1 ring-line-strong hover:bg-white/[0.09]'
                : 'bg-brand text-on-brand shadow-glow hover:bg-brand-300'
              : 'cursor-not-allowed bg-white/[0.04] text-ink-3 ring-1 ring-line'
          }`}
        >
          {todosAprobados ? (aprobado ? 'Abrir el test de nuevo' : 'Iniciar test final') : 'Test final bloqueado'}
          <span
            className={`grid size-9 place-items-center rounded-full transition-transform duration-[var(--duration-base)] ease-[var(--ease-out-expo)] ${
              !todosAprobados ? 'bg-white/[0.04]' : `group-hover:translate-x-0.5 ${aprobado ? 'bg-white/[0.06]' : 'bg-black/10'}`
            }`}
          >
            {todosAprobados ? <IconArrowRight className="size-[1.125rem]" /> : <IconLock className="size-[1.125rem]" />}
          </span>
        </button>
      </motion.div>
    </motion.section>
  );
}
