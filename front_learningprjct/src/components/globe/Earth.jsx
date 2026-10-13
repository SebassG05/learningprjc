/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BackSide, BufferAttribute, BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { landPoints, latLonToVec3 } from './geo';
import { glowBlending, shared } from './uniforms';

const tmp = new Vector3();

/* Capa "esfera": cuerpo oscuro con el lado iluminado en verde de marca */
export function Sphere({ palette }) {
  const uniforms = useMemo(() => ({
    uLight: shared.uLight,
    uDay: { value: palette.brand800 },
    uNight: { value: palette.canvas.clone().lerp(palette.brand950, 0.55) },
  }), [palette]);
  return (
    <mesh renderOrder={0}>
      <sphereGeometry args={[1, 72, 72]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={/* glsl */`
          varying vec3 vN;
          void main() {
            vN = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }`}
        fragmentShader={/* glsl */`
          uniform vec3 uLight; uniform vec3 uDay; uniform vec3 uNight;
          varying vec3 vN;
          void main() {
            vec3 n = normalize(vN);
            float lit = smoothstep(-0.45, 1.0, dot(n, uLight));
            float facing = clamp(n.z, 0.0, 1.0);
            vec3 col = mix(uNight, uDay, lit * 0.85);
            col += uDay * 0.45 * pow(lit, 3.0) * facing;
            gl_FragColor = vec4(col, 1.0);
          }`}
      />
    </mesh>
  );
}

/* Capa "malla": meridianos y paralelos cada 30° */
export function Graticule({ palette }) {
  const geometry = useMemo(() => {
    const pts = [];
    const a = new Vector3();
    const b = new Vector3();
    const r = 1.002;
    for (let lat = -60; lat <= 60; lat += 30) {
      for (let lon = -180; lon < 180; lon += 4) {
        latLonToVec3(lat, lon, r, a); latLonToVec3(lat, lon + 4, r, b);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    for (let lon = -180; lon < 180; lon += 30) {
      for (let lat = -86; lat < 86; lat += 4) {
        latLonToVec3(lat, lon, r, a); latLonToVec3(lat + 4, lon, r, b);
        pts.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(pts, 3));
    return g;
  }, []);
  return (
    <lineSegments geometry={geometry} renderOrder={1}>
      <lineBasicMaterial color={palette.brand600} transparent opacity={0.16} depthWrite={false} />
    </lineSegments>
  );
}

/* Capa "continentes": puntos sobre tierra (un solo draw call), tamaño en espacio de mundo */
export function LandDots({ palette, samples }) {
  const ref = useRef();
  const geometry = useMemo(() => {
    const { positions, seeds } = landPoints(samples, 1.004);
    const g = new BufferGeometry();
    g.setAttribute('position', new BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new BufferAttribute(seeds, 1));
    return g;
  }, [samples]);
  // Tamaño del punto proporcional a la separación entre puntos
  const worldSize = useMemo(() => 0.5 * Math.sqrt((4 * Math.PI) / samples), [samples]);
  const uniforms = useMemo(() => ({
    uLight: shared.uLight,
    uLit: { value: palette.brand300 },
    uDim: { value: palette.brand700 },
    uSize: { value: worldSize },
    uScale: { value: 1 },
    uResY: { value: 900 },
  }), [palette, worldSize]);

  useFrame((state) => {
    if (!ref.current) return;
    uniforms.uScale.value = ref.current.getWorldScale(tmp).x;
    uniforms.uResY.value = state.size.height * state.viewport.dpr;
  });

  return (
    <points ref={ref} geometry={geometry} renderOrder={2}>
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          uniform vec3 uLight; uniform float uSize; uniform float uScale; uniform float uResY;
          attribute float aSeed;
          varying float vLit; varying float vFacing; varying float vSeed;
          void main() {
            vec3 n = normalize(normalMatrix * normalize(position));
            vLit = smoothstep(-0.25, 0.85, dot(n, uLight));
            vFacing = n.z;
            vSeed = aSeed;
            vec4 mv = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = uSize * uScale * projectionMatrix[1][1] * uResY * 0.5 / -mv.z;
            gl_Position = projectionMatrix * mv;
          }`}
        fragmentShader={/* glsl */`
          uniform vec3 uLit; uniform vec3 uDim;
          varying float vLit; varying float vFacing; varying float vSeed;
          void main() {
            float d = length(gl_PointCoord - 0.5);
            float disc = 1.0 - smoothstep(0.32, 0.5, d);
            float limb = smoothstep(-0.02, 0.28, vFacing);
            vec3 col = mix(uDim, uLit, vLit) * (0.78 + 0.4 * vSeed);
            gl_FragColor = vec4(col, disc * limb * mix(0.55, 1.0, vLit));
          }`}
      />
    </points>
  );
}

/* Capa "sombra nocturna": oscurece el hemisferio opuesto a la luz por encima de los puntos */
export function NightShade({ palette }) {
  const uniforms = useMemo(() => ({ uLight: shared.uLight, uColor: { value: palette.canvas } }), [palette]);
  return (
    <mesh renderOrder={3} scale={1.007}>
      <sphereGeometry args={[1, 48, 48]} />
      <shaderMaterial
        transparent
        depthWrite={false}
        uniforms={uniforms}
        vertexShader={/* glsl */`
          varying vec3 vN;
          void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={/* glsl */`
          uniform vec3 uLight; uniform vec3 uColor; varying vec3 vN;
          void main() {
            float night = smoothstep(0.0, -0.8, dot(normalize(vN), uLight));
            gl_FragColor = vec4(uColor, night * 0.5);
          }`}
      />
    </mesh>
  );
}

/* Capa "atmósfera": halo Fresnel exterior y anillo de luz en el borde, en verde de marca */
export function Atmosphere({ palette }) {
  const halo = useMemo(() => ({ uColor: { value: palette.brand500 }, uLight: shared.uLight }), [palette]);
  const rim = useMemo(() => ({ uColor: { value: palette.brand400 }, uLight: shared.uLight }), [palette]);
  const vertex = /* glsl */`
    varying vec3 vN;
    void main() { vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
  return (
    <group>
      <mesh scale={1.22} renderOrder={4}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          side={BackSide}
          {...glowBlending}
          uniforms={halo}
          vertexShader={vertex}
          fragmentShader={/* glsl */`
            uniform vec3 uColor; uniform vec3 uLight; varying vec3 vN;
            void main() {
              vec3 n = normalize(vN);
              float i = pow(clamp(0.72 + n.z, 0.0, 1.0), 4.0);
              float side = 0.55 + 0.45 * smoothstep(-0.6, 0.8, dot(-n, uLight));
              gl_FragColor = vec4(uColor * i * side, 1.0) * 0.9;
            }`}
        />
      </mesh>
      <mesh scale={1.012} renderOrder={5}>
        <sphereGeometry args={[1, 64, 64]} />
        <shaderMaterial
          transparent
          depthWrite={false}
          {...glowBlending}
          uniforms={rim}
          vertexShader={vertex}
          fragmentShader={/* glsl */`
            uniform vec3 uColor; uniform vec3 uLight; varying vec3 vN;
            void main() {
              vec3 n = normalize(vN);
              float f = pow(1.0 - clamp(n.z, 0.0, 1.0), 3.2);
              float side = 0.45 + 0.55 * smoothstep(-0.5, 0.9, dot(n, uLight));
              gl_FragColor = vec4(uColor * f * side * 1.15, 1.0);
            }`}
        />
      </mesh>
    </group>
  );
}
