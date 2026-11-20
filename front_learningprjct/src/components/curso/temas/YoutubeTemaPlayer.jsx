/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import useReducedMotion from '../../../hooks/useReducedMotion';
import { AlertCircle, Play, RotateCcw } from 'lucide-react';
import { duration as dur, ease } from '../../../lib/motion';
import {
  PLAY_EVENT, clearTemaResume, formatTime, isYoutubePlaceholder, reachedSeen, readTemaResume, saveTemaResume, youtubePoster,
} from './temasProgress';

const SAVE_EVERY = 5; // segundos entre guardados de la posición
const POLL_MS = 1000; // la API de YouTube no emite «timeupdate»: se consulta la posición mientras suena
const YT_PLAYING = 1;
const YT_PAUSED = 2;
const YT_ENDED = 0;

// La API de YouTube se carga una sola vez y solo cuando alguien pulsa «Ver vídeo»
let apiPromise = null;
function loadYoutubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        resolve(window.YT);
      };
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.onerror = () => {
        apiPromise = null;
        script.remove();
        reject(new Error('No se pudo cargar YouTube'));
      };
      document.head.appendChild(script);
    });
  }
  return apiPromise;
}

/**
 * Vídeo de un tema alojado en YouTube (oculto).
 * - Fachada ligera: póster + botón; el iframe (youtube-nocookie) no se carga hasta que se pulsa.
 * - Controles: los de YouTube (velocidad, subtítulos, calidad y pantalla completa incluidos).
 * - Con la API del iframe: recuerda la posición por tema, avisa (`onSeen`) al pasar del 90 % y pausa los
 *   demás vídeos del aula al empezar.
 */
export default function YoutubeTemaPlayer({ cursoId, temaId, numero, titulo, onSeen, t, youtubeId }) {
  const reduce = useReducedMotion();
  const hostRef = useRef(null);
  const playerRef = useRef(null);
  const pollRef = useRef(0);
  const lastSaved = useRef(0);
  const seenSent = useRef(false);
  const instanceId = useId();

  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [poster, setPoster] = useState(() => youtubePoster(youtubeId));

  const resumeAt = useMemo(() => readTemaResume(cursoId, temaId), [cursoId, temaId]);

  const parallaxRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: parallaxRef, offset: ['start end', 'end start'] });
  const frameY = useTransform(scrollYProgress, [0, 1], [16, -16]);

  useEffect(() => setPoster(youtubePoster(youtubeId)), [youtubeId]);

  const save = useCallback(() => {
    const p = playerRef.current;
    const time = p?.getCurrentTime?.();
    if (Number.isFinite(time) && time > 0 && p.getPlayerState?.() !== YT_ENDED) saveTemaResume(cursoId, temaId, time);
  }, [cursoId, temaId]);

  const markSeen = useCallback(() => {
    if (seenSent.current) return;
    seenSent.current = true;
    onSeen?.(temaId);
  }, [onSeen, temaId]);

  const stopPolling = () => window.clearInterval(pollRef.current);

  const destroy = useCallback(() => {
    stopPolling();
    save();
    playerRef.current?.destroy?.();
    playerRef.current = null;
    if (hostRef.current) hostRef.current.replaceChildren();
  }, [save]);

  // Al desmontar o salir de la página se guarda la posición
  useEffect(() => {
    window.addEventListener('pagehide', save);
    return () => {
      window.removeEventListener('pagehide', save);
      destroy();
    };
  }, [save, destroy]);

  // Un solo vídeo a la vez
  useEffect(() => {
    const onOther = (e) => {
      if (e.detail !== instanceId) playerRef.current?.pauseVideo?.();
    };
    window.addEventListener(PLAY_EVENT, onOther);
    return () => window.removeEventListener(PLAY_EVENT, onOther);
  }, [instanceId]);

  const onStateChange = (e) => {
    const p = e.target;
    stopPolling();
    if (e.data === YT_PLAYING) {
      setLoading(false);
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: instanceId }));
      pollRef.current = window.setInterval(() => {
        const time = p.getCurrentTime();
        const length = p.getDuration();
        if (Math.abs(time - lastSaved.current) >= SAVE_EVERY) {
          lastSaved.current = time;
          saveTemaResume(cursoId, temaId, time);
        }
        if (reachedSeen(time, length)) markSeen();
      }, POLL_MS);
    } else if (e.data === YT_PAUSED) {
      saveTemaResume(cursoId, temaId, p.getCurrentTime());
    } else if (e.data === YT_ENDED) {
      clearTemaResume(cursoId, temaId);
      markSeen();
    }
  };

  const start = () => {
    setStarted(true);
    setLoading(true);
    setFailed(false);
    loadYoutubeApi()
      .then((YT) => {
        if (!hostRef.current) return;
        // El iframe sustituye a este nodo: se crea fuera de React para que React no lo pierda de vista
        const mount = document.createElement('div');
        hostRef.current.replaceChildren(mount);
        playerRef.current = new YT.Player(mount, {
          host: 'https://www.youtube-nocookie.com',
          videoId: youtubeId,
          width: '100%',
          height: '100%',
          playerVars: {
            autoplay: 1,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
            start: Math.floor(resumeAt) || undefined,
            origin: window.location.origin,
          },
          events: {
            onReady: (e) => {
              e.target.getIframe?.().setAttribute('title', t.videoLabel(numero, titulo));
              e.target.playVideo();
              setLoading(false);
            },
            onStateChange,
            onError: () => {
              setLoading(false);
              setFailed(true);
            },
          },
        });
      })
      .catch(() => {
        setLoading(false);
        setFailed(true);
      });
  };

  const retry = () => {
    destroy();
    start();
  };

  const accentRing = 'focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent)]';

  return (
    <motion.div ref={parallaxRef} style={reduce ? undefined : { y: frameY }}>
      <div
        role="group"
        aria-label={t.videoLabel(numero, titulo)}
        className="relative aspect-video w-full overflow-hidden rounded-[clamp(1.25rem,2.5vw,2rem)] bg-surface-2 shadow-raised ring-1 ring-inset ring-line-strong"
      >
        <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_60%),linear-gradient(160deg,var(--color-surface-3),var(--color-surface))]" />

        {/* Aquí monta YouTube su iframe */}
        <div ref={hostRef} className="absolute inset-0 bg-black [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full" hidden={!started} />

        {/* Póster hasta que se pulsa: se funde al arrancar */}
        <AnimatePresence>
          {!started ? (
            <motion.img
              key="poster"
              src={poster}
              alt=""
              aria-hidden="true"
              decoding="async"
              loading="lazy"
              onLoad={(e) => {
                if (isYoutubePlaceholder(e.currentTarget)) setPoster(youtubePoster(youtubeId, 'hqdefault'));
              }}
              onError={() => setPoster((p) => (p.includes('hqdefault') ? p : youtubePoster(youtubeId, 'hqdefault')))}
              exit={{ opacity: 0, transition: { duration: reduce ? 0 : dur.slow, ease: ease.outExpo } }}
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
        </AnimatePresence>

        {!started ? (
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        ) : null}

        {loading && !failed ? (
          <div role="status" className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="sr-only">{t.cargandoVideo}</span>
            <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-2 border-white/20 border-t-[var(--accent)]" />
          </div>
        ) : null}

        {failed ? (
          <div role="alert" className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-surface-2 px-6 text-center">
            <AlertCircle className="h-7 w-7 text-danger" aria-hidden="true" />
            <p className="text-callout text-ink">{t.errorVideo}</p>
            <button type="button" onClick={retry} className={`inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.1] px-5 text-callout font-semibold text-ink ring-1 ring-inset ring-line-strong ${accentRing}`}>
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
              {t.reintentar}
            </button>
          </div>
        ) : null}

        <AnimatePresence>
          {!started ? (
            <motion.div
              key="start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: reduce ? 0 : dur.base, ease: ease.outExpo } }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.04, transition: { duration: reduce ? 0 : dur.fast, ease: ease.exit } }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <button
                type="button"
                onClick={start}
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
      </div>
    </motion.div>
  );
}
