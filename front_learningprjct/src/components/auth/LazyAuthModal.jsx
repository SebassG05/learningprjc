/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Component, lazy, Suspense, useRef, useState } from 'react';
import { loadAuthModal } from './loadAuthModal';

// Si el chunk no llega, no se rompe la app: no se pinta nada y el siguiente intento reintenta
class LoadBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onFail();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

// Misma API que AuthModal. No descarga ni monta nada hasta la primera apertura; después se queda
// montado para que el cierre pueda animarse.
export default function LazyAuthModal({ open, onClose }) {
  const [opened, setOpened] = useState(open);
  const [attempt, setAttempt] = useState(0);
  // React.lazy recuerda un fallo para siempre: cada reintento usa un componente diferido nuevo
  const modal = useRef({ attempt: -1, Component: null });
  if (modal.current.attempt !== attempt) modal.current = { attempt, Component: lazy(loadAuthModal) };

  if (open && !opened) setOpened(true);
  if (!opened) return null;

  const AuthModal = modal.current.Component;
  const onFail = () => {
    // Con conexión, lo normal es un chunk de un despliegue anterior: una carga completa de /login
    // trae el bundle nuevo y abre el acceso. Sin conexión no se puede acceder: se deja como estaba.
    if (navigator.onLine && window.location.pathname !== '/login') {
      window.location.assign('/login');
      return;
    }
    setOpened(false);
    setAttempt((n) => n + 1);
    onClose?.();
  };
  return (
    <LoadBoundary key={attempt} onFail={onFail}>
      <Suspense fallback={null}>
        <AuthModal open={open} onClose={onClose} />
      </Suspense>
    </LoadBoundary>
  );
}
