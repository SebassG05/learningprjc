import React, { useEffect, useState } from 'react';
import ArrowUpIcon from '../ui/ArrowUpIcon';
import { glideTo } from '../../lib/smoothScroll';

export default function ScrollToTop() {
  const [show, setShow] = useState(false);

  // La posición al cambiar de ruta la restaura App, al terminar la salida de la página

  // Show button on scroll
  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    glideTo(0);
  };

  return (
    <>
      {/* Botón flotante para subir arriba */}
      {show && (
        <button
          onClick={handleClick}
          aria-label="Subir arriba"
          className="fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong material text-ink shadow-raised transition-colors duration-200 hover:bg-white/[0.12] sm:right-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}
