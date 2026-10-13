// Lenguaje de movimiento compartido (ver redesign-shots/MOTION-SPEC.md).
// Reglas: solo transform y opacity; muelles para lo interactivo; progreso de scroll como motion value.

export const ease = {
  outExpo: [0.16, 1, 0.3, 1], // entradas
  exit: [0.4, 0, 1, 1], // salidas: cortas y acelerando
  inOutQuart: [0.76, 0, 0.24, 1], // fundidos cruzados y overlays
  standard: [0.2, 0, 0, 1],
};

export const duration = {
  instant: 0.1,
  fast: 0.18,
  base: 0.28,
  slow: 0.45,
  scene: 0.7,
  reveal: 0.9,
};

export const spring = {
  // Respuesta inmediata para pulsaciones y hovers
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 },
  // Paneles, menús y modales
  gentle: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  // Indicadores que se desplazan (pestañas, subrayados con layoutId)
  glide: { type: 'spring', stiffness: 380, damping: 36 },
  // Letras que suben desde su máscara (titular del hero)
  letter: { type: 'spring', stiffness: 260, damping: 26, mass: 0.9 },
  // Pequeño rebote del punto de "Campus." al asentarse
  pop: { type: 'spring', stiffness: 520, damping: 16 },
};

// Suavizado del progreso de escena (useSpring): da inercia sin quedarse atrás del scroll
export const scrollSpring = { stiffness: 220, damping: 36, mass: 0.5, restDelta: 0.0005 };

export const stagger = {
  words: 0.04,
  list: 0.05,
  cards: 0.08,
};

export const distance = {
  rise: 24,
  page: 16,
};

// Entrada estándar: sube y aparece
export const fadeUp = {
  hidden: { opacity: 0, y: distance.rise },
  show: { opacity: 1, y: 0, transition: { duration: duration.scene, ease: ease.outExpo } },
};

// Entrada contenida para pantallas de trabajo
export const fadeUpSoft = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.outExpo } },
};

// Contenedor que escalona a sus hijos
export const staggerGroup = (step = stagger.cards, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

// Interacción táctil de botones y tarjetas
export const press = { whileTap: { scale: 0.97 }, transition: spring.snappy };

// Transición estándar de overlay (fondo de modales)
export const overlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: duration.base, ease: ease.outExpo } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.exit } },
};

// Panel flotante (modales, hojas, desplegables): entra con muelle, sale rápido
export const panel = {
  initial: { opacity: 0, y: 16, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1, transition: spring.gentle },
  exit: { opacity: 0, y: 8, scale: 0.98, transition: { duration: duration.fast, ease: ease.exit } },
};

// Despliegue de contenido sin animar altura: solo opacidad y un pequeño desplazamiento
export const disclose = {
  initial: { opacity: 0, y: -6 },
  animate: { opacity: 1, y: 0, transition: { duration: duration.base, ease: ease.outExpo } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.exit } },
};

// Margen del viewport para disparar entradas un poco antes de que el bloque sea visible
export const inView = { once: true, margin: '0px 0px -12% 0px' };
