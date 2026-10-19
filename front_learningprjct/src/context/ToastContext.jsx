/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { duration as dur, ease } from '../lib/motion';

const ToastContext = createContext();

// Como mucho tres a la vez: el más antiguo sale cuando llega uno nuevo
const MAX_VISIBLE = 3;
let nextId = 0;

/**
 * Avisos efímeros. `showToast(mensaje, tipo, duración, { action })` sigue funcionando como antes
 * y ahora admite una acción (p. ej. «Deshacer»). Devuelve el id para cerrarlo con `dismissToast`.
 * Cada aviso tiene su propio temporizador (antes el primero cerraba al siguiente), que se pausa
 * mientras el puntero está encima o el foco dentro, y mientras la pestaña está oculta.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    clearTimeout(timers.current.get(id)?.handle);
    timers.current.delete(id);
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const startTimer = useCallback((id, ms) => {
    const handle = setTimeout(() => dismissToast(id), ms);
    timers.current.set(id, { handle, ms, startedAt: Date.now() });
  }, [dismissToast]);

  const pauseTimer = useCallback((id) => {
    const t = timers.current.get(id);
    if (!t || t.paused) return;
    clearTimeout(t.handle);
    timers.current.set(id, { ...t, paused: true, ms: Math.max(800, t.ms - (Date.now() - t.startedAt)) });
  }, []);

  const resumeTimer = useCallback((id) => {
    const t = timers.current.get(id);
    if (t?.paused) startTimer(id, t.ms);
  }, [startTimer]);

  const showToast = useCallback((message, type = 'info', duration = 2500, options = {}) => {
    nextId += 1;
    const id = nextId;
    // Con acción hay que dar tiempo a leerla y pulsarla
    const ms = options.action ? Math.max(duration, 6000) : duration;
    setToasts((list) => {
      const next = [...list, { id, message, type, action: options.action }];
      next.slice(0, Math.max(0, next.length - MAX_VISIBLE)).forEach((t) => clearTimeout(timers.current.get(t.id)?.handle));
      return next.slice(-MAX_VISIBLE);
    });
    startTimer(id, ms);
    return id;
  }, [startTimer]);

  // Pestaña oculta: no se pierde un «Deshacer» que nadie ha visto
  useEffect(() => {
    const onVisibility = () => {
      const ids = [...timers.current.keys()];
      ids.forEach((id) => (document.hidden ? pauseTimer(id) : resumeTimer(id)));
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [pauseTimer, resumeTimer]);

  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t.handle)), []);

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} onPause={pauseTimer} onResume={resumeTimer} />
    </ToastContext.Provider>
  );
}

// Colores: info=neutro, success=marca, error=peligro
const DOT = { success: 'bg-brand', error: 'bg-danger', info: 'bg-ink-2' };

function ToastRegion({ toasts, onDismiss, onPause, onResume }) {
  const reduce = useReducedMotion();
  return (
    <div
      role="region"
      aria-label="Avisos"
      // Cada aviso anuncia por sí mismo; el atributo hace que lockPage no vuelva inerte la región
      // (un «Deshacer» tiene que poder pulsarse aunque haya un panel modal abierto)
      aria-live="off"
      className="pointer-events-none fixed inset-x-4 bottom-[max(1.5rem,env(safe-area-inset-bottom))] z-[9999] flex flex-col items-center gap-2 sm:inset-x-auto sm:right-6 sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!reduce}
            role={toast.type === 'error' ? 'alert' : 'status'}
            aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98, transition: { duration: dur.fast, ease: ease.exit } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onPointerEnter={() => onPause(toast.id)}
            onPointerLeave={() => onResume(toast.id)}
            onFocus={() => onPause(toast.id)}
            onBlur={() => onResume(toast.id)}
            className="pointer-events-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-line material-thick py-2 pl-5 pr-2 text-sm font-medium text-ink shadow-overlay"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${DOT[toast.type] ?? DOT.info}`} aria-hidden="true" />
            <span className="py-1.5 pr-3">{toast.message}</span>
            {toast.action ? (
              <button
                type="button"
                onClick={() => {
                  toast.action.onClick();
                  onDismiss(toast.id);
                }}
                className="min-h-11 shrink-0 rounded-full px-4 font-semibold text-brand-300 transition-colors duration-150 hover:bg-white/[0.08] focus-visible:outline-2 focus-visible:outline-brand-400 active:scale-[0.97]"
              >
                {toast.action.label}
              </button>
            ) : null}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
