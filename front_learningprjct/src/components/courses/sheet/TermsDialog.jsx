/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useDragControls, useScroll } from 'framer-motion';
import { Check, Loader, X } from 'lucide-react';
import Button from '../../ui/Button';
import useFocusTrap from '../../../hooks/useFocusTrap';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { lockPage } from '../../../lib/modalLock';
import { fetchTerms } from '../../../lib/coursesApi';
import { duration, ease, overlay, panel, spring } from '../../../lib/motion';
import { shouldDismissSheet } from '../../auth/validation';
import { SHEET, TERMS_DIALOG, formatTermsDate } from '../coursesCopy';

/**
 * Paso previo a inscribirse (o a seguir en el aula tras un cambio de versión): el texto completo de las
 * condiciones en una región con scroll. La casilla solo se habilita al llegar al final del texto
 * (un centinela observado dentro de la región) y el botón de confirmar, solo con la casilla marcada.
 * El backend vuelve a comprobarlo todo: esto es la experiencia, no la validación.
 *
 * Accesibilidad: role=dialog + aria-modal, fondo inerte, foco atrapado y devuelto al cerrar, Escape cierra.
 * La región es enfocable (flechas / AvPág) y recibe el foco al cargar; la pista que explica por qué la
 * casilla está deshabilitada es su descripción y se anuncia al cambiar.
 * Móvil: hoja inferior que se cierra arrastrando el asa hacia abajo. Escritorio: panel centrado.
 */
export default function TermsDialog({ open, ...props }) {
  return <AnimatePresence>{open ? <Dialog key="terms" {...props} /> : null}</AnimatePresence>;
}

function Dialog({ mode = 'enroll', courseTitle, language, sending = false, onConfirm, onClose }) {
  const sheet = !useMediaQuery('(min-width: 640px)');
  const ref = useRef(null);
  const regionRef = useRef(null);
  const endRef = useRef(null);
  const titleId = useId();
  const metaId = useId();
  const hintId = useId();
  const drag = useDragControls();
  const { scrollYProgress } = useScroll({ container: regionRef });

  const [state, setState] = useState({ status: 'loading', terms: null });
  const [attempt, setAttempt] = useState(0);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [checked, setChecked] = useState(false);
  const { terms } = state;

  const close = () => {
    if (!sending) onClose();
  };

  useEffect(() => lockPage(), []);
  useFocusTrap(ref, true, close);

  useEffect(() => {
    let alive = true;
    setState({ status: 'loading', terms: null });
    fetchTerms()
      .then((t) => alive && setState({ status: 'ready', terms: t }))
      .catch(() => alive && setState({ status: 'error', terms: null }));
    return () => {
      alive = false;
    };
  }, [attempt]);

  // Con el texto ya pintado: el foco va a la región (se lee y se desplaza con el teclado)
  // y se observa el final del documento. Si el texto cabe entero, el final ya se ve.
  useEffect(() => {
    if (state.status !== 'ready' || !regionRef.current || !endRef.current) return undefined;
    regionRef.current.focus({ preventScroll: true });
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setReachedEnd(true);
      },
      { root: regionRef.current, threshold: 1 }
    );
    io.observe(endRef.current);
    return () => io.disconnect();
  }, [state.status]);

  const motionProps = sheet
    ? {
        initial: { y: '100%' },
        animate: { y: 0, transition: spring.gentle },
        exit: { y: '100%', transition: { duration: duration.base, ease: ease.exit } },
        drag: 'y',
        dragListener: false,
        dragControls: drag,
        dragConstraints: { top: 0, bottom: 0 },
        dragElastic: { top: 0, bottom: 0.7 },
        onDragEnd: (_, info) => {
          if (shouldDismissSheet(info.offset.y, info.velocity.y)) close();
        },
      }
    : panel;

  const confirmLabel = TERMS_DIALOG.confirm[mode] ?? TERMS_DIALOG.confirm.enroll;
  const meta = terms ? [TERMS_DIALOG.meta(terms.version, formatTermsDate(terms.updatedAt)), courseTitle].filter(Boolean).join(' · ') : courseTitle;

  return (
    <motion.div
      {...overlay}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex items-end justify-center bg-canvas/75 sm:items-center sm:p-6 pointer-fine:backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={metaId}
        {...motionProps}
        className="relative flex max-h-[92svh] w-full flex-col overflow-hidden rounded-t-3xl border border-line-strong bg-surface shadow-overlay sm:max-h-[min(88svh,54rem)] sm:max-w-2xl sm:rounded-3xl"
      >
        {sheet ? (
          <div
            aria-hidden="true"
            onPointerDown={(e) => drag.start(e)}
            className="flex h-7 shrink-0 cursor-grab touch-none items-center justify-center pt-2 active:cursor-grabbing"
          >
            <span className="h-1.5 w-10 rounded-full bg-line-strong" />
          </div>
        ) : null}

        <header className="flex items-start gap-4 px-6 pb-4 pt-3 sm:px-8 sm:pt-8">
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-ink-3">{TERMS_DIALOG.eyebrow[mode === 'reaccept' ? 'reaccept' : 'enroll']}</p>
            <h2 id={titleId} className="mt-2 text-title-3 font-semibold text-ink sm:text-title-2">{terms?.title ?? (state.status === 'error' ? TERMS_DIALOG.fallbackTitle : TERMS_DIALOG.loading)}</h2>
            {meta ? <p id={metaId} className="mt-2 text-footnote text-ink-3">{meta}</p> : null}
          </div>
          <button
            type="button"
            onClick={close}
            aria-label={TERMS_DIALOG.close}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-2 hover:bg-white/[0.06] hover:text-ink"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col px-6 sm:px-8">
          {/* Progreso de lectura: solo transform */}
          <motion.div aria-hidden="true" style={{ scaleX: scrollYProgress }} className="absolute inset-x-6 top-0 z-10 h-0.5 origin-left rounded-full bg-brand sm:inset-x-8" />
          <div
            ref={regionRef}
            role="region"
            aria-label={TERMS_DIALOG.textRegion}
            aria-describedby={hintId}
            tabIndex={0}
            data-lenis-prevent
            className="min-h-40 flex-1 overflow-y-auto overscroll-contain rounded-2xl bg-surface-2 px-5 py-5 ring-1 ring-inset ring-line outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:px-6"
          >
            {state.status === 'loading' ? (
              <p role="status" className="flex items-center gap-2 text-callout text-ink-3">
                <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                {TERMS_DIALOG.loading}
              </p>
            ) : null}
            {state.status === 'error' ? (
              <div role="alert" className="flex flex-col items-start gap-3">
                <p className="text-callout text-ink-2">{TERMS_DIALOG.loadError}</p>
                <Button variant="secondary" size="sm" onClick={() => setAttempt((n) => n + 1)}>{TERMS_DIALOG.retry}</Button>
              </div>
            ) : null}
            {terms ? (
              <div className="space-y-6 text-callout text-ink-2">
                {mode === 'reaccept' ? <p className="font-medium text-ink">{TERMS_DIALOG.reacceptLead}</p> : null}
                <p>{terms.intro}</p>
                {terms.sections.map((s) => (
                  <section key={s.heading} className="space-y-2">
                    <h3 className="text-callout font-semibold text-ink">{s.heading}</h3>
                    {s.paragraphs.map((t) => <p key={t}>{t}</p>)}
                  </section>
                ))}
                <p ref={endRef} className="flex items-center gap-3 pt-2 text-footnote text-ink-3">
                  <span aria-hidden="true" className="h-px w-6 bg-line-strong" />
                  {TERMS_DIALOG.endOfDocument(terms.version)}
                </p>
              </div>
            ) : null}
          </div>
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-x-6 bottom-0 h-16 rounded-b-2xl bg-linear-to-t from-surface-2 to-transparent transition-opacity duration-300 sm:inset-x-8 ${reachedEnd || !terms ? 'opacity-0' : 'opacity-100'}`}
          />
        </div>

        <footer className="space-y-4 px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5 sm:px-8 sm:pb-8">
          <p id={hintId} aria-live="polite" className={`flex items-center gap-2 text-footnote font-medium ${reachedEnd ? 'text-brand' : 'text-ink-3'}`}>
            {reachedEnd ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" /> : null}
            {reachedEnd ? TERMS_DIALOG.reachedEnd : TERMS_DIALOG.scrollHint}
          </p>
          <label className={`flex items-start gap-3 ${reachedEnd ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
            <input
              type="checkbox"
              checked={checked}
              disabled={!reachedEnd}
              onChange={(e) => setChecked(e.target.checked)}
              aria-describedby={hintId}
              className="mt-0.5 h-5 w-5 shrink-0 accent-brand-400"
            />
            <span className="text-callout text-ink">{TERMS_DIALOG.checkbox}</span>
          </label>
          {language && mode !== 'reaccept' ? <p className="text-footnote text-ink-3">{TERMS_DIALOG.language(SHEET.languageNames[language])}</p> : null}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button variant="ghost" size="lg" onClick={close} disabled={sending}>{TERMS_DIALOG.cancel}</Button>
            <Button size="lg" disabled={!checked || sending || !terms} aria-busy={sending || undefined} onClick={() => onConfirm(terms.version)}>
              {sending ? (
                <>
                  <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  {TERMS_DIALOG.sending}
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </footer>
      </motion.div>
    </motion.div>
  );
}
