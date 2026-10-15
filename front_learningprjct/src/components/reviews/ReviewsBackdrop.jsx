/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Fondo de Reseñas: una aurora. Base profunda con matiz verde, cortinas de luz verde (y un toque de
// amanecer) que derivan despacio, destellos que parpadean y se desplazan muy poco con el cursor, y una
// ligera parallax de las auroras con el scroll. Sin espacio ni WebGL: CSS y SVG, solo transform y
// opacidad. En móvil, menos capas; con reduced motion, todo quieto.
import { useEffect, useRef } from 'react';
import { motion, useInView, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';

// Destellos en posiciones fijas (pseudoaleatorias y estables entre renders)
const SPARKLES = Array.from({ length: 34 }, (_, i) => {
  const r = (n) => ((Math.sin(i * 12.9898 + n * 78.233) * 43758.5453) % 1 + 1) % 1;
  return { x: r(1) * 100, y: r(2) * 70, size: 0.6 + r(3) * 1.4, delay: r(4) * 5.5, dawn: i % 7 === 0, mobile: i % 3 === 0 };
});
const DRIFT = 14; // px máximos que se desplazan con el cursor

function Sparkles({ reduce }) {
  const ref = useRef(null);
  const visible = useInView(ref);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const x = useSpring(px, { stiffness: 40, damping: 20 });
  const y = useSpring(py, { stiffness: 40, damping: 20 });

  useEffect(() => {
    // Solo con ratón, visible y sin reduced motion; un listener pasivo que mueve motion values
    if (reduce || !visible || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    const onMove = (e) => {
      px.set((e.clientX / window.innerWidth - 0.5) * -2 * DRIFT);
      py.set((e.clientY / window.innerHeight - 0.5) * -2 * DRIFT);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [reduce, visible, px, py]);

  return (
    <motion.div ref={ref} style={{ x, y }} className={`absolute inset-x-0 top-0 h-[120dvh] ${visible ? '' : 'reviews-paused'}`}>
      {SPARKLES.map((s, i) => (
        <span
          key={i}
          className={`reviews-twinkle absolute rounded-full ${s.dawn ? 'bg-dawn' : 'bg-brand-100'} ${s.mobile ? '' : 'hidden sm:block'}`}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size * 2, height: s.size * 2, animationDelay: `-${s.delay}s` }}
        />
      ))}
    </motion.div>
  );
}

export default function ReviewsBackdrop() {
  const reduce = useReducedMotion();
  // Parallax suave de las auroras con el scroll de la página
  const { scrollY } = useScroll();
  const lift = useTransform(scrollY, [0, 900], [0, reduce ? 0 : -120]);
  const auroraRef = useRef(null);
  const auroraVisible = useInView(auroraRef);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 -top-header -z-10 overflow-hidden lg:-top-header-lg">
      <div className="reviews-sky absolute inset-0" />

      <motion.div ref={auroraRef} style={{ y: lift }} className={`absolute inset-x-0 top-0 h-[130dvh] ${auroraVisible ? '' : 'reviews-paused'}`}>
        <div className="reviews-aurora absolute -left-[12%] -top-[14%] h-[60vh] w-[70vw] bg-brand-500/35" />
        <div className="reviews-aurora reviews-aurora-slow absolute -right-[16%] top-[2%] h-[55vh] w-[55vw] bg-night-teal" />
        <div className="reviews-aurora absolute left-[30%] top-[38%] hidden h-[38vh] w-[45vw] bg-brand-300/20 sm:block" />
        <div className="reviews-aurora reviews-aurora-slow absolute right-[8%] top-[48%] hidden h-[30vh] w-[30vw] bg-dawn/12 sm:block" />
      </motion.div>

      <Sparkles reduce={reduce} />

      {/* Funde con el pie */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-canvas" />
      <div className="contact-grain absolute inset-0" />
    </div>
  );
}
