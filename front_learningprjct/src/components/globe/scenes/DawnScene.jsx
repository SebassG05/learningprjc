/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
// Horizonte al amanecer (llamada final). El globo ya es el horizonte (lo coloca el director) y
// la luz barre sus puntos; aquí, el sol que asoma por la curva y, con hover o foco en
// "Comenzar ahora", dos arcos que suben del horizonte hacia el botón.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, LineBasicMaterial, SpriteMaterial } from 'three';
import { journey } from '../journey/store';
import { CAMERA_Z, clamp01, pxToWorld, silhouetteTop } from '../journey/keyframes';
import { glowTexture } from '../geo';
import { glowBlending } from '../uniforms';

const SEG = 40;
const SUN_Z = -3; // detrás de la silueta: la esfera tapa la parte del sol aún bajo el horizonte
const SIDES = [-1, 1];

export default function DawnScene({ palette }) {
  const root = useRef();
  const core = useRef();
  const corona = useRef();
  const heads = useRef([]);

  const res = useMemo(() => {
    const glow = (color) => new SpriteMaterial({ map: glowTexture(), color, ...glowBlending, transparent: true, depthWrite: false });
    const arcs = SIDES.map(() => {
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(new Float32Array((SEG + 1) * 3), 3));
      g.setDrawRange(0, 0);
      return g;
    });
    return {
      core: glow(palette.brand300),
      corona: glow(palette.brand600),
      head: glow(palette.brand100),
      arcs,
      arcMat: new LineBasicMaterial({ color: palette.brand200, transparent: true, opacity: 0, depthWrite: false, depthTest: false }),
    };
  }, [palette]);

  useEffect(() => () => {
    [res.core, res.corona, res.head, res.arcMat, ...res.arcs].forEach((o) => o.dispose());
  }, [res]);

  useFrame((state) => {
    const f = journey.frame;
    if (!f || !root.current) return;
    const w = f.weights[3];
    root.current.visible = w > 0.01;
    if (w <= 0.01) return;
    const { vw, vh } = f.view;
    const top = silhouetteTop(f.y, f.s);
    const rise = f.sweep;
    const boost = f.boost;
    const appear = w * w * (3 - 2 * w);

    // Sol: asoma por el centro de la curva al llegar; el hover lo aviva
    const depth = (CAMERA_Z - SUN_Z) / CAMERA_Z;
    // Pegado a la curva y achatado: la luz se abre a lo ancho del horizonte, no hacia el texto
    const sunY = top - vh * 0.04 + vh * 0.035 * rise;
    core.current.position.set(0, sunY * depth, SUN_Z);
    core.current.scale.set(vh * (0.5 + 0.12 * boost) * depth, vh * (0.2 + 0.05 * boost) * depth, 1);
    res.core.opacity = appear * (0.18 + 0.3 * rise + 0.22 * boost);
    corona.current.position.set(0, (sunY - vh * 0.03) * depth, SUN_Z);
    corona.current.scale.set(vh * (1.6 + 0.4 * boost) * depth, vh * (0.45 + 0.1 * boost) * depth, 1);
    res.corona.opacity = appear * (0.26 + 0.16 * rise + 0.18 * boost);

    // Arcos hacia el botón: se dibujan con el muelle del refuerzo y los recorre un destello
    const el = journey.boost.el;
    res.arcMat.opacity = 0.7 * boost * appear;
    const visible = boost > 0.002 && el;
    if (!visible) {
      res.arcs.forEach((g) => g.setDrawRange(0, 0));
      heads.current.forEach((h) => { if (h) h.visible = false; });
      return;
    }
    const r = el.getBoundingClientRect();
    const t = f.still ? 0.5 : state.clock.elapsedTime;
    SIDES.forEach((side, i) => {
      // Cada arco llega a un lateral del botón: rodea el texto de debajo en lugar de cruzarlo
      const [bx, by] = pxToWorld(side < 0 ? r.left + 6 : r.right - 6, r.top + r.height / 2, f.view);
      const x0 = side * vw * 0.26;
      const y0 = top - (x0 * x0) / (2 * f.s) - vh * 0.01;
      const cx = (x0 + bx) / 2 + side * vw * 0.06;
      const cy = Math.max(y0, by) + vh * 0.04;
      const pos = res.arcs[i].attributes.position;
      for (let j = 0; j <= SEG; j += 1) {
        const u = j / SEG;
        const a = (1 - u) ** 2;
        const b = 2 * (1 - u) * u;
        const c = u * u;
        pos.setXYZ(j, a * x0 + b * cx + c * bx, a * y0 + b * cy + c * by, 0);
      }
      pos.needsUpdate = true;
      const drawn = Math.round(clamp01(boost) * SEG);
      res.arcs[i].setDrawRange(0, drawn + 1);
      const h = heads.current[i];
      if (h) {
        const u = Math.min((t * 0.55 + i * 0.5) % 1, drawn / SEG);
        const k = Math.round(u * SEG);
        h.visible = boost > 0.5;
        h.position.set(pos.getX(k), pos.getY(k), 0);
        h.scale.setScalar(vh * 0.05);
      }
    });
    res.head.opacity = clamp01((boost - 0.5) * 2) * appear;
  });

  return (
    <group ref={root}>
      <sprite ref={corona} material={res.corona} renderOrder={-1} />
      <sprite ref={core} material={res.core} renderOrder={-1} />
      {res.arcs.map((g, i) => <line key={i} geometry={g} material={res.arcMat} renderOrder={12} />)}
      {SIDES.map((_, i) => (
        <sprite key={i} ref={(el) => { heads.current[i] = el; }} material={res.head} renderOrder={13} />
      ))}
    </group>
  );
}
