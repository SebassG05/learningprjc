/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Planeta del acceso fuera de la home: la misma escena del viaje, en un lienzo propio que se monta
// solo mientras el diálogo está abierto y ya encajada junto al panel (modo `portal`). Se pausa con
// la pestaña oculta. Sin WebGL (o si el lienzo falla) queda el horizonte al amanecer en CSS.
import { Component, lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease } from '../../lib/motion';

const GlobeCanvas = lazy(() => import('./GlobeCanvas'));

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
  componentDidCatch() { this.props.onFail?.(); }
  render() { return this.state.failed ? null : this.props.children; }
}

const Horizon = () => (
  <div className="absolute left-[66%] top-[62%] aspect-square w-[160vh] -translate-x-1/2 rounded-full bg-canvas shadow-[0_-24px_120px_-24px_var(--color-brand-400)] ring-1 ring-brand-400/40" />
);

export default function AuthGlobe() {
  const reduce = useReducedMotion();
  const webgl = useMemo(hasWebGL, []);
  const [failed, setFailed] = useState(false);
  const [shown, setShown] = useState(false);
  const [running, setRunning] = useState(!document.hidden);

  useEffect(() => {
    const sync = () => setRunning(!document.hidden);
    document.addEventListener('visibilitychange', sync);
    return () => document.removeEventListener('visibilitychange', sync);
  }, []);

  if (!webgl || failed) return <Horizon />;

  return (
    <CanvasBoundary onFail={() => setFailed(true)}>
      <Suspense fallback={null}>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, scale: reduce ? 1 : 0.985 }}
          animate={shown ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: duration.reveal, ease: ease.outExpo }}
        >
          <GlobeCanvas quality="high" portal animate={!reduce} running={running} onReady={() => setShown(true)} />
        </motion.div>
      </Suspense>
    </CanvasBoundary>
  );
}
