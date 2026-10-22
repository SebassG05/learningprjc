/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Pause, Play } from 'lucide-react';
import Button from '../../ui/Button';
import { duration, ease } from '../../../lib/motion';
import { VIDEO } from '../coursesCopy';
import { clearResume, readResume, saveResume } from './videoResume';

const FRAME = 'relative aspect-video overflow-hidden rounded-3xl bg-surface-2 ring-1 ring-inset ring-line';
const SAVE_EVERY = 5; // segundos entre guardados de la posición

// Avance: 30 s en silencio y en bucle, solo mientras se ve (no compite con la carga ni gasta datos fuera
// de pantalla). Sin controles de búsqueda; un único botón de pausa (WCAG 2.2.2), siempre en el mismo sitio
// para no perder el foco. Con reduced motion no arranca solo: se queda el póster y el botón «Ver avance».
function PreviewPlayer({ video, title, cta }) {
  const reduce = useReducedMotion();
  const frameRef = useRef(null);
  const videoRef = useRef(null);
  // null = el alumno no ha tocado el botón: manda la preferencia de movimiento (que puede llegar tarde)
  const [userPaused, setUserPaused] = useState(null);
  const paused = userPaused ?? Boolean(reduce);
  const setPaused = (p) => setUserPaused(typeof p === 'function' ? p(paused) : p);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true; // React no refleja `muted` como propiedad: sin esto Safari bloquea el autoplay
    // Si el navegador bloquea la reproducción, se queda en pausa con el botón «Ver avance»
    if (visible && !paused) v.play().catch(() => setUserPaused(true));
    else v.pause();
  }, [visible, paused]);

  const enrollable = cta.state === 'enroll' || cta.state === 'reserve';
  const rise = reduce
    ? { initial: { opacity: 0 }, whileInView: { opacity: 1 } }
    : { initial: { opacity: 0, transform: 'translateY(8px)' }, whileInView: { opacity: 1, transform: 'translateY(0px)' } };

  return (
    <div>
      <div ref={frameRef} className={FRAME}>
        <video
          ref={videoRef}
          src={video.src}
          poster={video.poster}
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          aria-label={VIDEO.previewLabel(title)}
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Póster encima del vídeo: se funde cuando hay imagen en movimiento, sin salto de fotograma */}
        <img
          src={video.poster}
          alt=""
          aria-hidden="true"
          decoding="async"
          loading="lazy"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ease-out-expo ${playing ? 'opacity-0' : 'opacity-100'}`}
        />
        {/* Opaco hasta la altura del texto: aunque el fotograma sea blanco, ink-2 queda ≥ 5,2:1 */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-3/4 bg-gradient-to-t from-canvas from-35% via-canvas/85 via-60% to-transparent sm:block" />

        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          // En pausa el nombre es el texto visible («Ver avance», WCAG 2.5.3); reproduciendo, solo hay icono
          aria-label={paused ? undefined : VIDEO.pauseLabel}
          className="absolute right-3 top-3 inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-full bg-canvas/75 px-3 text-callout font-semibold text-ink ring-1 ring-inset ring-line-strong transition-[background-color,transform] duration-150 ease-out-expo active:scale-[0.97] [@media(hover:hover)]:hover:bg-canvas sm:right-4 sm:top-4"
        >
          {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          {paused ? <span className="pr-1">{VIDEO.play}</span> : null}
        </button>

        {/* sm+: el CTA va dentro del marco, sobre el degradado */}
        <motion.div
          {...rise}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: duration.base, ease: ease.outExpo }}
          className="absolute inset-x-0 bottom-0 hidden items-end justify-between gap-6 p-8 sm:flex"
        >
          <CtaBlock cta={cta} enrollable={enrollable} />
        </motion.div>
      </div>
      {/* Móvil: el marco 16:9 es demasiado bajo para texto y botón, así que el CTA va debajo */}
      <div className="mt-5 sm:hidden">
        <CtaBlock cta={cta} enrollable={enrollable} />
      </div>
    </div>
  );
}

function CtaBlock({ cta, enrollable }) {
  if (cta.state === 'reserved') return <p className="text-callout text-ink-2">{VIDEO.reservedLead}</p>;
  if (!enrollable) return null;
  return (
    <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
      <p className="text-callout text-ink-2 sm:order-2 sm:max-w-[16rem]">{VIDEO.ctaLead}</p>
      <Button
        size="lg"
        onClick={cta.onClick}
        aria-disabled={cta.sending || undefined}
        aria-busy={cta.sending || undefined}
        className="w-full whitespace-normal text-center sm:w-auto"
      >
        {VIDEO.cta[cta.state]}
        <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
      </Button>
    </div>
  );
}

// Vídeo completo: el reproductor del navegador (controles, teclado, pantalla completa, PiP), carga diferida
// y reanuda sin preguntar donde se quedó el alumno.
function FullPlayer({ video, title, courseId }) {
  const ref = useRef(null);
  const lastSaved = useRef(0);
  const resumed = useRef(false);

  // Reanuda una sola vez y nunca si el alumno ya ha movido el cabezal
  const resume = (e) => {
    const v = e.currentTarget;
    if (resumed.current || v.currentTime > 0) return;
    const t = readResume(courseId, v.duration);
    if (t > 0) {
      resumed.current = true;
      v.currentTime = t;
    }
  };

  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    const flush = () => {
      if (v.currentTime > 0 && !v.ended) saveResume(courseId, v.currentTime);
    };
    window.addEventListener('pagehide', flush);
    return () => {
      flush();
      window.removeEventListener('pagehide', flush);
    };
  }, [courseId]);

  return (
    <div className={FRAME}>
      <video
        ref={ref}
        src={video.src}
        poster={video.poster}
        controls
        playsInline
        preload="metadata"
        controlsList="nodownload"
        aria-label={VIDEO.fullLabel(title)}
        onLoadedMetadata={resume}
        // La primera vez que Cloudinary genera la versión q_auto/f_auto puede anunciar una duración
        // provisional: se reintenta cuando llega la definitiva
        onDurationChange={resume}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (Math.abs(t - lastSaved.current) < SAVE_EVERY) return;
          lastSaved.current = t;
          saveResume(courseId, t);
        }}
        onPause={(e) => saveResume(courseId, e.currentTarget.currentTime)}
        onEnded={() => clearResume(courseId)}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    </div>
  );
}

// Escena del vídeo, entre la portada y «Qué aprenderás». El backend decide el modo; aquí solo se pinta.
export default function CourseVideo({ state, courseId, title, cta }) {
  const reduce = useReducedMotion();
  if (state.status !== 'ready' || !state.video) return null;
  const { video } = state;
  const full = video.mode === 'full';

  return (
    <section aria-labelledby="curso-video" className="mx-auto w-full max-w-site px-gutter pb-8 pt-12 lg:pb-4 lg:pt-24">
      <p className="eyebrow">{full ? VIDEO.fullEyebrow : VIDEO.previewEyebrow}</p>
      <h2 id="curso-video" className="mb-8 mt-4 text-title-2 font-bold text-ink lg:mb-10">{full ? VIDEO.fullTitle : VIDEO.previewTitle}</h2>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={video.mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: reduce ? 0 : duration.base, ease: ease.outExpo } }}
          exit={{ opacity: 0, transition: { duration: reduce ? 0 : duration.fast, ease: ease.exit } }}
        >
          {full ? <FullPlayer video={video} title={title} courseId={courseId} /> : <PreviewPlayer video={video} title={title} cta={cta} />}
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
