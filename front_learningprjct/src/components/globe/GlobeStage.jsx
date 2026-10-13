/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contenedor del fondo 3D en el DOM. Reserva su espacio (sin saltos de layout), pinta un
// resplandor CSS mientras tanto y carga el lienzo cuando la página ya está pintada.
// Pausa el render si el hero no está a la vista, si la pestaña está oculta o si la escena ya
// salió por el scroll. Sin WebGL (o si el lienzo falla) muestra la imagen estática.
import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease } from '../../lib/motion';

const GlobeCanvas = lazy(() => import('./GlobeCanvas'));

const FALLBACK_SRC = '/inicio/globo.webp';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

class CanvasBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const FallbackImage = ({ layout }) => (
  <>
    <Placeholder layout={layout} />
    <img
    src={FALLBACK_SRC}
    alt=""
    decoding="async"
    className={layout === 'center'
      ? 'absolute inset-0 h-full w-full object-contain'
      : 'absolute right-0 top-1/2 h-[92%] w-auto max-w-none -translate-y-1/2 object-contain'}
    />
  </>
);

// Resplandor de marca mientras carga el lienzo (los gradientes no cuentan como LCP)
function Placeholder({ layout }) {
  return (
  <div
    className={`pointer-events-none absolute aspect-square rounded-full bg-[radial-gradient(closest-side,rgb(161_219_135/0.16),rgb(161_219_135/0.05)_60%,transparent)] ${layout === 'center' ? 'inset-[12%]' : 'right-[6%] top-1/2 h-[78%] -translate-y-1/2'}`}
    />
  );
}

export default function GlobeStage({ progress, layout = 'side', extras, observe, className = '', style, children }) {
  const reduce = useReducedMotion();
  const host = useRef(null);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const [running, setRunning] = useState(true);
  const webgl = useMemo(hasWebGL, []);
  const quality = useMemo(() => (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches ? 'low' : 'high'), []);

  // Carga diferida: después del evento load y en un momento ocioso, para no competir con el texto del hero
  useEffect(() => {
    let idle;
    let timer;
    const go = () => {
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      else timer = setTimeout(() => setReady(true), 200);
    };
    if (document.readyState === 'complete') go();
    else window.addEventListener('load', go, { once: true });
    return () => {
      window.removeEventListener('load', go);
      if (idle) window.cancelIdleCallback?.(idle);
      clearTimeout(timer);
    };
  }, []);

  // Pausa: fuera de pantalla, pestaña oculta o escena ya terminada por el scroll
  useEffect(() => {
    const el = observe?.current ?? host.current;
    if (!el) return undefined;
    let inView = true;
    const sync = () => {
      const done = progress ? progress.get() > 0.86 : false;
      setRunning(inView && !document.hidden && !done);
    };
    const io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; sync(); });
    io.observe(el);
    document.addEventListener('visibilitychange', sync);
    const unsub = progress?.on('change', sync);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', sync);
      unsub?.();
    };
  }, [observe, progress]);

  return (
    <motion.div ref={host} aria-hidden="true" style={style} className={`pointer-events-none ${className}`}>
      {!webgl ? (
        <FallbackImage layout={layout} />
      ) : (
        <>
          {!shown && <Placeholder layout={layout} />}
          {ready && (
            <CanvasBoundary fallback={<FallbackImage layout={layout} />}>
              <Suspense fallback={null}>
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                  animate={shown ? { opacity: 1, scale: 1 } : undefined}
                  transition={{ duration: duration.reveal * 1.4, ease: ease.outExpo }}
                >
                  <GlobeCanvas
                    progress={progress}
                    layout={layout}
                    quality={quality}
                    animate={!reduce}
                    running={running}
                    extras={extras}
                    onReady={() => setShown(true)}
                  />
                </motion.div>
              </Suspense>
            </CanvasBoundary>
          )}
        </>
      )}
      {children}
    </motion.div>
  );
}
