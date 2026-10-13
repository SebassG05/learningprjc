import { CustomBlending, OneFactor, Vector3, ZeroFactor } from 'three';
import { LIGHT_DIR } from './config';

// Uniformes compartidos por todas las capas: una sola dirección de luz y un solo reloj
export const shared = {
  uLight: { value: new Vector3(...LIGHT_DIR).normalize() },
  uTime: { value: 0 },
};

// Brillo aditivo que no escribe alfa: sobre un lienzo transparente suma luz a la página
// en lugar de oscurecerla (la mezcla aditiva estándar deja un halo gris).
export const glowBlending = {
  blending: CustomBlending,
  blendSrc: OneFactor,
  blendDst: OneFactor,
  blendSrcAlpha: ZeroFactor,
  blendDstAlpha: OneFactor,
};
