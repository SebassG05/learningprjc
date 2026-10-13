/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
// Espacio profundo (FAQ): una red de nodos y arcos casi invisible y la luna cerca. Es la sección
// con más lectura, así que casi nada se mueve. Al abrir una pregunta sale un pulso desde su
// chevron que recorre un arco fijo (determinista) y enciende un nodo que se apaga despacio.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BufferAttribute, BufferGeometry, Float32BufferAttribute, LineBasicMaterial, ShaderMaterial } from 'three';
import { journey, takePulse } from '../journey/store';
import { clamp01 } from '../journey/keyframes';
import { Moon } from '../Extras';

const SEG = 48;
const SLOTS = 3; // pulsos simultáneos; el resto espera en la cola
const TRAVEL = 0.85; // s: recorrido del pulso
const LINGER = 0.5; // s: el rastro se desvanece tras llegar
const GLOW_DECAY = 0.62; // s: constante de apagado del nodo (~1,6 s visibles)
const TRAIL = 22; // segmentos de rastro detrás de la cabeza
// Sale decidido y frena al llegar (sin el arranque casi instantáneo de una exponencial)
const outCubic = (t) => 1 - (1 - t) ** 3;

// Nodo de destino de cada pregunta (coordenadas normalizadas de pantalla, -0.5…0.5, y hacia
// arriba): en el margen derecho, a alturas distintas para que cada arco tenga su forma
const QUESTION_NODES = [[0.462, 0.4], [0.474, -0.3], [0.448, 0.22], [0.468, -0.44], [0.455, 0.04]];

function buildNetwork(fieldCount) {
  let seed = 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const nodes = QUESTION_NODES.map(([u, v]) => [u, v]);
  for (let i = 0; i < fieldCount; i += 1) nodes.push([(rnd() - 0.5) * 0.96, (rnd() - 0.5) * 0.92]);
  // Cada nodo se une con sus dos vecinos más cercanos
  const edges = new Set();
  nodes.forEach((a, i) => {
    nodes
      .map((b, j) => [j, (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2])
      .filter(([j]) => j !== i)
      .sort((x, y) => x[1] - y[1])
      .slice(0, 2)
      .forEach(([j]) => edges.add(i < j ? `${i}-${j}` : `${j}-${i}`));
  });
  const linePts = [];
  edges.forEach((e) => {
    const [i, j] = e.split('-').map(Number);
    linePts.push(nodes[i][0], nodes[i][1], 0, nodes[j][0], nodes[j][1], 0);
  });
  return { nodes, linePts };
}

const pointVertex = /* glsl */`
  attribute float aGlow; uniform float uPx; uniform float uBase; uniform float uGrow; varying float vGlow;
  void main() {
    vGlow = aGlow;
    gl_PointSize = (uBase + aGlow * uGrow) * uPx;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const pointFragment = /* glsl */`
  uniform vec3 uDim; uniform vec3 uLit; uniform float uFade; uniform float uRest; varying float vGlow;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float core = 1.0 - smoothstep(0.1, 0.24, d);
    float halo = pow(1.0 - smoothstep(0.0, 0.5, d), 2.0);
    vec3 col = mix(uDim, uLit, vGlow);
    float a = uFade * (uRest * core * (1.0 - vGlow) + vGlow * (core + 0.7 * halo));
    gl_FragColor = vec4(col, a);
  }`;

export default function DeepSpaceScene({ palette, quality }) {
  const group = useRef();
  const field = useRef();
  const moon = useRef();
  const moonMat = useRef();
  const slots = useRef(Array.from({ length: SLOTS }, () => ({ active: false })));
  const low = quality === 'low';

  const net = useMemo(() => buildNetwork(low ? 5 : 9), [low]);

  const res = useMemo(() => {
    const nodeGeo = new BufferGeometry();
    nodeGeo.setAttribute('position', new Float32BufferAttribute(net.nodes.flatMap(([u, v]) => [u, v, 0]), 3));
    nodeGeo.setAttribute('aGlow', new BufferAttribute(new Float32Array(net.nodes.length), 1));
    const edgeGeo = new BufferGeometry();
    edgeGeo.setAttribute('position', new Float32BufferAttribute(net.linePts, 3));
    const headGeo = new BufferGeometry();
    headGeo.setAttribute('position', new BufferAttribute(new Float32Array(SLOTS * 3), 3));
    headGeo.setAttribute('aGlow', new BufferAttribute(new Float32Array(SLOTS), 1));
    const trailGeos = Array.from({ length: SLOTS }, () => {
      const g = new BufferGeometry();
      g.setAttribute('position', new BufferAttribute(new Float32Array((SEG + 1) * 3), 3));
      g.setDrawRange(0, 0);
      return g;
    });
    const common = { transparent: true, depthWrite: false, depthTest: false, vertexShader: pointVertex, fragmentShader: pointFragment };
    const nodeMat = new ShaderMaterial({
      ...common,
      uniforms: { uPx: { value: 1 }, uBase: { value: 2.4 }, uGrow: { value: 16 }, uFade: { value: 0 }, uRest: { value: 0.34 }, uDim: { value: palette.brand200 }, uLit: { value: palette.brand100 } },
    });
    const headMat = new ShaderMaterial({
      ...common,
      uniforms: { uPx: { value: 1 }, uBase: { value: 0 }, uGrow: { value: 14 }, uFade: { value: 0 }, uRest: { value: 0 }, uDim: { value: palette.brand300 }, uLit: { value: palette.brand100 } },
    });
    const edgeMat = new LineBasicMaterial({ color: palette.brand200, transparent: true, opacity: 0, depthWrite: false, depthTest: false });
    const trailMats = trailGeos.map(() => new LineBasicMaterial({ color: palette.brand300, transparent: true, opacity: 0, depthWrite: false, depthTest: false }));
    return { nodeGeo, edgeGeo, headGeo, trailGeos, nodeMat, headMat, edgeMat, trailMats };
  }, [net, palette]);

  useEffect(() => {
    journey.pulses.length = 0; // nada de pulsos viejos al llegar a la sección
    return () => {
      [res.nodeGeo, res.edgeGeo, res.headGeo, ...res.trailGeos, res.nodeMat, res.headMat, res.edgeMat, ...res.trailMats].forEach((o) => o.dispose());
    };
  }, [res]);

  useFrame((state, delta) => {
    const f = journey.frame;
    if (!f || !group.current) return;
    const { vw, vh, W, H } = f.view;
    const w = f.weights[1];
    group.current.visible = w > 0.01;
    moon.current.visible = w > 0.01;
    if (w <= 0.01) return;
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);
    const ease = w * w * (3 - 2 * w);

    // Plano de pantalla: la red se estira con el viewport y deriva un poco con el scroll (parallax)
    const p = journey.sections.faq?.get() ?? 0.5;
    const drift = (0.5 - p) * 0.08;
    group.current.scale.set(vw, vh, 1);
    field.current.position.y = drift;
    const px = state.viewport.dpr;
    res.nodeMat.uniforms.uPx.value = px;
    res.headMat.uniforms.uPx.value = px;
    res.nodeMat.uniforms.uFade.value = ease;
    res.headMat.uniforms.uFade.value = ease;
    res.edgeMat.opacity = 0.075 * ease;

    // Luna cercana, arriba a la derecha (detrás del plano: se compensa la perspectiva)
    const z = -1.6;
    const k = (6 - z) / 6;
    moon.current.position.set(vw * 0.36 * k, (vh * 0.31 + drift * vh * 0.5) * k, z);
    if (moonMat.current) moonMat.current.opacity = ease;

    const glow = res.nodeGeo.attributes.aGlow;
    let dirty = false;

    // Nuevos pulsos desde la cola
    let free = slots.current.find((s) => !s.active);
    while (free && journey.pulses.length) {
      const pulse = takePulse();
      const node = pulse.index % QUESTION_NODES.length;
      if (f.still) {
        // Reduced motion: el nodo se enciende sin recorrido
        glow.array.fill(0);
        glow.array[node] = 0.85;
        dirty = true;
      } else {
        const sx = pulse.x / W - 0.5;
        const sy = 0.5 - pulse.y / H - drift;
        const [ex, ey] = QUESTION_NODES[node];
        // Arco hacia el margen: control desplazado en perpendicular, siempre hacia fuera
        let nx = -(ey - sy);
        let ny = ex - sx;
        if (nx < 0) { nx = -nx; ny = -ny; }
        const len = Math.hypot(nx, ny) || 1;
        const cx = (sx + ex) / 2 + (nx / len) * 0.07;
        const cy = (sy + ey) / 2 + (ny / len) * 0.07;
        const pos = res.trailGeos[slots.current.indexOf(free)].attributes.position;
        for (let i = 0; i <= SEG; i += 1) {
          const u = i / SEG;
          const a = (1 - u) ** 2;
          const b = 2 * (1 - u) * u;
          const c = u * u;
          pos.setXYZ(i, a * sx + b * cx + c * ex, a * sy + b * cy + c * ey, 0);
        }
        pos.needsUpdate = true;
        Object.assign(free, { active: true, start: t, node, lit: false });
      }
      free = slots.current.find((s) => !s.active);
    }

    // Pulsos en curso: cabeza con rastro corto; al llegar enciende su nodo
    const heads = res.headGeo.attributes;
    slots.current.forEach((s, i) => {
      const trail = res.trailGeos[i];
      if (!s.active) { heads.aGlow.array[i] = 0; res.trailMats[i].opacity = 0; return; }
      const k = (t - s.start) / TRAVEL;
      const head = Math.round(outCubic(clamp01(k)) * SEG);
      const from = Math.max(0, head - TRAIL);
      trail.setDrawRange(from, head - from + 1);
      res.trailMats[i].opacity = 0.8 * (1 - clamp01((k - 1) / (LINGER / TRAVEL)));
      const tp = trail.attributes.position;
      heads.position.setXYZ(i, tp.getX(head), tp.getY(head), 0);
      heads.aGlow.array[i] = k < 1 ? 1 : 0;
      if (k >= 1 && !s.lit) { glow.array[s.node] = 1; s.lit = true; dirty = true; }
      if (k >= 1 + LINGER / TRAVEL) s.active = false;
    });
    heads.position.needsUpdate = true;
    heads.aGlow.needsUpdate = true;

    // Apagado lento de los nodos
    if (!f.still) {
      const fall = Math.exp(-dt / GLOW_DECAY);
      for (let i = 0; i < glow.count; i += 1) {
        if (glow.array[i] > 0.002) { glow.array[i] *= fall; dirty = true; } else if (glow.array[i] !== 0) { glow.array[i] = 0; dirty = true; }
      }
    }
    if (dirty) glow.needsUpdate = true;
  });

  return (
    <>
      <group ref={group} renderOrder={8}>
        <group ref={field}>
          <lineSegments geometry={res.edgeGeo} material={res.edgeMat} renderOrder={8} />
          {res.trailGeos.map((g, i) => (
            <line key={i} geometry={g} material={res.trailMats[i]} renderOrder={9} />
          ))}
          <points geometry={res.nodeGeo} material={res.nodeMat} renderOrder={10} />
          <points geometry={res.headGeo} material={res.headMat} renderOrder={11} />
        </group>
      </group>
      <group ref={moon}>
        <Moon palette={palette} animate={false} radius={0.2} position={[0, 0, 0]} materialRef={moonMat} />
      </group>
    </>
  );
}
