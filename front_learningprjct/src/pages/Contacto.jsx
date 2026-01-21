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
import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { 
  MapPin, 
  Mail, 
  Phone, 
  Linkedin, 
  Send, 
  CheckCircle, 
  ArrowRight, 
  ExternalLink,
  MessageSquare,
  User,
  Building2,
  FileText,
  Sparkles
} from 'lucide-react';
import Container from '../components/ui/Container';


const Contact = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    loading: false,
    error: null,
    successMessage: null,
    validationErrors: {}
  });
  
  const [isMobile, setIsMobile] = useState(false);
  const [isHoveringButton, setIsHoveringButton] = useState(false);
  
  const formRef = useRef(null);
  const sectionRef = useRef(null);
  const mainRef = useRef(null);
  const containerRef = useRef(null);
  
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  const mainInView = useInView(mainRef, { once: true, margin: "-100px" });

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Scroll al contenedor principal si viene desde FAQ
  useEffect(() => {
    if (location.state && location.state.scrollToForm && containerRef.current) {
      const headerOffset = 80; // Ajusta según el alto de tu header
      const elementPosition = containerRef.current.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: elementPosition - headerOffset,
        behavior: 'smooth'
      });
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

      setTimeout(() => {
        setFormStatus({ loading: false, submitted: false, error: null, validationErrors: {} });
      }, 8000);

    } catch (error) {
      setFormStatus({
        loading: false,
        submitted: false,
        error: error.message || 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.',
        validationErrors: {}
      });

      setTimeout(() => {
        setFormStatus({ loading: false, submitted: false, error: null, validationErrors: {} });
      }, 6000);
    }
  };

  const contactInfo = [
    {
      id: 1,
      icon: <MapPin className="w-5 h-5" />,
      title: "Dirección",
      details: "Av. de la República Argentina, 27, 41011 Sevilla",
      action: {
        label: "Ver mapa",
        url: "https://www.google.com/maps/place/Evenor-Tech/@37.3774502,-6.0050107,1318m/data=!3m2!1e3!4b1!4m6!3m5!1s0xd126dcad1bdd721:0xd80c106b41b3600e!8m2!3d37.377446!4d-6.0024358!16s%2Fg%2F11v68x5c3d?entry=ttu&g_ep=EgoyMDI1MDkwOC4wIKXMDSoASAFQAw%3D%3D",
        icon: <ExternalLink className="w-3 h-3" />
      },
      color: '#a1db87'
    },
    {
      id: 2,
      icon: <Mail className="w-5 h-5" />,
      title: "Email",
      details: "campusevenor@gmail.com",
      action: {
        label: "Enviar",
        url: "mailto:campusevenor@gmail.com",
        icon: <Send className="w-3 h-3" />
      },
      color: '#8bc96a'
    },
    {
      id: 3,
      icon: <Phone className="w-5 h-5" />,
      title: "Teléfono",
      details: "+34 954 151 096",
      action: {
        label: "Llamar",
        url: "tel:+34954151096",
        icon: <Phone className="w-3 h-3" />
      },
      color: '#7fb85d'
    },
    {
      id: 4,
      icon: <Linkedin className="w-5 h-5" />,
      title: "LinkedIn",
      details: "Síguenos en LinkedIn",
      action: {
        label: "Visitar",
        url: "https://www.linkedin.com/company/evenor-tech/",
        icon: <ExternalLink className="w-3 h-3" />
      },
      color: '#6fa550'
    }
  ];

    return (
      <div ref={containerRef} className="min-h-screen bg-transparent py-12 sm:py-16 md:py-20">
      {/* Decoraciones de fondo */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-[#a1db87]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#a1db87]/5 rounded-full blur-3xl" />

      <Container>
        {/* Header Principal */}
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={isInView ? { scale: 1, rotate: 0 } : {}}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="inline-flex items-center px-4 py-2 bg-[#2a2a2a] border border-[#a1db87]/30 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4 text-[#a1db87] mr-2" />
            <span className="text-xs sm:text-sm font-semibold text-[#a1db87]">
              Contacto
            </span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 font-[Rondana]">
            ¿Listo para empezar con <span className="text-[#a1db87]">tu proyecto</span>?
          </h1>

          <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto">
            Estamos disponibles para responder todas tus preguntas
          </p>
        </motion.div>

        {/* Contenedor principal en grid */}
        <motion.div
          ref={mainRef}
          initial={{ opacity: 0, y: 30 }}
          animate={mainInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid lg:grid-cols-3 gap-8 relative z-10"
        >
          {/* Columna izquierda: Información de contacto */}
          <div className="lg:col-span-1 space-y-6">
            {/* Cards de información */}
            <div className="space-y-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={info.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={mainInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-[#1a1a1a] border border-[#444444] rounded-xl p-4 hover:border-[#a1db87] transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${info.color}20`, color: info.color }}
                    >
                      {info.icon}
                    </div>

                    <div className="flex-grow min-w-0">
                      <h3 className="text-sm font-bold text-white mb-1">
                        {info.title}
                      </h3>
                      <p className="text-xs text-gray-300 mb-2 break-words">
                        {info.details}
                      </p>
                      {info.action && (
                        <a
                          href={info.action.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#a1db87] hover:text-[#8bc96a] font-medium"
                        >
                          {info.action.label}
                          {info.action.icon}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Mapa compacto */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={mainInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.7 }}
              className="bg-[#2a2a2a] border-2 border-[#a1db87] rounded-xl overflow-hidden"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3170.456193220813!2d-6.005224583886922!3d37.377445979833104!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd126dcad1bdd721%3A0xd80c106b41b3600e!2sEvenor-Tech!5e0!3m2!1ses!2ses!4v1694347141372!5m2!1ses!2ses"
                width="100%"
                height="250"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Evenor-Tech"
              />
            </motion.div>
          </div>

          {/* Columna derecha: Formulario */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={mainInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.4 }}
              className="bg-[#2a2a2a] border-2 border-[#a1db87] rounded-2xl p-6 sm:p-8"
            >
              <h2 className="text-2xl font-bold text-white mb-6">
                Envíanos un <span className="text-[#a1db87]">mensaje</span>
              </h2>

              <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                {/* Fila 1: Nombre y Email */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <User className="w-4 h-4 text-[#a1db87] mr-2" />
                      Nombre completo<span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder="Tu nombre completo"
                      required
                      className="w-full px-4 py-2.5 border border-[#444444] bg-[#1a1a1a] text-white rounded-lg focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition-all placeholder-gray-500 text-sm"
                    />
                    {formStatus.validationErrors.name && (
                      <p className="text-red-400 text-xs mt-1">{formStatus.validationErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <Mail className="w-4 h-4 text-[#a1db87] mr-2" />
                      Email<span className="text-red-400 ml-1">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="correo@ejemplo.com"
                      required
                      className="w-full px-4 py-2.5 border border-[#444444] bg-[#1a1a1a] text-white rounded-lg focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition-all placeholder-gray-500 text-sm"
                    />
                    {formStatus.validationErrors.email && (
                      <p className="text-red-400 text-xs mt-1">{formStatus.validationErrors.email}</p>
                    )}
                  </div>
                </div>

                {/* Fila 2: Teléfono y Empresa */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <Phone className="w-4 h-4 text-[#a1db87] mr-2" />
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+34 000 000 000"
                      className="w-full px-4 py-2.5 border border-[#444444] bg-[#1a1a1a] text-white rounded-lg focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition-all placeholder-gray-500 text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                      <Building2 className="w-4 h-4 text-[#a1db87] mr-2" />
                      Empresa/Organización
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      placeholder="Nombre de tu empresa"
                      className="w-full px-4 py-2.5 border border-[#444444] bg-[#1a1a1a] text-white rounded-lg focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition-all placeholder-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* Fila 3: Asunto */}
                <div>
                  <label htmlFor="subject" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <FileText className="w-4 h-4 text-[#a1db87] mr-2" />
                    Asunto<span className="text-red-400 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    placeholder="¿En qué podemos ayudarte?"
                    required
                    className="w-full px-4 py-2.5 border border-[#444444] bg-[#1a1a1a] text-white rounded-lg focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition-all placeholder-gray-500 text-sm"
                  />
                  {formStatus.validationErrors.subject && (
                    <p className="text-red-400 text-xs mt-1">{formStatus.validationErrors.subject}</p>
                  )}
                </div>

                {/* Fila 4: Mensaje */}
                <div>
                  <label htmlFor="message" className="flex items-center text-sm font-medium text-gray-300 mb-2">
                    <MessageSquare className="w-4 h-4 text-[#a1db87] mr-2" />
                    Mensaje<span className="text-red-400 ml-1">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Escribe aquí tu mensaje..."
                    required
                    className="w-full px-4 py-2.5 border border-[#444444] bg-[#1a1a1a] text-white rounded-lg focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition-all placeholder-gray-500 resize-none text-sm"
                  />
                  {formStatus.validationErrors.message && (
                    <p className="text-red-400 text-xs mt-1">{formStatus.validationErrors.message}</p>
                  )}
                </div>

                {/* Mensajes de error/éxito */}
                {formStatus.error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                  >
                    {formStatus.error}
                  </motion.div>
                )}

                {formStatus.submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-[#1e3a1a] border border-[#a1db87]/30 rounded-lg text-[#a1db87] text-sm flex items-center"
                  >
                    <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                    {formStatus.successMessage}
                  </motion.div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={formStatus.loading || formStatus.submitted}
                  onMouseEnter={() => setIsHoveringButton(true)}
                  onMouseLeave={() => setIsHoveringButton(false)}
                  className={`w-full relative px-6 py-3 font-bold rounded-xl shadow-lg overflow-hidden group transition-all ${
                    formStatus.submitted
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-[#a1db87] text-[#1a1a1a] hover:shadow-xl cursor-pointer'
                  }`}
                >
                  {!formStatus.submitted && !formStatus.loading && (
                    <motion.div
                      className="absolute inset-0 bg-white"
                      initial={{ x: '-100%', opacity: 0.3 }}
                      animate={isHoveringButton ? { x: '100%' } : {}}
                      transition={{ duration: 0.6 }}
                    />
                  )}

                  <span className="relative z-10 flex items-center justify-center">
                    {formStatus.loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Enviando...
                      </>
                    ) : formStatus.submitted ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        ¡Mensaje enviado!
                      </>
                    ) : (
                      <>
                        Enviar mensaje
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </span>
                </button>

                {/* Nota de privacidad */}
                <p className="text-xs text-gray-400 text-center">
                  Al enviar este formulario, aceptas nuestra política de privacidad
                </p>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </Container>
    </div>
  );
};

// Envía el mensaje de contacto al backend
async function sendContactMessage(data) {
  const res = await fetch('/api/contact', {
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