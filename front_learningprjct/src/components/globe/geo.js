import { CanvasTexture, Vector3 } from 'three';
import { LAND_BITS, LAND_H, LAND_W } from './landMask';

const DEG = Math.PI / 180;

// Longitud 0 mira a +Z (cámara); latitud positiva hacia +Y
export function latLonToVec3(lat, lon, radius = 1, target = new Vector3()) {
  const phi = lat * DEG;
  const lambda = lon * DEG;
  return target.set(
    Math.cos(phi) * Math.sin(lambda) * radius,
    Math.sin(phi) * radius,
    Math.cos(phi) * Math.cos(lambda) * radius,
  );
}

let landBytes = null;
function bytes() {
  if (!landBytes) {
    const bin = atob(LAND_BITS);
    landBytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) landBytes[i] = bin.charCodeAt(i);
  }
  return landBytes;
}

export function isLand(lat, lon) {
  const col = Math.min(LAND_W - 1, Math.floor(((lon + 180) / 360) * LAND_W));
  const row = Math.min(LAND_H - 1, Math.floor(((90 - lat) / 180) * LAND_H));
  const i = row * LAND_W + col;
  return (bytes()[i >> 3] >> (7 - (i & 7))) & 1;
}

// Puntos repartidos de forma uniforme (espiral de Fibonacci) y filtrados a tierra.
// Devuelve posiciones y un valor aleatorio estable por punto para variar el brillo.
export function landPoints(samples, radius) {
  const positions = [];
  const seeds = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  const v = new Vector3();
  for (let i = 0; i < samples; i += 1) {
    const y = 1 - (i / (samples - 1)) * 2;
    const lat = Math.asin(y) / DEG;
    const lon = ((((i * golden) / DEG) % 360) + 540) % 360 - 180;
    if (!isLand(lat, lon)) continue;
    latLonToVec3(lat, lon, radius, v);
    positions.push(v.x, v.y, v.z);
    seeds.push(((i * 9301 + 49297) % 233280) / 233280);
  }
  return { positions: new Float32Array(positions), seeds: new Float32Array(seeds) };
}

// Textura radial para halos de satélites y pulsos (se crea una vez y se comparte).
// Premultiplicada (de blanco a negro opaco) para usarla con glowBlending.
let glow = null;
export function glowTexture() {
  if (glow) return glow;
  const size = 64;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgb(255,255,255)');
  g.addColorStop(0.25, 'rgb(140,140,140)');
  g.addColorStop(1, 'rgb(0,0,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  glow = new CanvasTexture(canvas);
  return glow;
}
