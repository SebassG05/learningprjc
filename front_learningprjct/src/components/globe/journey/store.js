// Puente entre la página y el lienzo del viaje. Es un objeto mutable fuera de React: la UI
// escribe (sección registrada, pregunta abierta, número de reseñas, hover del botón) y el
// lienzo lo lee dentro de useFrame. Nada aquí provoca re-renders del Canvas.
import { useEffect } from 'react';
import { useScroll } from 'framer-motion';
import { journeyPosition } from './keyframes.js';

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
  // Hay un diálogo modal abierto (acceso): el lienzo se atenúa y se ralentiza
  overlay: false,
  // Escrito por el lienzo en cada frame (encaje actual del globo y pesos de estación)
  frame: null,
};

// Suscripción mínima para lo poco que sí cambia el DOM (estado de carga) o despierta el lienzo
const listeners = new Set();
const notify = () => listeners.forEach((fn) => fn());
export const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn); };

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
        notify();
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
  journey.pulses.push({ index, x, y, at: performance.now() });
  if (journey.pulses.length > MAX_QUEUED) journey.pulses.shift();
  notify();
}

// Siguiente pulso pendiente; los de hace más de un segundo se descartan (su origen ya no es válido)
const PULSE_TTL = 1000;
export function takePulse() {
  const now = performance.now();
  while (journey.pulses.length && now - journey.pulses[0].at > PULSE_TTL) journey.pulses.shift();
  return journey.pulses.shift();
}

export function setReviewCount(n) {
  if (journey.reviews === n) return;
  journey.reviews = n;
  notify();
}

export function setCtaBoost(on, el) {
  journey.boost.on = on;
  if (el !== undefined) journey.boost.el = el;
  notify();
}

// La escribe el diálogo de acceso al abrirse y cerrarse. Fuera de la home nadie la lee
export function setOverlay(on) {
  if (journey.overlay === on) return;
  journey.overlay = on;
  notify();
}

// Al salir de la home: nada de refuerzos ni pulsos colgados para la próxima visita
export function resetJourney() {
  journey.frame = null;
  journey.pulses.length = 0;
  journey.boost = { on: false, el: null };
}

// Posición continua en la trayectoria (0…3) según el scroll de las secciones registradas
export const progressOf = (mv) => (mv ? mv.get() : null);

export function readPosition() {
  const s = journey.sections;
  return journeyPosition({ faq: progressOf(s.faq), reviews: progressOf(s.reviews), cta: progressOf(s.cta) });
}
