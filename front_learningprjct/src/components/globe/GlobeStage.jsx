/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Fondo 3D de la home: un único lienzo fijo detrás de todo el contenido (un solo contexto WebGL)
// cuya cámara viaja del globo del hero al horizonte de la llamada final. El lienzo se carga
// cuando la página ya está pintada y se pausa con la pestaña oculta.
// GlobeAnchor marca en el DOM dónde va el globo del hero: reserva su espacio (sin saltos de
// layout), pinta un resplandor CSS mientras carga y, sin WebGL (o si el lienzo falla), la imagen
// estática.
import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease } from '../../lib/motion';
import { getStatus, resetJourney, setStatus, subscribe, useJourneyHero } from './journey/store';

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
  componentDidCatch() { setStatus('failed'); }
  render() { return this.state.failed ? null : this.props.children; }
}

const FallbackImage = ({ layout }) => (
  <img
    src={FALLBACK_SRC}
    alt=""
    decoding="async"
    className={layout === 'center'
      ? 'absolute inset-0 h-full w-full object-contain'
      : 'absolute right-0 top-1/2 h-[92%] w-auto max-w-none -translate-y-1/2 object-contain'}
  />
);

// Resplandor de marca mientras carga el lienzo (los gradientes no cuentan como LCP)
function Placeholder({ layout }) {
  return (
    <div
      className={`pointer-events-none absolute aspect-square rounded-full bg-[radial-gradient(closest-side,rgb(161_219_135/0.16),rgb(161_219_135/0.05)_60%,transparent)] ${layout === 'center' ? 'inset-[12%]' : 'right-[6%] top-1/2 h-[78%] -translate-y-1/2'}`}
    />
  );
}

export function GlobeAnchor({ layout = 'side', progress = null, className = '', style }) {
  const ref = useRef(null);
  const status = useSyncExternalStore(subscribe, getStatus);
  useJourneyHero(ref, progress, layout);
  return (
    <motion.div ref={ref} aria-hidden="true" style={style} className={`pointer-events-none ${className}`}>
      {status === 'idle' && <Placeholder layout={layout} />}
      {(status === 'nogl' || status === 'failed') && (
        <>
          <Placeholder layout={layout} />
          <FallbackImage layout={layout} />
        </>
      )}
    </motion.div>
  );
}

export default function GlobeStage() {
  const reduce = useReducedMotion();
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(false);
  const [running, setRunning] = useState(true);
  const webgl = useMemo(hasWebGL, []);
  const quality = useMemo(() => (window.matchMedia('(max-width: 767px), (pointer: coarse)').matches ? 'low' : 'high'), []);

  useEffect(() => {
    setStatus(webgl ? 'idle' : 'nogl');
    return () => {
      setStatus('idle');
      resetJourney();
    };
  }, [webgl]);

  // Carga diferida: después del evento load y en un momento ocioso. En móvil (calidad baja)
  // la CPU es limitada: además se espera a la primera interacción (scroll, toque o tecla).
  useEffect(() => {
    if (!webgl) return undefined;
    const INTENT = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'keydown'];
    let idle;
    let timer;
    let loaded = document.readyState === 'complete';
    let intent = quality !== 'low';
    const go = () => {
      if (!loaded || !intent) return;
      if ('requestIdleCallback' in window) idle = window.requestIdleCallback(() => setReady(true), { timeout: 1500 });
      else timer = setTimeout(() => setReady(true), 200);
    };
    const onLoad = () => { loaded = true; go(); };
    const onIntent = () => {
      intent = true;
      INTENT.forEach((type) => window.removeEventListener(type, onIntent));
      go();
    };
    if (!loaded) window.addEventListener('load', onLoad, { once: true });
    if (!intent) INTENT.forEach((type) => window.addEventListener(type, onIntent, { passive: true }));
    go();
    return () => {
      window.removeEventListener('load', onLoad);
      INTENT.forEach((type) => window.removeEventListener(type, onIntent));
      if (idle) window.cancelIdleCallback?.(idle);
      clearTimeout(timer);
    };
  }, [quality, webgl]);

  // Pausa con la pestaña oculta
  useEffect(() => {
    const sync = () => setRunning(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  if (!webgl || !ready) return null;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh">
      <CanvasBoundary>
        <Suspense fallback={null}>
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.985 }}
            animate={shown ? { opacity: 1, scale: 1 } : undefined}
            transition={{ duration: duration.reveal * 1.4, ease: ease.outExpo }}
          >
            <GlobeCanvas
              quality={quality}
              animate={!reduce}
              running={running}
              onReady={() => { setShown(true); setStatus('ready'); }}
            />
          </motion.div>
        </Suspense>
      </CanvasBoundary>
    </div>
  );
}
