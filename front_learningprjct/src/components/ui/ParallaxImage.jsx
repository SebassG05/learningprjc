/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useRef } from 'react';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

// Imagen con parallax ligado al scroll: la foto se desplaza más despacio que su marco.
const ParallaxImage = ({ src, srcSet, sizes, alt = '', className = '', children, strength = 12 }) => {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={reduce ? undefined : { y, scale: 1 + (strength * 2.2) / 100 }}
        className="absolute inset-0 h-full w-full object-cover will-change-transform"
      />
      {children}
    </div>
  );
};

export default ParallaxImage;
