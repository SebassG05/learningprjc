/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
// Extras del boceto, cada uno activable por separado: arcos de conexión, señales,
// amanecer, luna y estrellas de fondo.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferAttribute, BufferGeometry, DoubleSide, LineBasicMaterial,
  MeshBasicMaterial, QuadraticBezierCurve3, Quaternion, RingGeometry, SpriteMaterial, Vector3,
} from 'three';
import { ARCS } from './config';
import { glowTexture, latLonToVec3 } from './geo';
import { glowBlending, shared } from './uniforms';

const ringGeo = new RingGeometry(0.018, 0.026, 40);
const coreGeo = new RingGeometry(0, 0.009, 20);
const Z = new Vector3(0, 0, 1);

/* Arcos entre puntos del globo con un pulso de luz (el punto verde de "Campus.") que los recorre */
export function Arcs({ palette, count, animate }) {
  const pulses = useRef([]);
  const arcs = useMemo(() => ARCS.slice(0, count).map(([a, b], i) => {
    const start = latLonToVec3(a[0], a[1], 1.004);
    const end = latLonToVec3(b[0], b[1], 1.004);
    const lift = 1 + start.distanceTo(end) * 0.32;
    const mid = start.clone().add(end).normalize().multiplyScalar(lift);
    const curve = new QuadraticBezierCurve3(start, mid, end);
    const geometry = new BufferGeometry().setFromPoints(curve.getPoints(64));
    return { curve, geometry, offset: i * 0.37, speed: 0.16 + (i % 3) * 0.04 };
  }), [count]);
  const lineMat = useMemo(() => new LineBasicMaterial({ color: palette.brand200, transparent: true, opacity: 0.42, depthWrite: false }), [palette]);
  const pulseMat = useMemo(() => new SpriteMaterial({ map: glowTexture(), color: palette.brand400, ...glowBlending, transparent: true, depthWrite: false }), [palette]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    arcs.forEach((arc, i) => {
      const s = pulses.current[i];
      if (!s) return;
      const k = animate ? (t * arc.speed + arc.offset) % 1 : 0.5;
      arc.curve.getPoint(k, s.position);
      const fade = Math.sin(k * Math.PI);
      s.scale.setScalar(0.05 + 0.05 * fade);
    });
  });

  return (
    <group>
      {arcs.map((arc, i) => (
        <group key={i}>
          <line geometry={arc.geometry} material={lineMat} renderOrder={6} />
          <sprite ref={(el) => { pulses.current[i] = el; }} material={pulseMat} renderOrder={7} />
        </group>
      ))}
    </group>
  );
}

/* Señales: anillos que se expanden en los extremos de los arcos */
export function Signals({ palette, count, animate }) {
  const rings = useRef([]);
  const nodes = useMemo(() => {
    const seen = new Map();
    ARCS.slice(0, count).forEach(([a, b]) => [a, b].forEach((p) => seen.set(p.join(','), p)));
    return [...seen.values()].map((p, i) => {
      const pos = latLonToVec3(p[0], p[1], 1.008);
      const quat = new Quaternion().setFromUnitVectors(Z, pos.clone().normalize());
      return { pos, quat, offset: i * 0.29 };
    });
  }, [count]);
  const coreMat = useMemo(() => new MeshBasicMaterial({ color: palette.ink, transparent: true, opacity: 0.9, side: DoubleSide, depthWrite: false }), [palette]);
  const ringMats = useMemo(() => nodes.map(() => new MeshBasicMaterial({ color: palette.brand200, transparent: true, side: DoubleSide, depthWrite: false })), [nodes, palette]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    nodes.forEach((n, i) => {
      const r = rings.current[i];
      if (!r) return;
      const k = animate ? (t * 0.4 + n.offset) % 1 : 0.2;
      r.scale.setScalar(1 + k * 1.8);
      ringMats[i].opacity = 0.85 * (1 - k);
    });
  });

  return (
    <group>
      {nodes.map((n, i) => (
        <group key={i} position={n.pos} quaternion={n.quat}>
          <mesh geometry={coreGeo} material={coreMat} renderOrder={7} />
          <mesh ref={(el) => { rings.current[i] = el; }} geometry={ringGeo} material={ringMats[i]} renderOrder={7} />
        </group>
      ))}
    </group>
  );
}

/* Amanecer: creciente de luz intensa en el borde iluminado */
export function Dawn({ palette }) {
  const uniforms = useMemo(() => ({ uColor: { value: palette.brand100 }, uLight: shared.uLight, uGain: shared.uDawnGain, uTrueView: shared.uTrueView }), [palette]);
  return (
    <mesh scale={1.03} renderOrder={5}>
      <sphereGeometry args={[1, 128, 128]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        {...glowBlending}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          varying vec3 vN; varying vec3 vV;
          void main() {
            vN = normalize(normalMatrix * normal);
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            vV = -mv.xyz;
            gl_Position = projectionMatrix * mv;
          }`}
        fragmentShader={/* glsl */`
          uniform vec3 uColor; uniform vec3 uLight; uniform float uGain; uniform float uTrueView; varying vec3 vN; varying vec3 vV;
          void main() {
            vec3 n = normalize(vN);
            float nz = mix(n.z, dot(n, normalize(vV)), uTrueView);
            float f = pow(1.0 - clamp(nz, 0.0, 1.0), mix(4.5, 12.0, uTrueView));
            float sun = smoothstep(0.35, 0.95, dot(n, uLight));
            gl_FragColor = vec4(uColor * f * sun * 1.6 * uGain, 1.0);
          }`}
      />
    </mesh>
  );
}

/* Luna pequeña, lejana, iluminada por la misma luz (en el espacio profundo se usa fija y más cerca) */
export function Moon({ palette, animate, radius = 0.13, position = [2.4, 1.65, -1.2], materialRef }) {
  const ref = useRef();
  useFrame((state) => {
    if (!animate || !ref.current) return;
    const t = state.clock.elapsedTime * 0.03;
    ref.current.position.set(Math.cos(t + 0.6) * 2.9, 1.65 + Math.sin(t) * 0.08, Math.sin(t + 0.6) * -1.4);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 32, 32]} />
      <meshStandardMaterial ref={materialRef} color={palette.ink3} roughness={0.85} metalness={0.05} transparent={!!materialRef} />
    </mesh>
  );
}

/* Estrellas: puntos diminutos con un parpadeo leve, fuera del grupo del globo */
export function Stars({ palette, count, animate }) {
  const geometry = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (rnd() - 0.5) * 16;
      pos[i * 3 + 1] = (rnd() - 0.5) * 10;
      pos[i * 3 + 2] = -3 - rnd() * 6;
      seed[i] = rnd();
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(pos, 3));
    g.setAttribute('aSeed', new BufferAttribute(seed, 1));
    return g;
  }, [count]);
  const uniforms = useMemo(() => ({ uTime: shared.uTime, uFade: shared.uStarFade, uColor: { value: palette.ink }, uTwinkle: { value: animate ? 1 : 0 } }), [palette, animate]);
  return (
    <points geometry={geometry} renderOrder={-1}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          uniform float uTime; uniform float uTwinkle; attribute float aSeed; varying float vA;
          void main() {
            vA = (0.25 + 0.55 * aSeed) * (1.0 - uTwinkle * 0.35 * (0.5 + 0.5 * sin(uTime * (0.6 + aSeed) + aSeed * 40.0)));
            gl_PointSize = 1.0 + aSeed * 1.6;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`}
        fragmentShader={/* glsl */`
          uniform vec3 uColor; uniform float uFade; varying float vA;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            gl_FragColor = vec4(uColor, uFade * vA * (1.0 - smoothstep(0.2, 0.5, d)));
          }`}
      />
    </points>
  );
}
