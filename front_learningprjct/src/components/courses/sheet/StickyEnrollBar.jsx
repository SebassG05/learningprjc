/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { duration, ease, spring } from '../../../lib/motion';
import EnrollButton from './EnrollButton';

// true cuando ninguno de los elementos observados está en pantalla
function useAllOffscreen(refs) {
  const [offscreen, setOffscreen] = useState(false);
  useEffect(() => {
    const els = refs.map((r) => r.current).filter(Boolean);
    if (els.length === 0) return undefined;
    const visible = new Set();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) visible.add(e.target);
        else visible.delete(e.target);
      }
      setOffscreen(visible.size === 0);
    });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [refs]);
  return offscreen;
}

// CTA fija abajo en móvil: aparece cuando el botón de la portada y el del cierre no se ven.
// Respeta la zona segura del iPhone y avisa (--bottom-bar) para que «Volver arriba» suba con ella.
// Sin blur en táctil: fondo casi sólido, que en gama baja no cuesta fotogramas.
export default function StickyEnrollBar({ watch, meta, cta }) {
  const offscreen = useAllOffscreen(watch);
  const barRef = useRef(null);

  useEffect(() => {
    const root = document.documentElement;
    if (offscreen && barRef.current) root.style.setProperty('--bottom-bar', `${barRef.current.offsetHeight}px`);
    else root.style.removeProperty('--bottom-bar');
    return () => root.style.removeProperty('--bottom-bar');
  }, [offscreen]);

  return (
    <AnimatePresence>
      {offscreen ? (
        <motion.div
          ref={barRef}
          initial={{ y: '100%' }}
          animate={{ y: 0, transition: spring.gentle }}
          exit={{ y: '100%', transition: { duration: duration.fast, ease: ease.exit } }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden"
        >
          <div className="flex items-center justify-between gap-4 px-gutter">
            <p className="min-w-0 truncate text-footnote font-semibold text-ink-2">{meta}</p>
            <EnrollButton {...cta} size="md" className="shrink-0" />
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
