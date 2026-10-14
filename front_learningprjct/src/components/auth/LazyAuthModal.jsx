/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { lazy, Suspense, useState } from 'react';
import { preloadAuthModal } from './loadAuthModal';

const AuthModal = lazy(preloadAuthModal);

// Misma API que AuthModal. No descarga ni monta nada hasta la primera apertura; después se queda
// montado para que el cierre pueda animarse.
export default function LazyAuthModal({ open, onClose }) {
  const [opened, setOpened] = useState(open);
  if (open && !opened) setOpened(true);
  if (!opened) return null;
  return (
    <Suspense fallback={null}>
      <AuthModal open={open} onClose={onClose} />
    </Suspense>
  );
}
