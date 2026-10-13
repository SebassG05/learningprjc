/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Star, ChevronDown, Clock, ArrowRight, Award, FileText, Video, ListChecks, Check } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, LayoutGroup, motion, motion as m, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import SectionHeading from '../components/ui/SectionHeading';
import SplitText from '../components/ui/SplitText';
import { useUser } from '../context/UserContext';
import AuthModal from '../components/auth/AuthModal';
import GlobeStage from '../components/globe/GlobeStage';
import FloatingCards from '../components/globe/FloatingCards';
import { useScenesEnabled, useSceneProgress } from '../hooks/useScene';
import useMediaQuery from '../hooks/useMediaQuery';
import { disclose, duration, ease, spring, stagger } from '../lib/motion';
import { glideTo } from '../lib/smoothScroll';

/*
 * Coreografía (ver MOTION-SPEC.md):
 *   Hero (260vh, fijado, globo 3D detrás) ─┐ solape 140vh: el proceso entra en fundido cruzado mientras el hero sale
 *   Proceso (360vh, fijado) ─┐ solape 90vh: la FAQ sube por encima mientras el proceso se atenúa
 *   FAQ → Reseñas → CTA (flujo normal)
 * Todo el progreso va suavizado con useSpring y se aplica como motion values (sin re-render por frame);
 * el lienzo 3D lee el mismo progreso dentro de su bucle de render.
 */

/* ==========================================================================
   Fondo ambiental: el globo es el fondo del hero; aquí solo el tono de las escenas siguientes
   ========================================================================== */

const AmbientBackdrop = () => {
  const { scrollYProgress } = useScroll();
  const process = useTransform(scrollYProgress, [0.12, 0.26, 0.48, 0.6], [0, 1, 1, 0]);
  const finale = useTransform(scrollYProgress, [0.78, 0.96], [0, 1]);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <motion.div style={{ opacity: process }} className="absolute left-[-20vw] top-[10vh] h-[90vh] w-[80vw] rounded-[50%] bg-[radial-gradient(closest-side,rgb(133_200_105/0.09),transparent)]" />
      <motion.div style={{ opacity: finale }} className="absolute bottom-[-30vh] left-1/2 h-[80vh] w-[100vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(161_219_135/0.12),transparent)]" />
    </div>
  );
};

/* ==========================================================================
   Escena 1: Hero con el globo; el titular se aleja y suben las ventajas del campus
   ========================================================================== */

const features = [
  { Icon: Clock, title: 'Acceso ilimitado', desc: 'A todos los cursos, en los que podrás aprender multiples habilidades y conocimientos a tu propio ritmo.' },
  { Icon: Video, title: 'Material técnico', desc: 'Todo descargable y disponible online. Para obtener el máximo provecho de los cursos.' },
  { Icon: ListChecks, title: 'Ejercicios prácticos + tests', desc: 'Autoevaluación por módulo y guía paso a paso.' },
  { Icon: Award, title: 'Certificado profesional autorizado', desc: 'Evaluación final y diploma Evenor-Tech.' },
];

const perks = ['Registro gratuito', 'Acceso inmediato', 'Sin compromiso'];

// Entrada escalonada del hero al cargar. El texto es visible desde el primer frame
// (solo se desplaza), así el contenido es usable y la primera pintura no espera a la animación.
const heroIn = (delay, reduce) => (reduce ? {} : {
  initial: { y: 18 },
  animate: { y: 0, transition: { duration: duration.scene, ease: ease.outExpo, delay } },
});

// "Campus." sube letra a letra desde su máscara con un muelle; el punto verde se asienta al final
const HeroTitle = () => {
  const reduce = useReducedMotion();
  const letters = 'Campus'.split('');
  return (
    <h1 className="mt-5 text-hero font-bold text-ink" aria-label="Campus.">
      <span aria-hidden="true" className="-mb-[0.18em] inline-flex overflow-hidden pb-[0.18em] pr-[0.06em]">
        {letters.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block"
            initial={reduce ? false : { y: '108%' }}
            animate={{ y: '0%' }}
            transition={{ ...spring.letter, delay: 0.08 + i * stagger.words }}
          >
            {l}
          </motion.span>
        ))}
        <motion.span
          className="inline-block origin-bottom text-brand"
          initial={reduce ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...spring.pop, delay: 0.42 }}
        >
          .
        </motion.span>
      </span>
    </h1>
  );
};

const HeroCopy = ({ onStart }) => {
  const reduce = useReducedMotion();
  return (
    <div className="flex max-w-[46rem] flex-col items-start text-left">
      <motion.span {...heroIn(0.02, reduce)} className="eyebrow">E-learning · Evenor-Tech</motion.span>
      <HeroTitle />
      <motion.p {...heroIn(0.3, reduce)} className="mt-6 max-w-[56ch] text-lg text-balance sm:text-xl">
        <span className="text-ink">Plataforma de e-learning moderna y flexible.</span>{' '}
        <span className="text-ink-2">Formando profesionales con tecnología y pasión para el futuro digital.</span>
      </motion.p>
      <motion.div {...heroIn(0.4, reduce)} className="mt-9 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Button size="lg" className="text-button-lg shadow-glow-lg" onClick={onStart}>
          Comenzar ahora <ArrowRight className="h-5 w-5" aria-hidden="true" />
        </Button>
        <Button size="lg" variant="secondary" className="text-button-lg" to="/cursos">
          Ver cursos
        </Button>
      </motion.div>
      <motion.ul {...heroIn(0.5, reduce)} className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-callout text-ink-2">
        {perks.map((p) => (
          <li key={p} className="inline-flex items-center gap-2">
            <Check className="h-4 w-4 text-brand" aria-hidden="true" /> {p}
          </li>
        ))}
      </motion.ul>
    </div>
  );
};

// Ventajas en bento asimétrico (7/5 y 5/7); la primera lleva el tinte de marca
const bento = ['lg:col-span-7', 'lg:col-span-5', 'lg:col-span-5', 'lg:col-span-7'];

const FeatureCard = ({ Icon, title, desc, accent }) => (
  <div className={`relative flex h-full gap-5 overflow-hidden rounded-3xl p-6 glass-panel sm:p-7 ${accent ? 'bg-linear-to-br from-brand-900/70 to-transparent' : ''}`}>
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
      <Icon className="h-5 w-5" aria-hidden="true" />
    </span>
    <div className="pt-1">
      <h3 className="font-sans text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[48ch] text-sm leading-relaxed text-ink-2">{desc}</p>
    </div>
  </div>
);

// Tarjeta en capas: cada una sube a su velocidad (profundidad) y se asienta
const RisingCard = ({ progress, index, feature }) => {
  const start = 0.22 + index * 0.04;
  const depth = [260, 200, 300, 230][index];
  const y = useTransform(progress, [start, start + 0.24], [depth, 0]);
  const opacity = useTransform(progress, [start, start + 0.12], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.24], [0.9, 1]);
  return (
    <motion.div style={{ y, opacity, scale }} className={`will-change-transform ${bento[index]}`}>
      <FeatureCard {...feature} accent={index === 0} />
    </motion.div>
  );
};

// Contenedor amplio común con la cabecera (boceto: 1440 con 120 de margen)
const Site = ({ className = '', children }) => (
  <div className={`mx-auto w-full max-w-site px-gutter ${className}`}>{children}</div>
);

// Velo de legibilidad: el texto queda siempre sobre fondo casi sólido (contraste AA)
const HeroVeil = () => (
  <>
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-linear-to-r from-canvas from-10% via-canvas/60 via-30% to-transparent to-52%" />
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-canvas to-transparent" />
  </>
);

const HeroScene = ({ onStart }) => {
  const scenes = useScenesEnabled();
  const wide = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  // Desarrollo: el titular se aleja y se funde
  const titleScale = useTransform(p, [0, 0.36], [1, 0.82]);
  const titleOpacity = useTransform(p, [0.04, 0.28], [1, 0]);
  const titleY = useTransform(p, [0, 0.36], [0, -70]);
  // Las ventajas entran
  const headingOpacity = useTransform(p, [0.22, 0.36], [0, 1]);
  const headingY = useTransform(p, [0.22, 0.4], [48, 0]);
  // Salida (solapada con la escena siguiente): todo se aleja y se atenúa
  const exitOpacity = useTransform(p, [0.6, 0.8], [1, 0]);
  const exitScale = useTransform(p, [0.6, 0.86], [1, 0.94]);
  const exitY = useTransform(p, [0.6, 0.86], [0, -60]);
  // El globo se atenúa detrás de las ventajas y se va con la escena
  const globeOpacity = useTransform(p, [0.26, 0.42, 0.6, 0.8], [1, 0.5, 0.5, 0]);
  // Fondo y velo del hero se funden con la salida para no dejar un corte sobre el ambiente de la página
  const backdropOpacity = useTransform(p, [0.6, 0.8], [1, 0]);
  const cueOpacity = useTransform(p, [0, 0.05], [1, 0]);

  if (!scenes) {
    return (
      <div ref={ref}>
        <section className="relative -mt-header overflow-hidden lg:-mt-header-lg">
          {wide && (
            <>
              <GlobeStage progress={null} layout="side" className="absolute inset-0" />
              <HeroVeil />
            </>
          )}
          <Site className={`relative flex flex-col pt-header lg:pt-header-lg ${wide ? 'min-h-[100svh] justify-center pb-24' : 'pb-4'}`}>
            <div className="pt-10 md:pt-0">
              <HeroCopy onStart={onStart} />
            </div>
          </Site>
          {!wide && (
            <GlobeStage progress={null} layout="center" className="relative mx-auto -mt-2 aspect-square w-full max-w-[30rem]" />
          )}
        </section>
        <section className="pb-24 pt-12 md:pt-24">
          <Site>
            <SectionHeading align="left" title="¿Qué puedes esperar de los cursos?" />
            <Reveal group className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-12">
              {features.map((f, i) => (
                <Reveal.Item key={f.title} className={bento[i]}><FeatureCard {...f} accent={i === 0} /></Reveal.Item>
              ))}
            </Reveal>
          </Site>
        </section>
      </div>
    );
  }

  return (
    <section ref={ref} className="relative -mt-header h-[260vh] lg:-mt-header-lg">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div aria-hidden="true" style={{ opacity: backdropOpacity }} className="absolute inset-0 bg-canvas" />
        <GlobeStage progress={p} observe={ref} layout="side" style={{ opacity: globeOpacity }} className="absolute inset-0">
          <FloatingCards progress={p} />
        </GlobeStage>
        <motion.div style={{ opacity: backdropOpacity }} className="absolute inset-0">
          <HeroVeil />
        </motion.div>

        <motion.div style={{ opacity: exitOpacity, scale: exitScale, y: exitY }} className="relative flex h-full items-center pt-header will-change-transform lg:pt-header-lg">
          <Site className="relative">
            <motion.div
              style={{ scale: titleScale, opacity: titleOpacity, y: titleY }}
              className="absolute inset-x-0 top-1/2 origin-left -translate-y-1/2 px-gutter will-change-transform"
            >
              <HeroCopy onStart={onStart} />
            </motion.div>

            <div className="relative">
              <motion.div style={{ opacity: headingOpacity, y: headingY }} className="max-w-3xl">
                <h2 className="text-title-1 font-bold text-ink">¿Qué puedes esperar de los cursos?</h2>
              </motion.div>
              <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-12">
                {features.map((f, i) => (
                  <RisingCard key={f.title} progress={p} index={i} feature={f} />
                ))}
              </div>
            </div>
          </Site>
        </motion.div>

        {/* Boceto: "Desliza para explorar" (se va en cuanto empieza el scroll) */}
        <motion.div style={{ opacity: cueOpacity }} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-8 flex flex-col items-center gap-3">
          <span className="text-footnote text-ink-3">Desliza para explorar</span>
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <motion.span
              className="absolute inset-x-0 top-0 h-1/2 bg-brand"
              animate={reduce ? undefined : { y: ['-100%', '200%'] }}
              transition={{ duration: 2.2, ease: ease.inOutQuart, repeat: Infinity, repeatDelay: 0.4 }}
            />
          </span>
        </motion.div>
      </div>
    </section>
  );
};

/* ==========================================================================
   Escena 2: Proceso, entra en fundido cruzado y cada paso se enciende con el scroll
   ========================================================================== */

const steps = [
  { Icon: ArrowRight, title: 'Inicia sesión o regístrate', desc: 'Crea tu cuenta o accede con tus credenciales para comenzar tu formación.' },
  { Icon: FileText, title: 'Aplica al curso de tu interés', desc: 'Explora el catálogo, selecciona el curso y completa tu inscripción en pocos pasos.' },
  { Icon: ListChecks, title: 'Supera los temarios y tests', desc: 'Avanza a tu ritmo, estudia los módulos y aprueba los tests de autoevaluación.' },
  { Icon: Award, title: 'Obtén tu certificado', desc: 'Recibe tu diploma profesional al finalizar y aprobar el curso, listo para tu CV.' },
];

const StepText = ({ step, index }) => (
  <div className="pt-1">
    <span className="text-xs font-semibold tracking-[0.14em] text-ink-3">PASO {String(index + 1).padStart(2, '0')}</span>
    <h3 className="mt-1 font-sans text-xl font-semibold text-ink">{step.title}</h3>
    <p className="mt-2 max-w-md text-base text-ink-2">{step.desc}</p>
  </div>
);

const StepRowStatic = ({ step, index }) => (
  <Reveal.Item as="li" className="relative flex gap-5">
    <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-brand">
      <step.Icon className="h-5 w-5" />
    </span>
    <StepText step={step} index={index} />
  </Reveal.Item>
);

// Paso que se ilumina cuando el progreso de la escena lo alcanza
const StepRowScroll = ({ step, index, progress }) => {
  const at = 0.3 + index * 0.09;
  const opacity = useTransform(progress, [at - 0.08, at], [0.22, 1]);
  const x = useTransform(progress, [at - 0.08, at], [28, 0]);
  const dot = useTransform(progress, [at - 0.03, at], [0, 1]);
  return (
    <motion.li style={{ opacity, x }} className="relative flex gap-5 will-change-transform">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-brand">
        <motion.span style={{ scale: dot, opacity: dot }} className="absolute inset-0 rounded-full bg-brand" />
        <step.Icon className="relative h-5 w-5" />
        <motion.span style={{ opacity: dot }} className="absolute inset-0 flex items-center justify-center text-on-brand">
          <step.Icon className="h-5 w-5" />
        </motion.span>
      </span>
      <StepText step={step} index={index} />
    </motion.li>
  );
};

const PROCESS_LEAD = 'Cuatro pasos desde tu registro hasta tu certificado.';

const ProcessScene = () => {
  const scenes = useScenesEnabled();
  const ref = useRef(null);
  const p = useSceneProgress(ref);
  // Entrada en fundido cruzado (mientras el hero sale) y salida mientras sube la FAQ
  const sceneOpacity = useTransform(p, [0.03, 0.18, 0.64, 0.78], [0, 1, 1, 0]);
  const sceneY = useTransform(p, [0.03, 0.2, 0.64, 0.82], [70, 0, 0, -60]);
  const sceneScale = useTransform(p, [0.03, 0.2, 0.64, 0.82], [0.96, 1, 1, 0.95]);
  const fill = useTransform(p, [0.24, 0.6], [0, 1]);

  if (!scenes) {
    return (
      <section ref={ref} className="py-24">
        <Site>
          <SplitText as="h2" className="mt-4 block text-title-1 font-bold text-ink">¿Cómo funciona el proceso?</SplitText>
          <Reveal><p className="mt-5 max-w-sm text-lg text-ink-2">{PROCESS_LEAD}</p></Reveal>
          <Reveal group as="ol" step={0.1} className="relative mt-12 space-y-10">
            <span className="absolute bottom-6 left-6 top-6 w-px bg-line-strong" aria-hidden="true" />
            {steps.map((s, i) => <StepRowStatic key={s.title} step={s} index={i} />)}
          </Reveal>
        </Site>
      </section>
    );
  }

  return (
    // Solapada 140vh con el hero: su contenido fijado aparece mientras el del hero se va
    <section ref={ref} className="pointer-events-none relative -mt-[140vh] h-[360vh]">
      <div className="sticky top-header flex h-[calc(100svh-var(--spacing-header))] items-center lg:top-header-lg lg:h-[calc(100svh-var(--spacing-header-lg))]">
        <motion.div style={{ opacity: sceneOpacity, y: sceneY, scale: sceneScale }} className="w-full will-change-transform">
          <Site className="grid grid-cols-12 items-center gap-10">
            <div className="col-span-5">
              <h2 className="mt-4 text-title-1 font-bold text-ink">¿Cómo funciona el proceso?</h2>
              <SplitText as="p" progress={p} from={0.14} to={0.3} className="mt-5 block max-w-sm text-lg text-ink">
                {PROCESS_LEAD}
              </SplitText>
            </div>
            <ol className="relative col-span-7 space-y-12">
              <span className="absolute bottom-6 left-6 top-6 w-px bg-line-strong" aria-hidden="true" />
              <motion.span style={{ scaleY: fill }} className="absolute bottom-6 left-6 top-6 w-px origin-top bg-brand" aria-hidden="true" />
              {steps.map((s, i) => <StepRowScroll key={s.title} step={s} index={i} progress={p} />)}
            </ol>
          </Site>
        </motion.div>
      </div>
    </section>
  );
};

/* ==========================================================================
   FAQ
   ========================================================================== */

const FAQSection = ({ animating, setAnimating, navigate }) => {
  const faqs = [
    {
      question: '¿Cómo me registro en la plataforma?',
      answer: 'Haz clic en “Regístrate” en la parte superior derecha, completa el formulario y confirma tu correo electrónico para activar tu cuenta.'
    },
    {
      question: '¿Puedo acceder a los cursos desde cualquier dispositivo?',
      answer: 'Sí, puedes acceder desde ordenador, tablet o móvil, solo necesitas conexión a internet.'
    },
    {
      question: '¿Cuánto tiempo tengo para completar un curso?',
      answer: 'Tienes acceso 24/7 durante el periodo indicado en la descripción del curso, normalmente 7 semanas.'
    },
    {
      question: '¿Recibo un certificado al finalizar?',
      answer: 'Sí, al superar todos los módulos y tests recibirás un diploma profesional de Evenor-Tech.'
    },
    {
      question: '¿Qué hago si tengo problemas técnicos?',
      answer: 'Puedes contactar con soporte desde la sección de ayuda o escribiendo a info@evenor-tech.com.'
    },
  ];
  const [openIdx, setOpenIdx] = useState(null);
  const scenes = useScenesEnabled();
  return (
    <section className={`relative z-10 py-24 sm:py-32 ${scenes ? '-mt-[90vh]' : ''}`}>
      <Site>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading align="left" title="Preguntas frecuentes" />
            <Reveal className="mt-8 rounded-3xl border border-line bg-surface p-7 shadow-card">
              <p className="font-sans text-lg font-semibold text-ink">¿No encuentras tu respuesta?</p>
              <p className="mt-1 text-sm text-ink-2">Estamos aquí para ayudarte</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  size="sm"
                  onClick={() => {
                    setAnimating(true);
                    setTimeout(() => {
                      navigate('/contacto', { state: { scrollToForm: true } });
                    }, 600);
                  }}
                >
                  Contáctanos
                </Button>
                <Button size="sm" variant="secondary" onClick={() => navigate('/guia-usuario')}>
                  Guía de usuario
                </Button>
              </div>
              {/* Overlay animado para transición profesional */}
              <AnimatePresence>
                {animating && (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: duration.slow, ease: ease.inOutQuart }}
                    className="fixed inset-0 z-[100] bg-canvas"
                  />
                )}
              </AnimatePresence>
            </Reveal>
          </div>

          <LayoutGroup>
          <Reveal group as="ul" className="border-b border-line lg:col-span-8">
            {faqs.map((faq, idx) => (
              <Reveal.Item as="li" key={idx} layout="position" transition={{ layout: spring.gentle }} className="border-t border-line">
                <button
                  className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  aria-expanded={openIdx === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className={`text-lg font-medium transition-colors duration-200 sm:text-xl ${openIdx === idx ? 'text-ink' : 'text-ink-2 group-hover:text-ink'}`}>
                    {faq.question}
                  </span>
                  <m.span
                    animate={{ rotate: openIdx === idx ? 180 : 0 }}
                    transition={spring.snappy}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-ink-2"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </m.span>
                </button>
                <AnimatePresence initial={false} mode="popLayout">
                  {openIdx === idx && (
                    <m.div
                      key="content"
                      id={`faq-answer-${idx}`}
                      layout="position"
                      {...disclose}
                    >
                      <p className="max-w-2xl pb-6 text-base text-ink-2">{faq.answer}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </Reveal.Item>
            ))}
          </Reveal>
          </LayoutGroup>
        </div>
      </Site>
    </section>
  );
};

/* ==========================================================================
   Reseñas
   ========================================================================== */

const fetchReviews = async () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
  const res = await fetch(`${apiUrl}/api/reviews`);
  if (!res.ok) throw new Error('Error al cargar reseñas');
  const json = await res.json();
  return json.data || json;
};

const Stars = ({ rating, size = 'h-4 w-4' }) => (
  <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrellas`}>
    {[...Array(5)].map((_, i) => (
      <Star key={i} className={`${size} ${i < rating ? 'text-brand' : 'text-gray-600'}`} fill={i < rating ? 'currentColor' : 'none'} />
    ))}
  </div>
);

const ReviewsCarousel = () => {
  const carouselRef = useRef(null);
  const [modalReview, setModalReview] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews()
      .then(data => setReviews(data))
      .catch(() => setError('No se pudieron cargar las reseñas'))
      .finally(() => setLoading(false));
  }, []);

  // Drag to scroll horizontal
  let isDown = false;
  let startX;
  let scrollLeft;
  useEffect(() => {
    const carousel = carouselRef.current;
    if (!carousel) return;
    const handleMouseDown = (e) => {
      isDown = true;
      carousel.classList.add('dragging');
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
    };
    const handleMouseLeave = () => {
      isDown = false;
      carousel.classList.remove('dragging');
    };
    const handleMouseUp = () => {
      isDown = false;
      carousel.classList.remove('dragging');
    };
    const handleMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.2; // scroll speed
      carousel.scrollLeft = scrollLeft - walk;
    };
    carousel.addEventListener('mousedown', handleMouseDown);
    carousel.addEventListener('mouseleave', handleMouseLeave);
    carousel.addEventListener('mouseup', handleMouseUp);
    carousel.addEventListener('mousemove', handleMouseMove);
    return () => {
      carousel.removeEventListener('mousedown', handleMouseDown);
      carousel.removeEventListener('mouseleave', handleMouseLeave);
      carousel.removeEventListener('mouseup', handleMouseUp);
      carousel.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <section className="relative py-24 sm:py-32">
      <Site>
        <SectionHeading eyebrow="Reseñas" title="¿Qué opinan nuestros estudiantes?" />
        <div className="custom-scrollbar mt-12 select-none overflow-x-auto pb-4">
          <div ref={carouselRef} className="flex gap-4">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="h-56 min-w-[300px] flex-1 animate-pulse rounded-3xl border border-line bg-surface" />
              ))
            ) : error ? (
              <div role="status" className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl px-8 py-12 text-center glass-panel">
                <Stars rating={0} size="h-5 w-5" />
                <p className="mt-5 text-base text-red-300">{error}</p>
                <Button size="sm" variant="secondary" className="mt-6" to="/reseñas">Ir a reseñas</Button>
              </div>
            ) : reviews.length === 0 ? (
              <Reveal className="mx-auto flex w-full max-w-xl flex-col items-center rounded-3xl border border-line bg-surface px-8 py-14 text-center shadow-card">
                <Stars rating={0} size="h-6 w-6" />
                <p className="mt-6 font-display text-title-3 font-bold text-ink">¡Aún no hay reseñas!</p>
                <p className="mt-2 text-base text-ink-2">Sé el primero en compartir tu experiencia y ayuda a conocer Evenor-Tech.</p>
                <Button size="sm" className="mt-8" onClick={() => window.location.href = '/reseñas'}>
                  Ir a reseñas
                </Button>
              </Reveal>
            ) : (
              reviews.map((review, idx) => {
                const description = typeof review.description === 'string' ? review.description : '';
                let user = review.name || review.user || 'Usuario';
                const maxLen = 70;
                const isLong = description.length > maxLen;
                return (
                  <div
                    key={idx}
                    className="flex min-w-[300px] max-w-sm flex-col rounded-3xl border border-line bg-surface p-7 shadow-card sm:min-w-[360px]"
                  >
                    <Stars rating={review.rating} />
                    <p className="mt-5 flex-1 break-words text-lg leading-snug text-ink">
                      “{isLong ? description.slice(0, maxLen) + '…' : description}”
                    </p>
                    {isLong && (
                      <button
                        className="mt-3 self-start text-sm font-medium text-brand transition-colors hover:text-brand-300"
                        onClick={() => setModalReview({ ...review, user })}
                      >
                        Ver más
                      </button>
                    )}
                    <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                      <img
                        src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.charAt(0))}`}
                        alt=""
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                      />
                      <span className="font-semibold text-ink">{user}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* Modal animado para reseña completa */}
        <AnimatePresence>
          {modalReview && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                role="dialog"
                aria-modal="true"
                className="relative w-full max-w-lg break-words rounded-3xl border border-line bg-surface-2 p-8 shadow-overlay"
                initial={{ opacity: 0, scale: 0.96, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={spring.gentle}
              >
                <button
                  className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-white/[0.08] hover:text-ink"
                  onClick={() => setModalReview(null)}
                  aria-label="Cerrar"
                >
                  ×
                </button>
                <Stars rating={modalReview.rating} size="h-5 w-5" />
                <p className="mt-5 text-lg leading-relaxed text-ink">“{modalReview.description}”</p>
                <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
                  <img
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent((modalReview.user || 'U').charAt(0))}`}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                    loading="lazy"
                  />
                  <span className="font-semibold text-ink">{modalReview.user || 'Usuario'}</span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Site>
      <style>{`
        .dragging {
          cursor: grabbing !important;
          user-select: none;
        }
      `}</style>
    </section>
  );
};

/* ==========================================================================
   Escena final — CTA que se expande al entrar
   ========================================================================== */

const CTAScene = ({ onStart }) => {
  const scenes = useScenesEnabled();
  const ref = useRef(null);
  const p = useSceneProgress(ref, ['start end', 'center center']);
  const scale = useTransform(p, [0, 1], [0.88, 1]);
  const opacity = useTransform(p, [0, 0.55], [0.3, 1]);
  const y = useTransform(p, [0, 1], [80, 0]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32">
      <Site>
        <motion.div
          style={scenes ? { scale, opacity, y } : undefined}
          className="relative overflow-hidden rounded-[2.5rem] border border-line bg-surface px-6 py-20 text-center shadow-raised will-change-transform sm:px-16 sm:py-28"
        >
          {/* Horizonte del globo: la página termina con el mismo motivo con el que empieza */}
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[90%] aspect-square w-[150%] -translate-x-1/2 rounded-full border border-brand-400/30 bg-radial from-brand-900/70 via-brand-950/40 via-40% to-transparent to-70% shadow-glow-lg" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-radial-[at_50%_100%] from-brand-400/15 to-transparent to-70%" />
          <div className="relative">
            <SplitText as="h2" className="mx-auto block max-w-3xl text-title-1 font-bold text-ink">
              ¿Listo para encontrar tu próxima <span className="text-brand">oportunidad</span>?
            </SplitText>
            <Reveal group className="flex flex-col items-center">
              <Reveal.Item as="p" className="mx-auto mt-5 max-w-xl text-lg text-ink-2">Únete a miles de empresas que ya están aprovechando nuestras herramientas</Reveal.Item>
              <Reveal.Item as="ul" className="mt-8 flex flex-wrap justify-center gap-2">
                {perks.map((pk) => (
                  <li key={pk} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-4 py-1.5 text-sm text-ink-2">
                    <Check className="h-3.5 w-3.5 text-brand" /> {pk}
                  </li>
                ))}
              </Reveal.Item>
              <Reveal.Item>
                <Button size="lg" className="mt-10" onClick={onStart}>
                  Comenzar ahora <ArrowRight className="h-5 w-5" />
                </Button>
              </Reveal.Item>
              <Reveal.Item as="p" className="mt-4 text-xs text-ink-3">Cursos gratuitos y sin compromiso</Reveal.Item>
            </Reveal>
          </div>
        </motion.div>
      </Site>
    </section>
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);
  const { user } = useUser();
  const [showLogin, setShowLogin] = useState(false);
  const handleStart = () => {
    if (user) {
      navigate('/cursos');
    } else {
      glideTo(0);
      setShowLogin(true);
    }
  };
  return (
    <>
      <AmbientBackdrop />
      {showLogin && <AuthModal open={showLogin} onClose={() => setShowLogin(false)} />}
      <HeroScene onStart={handleStart} />
      <ProcessScene />
      <FAQSection animating={animating} setAnimating={setAnimating} navigate={navigate} />
      <ReviewsCarousel />
      <CTAScene onStart={handleStart} />
    </>
  );
};

export default Home;
