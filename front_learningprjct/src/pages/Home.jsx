/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Star, ChevronDown, Clock, ArrowRight, Award, FileText, Video, ListChecks, Check } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';
import { AnimatePresence, motion, motion as m, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import Button from '../components/ui/Button';
import Reveal from '../components/ui/Reveal';
import SectionHeading from '../components/ui/SectionHeading';
import { useUser } from '../context/UserContext';
import AuthModal from '../components/auth/AuthModal';
import useMediaQuery from '../hooks/useMediaQuery';
import { ease, spring } from '../lib/motion';

// Las escenas ligadas al scroll solo se activan en pantallas medianas+ y sin reduced-motion
const useScenes = () => {
  const wide = useMediaQuery('(min-width: 768px)');
  const reduce = useReducedMotion();
  return wide && !reduce;
};

/* ==========================================================================
   Escena 1 — Hero: el titular se aleja y suben las ventajas del campus
   ========================================================================== */

const features = [
  { Icon: Clock, title: 'Acceso ilimitado', desc: 'A todos los cursos, en los que podrás aprender multiples habilidades y conocimientos a tu propio ritmo.' },
  { Icon: Video, title: 'Material técnico', desc: 'Todo descargable y disponible online. Para obtener el máximo provecho de los cursos.' },
  { Icon: ListChecks, title: 'Ejercicios prácticos + tests', desc: 'Autoevaluación por módulo y guía paso a paso.' },
  { Icon: Award, title: 'Certificado profesional autorizado', desc: 'Evaluación final y diploma Evenor-Tech.' },
];

const perks = ['Registro gratuito', 'Acceso inmediato', 'Sin compromiso'];

const HeroCopy = ({ onStart }) => (
  <div className="flex flex-col items-center text-center">
    <span className="eyebrow">E-learning · Evenor-Tech</span>
    <h1 className="mt-5 text-hero font-bold text-ink">
      Campus<span className="text-brand">.</span>
    </h1>
    <p className="mt-6 max-w-xl text-lg text-ink-2 sm:text-xl">
      Plataforma de e-learning moderna y flexible. Formando profesionales con tecnología y pasión para el futuro digital.
    </p>
    <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
      <Button size="lg" onClick={onStart}>
        Comenzar ahora <ArrowRight className="h-5 w-5" />
      </Button>
      <Button size="lg" variant="secondary" to="/cursos">
        Ver cursos
      </Button>
    </div>
    <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-3">
      {perks.map((p) => (
        <li key={p} className="inline-flex items-center gap-1.5">
          <Check className="h-4 w-4 text-brand" /> {p}
        </li>
      ))}
    </ul>
  </div>
);

const FeatureCard = ({ Icon, title, desc }) => (
  <div className="h-full rounded-3xl border border-line bg-surface p-7 shadow-card">
    <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
      <Icon className="h-5 w-5" />
    </span>
    <h3 className="mt-6 font-sans text-lg font-semibold text-ink">{title}</h3>
    <p className="mt-2 text-sm leading-relaxed text-ink-2">{desc}</p>
  </div>
);

// Tarjeta cuyo ascenso depende del progreso de la escena (sin re-renders)
const RisingCard = ({ progress, index, feature }) => {
  const start = 0.28 + index * 0.06;
  const y = useTransform(progress, [start, start + 0.32], [220 + index * 50, 0]);
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.32], [0.92, 1]);
  return (
    <motion.div style={{ y, opacity, scale }} className="will-change-transform">
      <FeatureCard {...feature} />
    </motion.div>
  );
};

const HeroScene = ({ onStart }) => {
  const scenes = useScenes();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const titleScale = useTransform(scrollYProgress, [0, 0.4], [1, 0.82]);
  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.32], [1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.4], [0, -60]);
  const headingOpacity = useTransform(scrollYProgress, [0.26, 0.42], [0, 1]);
  const headingY = useTransform(scrollYProgress, [0.26, 0.45], [40, 0]);
  const glowY = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const glowOpacity = useTransform(scrollYProgress, [0.75, 1], [1, 0]);

  if (!scenes) {
    return (
      <div ref={ref}>
        <section className="relative pt-20 pb-24 sm:pt-28">
          <Container>
            <Reveal><HeroCopy onStart={onStart} /></Reveal>
          </Container>
        </section>
        <section className="pb-24">
          <Container>
            <SectionHeading eyebrow="Ventajas del campus" title="¿Qué puedes esperar de los cursos?" />
            <Reveal group className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <Reveal.Item key={f.title}><FeatureCard {...f} /></Reveal.Item>
              ))}
            </Reveal>
          </Container>
        </section>
      </div>
    );
  }

  return (
    <section ref={ref} className="relative h-[260vh]">
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center overflow-hidden">
        <motion.div
          aria-hidden="true"
          style={{ y: glowY, opacity: glowOpacity }}
          className="pointer-events-none absolute left-1/2 top-[8%] h-[70vh] w-[70vw] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(closest-side,rgb(161_219_135/0.16),transparent)]"
        />
        <Container className="relative">
          <motion.div
            style={{ scale: titleScale, opacity: titleOpacity, y: titleY }}
            className="absolute inset-x-0 top-1/2 -translate-y-1/2 will-change-transform"
          >
            <HeroCopy onStart={onStart} />
          </motion.div>

          <div className="relative">
            <motion.div style={{ opacity: headingOpacity, y: headingY }} className="mx-auto max-w-3xl text-center">
              <span className="eyebrow">Ventajas del campus</span>
              <h2 className="mt-4 text-title-1 font-bold text-ink">¿Qué puedes esperar de los cursos?</h2>
            </motion.div>
            <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {features.map((f, i) => (
                <RisingCard key={f.title} progress={scrollYProgress} index={i} feature={f} />
              ))}
            </div>
          </div>
        </Container>
      </div>
    </section>
  );
};

/* ==========================================================================
   Escena 2 — Proceso: cada paso se enciende al avanzar el scroll
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
  const at = 0.12 + index * 0.2;
  const opacity = useTransform(progress, [at - 0.1, at], [0.25, 1]);
  const x = useTransform(progress, [at - 0.1, at], [24, 0]);
  const dot = useTransform(progress, [at - 0.04, at], [0, 1]);
  const iconOpacity = useTransform(progress, [at - 0.04, at], [0, 1]);
  return (
    <motion.li style={{ opacity, x }} className="relative flex gap-5">
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-brand">
        <motion.span style={{ scale: dot, opacity: dot }} className="absolute inset-0 rounded-full bg-brand" />
        <step.Icon className="relative h-5 w-5" />
        <motion.span style={{ opacity: iconOpacity }} className="absolute inset-0 flex items-center justify-center text-on-brand">
          <step.Icon className="h-5 w-5" />
        </motion.span>
      </span>
      <StepText step={step} index={index} />
    </motion.li>
  );
};

const ProcessScene = () => {
  const scenes = useScenes();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const fill = useTransform(scrollYProgress, [0.05, 0.75], [0, 1]);

  const heading = (
    <>
      <span className="eyebrow">Proceso</span>
      <h2 className="mt-4 text-title-1 font-bold text-ink">¿Cómo funciona el proceso?</h2>
      <p className="mt-5 max-w-sm text-lg text-ink-2">Cuatro pasos desde tu registro hasta tu certificado.</p>
    </>
  );

  if (!scenes) {
    return (
      <section ref={ref} className="py-24">
        <Container>
          <Reveal>{heading}</Reveal>
          <Reveal group as="ol" step={0.1} className="relative mt-12 space-y-10">
            <span className="absolute bottom-6 left-6 top-6 w-px bg-line-strong" aria-hidden="true" />
            {steps.map((s, i) => <StepRowStatic key={s.title} step={s} index={i} />)}
          </Reveal>
        </Container>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[300vh]">
      <div className="sticky top-16 flex h-[calc(100svh-4rem)] items-center">
        <Container className="grid grid-cols-12 items-center gap-10">
          <div className="col-span-5">{heading}</div>
          <ol className="relative col-span-7 space-y-12">
            <span className="absolute bottom-6 left-6 top-6 w-px bg-line-strong" aria-hidden="true" />
            <motion.span
              style={{ scaleY: fill }}
              className="absolute bottom-6 left-6 top-6 w-px origin-top bg-brand"
              aria-hidden="true"
            />
            {steps.map((s, i) => <StepRowScroll key={s.title} step={s} index={i} progress={scrollYProgress} />)}
          </ol>
        </Container>
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
  return (
    <section className="relative py-24 sm:py-32">
      <Container>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeading align="left" eyebrow="Ayuda" title="Preguntas frecuentes" />
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
                    transition={{ duration: 0.5, ease: ease.inOutQuart }}
                    className="fixed inset-0 z-[100] bg-canvas"
                  />
                )}
              </AnimatePresence>
            </Reveal>
          </div>

          <Reveal group as="ul" className="divide-y divide-line border-y border-line lg:col-span-8">
            {faqs.map((faq, idx) => (
              <Reveal.Item as="li" key={idx}>
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
                <AnimatePresence initial={false}>
                  {openIdx === idx && (
                    <m.div
                      key="content"
                      id={`faq-answer-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ height: { duration: 0.35, ease: ease.outExpo }, opacity: { duration: 0.2 } }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p className="max-w-2xl pb-6 text-base text-ink-2">{faq.answer}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </Reveal.Item>
            ))}
          </Reveal>
        </div>
      </Container>
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
      <Star key={i} className={`${size} ${i < rating ? 'text-brand' : 'text-gray-700'}`} fill={i < rating ? 'currentColor' : 'none'} />
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
      <Container>
        <SectionHeading eyebrow="Reseñas" title="¿Qué opinan nuestros estudiantes?" />
        <div className="custom-scrollbar mt-12 select-none overflow-x-auto pb-4">
          <div ref={carouselRef} className="flex gap-4">
            {loading ? (
              [0, 1, 2].map((i) => (
                <div key={i} className="h-56 min-w-[300px] flex-1 animate-pulse rounded-3xl border border-line bg-surface" />
              ))
            ) : error ? (
              <div className="w-full py-12 text-center text-red-300">{error}</div>
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
      </Container>
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
  const scenes = useScenes();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'center center'] });
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [0.4, 1]);

  return (
    <section ref={ref} className="relative py-24 sm:py-32">
      <Container>
        <motion.div
          style={scenes ? { scale, opacity } : undefined}
          className="relative overflow-hidden rounded-[2.5rem] border border-line bg-surface px-6 py-20 text-center shadow-raised sm:px-16 sm:py-28"
        >
          <div className="pointer-events-none absolute inset-x-0 -top-1/2 mx-auto h-full w-3/4 rounded-[50%] bg-[radial-gradient(closest-side,rgb(161_219_135/0.18),transparent)]" aria-hidden="true" />
          <div className="relative">
            <h2 className="mx-auto max-w-3xl text-title-1 font-bold text-ink">
              ¿Listo para encontrar tu próxima <span className="text-brand">oportunidad</span>?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-ink-2">Únete a miles de empresas que ya están aprovechando nuestras herramientas</p>
            <ul className="mt-8 flex flex-wrap justify-center gap-2">
              {perks.map((p) => (
                <li key={p} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.04] px-4 py-1.5 text-sm text-ink-2">
                  <Check className="h-3.5 w-3.5 text-brand" /> {p}
                </li>
              ))}
            </ul>
            <Button size="lg" className="mt-10" onClick={onStart}>
              Comenzar ahora <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="mt-4 text-xs text-ink-3">Cursos gratuitos y sin compromiso</p>
          </div>
        </motion.div>
      </Container>
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setShowLogin(true);
    }
  };
  return (
    <>
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
