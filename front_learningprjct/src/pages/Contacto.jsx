// Validación simple de campos requeridos
function validateContactForm(data) {
  const errors = {};
  if (!data.name) errors.name = 'El nombre es obligatorio.';
  if (!data.email) errors.email = 'El email es obligatorio.';
  else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.email = 'El email no es válido.';
  if (!data.subject) errors.subject = 'El asunto es obligatorio.';
  if (!data.message) errors.message = 'El mensaje es obligatorio.';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import ContactHero from '../components/contact/ContactHero';
import ContactChannels from '../components/contact/ContactChannels';
import ContactForm from '../components/contact/ContactForm';
import QuickAnswers from '../components/contact/QuickAnswers';
import LocationCard from '../components/contact/LocationCard';
import ContactBackdrop from '../components/contact/ContactBackdrop';
import { duration, ease, stagger } from '../lib/motion';
import { glideTo } from '../lib/smoothScroll';
import usePageMeta from '../hooks/usePageMeta';

const PAGE_TITLE = 'Contacto · Evenor-Tech Campus';
const PAGE_DESCRIPTION =
  'Resuelve tus dudas sobre cursos, matrícula, acceso a la plataforma o certificados. Escribe al equipo del campus de Evenor-Tech en Sevilla.';

const IDLE = { submitted: false, loading: false, error: null, successMessage: null, validationErrors: {} };

const Contact = () => {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [formStatus, setFormStatus] = useState(IDLE);

  const formRef = useRef(null);
  const formCardRef = useRef(null);

  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);

  // Scroll al formulario si viene desde FAQ
  useEffect(() => {
    if (location.state && location.state.scrollToForm && formCardRef.current) {
      const headerOffset = 96;
      const elementPosition = formCardRef.current.getBoundingClientRect().top + window.pageYOffset;
      glideTo(elementPosition - headerOffset);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const messageData = {
      name: formData.get('name')?.trim() || '',
      email: formData.get('email')?.trim() || '',
      phone: formData.get('phone')?.trim() || '',
      company: formData.get('company')?.trim() || '',
      subject: formData.get('subject')?.trim() || '',
      message: formData.get('message')?.trim() || ''
    };

    const validation = validateContactForm(messageData);
    if (!validation.isValid) {
      setFormStatus({
        loading: false,
        submitted: false,
        error: 'Por favor, completa todos los campos requeridos correctamente',
        validationErrors: validation.errors
      });
      return;
    }

    setFormStatus({ loading: true, submitted: false, error: null, validationErrors: {} });

    try {
      const response = await sendContactMessage(messageData);

      formRef.current.reset();
      setFormStatus({
        loading: false,
        submitted: true,
        error: null,
        successMessage: response.message || '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.',
        validationErrors: {}
      });
    } catch (error) {
      // El aviso de error se queda visible hasta el siguiente intento (antes desaparecía a los 6 s)
      setFormStatus({
        loading: false,
        submitted: false,
        error: error.message || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
        validationErrors: {}
      });
    }
  };

  // "Enviar otro mensaje": vuelve al formulario (antes se volvía solo a los 8 s)
  const resetStatus = useCallback(() => setFormStatus(IDLE), []);

  // Entrada escalonada corta; con reduced motion, solo fundido
  const group = { hidden: {}, show: { transition: { staggerChildren: stagger.cards, delayChildren: 0.05 } } };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: reduce ? duration.fast : duration.scene, ease: ease.outExpo } },
  };

  return (
    <div className="relative isolate min-h-dvh pb-[27rem]">
      <ContactBackdrop />

      <motion.div
        variants={group}
        initial="hidden"
        animate="show"
        className="mx-auto w-full max-w-wide px-gutter pt-8 sm:pt-12 lg:pt-16"
      >
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-24">
          <div className="flex flex-col gap-10 lg:col-span-5 lg:gap-12 lg:pt-6">
            <motion.div variants={item}>
              <ContactHero />
            </motion.div>
            <motion.div variants={item}>
              <ContactChannels />
            </motion.div>
          </div>

          <motion.div ref={formCardRef} variants={item} className="scroll-mt-24 lg:col-span-7">
            <ContactForm ref={formRef} status={formStatus} onSubmit={handleSubmit} onReset={resetStatus} />
          </motion.div>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-10 lg:mt-24 lg:grid-cols-12 lg:gap-x-16 xl:gap-x-24">
          <motion.div variants={item} className="lg:col-span-5">
            <QuickAnswers />
          </motion.div>
          <motion.div variants={item} className="lg:col-span-7">
            <LocationCard />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

// Envía el mensaje de contacto al backend
async function sendContactMessage(data) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
  const res = await fetch(`${apiUrl}/api/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || 'Error al enviar el mensaje');
  }
  return await res.json();
}

export default Contact;
