/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Titular de Sobre Nosotros. Se pinta en el primer frame (es el LCP): solo sube con transform, nunca desde opacity 0.
import { INTRO } from './aboutCopy';

export default function AboutHero({ className = '' }) {
  return (
    <header className={`relative ${className}`}>
      <div aria-hidden="true" className="about-halo about-light pointer-events-none absolute -left-[20%] -top-24 -z-10 h-[34rem] w-[min(64rem,140vw)]" />
      <h1 className="about-rise max-w-[12ch] text-balance text-display font-bold text-ink">
        Sobre <span className="text-brand-400">Evenor-Tech</span>
      </h1>
      <p className="about-rise about-rise-late mt-8 max-w-[56ch] text-pretty text-lg text-gray-200 sm:mt-10">{INTRO}</p>
      {/* Señal de scroll: solo en pantallas medianas+, donde el hero deja aire debajo. Un punto baja tres veces y se queda. */}
      <span aria-hidden="true" className="pointer-events-none absolute bottom-12 left-0 hidden h-16 w-1 overflow-hidden md:block">
        <span className="about-cue absolute inset-y-0 left-1/2 w-px -translate-x-1/2" />
        <span className="about-cue-dot absolute left-0 top-0 h-2 w-1 rounded-full bg-brand-200" />
      </span>
    </header>
  );
}
