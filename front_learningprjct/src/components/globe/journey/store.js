// Puente entre la página y el lienzo del viaje. Es un objeto mutable fuera de React: la UI
// escribe (sección registrada, pregunta abierta, número de reseñas, hover del botón) y el
// lienzo lo lee dentro de useFrame. Nada aquí provoca re-renders del Canvas.
import { useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { journeyPosition } from './keyframes';

export const SECTIONS = ['faq', 'reviews', 'cta'];
const MAX_QUEUED = 8;

export const journey = {
  // Progreso (MotionValue 0→1, de 'start end' a 'end start') y elemento de cada sección
  sections: { faq: null, reviews: null, cta: null },
  elements: { faq: null, reviews: null, cta: null },
  // Hero: progreso de la escena fijada (o null), elemento donde se encaja el globo y su encaje
  hero: { progress: null, anchor: null, layout: 'side' },
  // Elemento sobre cuyo borde inferior se dibuja el horizonte de la llamada final
  horizon: null,
  pulses: [],
  reviews: null, // null = cargando o error
  boost: { on: false, el: null },
  // Escrito por el lienzo en cada frame (encaje actual del globo y pesos de estación)
  frame: null,
};

// Suscripción mínima para lo poco que sí cambia el DOM (estado de carga) o despierta el lienzo
const listeners = new Set();
let version = 0;
const notify = () => { version += 1; listeners.forEach((fn) => fn()); };
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };
export const getVersion = () => version;

let status = 'idle'; // idle | ready | failed | nogl
export const getStatus = () => status;
export function setStatus(next) {
  if (status === next) return;
  status = next;
  notify();
}

// Registra una sección del viaje: su progreso de scroll y su elemento (para montar escenas cerca)
export function useJourneySection(ref, key) {
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  useEffect(() => {
    journey.sections[key] = scrollYProgress;
    journey.elements[key] = ref.current;
    notify();
    return () => {
      if (journey.sections[key] === scrollYProgress) {
        journey.sections[key] = null;
        journey.elements[key] = null;
      }
    };
  }, [key, ref, scrollYProgress]);
}

// Registra el hero: dónde va el globo (elemento) y, si la escena está fijada, su progreso
export function useJourneyHero(anchorRef, progress, layout) {
  useEffect(() => {
    const anchor = anchorRef.current;
    journey.hero = { progress, anchor, layout };
    notify();
    return () => {
      if (journey.hero.anchor === anchor) journey.hero = { progress: null, anchor: null, layout: 'side' };
    };
  }, [anchorRef, progress, layout]);
}

export function useJourneyHorizon(ref) {
  useEffect(() => {
    const el = ref.current;
    journey.horizon = el;
    return () => { if (journey.horizon === el) journey.horizon = null; };
  }, [ref]);
}

// Pulso de la FAQ: sale de (x, y) en píxeles de pantalla hacia el nodo de la pregunta `index`
export function emitPulse(index, x, y) {
  journey.pulses.push({ index, x, y });
  if (journey.pulses.length > MAX_QUEUED) journey.pulses.shift();
  notify();
}

export function takePulse() {
  return journey.pulses.shift();
}

export function setReviewCount(n) {
  if (journey.reviews === n) return;
  journey.reviews = n;
  notify();
}

export function setCtaBoost(on, el) {
  journey.boost.on = on;
  if (el) journey.boost.el = el;
  notify();
}

// Posición continua en la trayectoria (0…3) según el scroll de las secciones registradas
export const progressOf = (mv) => (mv ? mv.get() : null);

export function readPosition() {
  const s = journey.sections;
  return journeyPosition({ faq: progressOf(s.faq), reviews: progressOf(s.reviews), cta: progressOf(s.cta) });
}
