import { useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion';
import { glideTo } from '../../lib/smoothScroll';
import { duration, ease } from '../../lib/motion';

const SHOW_AFTER = 200;

export default function ScrollToTop() {
  const { scrollY } = useScroll();
  const [show, setShow] = useState(false);

  // La posición al cambiar de ruta la restaura App, al terminar la salida de la página

  // Solo re-renderiza al cruzar el umbral, no en cada fotograma de scroll
  useMotionValueEvent(scrollY, 'change', (y) => {
    const next = y > SHOW_AFTER;
    setShow((prev) => (prev === next ? prev : next));
  });

  // Con reduced-motion glideTo salta sin animación
  const handleClick = () => {
    glideTo(0);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          type="button"
          onClick={handleClick}
          aria-label="Volver arriba"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1, transition: { duration: duration.base, ease: ease.outExpo } }}
          exit={{ opacity: 0, scale: 0.85, transition: { duration: duration.fast, ease: ease.exit } }}
          className="fixed bottom-6 right-4 z-40 flex size-11 items-center justify-center rounded-full border border-line-strong material text-ink shadow-raised hover:bg-surface-3 sm:right-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
