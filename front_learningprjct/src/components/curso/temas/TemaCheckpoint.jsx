/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Check, ClipboardCheck } from 'lucide-react';
import { ease } from '../../../lib/motion';

const R = 26;
const C = 2 * Math.PI * R;

/**
 * Test del tema como «checkpoint» del recorrido: tarjeta con el color del tema y un anillo de ESTADO:
 * vacío mientras no se ha aprobado y completo con ✓ al aprobar (se dibuja al entrar en pantalla; nada con
 * reduced motion). La nota para aprobar va solo en el texto: en el anillo parecería progreso.
 * Toda la tarjeta es el botón; el círculo de la flecha crece al pasar por encima. En móvil: anillo y
 * flecha arriba, texto debajo.
 */
export default function TemaCheckpoint({ numero, info, passed, onOpen, t }) {
  const reduce = useReducedMotion();
  const fill = passed ? 1 : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group/test relative flex w-full flex-wrap items-center gap-x-5 gap-y-4 overflow-hidden rounded-[1.75rem] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--accent)_16%,var(--color-surface-2)),var(--color-surface)_70%)] p-5 text-left shadow-card sm:flex-nowrap ring-1 ring-inset ring-[color-mix(in_oklab,var(--accent)_35%,transparent)] transition-[transform,box-shadow] duration-300 ease-out-expo active:scale-[0.985] sm:gap-6 sm:p-7 [@media(hover:hover)]:hover:-translate-y-0.5 [@media(hover:hover)]:hover:shadow-[0_24px_48px_-24px_color-mix(in_oklab,var(--accent)_60%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]"
    >
      {/* Anillo: arco hasta la nota para aprobar; completo y con ✓ si ya está aprobado */}
      <span aria-hidden="true" className="relative flex h-16 w-16 shrink-0 items-center justify-center sm:h-[4.5rem] sm:w-[4.5rem]">
        <svg viewBox="0 0 64 64" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="32" cy="32" r={R} fill="none" stroke="rgb(255 255 255 / 0.1)" strokeWidth="4" />
          <motion.circle
            cx="32"
            cy="32"
            r={R}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: reduce ? C * (1 - fill) : C }}
            whileInView={{ strokeDashoffset: C * (1 - fill) }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{ duration: reduce ? 0 : 1.1, ease: ease.outExpo, delay: reduce ? 0 : 0.15 }}
          />
        </svg>
        {passed ? (
          <Check className="relative h-7 w-7 text-[var(--accent)]" strokeWidth={2.5} />
        ) : (
          <ClipboardCheck className="relative h-6 w-6 text-ink-2 sm:h-7 sm:w-7" strokeWidth={1.75} />
        )}
      </span>

      <span className="order-3 min-w-0 basis-full sm:order-none sm:basis-auto sm:flex-1">
        <span className="block text-footnote font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{t.checkpoint(numero)}</span>
        <span className="mt-1.5 block text-xl font-semibold leading-snug text-ink sm:text-2xl">{passed ? t.testSuperado : t.testTitulo}</span>
        <span className="mt-1.5 block text-callout text-ink-2 sm:text-base">{passed ? t.verResultados : t.testMeta(info)}</span>
      </span>

      <span
        aria-hidden="true"
        className="ml-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] sm:ml-0 text-on-brand shadow-[0_10px_24px_-10px_var(--accent)] transition-transform duration-300 ease-out-expo sm:h-14 sm:w-14 [@media(hover:hover)]:group-hover/test:scale-110"
      >
        <ArrowRight className="h-5 w-5 transition-transform duration-300 ease-out-expo sm:h-6 sm:w-6 [@media(hover:hover)]:group-hover/test:translate-x-0.5" strokeWidth={2.5} />
      </span>
    </button>
  );
}
