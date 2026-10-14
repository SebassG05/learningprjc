/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contenedor cuya altura sigue a su contenido con un muelle (login ↔ registro, mensajes que aparecen).
// La altura se mide con ResizeObserver y solo cambia cuando cambia el contenido, nunca por frame.
// El relleno interior compensado (-m / p) evita recortar los anillos de foco con overflow-hidden.
import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { spring } from '../../lib/motion';

export default function AutoHeight({ children, className = '' }) {
  const inner = useRef(null);
  const [height, setHeight] = useState('auto');
  const reduce = useReducedMotion();

  useLayoutEffect(() => {
    const el = inner.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => setHeight(entry.borderBoxSize?.[0]?.blockSize ?? el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <motion.div
      className={`-m-2 overflow-hidden ${className}`}
      initial={false}
      animate={{ height }}
      transition={reduce ? { duration: 0 } : spring.gentle}
    >
      <div ref={inner} className="relative p-2">{children}</div>
    </motion.div>
  );
}
