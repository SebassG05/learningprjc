// Tokens de movimiento compartidos. Espejo en JS de las curvas de index.css.
// Regla: animar solo transform y opacity; muelles para todo lo interactivo.

export const ease = {
  outExpo: [0.16, 1, 0.3, 1],
  inOutQuart: [0.76, 0, 0.24, 1],
  standard: [0.2, 0, 0, 1],
};

export const duration = {
  fast: 0.15,
  base: 0.25,
  slow: 0.4,
  scene: 0.7,
};

export const spring = {
  // Respuesta inmediata para pulsaciones y hovers
  snappy: { type: 'spring', stiffness: 520, damping: 34, mass: 0.7 },
  // Paneles, menús y modales
  gentle: { type: 'spring', stiffness: 260, damping: 30, mass: 0.9 },
  // Indicadores que se desplazan (pestañas, subrayados)
  glide: { type: 'spring', stiffness: 380, damping: 36 },
};

// Entrada estándar: sube 24px y aparece
export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: duration.scene, ease: ease.outExpo } },
};

// Contenedor que escalona a sus hijos
export const stagger = (step = 0.06, delay = 0) => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

// Interacción táctil de botones y tarjetas
export const press = { whileTap: { scale: 0.97 }, transition: spring.snappy };

// Margen del viewport para disparar entradas un poco antes de que el bloque sea visible
export const inView = { once: true, margin: '0px 0px -12% 0px' };
