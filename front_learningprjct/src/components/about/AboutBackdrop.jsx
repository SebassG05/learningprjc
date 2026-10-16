// Fondo de Sobre Nosotros: el cielo verde de la home, una capa de estrellas, una aurora y el borde del globo.
// Todo CSS (degradados, sin blur ni backdrop-filter). La aurora solo deriva con escenas activas
// (≥ 768 px y sin reduced motion) y se pausa fuera de pantalla sin pasar por React.
import { useEffect, useRef } from 'react';
import { useScenesEnabled } from '../../hooks/useScene';

export default function AboutBackdrop() {
  const scenes = useScenesEnabled();
  const auroraRef = useRef(null);

  useEffect(() => {
    const el = auroraRef.current;
    if (!scenes || !el) return undefined;
    const io = new IntersectionObserver(([entry]) => el.classList.toggle('about-paused', !entry.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, [scenes]);

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-header bottom-0 -z-10 overflow-hidden lg:-top-header-lg">
      <div className="about-sky absolute inset-0" />
      <div className="about-sky-top absolute inset-x-0 top-0 h-[130dvh]" />
      <div className="about-stars absolute inset-x-0 top-0 h-[110dvh]" />
      <div ref={auroraRef} className={`about-aurora absolute -left-[20%] -top-[15dvh] h-[80dvh] w-[90vw] ${scenes ? 'about-drift' : ''}`} />
      <div className="about-limb absolute -right-[40rem] top-24 hidden aspect-square w-[56rem] rounded-full md:block xl:-right-[32rem]" />
      {/* Luz tenue a media página: los valores y el equipo no caen en negro plano */}
      <div className="about-sky-mid absolute left-1/2 top-[38%] h-[90rem] w-[140vw] -translate-x-1/2" />
    </div>
  );
}
