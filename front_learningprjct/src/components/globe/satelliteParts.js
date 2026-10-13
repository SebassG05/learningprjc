// Piezas compartidas de satélites y órbitas: las usan las órbitas del hero y la escena de reseñas
import { useEffect, useMemo } from 'react';
import {
  BufferGeometry, Float32BufferAttribute,
  LineBasicMaterial, LineDashedMaterial, MeshStandardMaterial, SpriteMaterial,
} from 'three';
import { glowTexture } from './geo';
import { glowBlending } from './uniforms';

export function circleGeometry(radius, segments = 180) {
  const pts = [];
  for (let i = 0; i <= segments; i += 1) {
    const a = (i / segments) * Math.PI * 2;
    pts.push(Math.cos(a) * radius, 0, Math.sin(a) * radius);
  }
  const g = new BufferGeometry();
  g.setAttribute('position', new Float32BufferAttribute(pts, 3));
  return g;
}

/* Materiales de satélites y órbitas (los comparten las órbitas del hero y la escena de reseñas);
   se liberan al desmontar quien los creó */
export function useSatelliteMaterials(palette) {
  const materials = useMemo(() => ({
    body: new MeshStandardMaterial({ color: palette.surface3, metalness: 0.55, roughness: 0.35 }),
    panel: new MeshStandardMaterial({ color: palette.brand600, emissive: palette.brand800, emissiveIntensity: 0.9, metalness: 0.3, roughness: 0.4 }),
    glow: new SpriteMaterial({ map: glowTexture(), color: palette.brand400, ...glowBlending, transparent: true, opacity: 0.85, depthWrite: false }),
    line: new LineBasicMaterial({ color: palette.brand200, transparent: true, opacity: 0.22, depthWrite: false }),
    dashed: new LineDashedMaterial({ color: palette.brand200, transparent: true, opacity: 0.3, dashSize: 0.025, gapSize: 0.045, depthWrite: false }),
  }), [palette]);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);
  return materials;
}

