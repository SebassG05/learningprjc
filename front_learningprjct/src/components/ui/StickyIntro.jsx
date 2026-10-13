/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import { useScenesEnabled } from '../../hooks/useScene';
import { scrollSpring } from '../../lib/motion';

// Introducción de página fijada: el contenido siguiente (con `relative z-10`) se desliza por encima
// mientras el titular se aleja y se funde. Pensado para el inicio de la página (usa el scroll absoluto).
const StickyIntro = ({ children, className = '', distance = 360 }) => {
  const scenes = useScenesEnabled();
  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, scrollSpring);
  // Se funde antes de que el contenido lo cubra, para que no se lean restos entre tarjetas
  const opacity = useTransform(smooth, [0, distance * 0.55], [1, 0]);
  const scale = useTransform(smooth, [0, distance], [1, 0.92]);
  const y = useTransform(smooth, [0, distance], [0, -32]);

  if (!scenes) return <div className={className}>{children}</div>;
  return (
    <motion.div style={{ opacity, scale, y }} className={`sticky top-16 z-0 origin-top will-change-transform ${className}`}>
      {children}
    </motion.div>
  );
};

export default StickyIntro;
