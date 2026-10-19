/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import Button from '../../ui/Button';
import useFocusTrap from '../../../hooks/useFocusTrap';
import { lockPage } from '../../../lib/modalLock';
import { overlay, panel } from '../../../lib/motion';

/**
 * Confirmación antes de una acción destructiva o de perder cambios (sustituye a window.confirm).
 * role=alertdialog; el foco empieza en «Cancelar», la opción segura. Escape cancela.
 */
export default function ConfirmDialog({ open, ...props }) {
  return <AnimatePresence>{open ? <Dialog key="confirm" {...props} /> : null}</AnimatePresence>;
}

function Dialog({ title, description, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', destructive = false, busy = false, onConfirm, onCancel }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => lockPage(), []);
  useFocusTrap(ref, true, () => !busy && onCancel());

  return (
    <motion.div {...overlay} className="fixed inset-0 z-[80] flex items-center justify-center bg-canvas/75 p-4">
      <motion.div
        ref={ref}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        {...(reduce ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } } : panel)}
        className="w-full max-w-md rounded-3xl border border-line-strong bg-surface p-6 shadow-overlay"
      >
        <h2 id={titleId} className="text-title-3 font-semibold text-ink">{title}</h2>
        {description ? <p id={descId} className="mt-2 text-callout text-ink-2">{description}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={busy}>{cancelLabel}</Button>
          <Button
            onClick={onConfirm}
            disabled={busy}
            aria-busy={busy || undefined}
            className={destructive ? 'bg-danger! text-canvas! hover:bg-danger/90! shadow-none!' : ''}
          >
            {confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
