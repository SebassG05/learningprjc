/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
// La órbita (reseñas): una elipse grande e inclinada detrás de la tarjeta con un satélite por
// reseña (máx. 12; 6 en móvil). Sin reseñas, un único satélite en espera emite su "señal".
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { journey, subscribe } from '../journey/store';
import { Satellite } from '../Orbits';
import { circleGeometry, useSatelliteMaterials } from '../satelliteParts';

const CAP = { high: 12, low: 6 };
const SIGNAL = 2.4; // s: periodo de la señal del satélite en espera
const DEPTH = -3; // plano de la órbita, detrás de la tarjeta
const blip = (phase, at) => Math.exp(-(((phase - at) / 0.035) ** 2));

// Satélites visibles según las reseñas que ya cargó la página (0 = cargando, error o ninguna)
function useSatelliteCount(cap) {
  const [count, setCount] = useState(() => Math.min(journey.reviews || 0, cap));
  useEffect(() => {
    const sync = () => setCount(Math.min(journey.reviews || 0, cap));
    sync();
    return subscribe(sync);
  }, [cap]);
  return count;
}

export default function OrbitScene({ palette, quality }) {
  const root = useRef();
  const plane = useRef();
  const ring = useRef();
  const outer = useRef();
  const pivots = useRef([]);
  const arms = useRef([]);
  const signal = useRef();
  const count = useSatelliteCount(CAP[quality] ?? 12);
  const waiting = count === 0;
  const slots = waiting ? 1 : count;

  const mats = useSatelliteMaterials(palette);
  const beacon = useMemo(() => mats.glow.clone(), [mats]);
  const wave = useMemo(() => mats.glow.clone(), [mats]);
  const ringGeo = useMemo(() => circleGeometry(1, 240), []);
  const outerGeo = useMemo(() => circleGeometry(1, 240), []);
  useLayoutEffect(() => { outer.current?.computeLineDistances(); }, [outerGeo]);
  useEffect(() => () => { beacon.dispose(); wave.dispose(); ringGeo.dispose(); outerGeo.dispose(); }, [beacon, wave, ringGeo, outerGeo]);

  useFrame((state) => {
    const f = journey.frame;
    if (!f || !root.current) return;
    const w = f.weights[2];
    root.current.visible = w > 0.01;
    if (w <= 0.01) return;
    const { vw, vh } = f.view;
    const t = f.still ? 0 : state.clock.elapsedTime;
    const appear = w * w * (3 - 2 * w);

    // Elipse más ancha que la tarjeta; en vertical, menos inclinada para que asome arriba y abajo
    const wide = vw / vh > 1.2;
    const depth = (6 - DEPTH) / 6;
    const R = (wide ? vw * 0.4 : vw * 0.58) * depth;
    const p = journey.sections.reviews?.get() ?? 0.5;
    root.current.position.set(0, ((0.5 - p) * 0.3 + vh * 0.02) * depth, DEPTH);
    plane.current.rotation.set(wide ? 0.28 : 0.5, 0, -0.09);
    ring.current.scale.setScalar(R);
    outer.current.scale.setScalar(R * 1.14);
    mats.line.opacity = 0.26 * appear;
    mats.dashed.opacity = 0.16 * appear;

    for (let i = 0; i < slots; i += 1) {
      const pivot = pivots.current[i];
      const arm = arms.current[i];
      if (!pivot || !arm) continue;
      pivot.rotation.y = waiting
        ? 0.12 + 0.12 * Math.sin(t * 0.18) // en espera: deriva despacio en el lado visible
        : (i / slots) * Math.PI * 2 + 0.4 + t * (0.05 + (i % 4) * 0.012);
      arm.position.x = R;
      arm.scale.setScalar(1.25 * appear);
    }

    // Señal: dos destellos cortos por periodo y un anillo que se expande
    const phase = (t % SIGNAL) / SIGNAL;
    const b = f.still ? 1 : blip(phase, 0.06) + 0.6 * blip(phase, 0.2);
    beacon.opacity = (0.25 + 0.75 * b) * appear;
    if (signal.current) {
      signal.current.visible = waiting && !f.still;
      signal.current.scale.setScalar(0.3 + 1.6 * phase);
      wave.opacity = 0.5 * (1 - phase) ** 2 * appear;
    }
  });

  const sat = waiting ? { ...mats, glow: beacon } : mats;

  return (
    <group ref={root}>
      <group ref={plane}>
        <line ref={ring} geometry={ringGeo} material={mats.line} renderOrder={6} />
        <line ref={outer} geometry={outerGeo} material={mats.dashed} renderOrder={6} />
        {Array.from({ length: slots }, (_, i) => (
          <group key={i} ref={(el) => { pivots.current[i] = el; }}>
            <group ref={(el) => { arms.current[i] = el; }}>
              <Satellite materials={sat} />
              {waiting && i === 0 && <sprite ref={signal} material={wave} />}
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
