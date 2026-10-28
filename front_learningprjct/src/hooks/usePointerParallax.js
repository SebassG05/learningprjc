import { useEffect } from 'react';

const clamp = (v) => Math.max(-1, Math.min(1, v));

// Parallax sutil: escribe --px y --py (de -1 a 1) en el elemento siguiendo el puntero, el toque o la
// inclinación del móvil, y el CSS las convierte en transform por capas. Solo hay bucle de animación
// mientras el valor se mueve (en una pestaña oculta rAF no corre); con reduced motion no hace nada
export default function usePointerParallax(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;

    const tick = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      el.style.setProperty('--px', current.x.toFixed(4));
      el.style.setProperty('--py', current.y.toFixed(4));
      const moving = Math.abs(target.x - current.x) + Math.abs(target.y - current.y) > 0.001;
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const aim = (x, y) => {
      target.x = clamp(x);
      target.y = clamp(y);
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onPointer = (e) => aim((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    // La postura con la que se sostiene el móvil al llegar es el centro; 30° de giro llevan al tope
    let restBeta = null;
    const onTilt = (e) => {
      if (e.gamma == null || e.beta == null) return;
      restBeta ??= e.beta;
      aim(e.gamma / 30, (e.beta - restBeta) / 30);
    };

    window.addEventListener('pointermove', onPointer, { passive: true });
    window.addEventListener('pointerdown', onPointer, { passive: true });
    window.addEventListener('deviceorientation', onTilt, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onPointer);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('deviceorientation', onTilt);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}
