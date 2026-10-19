/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import useFocusTrap from '../../../hooks/useFocusTrap';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { lockPage } from '../../../lib/modalLock';
import { duration, ease, overlay, spring } from '../../../lib/motion';
import { shouldDismissSheet } from '../../auth/validation';
import { focusRing } from './tones';

// Curva tipo iOS para paneles que entran desde un borde
const DRAWER_EASE = [0.32, 0.72, 0, 1];
const WIDTH = { md: 'md:max-w-xl', lg: 'md:max-w-2xl xl:max-w-4xl' };

/**
 * Panel lateral (≥ 768 px) u hoja a pantalla completa (móvil) para trabajar sin salir de la página.
 * role=dialog + aria-modal, fondo inerte, foco atrapado y devuelto al cerrar, Escape cierra.
 * `onClose` se llama para cualquier intento de cierre (X, Escape, fondo, arrastre): el padre decide
 * (p. ej. pedir confirmación si hay cambios sin guardar).
 */
export default function Drawer({ open, ...props }) {
  return <AnimatePresence>{open ? <Panel key="drawer" {...props} /> : null}</AnimatePresence>;
}

function Panel({ title, subtitle, headerExtra, footer, children, onClose, size = 'md', closeLabel = 'Cerrar panel', bodyRef }) {
  const side = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const titleId = useId();
  const subtitleId = useId();
  const drag = useDragControls();

  useEffect(() => lockPage(), []);
  useFocusTrap(ref, true, onClose);

  const fade = { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: duration.fast } };
  const motionProps = reduce
    ? fade
    : side
      ? {
          initial: { x: '100%' },
          animate: { x: 0, transition: { duration: duration.base, ease: DRAWER_EASE } },
          exit: { x: '100%', transition: { duration: duration.fast, ease: ease.exit } },
        }
      : {
          initial: { y: '100%' },
          animate: { y: 0, transition: spring.gentle },
          exit: { y: '100%', transition: { duration: duration.fast, ease: ease.exit } },
          drag: 'y',
          dragListener: false,
          dragControls: drag,
          dragConstraints: { top: 0, bottom: 0 },
          dragElastic: { top: 0, bottom: 0.7 },
          onDragEnd: (_, info) => {
            if (shouldDismissSheet(info.offset.y, info.velocity.y)) onClose();
          },
        };

  return (
    <motion.div
      {...overlay}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex items-end bg-canvas/70 md:items-stretch md:justify-end pointer-fine:backdrop-blur-[2px]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        {...motionProps}
        className={`relative flex h-[calc(100svh-0.5rem)] w-full flex-col overflow-hidden rounded-t-3xl border border-line-strong bg-surface shadow-overlay md:h-full md:rounded-none md:rounded-l-3xl md:border-y-0 md:border-r-0 ${WIDTH[size] ?? WIDTH.md}`}
      >
        {!side && !reduce ? (
          <div
            aria-hidden="true"
            onPointerDown={(e) => drag.start(e)}
            className="flex h-6 shrink-0 cursor-grab touch-none items-center justify-center pt-2 active:cursor-grabbing"
          >
            <span className="h-1.5 w-10 rounded-full bg-line-strong" />
          </div>
        ) : null}

        <header className="flex shrink-0 items-start gap-3 border-b border-line px-5 pb-4 pt-3 md:px-6 md:pt-5">
          <div className="min-w-0 flex-1">
            <h2 id={titleId} className="truncate text-title-3 font-semibold text-ink">{title}</h2>
            {subtitle ? <p id={subtitleId} className="mt-1 truncate text-footnote text-ink-3">{subtitle}</p> : null}
          </div>
          {headerExtra}
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className={`-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink active:scale-[0.97] ${focusRing}`}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div ref={bodyRef} data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6">
          {children}
        </div>

        {footer ? (
          <footer className="shrink-0 border-t border-line bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6">{footer}</footer>
        ) : null}
      </motion.div>
    </motion.div>
  );
}
