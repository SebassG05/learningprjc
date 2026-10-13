// Configuración de la escena del globo. Boceto: proyección centrada en 18° O con 20° de
// inclinación; satélites en órbitas inclinadas a velocidades distintas.

export const GLOBE = {
  centerLon: -18,
  tilt: 20 * (Math.PI / 180),
  spin: 0.05, // rad/s: un giro completo cada ~2 minutos
};

// Luz en espacio de cámara: el lado iluminado queda arriba a la izquierda (amanecer del boceto)
export const LIGHT_DIR = [-0.62, 0.55, 0.56];

// Órbitas: radio (en radios terrestres), inclinación [x, z], velocidad angular (rad/s) y fase
export const ORBITS = [
  { radius: 1.32, tilt: [-0.22, -0.12], speed: 0.21, phase: 2.6, dashed: false },
  { radius: 1.6, tilt: [0.32, 0.22], speed: -0.13, phase: 0.4, dashed: false },
  { radius: 1.95, tilt: [1.2, -0.3], speed: 0.09, phase: 4.1, dashed: true },
  { radius: 2.35, tilt: [1.38, 0.55], speed: -0.06, phase: 1.3, dashed: true },
];

// Arcos de conexión desde la península ibérica (decorativos, sin etiquetas)
const HUB = [40.2, -3.7];
export const ARCS = [
  [HUB, [4.7, -74.1]],
  [HUB, [19.4, -99.1]],
  [HUB, [-34.6, -58.4]],
  [HUB, [-12.0, -77.0]],
  [HUB, [52.5, 13.4]],
  [HUB, [6.5, 3.4]],
  [HUB, [30.0, 31.2]],
];

// Calidad por dispositivo: el móvil carga menos puntos, satélites y estrellas
export const QUALITY = {
  high: { samples: 26000, orbits: 4, stars: 900, arcs: ARCS.length, moon: true, dpr: [1, 1.5] },
  low: { samples: 11000, orbits: 2, stars: 260, arcs: 4, moon: false, dpr: [1, 1.25] },
};
