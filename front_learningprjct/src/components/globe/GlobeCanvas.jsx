/* eslint-disable react/prop-types, react/no-unknown-property -- props de R3F */
// Lienzo único de la home (se carga en diferido con React.lazy). Composición por capas:
//   rig (encaje del globo según la estación del viaje) → inclinación → giro → esfera, malla,
//   continentes, arcos, señales; encima sombra nocturna, atmósfera y amanecer; órbitas con
//   satélites; luna. Estrellas en su propio grupo (parallax). Escenas del viaje por sección:
//   espacio profundo (FAQ), órbita (reseñas) y horizonte al amanecer (llamada final).
// El director lee el scroll (motion values) y el puente de journey/store.js dentro de useFrame:
// ningún estado de React cambia por frame.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import { Vector3 } from 'three';
import { GLOBE, LIGHT_DIR, QUALITY } from './config';
import { getPalette } from './palette';
import { shared } from './uniforms';
import { Atmosphere, Graticule, LandDots, NightShade, Sphere } from './Earth';
import Orbits from './Orbits';
import { Arcs, Dawn, Moon, Signals, Stars } from './Extras';
import { journey, progressOf, readPosition, SECTIONS, subscribe } from './journey/store';
import {
  blendFrames, carryAt, clamp01, dawnFrame, followFrame, FRAME_KEYS, deepSpaceFrame, heroFrame, heroLeave,
  journeyFrame, orbitFrame, portalFrame, processFrame, smooth, stationWeights, stepSpring,
} from './journey/keyframes';
import DeepSpaceScene from './scenes/DeepSpaceScene';
import OrbitScene from './scenes/OrbitScene';
import DawnScene from './scenes/DawnScene';

const DEG = Math.PI / 180;
const BASE_LIGHT = new Vector3(...LIGHT_DIR).normalize();
// Amanecer: la luz llega por detrás del horizonte y barre hacia el espectador
const DAWN_FROM = new Vector3(0.1, 0.3, -0.95).normalize();
const DAWN_TO = new Vector3(-0.14, 0.8, -0.08).normalize();
const SWEEP_SECONDS = 2.6;

const tmpLight = new Vector3();

function Director({ still, portal, moonMaterial, children, spinChildren, staticChildren, heroOnly, starsChildren }) {
  const rig = useRef();
  const tilt = useRef();
  const spin = useRef();
  const stars = useRef();
  const extras = useRef();
  const current = useRef(null);
  const previous = useRef(null);
  const turned = useRef(0);
  const boost = useRef({ x: 0, v: 0 });
  const sweep = useRef({ start: null, k: 0 });
  const opacity = useRef(-1);
  // Diálogo abierto (journey.overlay): muelle 0→1 que lleva el globo al encaje del acceso y ralentiza el giro
  // Con `portal` (lienzo propio del acceso, fuera de la home) empieza ya junto al panel
  const dim = useRef({ x: portal ? 1 : 0, v: 0 });
  const shaderTime = useRef(0);

  useFrame((state, delta) => {
    const { width: vw, height: vh } = state.viewport;
    const { width: W, height: H } = state.size;
    const view = { W, H, vw, vh };
    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.1);
    const d = dim.current;
    const dimTarget = portal || journey.overlay ? 1 : 0;
    if (still) { d.x = dimTarget; d.v = 0; } else stepSpring(d, dimTarget, undefined, dt);
    const dimK = clamp01(d.x);
    const rate = 1 - 0.6 * dimK;

    // Posición en la trayectoria: continua; con reduced motion, la estación más cercana (sin viaje)
    const exact = readPosition();
    const position = still ? Math.round(exact) : exact;

    // Hero (ancla en el DOM, con o sin escena fijada) y su salida hacia el proceso. Los rectángulos
    // solo se leen cuando su estación pesa (evita forzar layout en el resto del recorrido)
    const { hero } = journey;
    const heroIn = {
      layout: hero.layout,
      rect: hero.anchor && position < 1 ? hero.anchor.getBoundingClientRect() : null,
      progress: progressOf(hero.progress),
    };
    const pre = blendFrames(heroFrame(heroIn, view), processFrame(view), heroLeave(heroIn, view));
    const horizonRect = journey.horizon && position > 2 ? journey.horizon.getBoundingClientRect() : null;
    const route = journeyFrame([pre, deepSpaceFrame(view), orbitFrame(view), dawnFrame(view, horizonRect)], position);
    // Con el acceso abierto el globo deja su estación y se coloca junto al panel
    const target = dimK > 0.001 ? blendFrames(route, portalFrame(view), dimK) : route;

    // Pasos pequeños del objetivo se siguen al momento y los saltos se amortiguan (followFrame).
    // En modo estático se pinta un frame más si el encaje cambió: las capas que leen la escala del
    // globo (puntos de tierra) la toman del frame anterior
    if (still && current.current && FRAME_KEYS.some((k) => Math.abs(current.current[k] - target[k]) > 1e-4)) state.invalidate();
    if (!current.current || still) current.current = { ...target };
    else followFrame(current.current, target, previous.current, vh, dt, carryAt(exact));
    previous.current = target;
    const f = current.current;

    rig.current.position.set(f.x, f.y, 0);
    rig.current.scale.setScalar(f.s);
    tilt.current.rotation.x = GLOBE.tilt + f.tilt;
    if (!still) turned.current += dt * GLOBE.spin * rate;
    spin.current.rotation.y = -GLOBE.centerLon * DEG + turned.current + (heroIn.progress ?? 0) * 0.9;
    stars.current.position.y = f.starsY;
    // Órbitas y luna del hero: se funden (nunca aparecen de golpe). Las órbitas se van en el espacio
    // profundo (asomarían tras el texto) y en el horizonte (a esa escala cruzarían la pantalla); la luna
    // solo acompaña al hero (luego quedaría sobre las tarjetas)
    const w = stationWeights(still ? position : exact);
    const orbitsFade = smooth(clamp01(1 - w[1] - w[3]));
    extras.current.visible = orbitsFade > 0.01;
    if (moonMaterial.current) {
      const moonFade = smooth(w[0]);
      moonMaterial.current.opacity = moonFade;
      moonMaterial.current.visible = moonFade > 0.01;
    }

    // Amanecer: barrido de luz una vez al llegar; refuerzo con hover/foco del botón (muelle)
    const sw = sweep.current;
    if (f.dawn > 0.6 && sw.start === null) sw.start = t;
    if (f.dawn < 0.15) sw.start = null;
    sw.k = still ? 1 : sw.start === null ? 0 : smooth(clamp01((t - sw.start) / SWEEP_SECONDS));
    const b = boost.current;
    const on = journey.boost.on ? 1 : 0;
    if (still) { b.x = on; b.v = 0; } else stepSpring(b, on, undefined, dt);
    const boostK = clamp01(b.x);

    tmpLight.copy(DAWN_FROM).lerp(DAWN_TO, sw.k);
    tmpLight.z += 0.3 * boostK;
    tmpLight.normalize();
    shared.uLight.value.copy(BASE_LIGHT).lerp(tmpLight, f.dawn).normalize();
    shared.uStarFade.value = f.starFade;
    shared.uTrueView.value = f.dawn;
    // En el horizonte el creciente es rasante y ocupa toda la curva: más contenido, salvo con el refuerzo
    shared.uDawnGain.value = 1 + (0.35 * sw.k + 0.9 * boostK - 0.45) * f.dawn;
    if (!still) shaderTime.current += dt * rate;
    shared.uTime.value = still ? t : shaderTime.current;

    // Opacidad del lienzo (solo si cambia: es un estilo del compositor, sin reflujo)
    const shown = f.opacity;
    if (Math.abs(opacity.current - shown) > 0.004) {
      opacity.current = shown;
      state.gl.domElement.style.opacity = shown.toFixed(3);
    }

    journey.frame = Object.assign(journey.frame ?? {}, f, {
      view, weights: w, orbitsFade, sweep: sw.k, boost: boostK, time: t, still,
    });
  });

  return (
    <>
      <group ref={stars}>{starsChildren}</group>
      <group ref={rig}>
        <group ref={tilt} rotation={[GLOBE.tilt, 0, 0]}>
          <group ref={spin}>{spinChildren}</group>
          {staticChildren}
          <group ref={extras}>{heroOnly}</group>
        </group>
        {children}
      </group>
    </>
  );
}

// Modos estáticos (reduced motion o equipo de gama baja): se pinta solo cuando cambia algo,
// y el cambio de estación entra con un fundido de opacidad del contenedor
function StillInvalidator({ still }) {
  const { invalidate, gl } = useThree();
  useEffect(() => {
    if (!still) return undefined;
    let station = Math.round(readPosition());
    const wrapper = gl.domElement.parentElement;
    const onChange = () => {
      const next = Math.round(readPosition());
      if (next !== station) {
        station = next;
        wrapper?.animate?.([{ opacity: 0 }, { opacity: 1 }], { duration: 320, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
      }
      invalidate();
    };
    const unsub = subscribe(onChange);
    window.addEventListener('scroll', onChange, { passive: true });
    window.addEventListener('resize', onChange);
    onChange();
    return () => {
      unsub();
      window.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [still, invalidate, gl]);
  return null;
}

// Gama baja de verdad: fps bajos sostenidos (no los picos al compilar shaders o al cargar)
const LOW_FPS = 20;
function LowEndGuard({ active, onLow }) {
  const frames = useRef(0);
  useFrame(() => { frames.current += 1; });
  useEffect(() => {
    if (!active) return undefined;
    let slow = 0;
    let warmup = 2;
    const id = setInterval(() => {
      const fps = frames.current / 2;
      frames.current = 0;
      if (document.hidden || warmup > 0) { warmup -= 1; return; }
      slow = fps < LOW_FPS ? slow + 1 : 0;
      if (slow >= 3) { clearInterval(id); onLow(); }
    }, 2000);
    return () => clearInterval(id);
  }, [active, onLow]);
  return null;
}

// Compila todos los shaders antes del primer frame sin bloquear el hilo principal (compileAsync con
// KHR_parallel_shader_compile). Mientras tanto el bucle está parado y el lienzo sigue a opacidad 0;
// al terminar, el primer dibujado ya no espera al compilador del driver (era el tirón al montar)
function Warmup({ onDone }) {
  const { gl, scene, camera, invalidate } = useThree();
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    let alive = true;
    gl.compileAsync(scene, camera).then(() => {
      if (!alive) return;
      done.current();
      invalidate();
    });
    return () => { alive = false; };
  }, [gl, scene, camera, invalidate]);
  return null;
}

// Monta cada escena cuando su sección se acerca a la pantalla y la conserva (se compila una sola vez)
function useNearSections() {
  const [near, setNear] = useState({ faq: false, reviews: false, cta: false });
  useEffect(() => {
    let io = null;
    let key = '';
    const setup = () => {
      const next = SECTIONS.map((k) => (journey.elements[k] ? '1' : '0')).join('');
      if (next === key) return;
      key = next;
      io?.disconnect();
      io = new IntersectionObserver((entries) => {
        setNear((prev) => {
          const out = { ...prev };
          entries.forEach((e) => {
            const k = SECTIONS.find((s) => journey.elements[s] === e.target);
            if (k) out[k] = prev[k] || e.isIntersecting;
          });
          return SECTIONS.every((s) => out[s] === prev[s]) ? prev : out;
        });
      }, { rootMargin: '60% 0px' });
      SECTIONS.forEach((k) => journey.elements[k] && io.observe(journey.elements[k]));
    };
    setup();
    const unsub = subscribe(setup);
    return () => { unsub(); io?.disconnect(); };
  }, []);
  return near;
}

export default function GlobeCanvas({ quality: initialQuality = 'high', animate = true, running = true, portal = false, onReady }) {
  const [quality, setQuality] = useState(initialQuality);
  const [dpr, setDpr] = useState(QUALITY[initialQuality].dpr);
  const [lowEnd, setLowEnd] = useState(false);
  const cfg = QUALITY[quality];
  const palette = useMemo(getPalette, []);
  const light = useMemo(() => LIGHT_DIR.map((v) => v * 6), []);
  const near = useNearSections();
  const still = !animate || lowEnd;
  const moonMaterial = useRef();
  const onLow = useCallback(() => setLowEnd(true), []);
  const [compiled, setCompiled] = useState(false);
  const onCompiled = () => {
    setCompiled(true);
    onReady?.();
  };

  return (
    <Canvas
      flat
      linear
      dpr={dpr}
      resize={{ offsetSize: true, scroll: false }}
      frameloop={!compiled ? 'never' : still ? 'demand' : running ? 'always' : 'never'}
      camera={{ fov: 30, position: [0, 0, 6], near: 0.1, far: 40 }}
      gl={{ antialias: true, alpha: true, stencil: false, powerPreference: 'high-performance' }}
      style={{ pointerEvents: 'none' }}
      aria-hidden="true"
    >
      {/* Si el equipo va justo: menos resolución y calidad móvil; con fps bajos sostenidos, fotograma estático */}
      <PerformanceMonitor onDecline={() => { setDpr(1); setQuality('low'); }} />
      <LowEndGuard active={!still && running} onLow={onLow} />
      <StillInvalidator still={still} />
      <ambientLight intensity={0.35} />
      <directionalLight position={light} intensity={2.4} />

      <Director
        still={still}
        portal={portal}
        moonMaterial={moonMaterial}
        starsChildren={<Stars palette={palette} count={cfg.stars} animate={!still} />}
        spinChildren={(
          <>
            <Sphere palette={palette} />
            <Graticule palette={palette} />
            <LandDots palette={palette} samples={cfg.samples} />
            <Arcs palette={palette} count={cfg.arcs} animate={!still} />
            <Signals palette={palette} count={cfg.arcs} animate={!still} />
          </>
        )}
        staticChildren={(
          <>
            <NightShade palette={palette} />
            <Atmosphere palette={palette} />
            <Dawn palette={palette} />
          </>
        )}
        heroOnly={<Orbits palette={palette} count={cfg.orbits} animate={!still} />}
      >
        {cfg.moon && <Moon palette={palette} animate={!still} materialRef={moonMaterial} />}
      </Director>

      <Warmup onDone={onCompiled} />

      {near.faq && <DeepSpaceScene palette={palette} quality={quality} />}
      {near.reviews && <OrbitScene palette={palette} quality={quality} />}
      {near.cta && <DawnScene palette={palette} />}
    </Canvas>
  );
}

