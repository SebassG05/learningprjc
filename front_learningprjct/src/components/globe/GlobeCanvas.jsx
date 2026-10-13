/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
// Lienzo 3D del globo (se carga en diferido con React.lazy). Composición por capas:
//   rig (posición/escala según layout y scroll) → inclinación → giro → esfera, malla,
//   continentes, arcos, señales; encima sombra nocturna, atmósfera y amanecer;
//   órbitas con satélites; luna; estrellas fuera del rig.
import { useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { GLOBE, LIGHT_DIR, QUALITY } from './config';
import { getPalette } from './palette';
import { shared } from './uniforms';
import { Atmosphere, Graticule, LandDots, NightShade, Sphere } from './Earth';
import Orbits from './Orbits';
import { Arcs, Dawn, Moon, Signals, Stars } from './Extras';

const DEG = Math.PI / 180;
const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (t) => t * t * (3 - 2 * t);

// Encaje del globo en el lienzo (unidades de mundo a z = 0)
function frame(layout, vw, vh) {
  if (layout === 'center') return { x: 0, y: 0, s: Math.min(vw, vh) * 0.27 };
  if (vw / vh < 1.2) return { x: vw * 0.26, y: -vh * 0.2, s: vw * 0.4 };
  return { x: vw * 0.22, y: vh * 0.01, s: vh * 0.335 };
}

function Rig({ progress, layout, animate, children, spinChildren, staticChildren }) {
  const rig = useRef();
  const spin = useRef();
  const turned = useRef(0);

  useFrame((state, delta) => {
    const { width: vw, height: vh } = state.viewport;
    const { x, y, s } = frame(layout, vw, vh);
    // Scroll (motion value de Motion leído aquí, sin re-render): acercamiento y desplazamiento al centro,
    // después el globo sube y crece detrás de las ventajas
    const p = animate && progress ? progress.get() : 0;
    const a = smooth(clamp01(p / 0.32));
    const b = smooth(clamp01((p - 0.32) / 0.3));
    rig.current.position.set(x * (1 - 0.55 * a), y - vh * 0.04 * a + vh * 0.12 * b, 0);
    rig.current.scale.setScalar(s * (1 + 0.2 * a + 0.22 * b));
    if (animate) turned.current += Math.min(delta, 0.1) * GLOBE.spin;
    spin.current.rotation.y = -GLOBE.centerLon * DEG + turned.current + p * 0.9;
    shared.uTime.value = state.clock.elapsedTime;
  });

  return (
    <group ref={rig}>
      <group rotation={[GLOBE.tilt, 0, 0]}>
        <group ref={spin}>{spinChildren}</group>
        {staticChildren}
      </group>
      {children}
    </group>
  );
}

export default function GlobeCanvas({ progress, layout = 'side', quality: initialQuality = 'high', animate = true, running = true, extras = {}, onReady }) {
  const [quality, setQuality] = useState(initialQuality);
  const [dpr, setDpr] = useState(QUALITY[initialQuality].dpr);
  const cfg = QUALITY[quality];
  const palette = useMemo(getPalette, []);
  const { arcs = true, signals = true, dawn = true, moon = true, stars = true } = extras;
  const light = useMemo(() => LIGHT_DIR.map((v) => v * 6), []);

  return (
    <Canvas
      flat
      linear
      dpr={dpr}
      // Medir sin transforms: el contenedor entra con una escala y no debe fijar un tamaño menor
      resize={{ offsetSize: true, scroll: false }}
      frameloop={!animate ? 'demand' : running ? 'always' : 'never'}
      camera={{ fov: 30, position: [0, 0, 6], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, stencil: false, powerPreference: 'high-performance' }}
      onCreated={() => onReady?.()}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Si el equipo va justo: menos resolución y calidad móvil */}
      <PerformanceMonitor onDecline={() => { setDpr(1); setQuality('low'); }} />
      <ambientLight intensity={0.35} />
      <directionalLight position={light} intensity={2.4} />

      {stars && <Stars palette={palette} count={cfg.stars} animate={animate} />}

      <Rig
        progress={progress}
        layout={layout}
        animate={animate}
        spinChildren={(
          <>
            <Sphere palette={palette} />
            <Graticule palette={palette} />
            <LandDots palette={palette} samples={cfg.samples} />
            {arcs && <Arcs palette={palette} count={cfg.arcs} animate={animate} />}
            {signals && <Signals palette={palette} count={cfg.arcs} animate={animate} />}
          </>
        )}
        staticChildren={(
          <>
            <NightShade palette={palette} />
            <Atmosphere palette={palette} />
            {dawn && <Dawn palette={palette} />}
            <Orbits palette={palette} count={cfg.orbits} animate={animate} />
          </>
        )}
      >
        {moon && cfg.moon && <Moon palette={palette} animate={animate} />}
      </Rig>
    </Canvas>
  );
}
