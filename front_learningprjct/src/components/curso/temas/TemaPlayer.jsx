/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { AlertCircle, Gauge, Maximize, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { duration as dur, ease, panel } from '../../../lib/motion';
import useTemaVideo from './useTemaVideo';
import {
  SPEEDS, clearTemaResume, currentQuality, formatSpeed, formatTime, reachedSeen, readTemaResume, saveTemaResume,
} from './temasProgress';

const SAVE_EVERY = 5; // segundos entre guardados de la posición
const HIDE_AFTER = 2600; // ms sin actividad para ocultar los controles mientras se reproduce
const PLAY_EVENT = 'tema-video-play'; // un solo vídeo sonando a la vez
const POSTER_SIZES = '(min-width: 1280px) 1100px, (min-width: 768px) 90vw, 100vw';

const ICON_BTN =
  'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 ease-out-expo active:scale-[0.94] [@media(hover:hover)]:hover:bg-white/[0.12] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]';

/**
 * Vídeo explicativo de un tema con controles propios sobre <video> nativo.
 * - Carga diferida: las URLs (firmadas) se piden cuando la escena se acerca (`near`); el <video> va con
 *   preload="metadata", playsinline y nunca arranca solo.
 * - Calidad: 720p en móvil, ahorro de datos o red lenta; la original en el resto.
 * - Recuerda la posición por tema y avisa (`onSeen`) al pasar del 90 %.
 * - Sin JavaScript de controles (o si fallan) quedan los controles nativos: `controls` hasta montar.
 * Teclado (con el foco dentro del reproductor): espacio/K, ←/→ 5 s, J/L 10 s, ↑/↓ volumen, M, F, 0–9.
 */
export default function TemaPlayer({ cursoId, temaId, numero, titulo, near, onSeen, t }) {
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  const rangeRef = useRef(null);
  const hideTimer = useRef(0);
  const lastSaved = useRef(0);
  const resumed = useRef(false);
  const seenSent = useRef(false);
  const scrubbing = useRef(false);
  const instanceId = useId();
  const shortcutsId = useId();

  const [attempt, setAttempt] = useState(0);
  const { status, video } = useTemaVideo(cursoId, temaId, near, attempt);
  const [quality, setQuality] = useState(currentQuality);
  const [enhanced, setEnhanced] = useState(false);
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [failed, setFailed] = useState(false);
  const [time, setTime] = useState(0);
  const [length, setLength] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);
  const [menu, setMenu] = useState(false);
  const [active, setActive] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);

  const resumeAt = useMemo(() => readTemaResume(cursoId, temaId), [cursoId, temaId]);
  const src = video ? (quality === 'sd' ? video.sd : video.hd) : null;

  // Parallax suave: el marco entero se desplaza un poco más despacio que la página (solo transform, sin
  // recortar el póster; nada con reduced motion). Va en un envoltorio: la pantalla completa no lo hereda.
  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ['start end', 'end start'] });
  const frameY = useTransform(scrollYProgress, [0, 1], [16, -16]);

  useEffect(() => setEnhanced(true), []);

  // ---- Progreso fluido: la barra se mueve en cada fotograma sin re-renderizar ----
  const paintProgress = useCallback(() => {
    const v = videoRef.current;
    const range = rangeRef.current;
    if (!v || !range || scrubbing.current) return;
    const d = v.duration || 0;
    range.value = String(v.currentTime);
    range.style.setProperty('--p', d ? `${(v.currentTime / d) * 100}%` : '0%');
  }, []);

  useEffect(() => {
    if (!playing) return undefined;
    let raf = 0;
    const tick = () => {
      paintProgress();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, paintProgress]);

  // ---- Un solo vídeo a la vez ----
  useEffect(() => {
    const onOther = (e) => {
      if (e.detail !== instanceId) videoRef.current?.pause();
    };
    window.addEventListener(PLAY_EVENT, onOther);
    return () => window.removeEventListener(PLAY_EVENT, onOther);
  }, [instanceId]);

  // ---- Guardar la posición al salir ----
  useEffect(() => {
    const flush = () => {
      const v = videoRef.current;
      if (v && v.currentTime > 0 && !v.ended) saveTemaResume(cursoId, temaId, v.currentTime);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
    };
  }, [cursoId, temaId]);

  // ---- Pantalla completa ----
  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ---- Controles que se ocultan mientras se reproduce ----
  const poke = useCallback(() => {
    setActive(true);
    window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setActive(false), HIDE_AFTER);
  }, []);
  useEffect(() => () => window.clearTimeout(hideTimer.current), []);
  const showControls = !playing || active || menu;

  // ---- Acciones ----
  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    setStarted(true);
    v.play().catch(() => setPlaying(false));
  };
  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) play();
    else v.pause();
  };
  const seekBy = (delta) => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = Math.min(Math.max(v.currentTime + delta, 0), v.duration);
    setStarted(true);
    paintProgress();
  };
  const setVol = (value) => {
    const v = videoRef.current;
    if (!v) return;
    v.volume = Math.min(Math.max(value, 0), 1);
    v.muted = v.volume === 0;
  };
  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    if (!v.muted && v.volume === 0) v.volume = 0.6;
  };
  const changeRate = (r) => {
    if (videoRef.current) videoRef.current.playbackRate = r;
    setRate(r);
  };
  const toggleFullscreen = () => {
    const frame = frameRef.current;
    const v = videoRef.current;
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
    } else if (frame?.requestFullscreen) {
      frame.requestFullscreen().catch(() => v?.webkitEnterFullscreen?.());
    } else {
      v?.webkitEnterFullscreen?.(); // iOS: solo el propio <video> entra en pantalla completa
    }
  };

  const onKeyDown = (e) => {
    if (!videoRef.current || e.altKey || e.ctrlKey || e.metaKey) return;
    // Los controles con teclado propio (barra, volumen, menú) se encargan de sus flechas
    const own = e.target instanceof HTMLInputElement || e.target.closest?.('[role="menu"]');
    const key = e.key.toLowerCase();
    let handled = true;
    if (key === ' ' || key === 'k') {
      if (e.target instanceof HTMLButtonElement && key === ' ') return; // el botón ya hace su acción
      toggle();
    } else if (key === 'arrowleft' && !own) seekBy(-5);
    else if (key === 'arrowright' && !own) seekBy(5);
    else if (key === 'j') seekBy(-10);
    else if (key === 'l') seekBy(10);
    else if (key === 'arrowup' && !own) setVol(videoRef.current.volume + 0.1);
    else if (key === 'arrowdown' && !own) setVol(videoRef.current.volume - 0.1);
    else if (key === 'm') toggleMute();
    else if (key === 'f') toggleFullscreen();
    else if (/^[0-9]$/.test(key) && !own) {
      const v = videoRef.current;
      if (Number.isFinite(v.duration)) v.currentTime = (Number(key) / 10) * v.duration;
      setStarted(true);
      paintProgress();
    } else handled = false;
    if (handled) {
      e.preventDefault();
      poke();
    }
  };

  // ---- Eventos del <video> ----
  const resume = (e) => {
    const v = e.currentTarget;
    setLength(v.duration || 0);
    if (resumed.current || v.currentTime > 0) return;
    const at = readTemaResume(cursoId, temaId, v.duration);
    if (at > 0) {
      resumed.current = true;
      v.currentTime = at;
      setTime(at);
      paintProgress();
    }
  };

  const onTimeUpdate = (e) => {
    const v = e.currentTarget;
    setTime(v.currentTime);
    if (!playing) paintProgress();
    if (Math.abs(v.currentTime - lastSaved.current) >= SAVE_EVERY) {
      lastSaved.current = v.currentTime;
      saveTemaResume(cursoId, temaId, v.currentTime);
    }
    if (!seenSent.current && reachedSeen(v.currentTime, v.duration)) {
      seenSent.current = true;
      onSeen?.(temaId);
    }
  };

  const onError = () => {
    // La versión de 720p puede no existir aún o fallar: se prueba la original antes de rendirse
    if (quality === 'sd') setQuality('hd');
    else setFailed(true);
  };

  const retry = () => {
    setFailed(false);
    setAttempt((n) => n + 1);
  };

  const accentRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]';
  const posters = video?.posters ?? [];
  const srcSet = posters.map((p) => `${p.url} ${p.width}w`).join(', ');
  const ready = status === 'ready' && src && !failed;

  return (
    <motion.div ref={parallaxRef} style={reduce ? undefined : { y: frameY }}>
    <div
      ref={frameRef}
      role="group"
      aria-label={t.videoLabel(numero, titulo)}
      aria-describedby={shortcutsId}
      onKeyDown={onKeyDown}
      onPointerMove={playing ? poke : undefined}
      onFocus={playing ? poke : undefined}
      className={`group/player relative aspect-video w-full overflow-hidden rounded-[clamp(1.25rem,2.5vw,2rem)] bg-surface-2 shadow-raised ring-1 ring-inset ring-line-strong ${playing && !showControls ? 'cursor-none' : ''} ${fullscreen ? 'rounded-none' : ''}`}
    >
      <span id={shortcutsId} className="sr-only">{t.shortcuts}</span>

      {/* Fondo mientras llegan las URLs: un degradado con el acento del tema, sin salto de tamaño */}
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%),linear-gradient(160deg,var(--color-surface-3),var(--color-surface))]" />

      {ready ? (
        <video
          ref={videoRef}
          src={src}
          poster={video.poster}
          preload="metadata"
          playsInline
          controls={!enhanced}
          controlsList="nodownload"
          disablePictureInPicture={false}
          tabIndex={-1}
          aria-label={t.videoLabel(numero, titulo)}
          onLoadedMetadata={resume}
          // La primera vez que Cloudinary genera una transformación puede anunciar una duración
          // provisional: se reintenta con la definitiva
          onDurationChange={resume}
          onTimeUpdate={onTimeUpdate}
          onPlay={() => {
            setStarted(true);
            window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: instanceId }));
          }}
          onPlaying={() => {
            setPlaying(true);
            setWaiting(false);
            poke();
          }}
          onPause={(e) => {
            setPlaying(false);
            setActive(true);
            saveTemaResume(cursoId, temaId, e.currentTarget.currentTime);
          }}
          onWaiting={() => setWaiting(true)}
          onCanPlay={() => setWaiting(false)}
          onEnded={() => {
            clearTemaResume(cursoId, temaId);
            if (!seenSent.current) {
              seenSent.current = true;
              onSeen?.(temaId);
            }
          }}
          onVolumeChange={(e) => {
            setMuted(e.currentTarget.muted);
            setVolume(e.currentTarget.volume);
          }}
          onRateChange={(e) => setRate(e.currentTarget.playbackRate)}
          onError={onError}
          onClick={enhanced ? toggle : undefined}
          className="absolute inset-0 h-full w-full bg-black object-contain"
        />
      ) : null}

      {/* Póster encima del vídeo hasta que empieza: se funde sin salto de fotograma */}
      {posters.length ? (
        <motion.img
          src={video.poster}
          srcSet={srcSet}
          sizes={POSTER_SIZES}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="lazy"
          animate={{ opacity: started ? 0 : 1 }}
          transition={{ duration: reduce ? 0 : dur.slow, ease: ease.outExpo }}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
      ) : null}

      {/* Velo inferior para que los controles se lean sobre cualquier fotograma */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/75 via-black/30 to-transparent transition-opacity duration-300 ease-out-expo ${started && !showControls ? 'opacity-0' : 'opacity-100'}`}
      />

      {/* Estado: cargando, sin vídeo o error */}
      {status === 'loading' || (ready && waiting && started) ? (
        <div role="status" className="absolute inset-0 flex items-center justify-center">
          <span className="sr-only">{t.cargandoVideo}</span>
          <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent)]" />
        </div>
      ) : null}
      {status === 'none' ? (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-callout text-ink-2">{t.sinVideo}</p>
      ) : null}
      {status === 'error' || failed ? (
        <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <AlertCircle className="h-7 w-7 text-danger" aria-hidden="true" />
          <p className="text-callout text-ink">{t.errorVideo}</p>
          <button type="button" onClick={retry} className={`inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.1] px-5 text-callout font-semibold text-ink ring-1 ring-inset ring-line-strong ${accentRing}`}>
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            {t.reintentar}
          </button>
        </div>
      ) : null}

      {/* Botón grande de inicio (y de «seguir desde…») hasta la primera reproducción */}
      <AnimatePresence>
        {ready && enhanced && !started ? (
          <motion.div
            key="start"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: reduce ? 0 : dur.base, ease: ease.outExpo } }}
            exit={{ opacity: 0, scale: reduce ? 1 : 1.04, transition: { duration: reduce ? 0 : dur.fast, ease: ease.exit } }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <button
              type="button"
              onClick={play}
              className={`group/start inline-flex min-h-14 items-center gap-3 rounded-full bg-black/45 py-2 pl-2 pr-6 text-base font-semibold text-white shadow-raised ring-1 ring-inset ring-white/20 backdrop-blur-xl backdrop-saturate-150 transition-[transform,background-color] duration-200 ease-out-expo active:scale-[0.97] [@media(hover:hover)]:hover:bg-black/60 ${accentRing}`}
            >
              <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--accent)] text-on-brand transition-transform duration-300 ease-out-expo [@media(hover:hover)]:group-hover/start:scale-[1.06]">
                <Play className="ml-0.5 h-5 w-5 fill-current" />
              </span>
              {resumeAt > 0 ? t.seguir(formatTime(resumeAt)) : t.verVideo}
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* Barra de controles: material translúcido sobre el vídeo */}
      {ready && enhanced && started ? (
        <div
          className={`absolute inset-x-2 bottom-2 transition-[opacity,transform] duration-300 ease-out-expo sm:inset-x-4 sm:bottom-4 ${showControls ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'}`}
        >
          <div className="flex items-center gap-1 rounded-2xl bg-black/55 px-1.5 py-1 ring-1 ring-inset ring-white/15 backdrop-blur-xl backdrop-saturate-150 sm:gap-2 sm:px-2">
            <button type="button" onClick={toggle} aria-label={playing ? t.pause : t.play} className={ICON_BTN}>
              {playing ? <Pause className="h-5 w-5 fill-current" aria-hidden="true" /> : <Play className="ml-0.5 h-5 w-5 fill-current" aria-hidden="true" />}
            </button>

            <span className="hidden shrink-0 text-footnote tabular-nums text-white/85 sm:inline" aria-hidden="true">
              {formatTime(time)} <span className="text-white/50">/ {formatTime(length)}</span>
            </span>

            <input
              ref={rangeRef}
              type="range"
              min={0}
              max={length || 0}
              step={0.1}
              defaultValue={0}
              aria-label={t.seek}
              aria-valuetext={`${formatTime(time)} / ${formatTime(length)}`}
              onPointerDown={() => { scrubbing.current = true; }}
              onPointerUp={() => { scrubbing.current = false; }}
              onPointerCancel={() => { scrubbing.current = false; }}
              onInput={(e) => {
                const v = videoRef.current;
                const value = Number(e.currentTarget.value);
                e.currentTarget.style.setProperty('--p', length ? `${(value / length) * 100}%` : '0%');
                if (v) v.currentTime = value;
                setTime(value);
              }}
              className="tema-range min-w-0 flex-1"
            />

            <span className="shrink-0 text-footnote tabular-nums text-white/85 sm:hidden" aria-hidden="true">{formatTime(Math.max(length - time, 0))}</span>

            <SpeedMenu rate={rate} onChange={changeRate} open={menu} setOpen={setMenu} t={t} />

            <button type="button" onClick={toggleMute} aria-label={muted ? t.unmute : t.mute} className={`${ICON_BTN} hidden sm:inline-flex`}>
              {muted || volume === 0 ? <VolumeX className="h-5 w-5" aria-hidden="true" /> : <Volume2 className="h-5 w-5" aria-hidden="true" />}
            </button>
            {/* Volumen: solo con puntero fino (en iOS el volumen lo controlan los botones físicos) */}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              onChange={(e) => setVol(Number(e.currentTarget.value))}
              aria-label={t.volume}
              aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)} %`}
              style={{ '--p': `${(muted ? 0 : volume) * 100}%` }}
              className="tema-range hidden w-20 [@media(hover:hover)_and_(pointer:fine)]:lg:block"
            />

            <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? t.exitFullscreen : t.fullscreen} className={ICON_BTN}>
              {fullscreen ? <Minimize className="h-5 w-5" aria-hidden="true" /> : <Maximize className="h-5 w-5" aria-hidden="true" />}
            </button>
          </div>
        </div>
      ) : null}
    </div>
    </motion.div>
  );
}

// Menú de velocidad: botón con el valor actual y lista de opciones (menuitemradio) anclada al botón
function SpeedMenu({ rate, onChange, open, setOpen, t }) {
  const buttonRef = useRef(null);
  const listRef = useRef(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const current = listRef.current?.querySelector('[aria-checked="true"]');
    current?.focus({ preventScroll: true });
    const onDown = (e) => {
      if (!listRef.current?.contains(e.target) && !buttonRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open, setOpen]);

  const close = (focusButton = true) => {
    setOpen(false);
    if (focusButton) buttonRef.current?.focus({ preventScroll: true });
  };

  const onKeyDown = (e) => {
    const items = [...(listRef.current?.querySelectorAll('[role="menuitemradio"]') ?? [])];
    const i = items.indexOf(document.activeElement);
    if (e.key === 'Escape' || e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      close();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      e.stopPropagation();
      const next = (i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    } else if (e.key === 'Home' || e.key === 'End') {
      e.preventDefault();
      items[e.key === 'Home' ? 0 : items.length - 1]?.focus();
    }
  };

  return (
    <div className="relative shrink-0">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${t.speed}: ${formatSpeed(rate)}`}
        onClick={() => setOpen(!open)}
        className={`${ICON_BTN} w-auto min-w-11 gap-1 px-2.5 text-footnote font-semibold tabular-nums`}
      >
        <Gauge className="h-4 w-4 sm:hidden" aria-hidden="true" />
        <span className="hidden sm:inline">{formatSpeed(rate)}</span>
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            ref={listRef}
            id={menuId}
            role="menu"
            aria-label={t.speed}
            onKeyDown={onKeyDown}
            {...panel}
            style={{ transformOrigin: 'bottom right' }}
            className="absolute bottom-[calc(100%+0.5rem)] right-0 z-10 w-32 rounded-2xl bg-surface-2/95 p-1.5 shadow-raised ring-1 ring-inset ring-line-strong backdrop-blur-xl"
          >
            {SPEEDS.map((s) => (
              <li key={s} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={s === rate}
                  onClick={() => {
                    onChange(s);
                    close();
                  }}
                  className="flex h-11 w-full items-center justify-between rounded-xl px-3 text-callout tabular-nums text-ink transition-colors duration-150 hover:bg-white/[0.08] focus-visible:bg-white/[0.1] focus-visible:outline-none aria-checked:font-semibold aria-checked:text-[var(--accent)]"
                >
                  {formatSpeed(s)}
                  {s === rate ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" /> : null}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
