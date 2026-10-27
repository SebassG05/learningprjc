/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, Download, ExternalLink, RotateCcw, X } from 'lucide-react';
import useFocusTrap from '../../../hooks/useFocusTrap';
import { lockPage } from '../../../lib/modalLock';
import { duration, ease, overlay, spring } from '../../../lib/motion';
import { loadTemario } from './temarioPdf';

/**
 * Visor del temario a pantalla completa (escritorio y tabletas con puntero). En táctil no se usa: el
 * PDF se abre en una pestaña con el visor nativo (ver TemarioPdf).
 * Accesibilidad: role=dialog + aria-modal, fondo inerte, foco atrapado y devuelto, Escape cierra.
 */
export default function TemarioModal({ open, ...props }) {
  // En <body>: la transición de página crea un contexto de apilamiento y el visor quedaría debajo de
  // los botones flotantes (subir, etc.)
  return createPortal(<AnimatePresence>{open ? <Dialog key="temario" {...props} /> : null}</AnimatePresence>, document.body);
}

function Dialog({ cursoId, materialId, lang = 'es', numero, titulo, filename, accent, onClose, onNotAllowed, t }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const titleId = useId();
  const [state, setState] = useState({ status: 'loading', url: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => lockPage(), []);
  useFocusTrap(ref, true, onClose);

  useEffect(() => {
    const ctrl = new AbortController();
    let blobUrl = null;
    setState({ status: 'loading', url: null });
    loadTemario(cursoId, materialId, ctrl.signal, lang)
      .then(({ url, external }) => {
        blobUrl = url ?? null;
        setState({ status: 'ready', url: url ?? external });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        if (err.status === 401 || err.status === 403) onNotAllowed?.();
        else setState({ status: 'error', url: null });
      });
    return () => {
      ctrl.abort();
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [cursoId, materialId, lang, attempt, onNotAllowed]);

  const action =
    'inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-callout font-semibold transition-[background-color,transform] duration-150 ease-out-expo active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

  return (
    <div className="fixed inset-0 z-[70]" style={{ '--accent': accent }}>
      <motion.div {...overlay} aria-hidden="true" className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.985 }}
        animate={reduce ? { opacity: 1, transition: { duration: duration.fast } } : { opacity: 1, y: 0, scale: 1, transition: spring.gentle }}
        exit={reduce ? { opacity: 0, transition: { duration: duration.fast } } : { opacity: 0, y: 16, scale: 0.985, transition: { duration: duration.fast, ease: ease.exit } }}
        className="absolute inset-2 flex flex-col overflow-hidden rounded-[1.75rem] bg-surface shadow-raised ring-1 ring-inset ring-line-strong sm:inset-4 lg:inset-x-[max(2rem,calc((100vw-80rem)/2))] lg:inset-y-6"
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface-2/80 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="text-footnote font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{`${t.eyebrow} · ${numero.toString().padStart(2, '0')}`}</p>
            <h2 id={titleId} className="truncate text-title-3 font-semibold text-ink">{titulo}</h2>
          </div>
          {state.status === 'ready' ? (
            <>
              <a href={state.url} download={filename} className={`${action} bg-[var(--accent)] text-on-brand [@media(hover:hover)]:hover:brightness-110`}>
                <Download className="h-4 w-4" aria-hidden="true" />
                {t.descargar}
              </a>
              <a href={state.url} target="_blank" rel="noopener noreferrer" className={`${action} hidden bg-white/[0.06] text-ink ring-1 ring-inset ring-line-strong sm:inline-flex [@media(hover:hover)]:hover:bg-white/[0.1]`}>
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                {t.abrirPestana}
              </a>
            </>
          ) : null}
          <button type="button" onClick={onClose} aria-label={t.cerrar} className={`${action} w-11 px-0 text-ink-2 hover:text-ink [@media(hover:hover)]:hover:bg-white/[0.08]`}>
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="relative flex-1 bg-surface-3">
          {state.status === 'ready' ? (
            <iframe title={titulo} src={`${state.url}#view=FitH&toolbar=1&navpanes=0`} className="absolute inset-0 h-full w-full" />
          ) : null}
          {state.status === 'loading' ? (
            <div role="status" className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-ink-2">
              <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-2 border-line-strong border-t-[var(--accent)]" />
              <span className="text-callout">{t.cargandoPdf}</span>
            </div>
          ) : null}
          {state.status === 'error' ? (
            <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <AlertCircle className="h-7 w-7 text-danger" aria-hidden="true" />
              <p className="text-callout text-ink">{t.errorPdf}</p>
              <button type="button" onClick={() => setAttempt((n) => n + 1)} className={`${action} bg-white/[0.08] text-ink ring-1 ring-inset ring-line-strong`}>
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                {t.reintentar}
              </button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
