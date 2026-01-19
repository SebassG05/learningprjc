// Carrusel de reseñas de estudiantes
import { Star } from 'lucide-react';
import { useRef } from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Container from '../components/ui/Container';
import { 
  TrendingUp, Building2, Clock, ArrowRight, Sparkles, 
  Award, FileText, Euro, Video, ListChecks
} from 'lucide-react';
import Footer from '../components/layout/Footer';

const HeroSection = () => {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);
    const [showBoxes, setShowBoxes] = useState(true);
    const [hideAnim, setHideAnim] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return (
    <section className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
      <Container>
        {/* Título principal del sistema */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#a1db87] to-white bg-clip-text text-transparent mb-3">
            <span className="font-[Rondana]">CAMPUS</span>
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-6"
          >
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#a1db87]"></div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#a1db87] to-emerald-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-[#a1db87]/40 rounded-lg px-6 py-2">
                  <span className="text-lg font-bold text-[#a1db87] tracking-[0.2em]">
                    E-LEARNING
                  </span>
                </div>
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#a1db87]"></div>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="inline-block"
              >
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#a1db87]/50 to-transparent mt-1"></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Badge superior centrado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2a2a2a] border border-[#a1db87]/30 rounded-full">
            <TrendingUp className="w-4 h-4 text-[#a1db87]" />
            <span className="text-xs sm:text-sm font-semibold text-[#a1db87]">
              Ventajas del Campus
            </span>
          </div>
        </motion.div>

        {/* Showcase de Fuentes Institucionales - Ancho completo */}
        <div className="w-full">
          
          {/* SHOWCASE DE FUENTES DE DATOS */}
          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#333333] shadow-2xl"
            >
              {/* Header del showcase */}
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-[Rondana] text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  ¿Qué puedes esperar de los cursos?
                </motion.h2>
              </div>

          

              {/* Tarjetas de características del curso */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
              >
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <Clock className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Acceso 24/7 durante 7 semanas</h3>
                  <p className="text-gray-400 text-sm">(11 marzo - 29 abril 2026)</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <Video className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Vídeos, lecturas y material técnico</h3>
                  <p className="text-gray-400 text-sm">Todo descargable y disponible online</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <ListChecks className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Ejercicios prácticos + tests</h3>
                  <p className="text-gray-400 text-sm">Autoevaluación por módulo y guía paso a paso</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <Award className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Certificado profesional autorizado</h3>
                  <p className="text-gray-400 text-sm">Evaluación final y diploma Evenor-Tech</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Decoraciones externas - solo desktop */}
            {!isMobile && (
              <>
                <div className="absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 w-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 rounded-xl bg-[#a1db87]/20 rotate-12" />
                <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-5 sm:w-8 h-5 sm:h-8 rounded-lg border border-[#a1db87] -rotate-12" />
              </>
            )}
          </div>
        </div>
      </Container>
      {/* Proceso de inscripción - vertical stepper */}
      <section className="relative py-24 sm:py-32 flex items-center justify-center bg-transparent">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="flex flex-col items-center justify-center w-full"
          >
            <h2 className="font-[Rondana] text-3xl sm:text-4xl font-bold text-center text-white mb-16 underline underline-offset-8 decoration-[#a1db87]">
              ¿Cómo funciona el proceso?
            </h2>
            <ol className="relative mx-auto min-h-[520px] max-w-4xl w-full">
              {[{
                icon: <ArrowRight className='w-6 h-6 text-[#a1db87]' />,
                title: 'Inicia sesión o regístrate',
                desc: 'Crea tu cuenta o accede con tus credenciales para comenzar tu formación.'
              }, {
                icon: <FileText className='w-6 h-6 text-[#a1db87]' />,
                title: 'Aplica al curso de tu interés',
                desc: 'Explora el catálogo, selecciona el curso y completa tu inscripción en pocos pasos.'
              }, {
                icon: <ListChecks className='w-6 h-6 text-[#a1db87]' />,
                title: 'Supera los temarios y tests',
                desc: 'Avanza a tu ritmo, estudia los módulos y aprueba los tests de autoevaluación.'
              }, {
                icon: <Award className='w-6 h-6 text-[#a1db87]' />,
                title: 'Obtén tu certificado',
                desc: 'Recibe tu diploma profesional al finalizar y aprobar el curso, listo para tu CV.'
              }].map((step, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.3 + idx * 0.4 }}
                  className={`relative flex w-full min-h-[140px] ${idx !== 3 ? 'mb-12' : ''}`}
                >
                  {/* Timeline vertical line */}
                  <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full flex flex-col items-center z-0">
                    <div className={`w-1 h-full bg-[#a1db87]/60 ${idx === 0 ? 'rounded-t-full' : ''} ${idx === 3 ? 'rounded-b-full' : ''}`}></div>
                  </div>
                  {/* Icon */}
                  <span className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center w-14 h-14 bg-[#23272f] border-4 border-[#a1db87] rounded-full shadow-lg z-10">
                    {step.icon}
                  </span>
                  {/* Text block, alternate left/right, not centered */}
                  {idx % 2 === 0 ? (
                    <div className="w-1/2 flex flex-col justify-center items-end pr-16 text-right ml-0 mr-auto" style={{minHeight:'140px'}}>
                      <h3 className="font-bold text-xl text-white mb-2 mt-1"><span className="text-[#a1db87] mr-2">{idx+1}.</span>{step.title}</h3>
                      <p className="text-gray-300 text-base max-w-md">{step.desc}</p>
                    </div>
                  ) : (
                    <div className="w-1/2 flex flex-col justify-center items-start pl-16 text-left ml-auto mr-0" style={{minHeight:'140px'}}>
                      <h3 className="font-bold text-xl text-white mb-2 mt-1"><span className="text-[#a1db87] mr-2">{idx+1}.</span>{step.title}</h3>
                      <p className="text-gray-300 text-base max-w-md">{step.desc}</p>
                    </div>
                  )}
                </motion.li>
              ))}
            </ol>
          </motion.div>
        </Container>
      </section>
    </section>
  );
};


// FAQ Section Component con animaciones y diseño profesional
import { ChevronDown } from 'lucide-react';
import { AnimatePresence, motion as m } from 'framer-motion';

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
      answer: 'Puedes contactar con soporte desde la sección de ayuda o escribiendo a soporte@evenor-tech.com.'
    },
  ];
  const [openIdx, setOpenIdx] = useState(null);
  return (
    <section className="relative pt-0 pb-8 sm:pt-0 sm:pb-10 bg-transparent">
      <div className="max-w-6xl mx-auto px-2">
        <h2 className="font-[Rondana] text-3xl sm:text-4xl font-bold text-center text-white mb-12 underline underline-offset-8 decoration-[#a1db87]">Preguntas frecuentes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          {/* FAQ a la izquierda */}
          <ul className="space-y-6 md:pr-4">
            {faqs.map((faq, idx) => (
              <li key={idx} className="bg-[#23272f] border border-[#a1db87]/30 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                <button
                  className={`w-full flex justify-between items-center px-7 py-6 text-left focus:outline-none group transition-colors duration-300 ${openIdx === idx ? 'bg-[#23272f]/80 border-l-4 border-[#a1db87]' : ''}`}
                  onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
                  aria-expanded={openIdx === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span className="text-lg font-semibold text-white group-hover:text-[#a1db87] transition-colors flex-1">
                    {faq.question}
                  </span>
                  <m.span
                    animate={{ rotate: openIdx === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="ml-4"
                  >
                    <ChevronDown className="w-7 h-7 text-[#a1db87]" />
                  </m.span>
                </button>
                <AnimatePresence initial={false}>
                  {openIdx === idx && (
                    <m.div
                      key="content"
                      id={`faq-answer-${idx}`}
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
                      style={{ overflow: 'hidden' }}
                      className="px-7 pb-6 text-gray-300 text-base origin-top"
                      layout
                    >
                      <m.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.28, ease: 'easeOut' }}
                      >
                        {faq.answer}
                      </m.div>
                    </m.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
          {/* CTA y recursos útiles a la derecha */}
          <div className="w-full flex flex-col items-center justify-start">
            <m.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#23272f] to-[#1a1a1a] border border-[#a1db87]/30 rounded-2xl shadow-xl p-10 min-h-[340px]"
            >
              <div className="flex flex-col items-center mb-6">
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#a1db87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mb-2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 1 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span className="text-xl font-bold text-white mb-1">¿No encuentras tu respuesta?</span>
                <span className="text-[#a1db87] text-base">Estamos aquí para ayudarte</span>
              </div>
              <motion.button
                whileTap={{ scale: 0.96 }}
                whileHover={{ scale: 1.04 }}
                onClick={() => {
                  setAnimating(true);
                  setTimeout(() => {
                    navigate('/contacto');
                  }, 600);
                }}
                className="cursor-pointer mt-4 inline-block px-7 py-3 rounded-lg bg-[#a1db87] text-[#1a1a1a] font-bold text-lg shadow-md hover:bg-emerald-400 transition-colors duration-200"
              >
                Contáctanos
              </motion.button>
              {/* Overlay animado para transición profesional */}
              <AnimatePresence>
                {animating && (
                  <m.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeInOut', opacity: { duration: 1.1, ease: 'easeInOut' } }}
                    style={{ position: 'fixed', inset: 0, zIndex: 100, background: '#23272f' }}
                  />
                )}
              </AnimatePresence>
            </m.div>
            {/* Recursos útiles */}
            <m.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="w-full mt-8 flex flex-col items-center justify-center bg-[#23272f] border border-[#a1db87]/20 rounded-2xl shadow-lg p-7"
            >
              <span className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <svg width="22" height="22" fill="none" stroke="#a1db87" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M8 16h8M8 8h8"/></svg>
                Recursos útiles
              </span>
              <ul className="space-y-2 w-full">
                <li>
                  <a href="#" className="block px-4 py-2 rounded-md text-[#a1db87] font-semibold bg-[#1a1a1a] hover:bg-[#a1db87] hover:text-[#1a1a1a] transition-colors duration-200 text-center">Guía de usuario</a>
                </li>
              </ul>
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
};

const reviewsMock = [
  {
    name: 'María López',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    rating: 5,
    text: 'El campus superó mis expectativas. Los contenidos son claros y el soporte es excelente. ¡Repetiría sin dudarlo!'
  },
  {
    name: 'Carlos García',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    rating: 4,
    text: 'Muy buena experiencia, los tests ayudan mucho a afianzar los conocimientos. Recomiendo el curso a todos.'
  },
  {
    name: 'Lucía Fernández',
    avatar: 'https://randomuser.me/api/portraits/women/65.jpg',
    rating: 5,
    text: 'Me encantó la flexibilidad y la calidad del material. El certificado me ayudó a mejorar mi CV.'
  },
  {
    name: 'Javier Ruiz',
    avatar: 'https://randomuser.me/api/portraits/men/41.jpg',
    rating: 5,
    text: 'Plataforma intuitiva y profesores muy atentos. Aprendí mucho más de lo que esperaba.'
  },
  {
    name: 'Ana Torres',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
    rating: 4,
    text: 'El contenido es actual y práctico. Me gustó poder avanzar a mi ritmo y repetir los módulos.'
  },
  {
    name: 'Pedro Sánchez',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg',
    rating: 5,
    text: 'Excelente atención y material descargable. Lo recomiendo para quienes buscan formación profesional.'
  },
];

const ReviewsCarousel = () => {
  const carouselRef = useRef(null);
  const [modalReview, setModalReview] = useState(null);
  const reviews = [...reviewsMock, ...reviewsMock];
  const truncate = (str, n) => (str.length > n ? str.slice(0, n) + '…' : str);
  return (
    <section className="relative py-16 bg-transparent">
      <Container>
        <h2 className="font-[Rondana] text-3xl sm:text-4xl font-bold text-center text-white mb-12 underline underline-offset-8 decoration-[#a1db87]">
          ¿Qué opinan nuestros estudiantes?
        </h2>
        <div className="overflow-x-hidden">
          <div
            ref={carouselRef}
            className="flex gap-10 animate-carousel whitespace-nowrap"
            style={{ willChange: 'transform' }}
          >
            {reviews.map((review, idx) => {
              const maxLen = 110;
              const isLong = review.text.length > maxLen;
              return (
                <div
                  key={idx}
                  className="min-w-[400px] max-w-md bg-[#23272f] border border-[#a1db87]/20 rounded-2xl shadow-lg px-10 py-8 flex flex-col items-center text-center relative"
                >
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className="w-20 h-20 rounded-full border-2 border-[#a1db87] mb-4 object-cover"
                    loading="lazy"
                  />
                  <div className="flex items-center justify-center mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < review.rating ? 'text-[#a1db87]' : 'text-gray-600'}`} fill={i < review.rating ? '#a1db87' : 'none'} />
                    ))}
                  </div>
                  <div className="w-full flex flex-col items-center">
                    <p className="text-gray-200 text-lg mb-2 w-full line-clamp-3 break-words">“{review.text}”</p>
                    {isLong && (
                      <button
                        className="text-[#a1db87] underline text-sm hover:text-emerald-400 transition-colors mb-2"
                        onClick={() => setModalReview(review)}
                      >
                        Ver reseña completa
                      </button>
                    )}
                  </div>
                  <span className="font-bold text-[#a1db87] text-xl">{review.name}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* Modal para reseña completa */}
        {modalReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-[#23272f] border border-[#a1db87]/30 rounded-2xl shadow-2xl p-8 max-w-lg w-full relative animate-fadeIn">
              <button
                className="absolute top-3 right-3 text-[#a1db87] text-2xl font-bold hover:text-emerald-400 transition-colors"
                onClick={() => setModalReview(null)}
                aria-label="Cerrar"
              >
                ×
              </button>
              <img
                src={modalReview.avatar}
                alt={modalReview.name}
                className="w-20 h-20 rounded-full border-2 border-[#a1db87] mb-4 object-cover mx-auto"
                loading="lazy"
              />
              <div className="flex items-center justify-center mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-6 h-6 ${i < modalReview.rating ? 'text-[#a1db87]' : 'text-gray-600'}`} fill={i < modalReview.rating ? '#a1db87' : 'none'} />
                ))}
              </div>
              <p className="text-gray-200 text-lg mb-4 text-center">“{modalReview.text}”</p>
              <span className="font-bold text-[#a1db87] text-xl block text-center">{modalReview.name}</span>
            </div>
            <style>{`
              .animate-fadeIn { animation: fadeIn .3s cubic-bezier(.4,0,.2,1); }
              @keyframes fadeIn { from { opacity: 0; transform: scale(.96);} to { opacity: 1; transform: scale(1);} }
            `}</style>
          </div>
        )}
        {/* Clamp multiline utility for tailwind (if not presente in tu config, add @tailwindcss/line-clamp to tailwind.config.js) */}
        <style>{`
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        `}</style>
      </Container>
      {/* Animación CSS para el carrusel */}
      <style>{`
        @keyframes carousel {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-carousel {
          animation: carousel 40s linear infinite;
        }
      `}</style>
    </section>
  );
};


const Home = () => {
  const navigate = useNavigate();
  const [animating, setAnimating] = useState(false);
  return (
    <>
      <HeroSection />
      <FAQSection animating={animating} setAnimating={setAnimating} navigate={navigate} />
      <ReviewsCarousel />
      {/* Sección CTA inspirada en la imagen */}
      <section className="relative flex items-center justify-center py-16 sm:py-20">
        <Container>
          <div className="relative bg-[#23272f] border border-[#a1db87] rounded-2xl shadow-2xl px-6 sm:px-16 py-12 sm:py-16 flex flex-col items-center text-center overflow-hidden">
            {/* Borde decorativo */}
            <div className="absolute inset-0 rounded-2xl border border-[#a1db87]/40 pointer-events-none" aria-hidden="true"></div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 leading-tight">
              ¿Listo para encontrar tu próxima <span className="text-[#a1db87]">oportunidad</span>?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">Únete a miles de empresas que ya están aprovechando nuestras herramientas</p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <span className="flex items-center gap-2 bg-black/70 border border-[#a1db87]/30 rounded-full px-5 py-2 text-sm text-gray-100 font-semibold"><span className="text-[#a1db87]">✔</span> Registro gratuito</span>
              <span className="flex items-center gap-2 bg-black/70 border border-[#a1db87]/30 rounded-full px-5 py-2 text-sm text-gray-100 font-semibold"><span className="text-[#a1db87]">✔</span> Acceso inmediato</span>
              <span className="flex items-center gap-2 bg-black/70 border border-[#a1db87]/30 rounded-full px-5 py-2 text-sm text-gray-100 font-semibold"><span className="text-[#a1db87]">✔</span> Sin compromiso</span>
            </div>
            <button className="bg-[#a1db87] hover:bg-emerald-400 text-black font-bold text-lg rounded-xl px-10 py-4 shadow-lg transition-colors flex items-center gap-2 mb-2">
              Comenzar ahora <ArrowRight className="w-5 h-5" />
            </button>
            <span className="text-xs text-gray-400 mt-2">No se requiere tarjeta de crédito</span>
          </div>
        </Container>
      </section>
    </>
  );
};

export default Home;