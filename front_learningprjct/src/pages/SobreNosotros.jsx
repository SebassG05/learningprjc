import React from "react";
import { Briefcase, Users, Award, HeartHandshake, Star, Globe, MessageCircle, Target, Eye, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ParallaxImage from '../components/ui/ParallaxImage';
import SplitText from '../components/ui/SplitText';
import StickyIntro from '../components/ui/StickyIntro';
import { duration, ease, spring, stagger } from '../lib/motion';

const team = [
  { name: 'Maria Anaya Romero', role: 'CEO & Fundador', img: '', linkedin: 'https://www.linkedin.com/in/mar%C3%ADa-anaya-romero-95005727/' },
  { name: 'Javier Bravo Garcia', role: 'Responsable en GIS, Teledetección y Medio Ambiente', img: '', linkedin: 'https://www.linkedin.com/in/javier-bravo-garc%C3%ADa-5158b720a/' },
  { name: 'Francisco José Blanco-Velázquez', role: 'Project Manager', img: '', linkedin: 'https://www.linkedin.com/in/francisco-jos%C3%A9-blanco-vel%C3%A1zquez-19138b103/' },
  { name: 'Sebastián Gandía Gutiérrez', role: 'Desarrollador Full Stack', img: '', linkedin: 'https://www.linkedin.com/in/sebasti%C3%A1n-gand%C3%ADa-guti%C3%A8rrez-7880662b5/' },
  { name: 'Jesús Manuel Vázquez Herrera', role: 'Desarrollador Full Stack', img: '', linkedin: 'https://www.linkedin.com/in/jes%C3%BAs-manuel-v%C3%A1zquez-herrera-8191462a3/' },
];

const values = [
  { icon: <Star className="w-6 h-6 text-brand" />, title: 'Innovación', desc: 'Siempre a la vanguardia en tecnología educativa.' },
  { icon: <HeartHandshake className="w-6 h-6 text-brand" />, title: 'Cercanía', desc: 'Acompañamos a cada alumno en su camino.' },
  { icon: <Award className="w-6 h-6 text-brand" />, title: 'Calidad', desc: 'Cursos y soporte de máxima calidad.' },
  { icon: <Globe className="w-6 h-6 text-brand" />, title: 'Accesibilidad', desc: 'Formación para todos, sin barreras.' },
  { icon: <Globe className="w-6 h-6 text-brand" />, title: 'Transparencia', desc: 'Comprometidos con la honestidad y claridad en todas nuestras acciones.' },
];

export default function SobreNosotros() {
  // Testimonios hooks deben estar aquí para cumplir las reglas de hooks
  const testimonials = [
    {
      text: 'I have been working with Evenor tech for several years and they have never disappointed me. Their solutions are reliable and efficient. The team is knowledgeable, responsive...',
      name: 'Amy Brenna',
      source: 'Trustburn',
      rating: 4,
      initials: 'AB',
      color: 'bg-brand/90',
    },
    {
      text: 'Evenor tech has exceeded my expectations. Their soil solutions are exceptional and have greatly improved the quality of my land.',
      name: 'Patricia Langford',
      source: 'Trustburn',
      rating: 4,
      initials: 'PS',
      color: 'bg-blue-400/80',
    },
    {
      text: 'I had a great experience with this company. The team was responsive and answered all my questions promptly. The solutions they offer for soil use and protection are innovative and effective.',
      name: 'Jeff Conley',
      source: 'Trustburn',
      rating: 5,
      initials: 'JF',
      color: 'bg-brand/90',
    },
    {
      text: 'Evenor tech is simply amazing! Their expertise in soil use and protection is unparalleled.',
      name: 'Gillianne Uvia',
      source: 'Trustburn',
      rating: 5,
      initials: 'GU',
      color: 'bg-brand/90',
    },
  ];
  const [idx, setIdx] = React.useState(0);
  const [direction, setDirection] = React.useState(0); // 1: next, -1: prev
  const t = testimonials[idx];
  const next = () => {
    setDirection(1);
    setIdx((i) => (i + 1) % testimonials.length);
  };
  const prev = () => {
    setDirection(-1);
    setIdx((i) => (i - 1 + testimonials.length) % testimonials.length);
  };
  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Encabezado animado */}
      <section className="mb-20">
        {/* Header Principal fijado: los valores se deslizan por encima */}
        <StickyIntro>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: duration.slow, ease: ease.outExpo }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...spring.gentle, delay: 0.1 }}
            className="inline-flex items-center px-4 py-2 bg-surface-2 border border-line rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-brand mr-2" />
            <span className="text-xs sm:text-sm font-semibold text-brand">
              Sobre Nosotros
            </span>
          </motion.div>
        </motion.div>

        <SplitText as="h1" trigger="mount" delay={0.15} className="block text-display font-bold text-ink mb-14 text-center">
          Sobre <span className="text-brand">Evenor-Tech</span>
        </SplitText>
        </StickyIntro>
        <motion.div
          className="relative z-10 flex flex-wrap justify-center gap-6 mt-8"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: stagger.cards,
                delayChildren: 0.35
              }
            },
            hidden: {}
          }}
        >
          {values.map((v, i) => (
            <motion.div
              key={i}
              className="bg-surface rounded-3xl p-6 w-full sm:w-64 flex flex-col items-center shadow-card border border-line"
              variants={{
                hidden: { opacity: 0, y: 24 },
                visible: { opacity: 1, y: 0, transition: { duration: duration.scene, ease: ease.outExpo } }
              }}
            >
              {v.icon}
              <h3 className="mt-3 mb-1 font-sans text-lg font-semibold text-ink">{v.title}</h3>
              <p className="text-ink-2 text-sm text-center">{v.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>


      {/* Nuestra Esencia */}
      <section className="mb-20">
        <div className="flex flex-col items-center mb-8">
          <span className="eyebrow mb-4">Nuestra esencia</span>
          <h2 className="text-title-1 font-bold text-ink text-center">Misión, Visión y Valores</h2>
        </div>
        <div className="w-full max-w-6xl mx-auto mb-10">
          <ParallaxImage
            src="https://res.cloudinary.com/dgbmy60sc/image/upload/v1768909817/free-photo-of-naturaleza-animal-insecto-libelula_l4rvk6.jpg"
            alt="Biodiversidad y sostenibilidad"
            className="aspect-[4/3] rounded-3xl border border-line shadow-raised sm:aspect-[21/9]"
          >
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 sm:p-10">
              <h3 className="text-title-2 font-bold text-ink mb-2">Biodiversidad y sostenibilidad</h3>
              <p className="max-w-xl text-ink/90 text-base">Nuestro compromiso con el medio ambiente y la protección de recursos naturales</p>
            </div>
          </ParallaxImage>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-12">
          {/* Misión */}
          <div className="bg-surface rounded-3xl shadow-card border border-line p-7 sm:p-10 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Target className="w-6 h-6 text-brand" />
              <span className="font-display text-title-3 font-bold text-ink">Misión</span>
            </div>
            <p className="text-ink-2 text-base leading-relaxed">
              Nuestra misión es ayudar a gestionar todo el uso del territorio de una manera sostenible y bajo herramientas sensibilizadas con la innovación, la calidad y el medio ambiente.<br /><br />
              En Evenor-Tech aplicamos tecnologías avanzadas y metodologías innovadoras para promover una gestión territorial que respete los ecosistemas naturales, maximice la eficiencia de los recursos y contribuya a la mitigación del cambio climático a través de soluciones tecnológicas accesibles para todos.
            </p>
          </div>
          {/* Visión */}
          <div className="bg-surface rounded-3xl shadow-card border border-line p-7 sm:p-10 flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-brand" />
              <span className="font-display text-title-3 font-bold text-ink">Visión</span>
            </div>
            <p className="text-ink-2 text-base leading-relaxed">
              Nuestro objetivo es ser reconocido como una organización capaz de poner remedio a la deficiente gestión de los recursos naturales.<br /><br />
              Evenor-Tech cree firmemente que se puede lograr una gestión del territorio en la que todas las personas tengan acceso a las últimas técnicas de gestión sostenible, adaptando para ello la información necesaria para el desarrollo de su actividad, mediante el uso de las TIC. Esto lograría realmente una gestión eficiente del territorio.
            </p>
          </div>
        </div>
      </section>

      {/* Equipo */}
      <section className="mb-16">
        <h2 className="text-title-2 font-bold text-ink mb-8 flex items-center gap-3 justify-center text-center"><Users className="w-6 h-6 text-brand" />Nuestro Equipo</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
          {team.slice(0, 3).map((m, i) => (
            <div key={i} className="bg-surface rounded-3xl p-6 flex flex-col items-center shadow-card border border-line">
              <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-2xl font-bold text-brand mb-2">
                {m.img ? <img src={m.img} alt={m.name} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
              </div>
              <div className="text-ink font-semibold text-base text-center">{m.name}</div>
              <div className="text-gray-400 text-xs text-center mb-1">{m.role}</div>
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand text-xs hover:underline">LinkedIn</a>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
          {team.slice(3).map((m, i) => (
            <div key={i} className="bg-surface rounded-3xl p-6 flex flex-col items-center shadow-card border border-line">
              <div className="w-16 h-16 rounded-full bg-brand/20 flex items-center justify-center text-2xl font-bold text-brand mb-2">
                {m.img ? <img src={m.img} alt={m.name} className="w-full h-full rounded-full object-cover" /> : m.name.charAt(0)}
              </div>
              <div className="text-ink font-semibold text-base text-center">{m.name}</div>
              <div className="text-gray-400 text-xs text-center mb-1">{m.role}</div>
              <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-brand text-xs hover:underline">LinkedIn</a>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonios Slider */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-ink mb-8 flex items-center gap-2 justify-center text-center"><MessageCircle className="w-6 h-6 text-brand" />Testimonios</h2>
        {/* Testimonial Data */}
        <div className="relative flex flex-col items-center">
          {/* Card */}
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: direction === 1 ? 56 : -56 }}
              animate={{ opacity: 1, x: 0, transition: spring.gentle }}
              exit={{ opacity: 0, x: direction === 1 ? -56 : 56, transition: { duration: duration.fast, ease: ease.exit } }}
              className="w-full max-w-3xl bg-surface/90 border border-line rounded-2xl shadow-card px-8 py-10 flex flex-col items-center relative"
            >
              <MessageCircle className="w-12 h-12 text-brand absolute -top-6 left-8 bg-surface rounded-full p-2 shadow" />
              <p className="text-ink text-lg md:text-xl font-medium text-center mb-8 mt-4 leading-relaxed" style={{ fontFamily: 'inherit' }}>
                "{t.text}"
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold text-on-brand shadow ${t.color}`}>
                  {t.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-ink font-semibold text-base">{t.name}</span>
                  <span className="text-brand text-sm">{t.source}</span>
                  <div className="flex items-center mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < t.rating ? 'text-brand' : 'text-gray-500'}`} fill={i < t.rating ? '#a1db87' : 'none'} />
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          {/* Nav Buttons */}
          <button onClick={prev} aria-label="Anterior" className="cursor-pointer absolute left-0 top-1/2 -translate-y-1/2 bg-brand hover:bg-brand-200 text-on-brand rounded-full w-12 h-12 flex items-center justify-center shadow-card transition-colors z-10">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={next} aria-label="Siguiente" className="cursor-pointer absolute right-0 top-1/2 -translate-y-1/2 bg-brand hover:bg-brand-200 text-on-brand rounded-full w-12 h-12 flex items-center justify-center shadow-card transition-colors z-10">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
          </button>
          {/* Dots */}
          <div className="flex gap-2 mt-8">
            {testimonials.map((_, i) => (
              <span key={i} className={`w-3 h-3 rounded-full ${i === idx ? 'bg-brand' : 'bg-gray-600'}`}></span>
            ))}
          </div>
        </div>
      </section>

      {/* Contacto directo */}
      <section className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-ink mb-2 flex items-center gap-2 justify-center"><HeartHandshake className="w-6 h-6 text-brand" />¿Quieres colaborar o tienes dudas?</h2>
        <p className="text-gray-300 mb-4">
          Escríbenos a{' '}
          <a
            href="https://outlook.live.com/mail/0/deeplink/compose?to=info@evenor-tech.com"
            className="text-brand underline"
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir Outlook para escribir a info@evenor-tech.com"
          >
            info@evenor-tech.com
          </a>
          {' '}o rellena nuestro <a href="/contacto" className="text-brand underline">formulario de contacto</a>.
        </p>
      </section>
    </div>
  );
}
