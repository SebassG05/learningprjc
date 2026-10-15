/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Superficie del panel "Tu turno": cristal translúcido con borde de luz. Responde a la puntuación:
// el halo crece con cada estrella y un haz en el borde superior se va cargando; con 5 estrellas se
// tiñe de amanecer. Solo opacidad y transform (scaleX del haz); con reduced motion, sin muelles.
import { motion, useReducedMotion } from 'framer-motion';
import { duration, ease, spring } from '../../lib/motion';

export default function ReviewStation({ rating = 0, className = '', children }) {
  const reduce = useReducedMotion();
  const charge = rating / 5;
  const full = rating === 5;
  const move = reduce ? { duration: duration.fast } : spring.gentle;

  return (
    <div className={`reviews-station relative isolate rounded-3xl material shadow-raised ${className}`}>
      {/* Halo que crece con la puntuación */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-10 -z-10 rounded-[3rem] bg-brand-400/25 blur-3xl"
        initial={false}
        animate={{ opacity: 0.25 + charge * 0.75 }}
        transition={{ duration: duration.slow, ease: ease.outExpo }}
      />
      {/* Haz que se carga en el borde superior */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-6 top-0 h-px overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full origin-left bg-linear-to-r from-brand-300 to-brand-100"
          initial={false}
          animate={{ scaleX: charge }}
          transition={move}
        />
        <motion.div
          className="absolute inset-0 origin-left bg-linear-to-r from-brand-200 to-dawn"
          initial={false}
          animate={{ opacity: full ? 1 : 0 }}
          transition={{ duration: duration.base }}
        />
      </div>
      <div className="relative p-6 sm:p-8">{children}</div>
    </div>
  );
}
