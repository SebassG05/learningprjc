/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BoxGeometry } from 'three';
import { ORBITS } from './config';
import { circleGeometry, useSatelliteMaterials } from './satelliteParts';

// Geometrías compartidas por todos los satélites (low-poly, sin modelos externos)
const bodyGeo = new BoxGeometry(0.07, 0.07, 0.07);
const panelGeo = new BoxGeometry(0.05, 0.006, 0.15);
const armGeo = new BoxGeometry(0.012, 0.012, 0.05);

/* Satélite: cuerpo, brazos y dos paneles en verde de marca, con un halo suave */
export function Satellite({ materials }) {
  return (
    <group>
      <mesh geometry={bodyGeo} material={materials.body} />
      <mesh geometry={armGeo} material={materials.body} position={[0, 0, 0.055]} />
      <mesh geometry={armGeo} material={materials.body} position={[0, 0, -0.055]} />
      <mesh geometry={panelGeo} material={materials.panel} position={[0, 0, 0.15]} />
      <mesh geometry={panelGeo} material={materials.panel} position={[0, 0, -0.15]} />
      <sprite material={materials.glow} scale={0.34} />
    </group>
  );
}

/* Línea de órbita fina y semitransparente (continua o punteada) */
function OrbitLine({ radius, dashed, materials }) {
  const ref = useRef();
  const geometry = useMemo(() => circleGeometry(radius), [radius]);
  useLayoutEffect(() => { if (dashed) ref.current?.computeLineDistances(); }, [dashed, geometry]);
  return <line ref={ref} geometry={geometry} material={dashed ? materials.dashed : materials.line} renderOrder={6} />;
}

/* Órbitas inclinadas, cada una con su satélite a su propia velocidad */
export default function Orbits({ palette, count, animate }) {
  const pivots = useRef([]);
  const orbits = ORBITS.slice(0, count);
  const materials = useSatelliteMaterials(palette);

  useFrame((state) => {
    if (!animate) return;
    const t = state.clock.elapsedTime;
    orbits.forEach((o, i) => {
      const p = pivots.current[i];
      if (p) p.rotation.y = o.phase + t * o.speed;
    });
  });

  return (
    <group>
      {orbits.map((o, i) => (
        <group key={o.radius} rotation={[o.tilt[0], 0, o.tilt[1]]}>
          <OrbitLine radius={o.radius} dashed={o.dashed} materials={materials} />
          <group ref={(el) => { pivots.current[i] = el; }} rotation={[0, o.phase, 0]}>
            <group position={[o.radius, 0, 0]} scale={0.72}>
              <Satellite materials={materials} />
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}
