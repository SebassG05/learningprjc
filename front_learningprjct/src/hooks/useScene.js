import { useReducedMotion, useScroll, useSpring } from 'framer-motion';
import useMediaQuery from './useMediaQuery';
import { scrollSpring } from '../lib/motion';

// ¿Se usan escenas fijadas? Solo en pantallas medianas+ y sin reduced-motion.
export function useScenesEnabled() {
  const wide = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion();
  return wide && !reduce;
}

// Progreso de una escena (0→1) suavizado con un muelle: inercia sin re-renders.
export function useSceneProgress(ref, offset = ['start start', 'end end']) {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return useSpring(scrollYProgress, scrollSpring);
}
