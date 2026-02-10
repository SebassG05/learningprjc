import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Book,
  UserPlus,
  LogIn,
  Play,
  Award,
  Settings,
  HelpCircle,
  ChevronRight,
  Monitor,
  Smartphone,
  Clock,
  CheckCircle2,
  Download,
  Mail,
  Search,
  FileText,
  Shield,
  CreditCard,
  MessageCircle
} from 'lucide-react';

const GuiaUsuario = () => {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'registro',
      title: '¿Cómo me registro en la plataforma?',
      icon: <UserPlus className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Registrarse en nuestra plataforma es muy sencillo:</p>
          <ol className="list-decimal list-inside space-y-3 text-gray-300 ml-4">
            <li>Haz clic en el botón <span className="text-[#a1db87] font-semibold">"Registrarse"</span> en la esquina superior derecha</li>
            <li>Completa el formulario con tu información:
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>Nombre completo</li>
                <li>Correo electrónico</li>
                <li>Contraseña segura (mínimo 8 caracteres)</li>
              </ul>
            </li>
            <li>Acepta los términos y condiciones</li>
            <li>Haz clic en <span className="text-[#a1db87] font-semibold">"Crear cuenta"</span></li>
            <li>Revisa tu correo electrónico para verificar tu cuenta</li>
          </ol>
          <div className="bg-[#1a1a1a] p-4 rounded-lg border border-[#a1db87]/20 mt-4">
            <p className="text-sm text-gray-400">
              <span className="text-[#a1db87] font-semibold">💡 Consejo:</span> También puedes registrarte usando tu cuenta de Google para un acceso más rápido.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'acceso',
      title: '¿Puedo acceder a los cursos desde cualquier dispositivo?',
      icon: <Monitor className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">¡Absolutamente! Nuestra plataforma está optimizada para todos los dispositivos:</p>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <div className="flex items-center gap-3 mb-3">
                <Monitor className="w-5 h-5 text-[#a1db87]" />
                <h4 className="font-semibold text-white">Ordenador</h4>
              </div>
              <p className="text-sm text-gray-400">Navegadores compatibles: Chrome, Firefox, Safari, Edge</p>
            </div>
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <div className="flex items-center gap-3 mb-3">
                <Smartphone className="w-5 h-5 text-[#a1db87]" />
                <h4 className="font-semibold text-white">Móvil/Tablet</h4>
              </div>
              <p className="text-sm text-gray-400">Compatible con iOS y Android. Diseño responsive adaptado.</p>
            </div>
          </div>
          <p className="text-gray-300 mt-4">Tu progreso se sincroniza automáticamente entre todos tus dispositivos.</p>
        </div>
      ),
    },
    {
      id: 'duracion',
      title: '¿Cuánto tiempo tengo para completar un curso?',
      icon: <Clock className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Cada curso tiene su propia duración estimada, pero tú marcas el ritmo:</p>
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#a1db87]/20">
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold text-white">Acceso ilimitado:</span> Una vez inscrito, tienes acceso de por vida al curso</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold text-white">A tu propio ritmo:</span> Puedes pausar y retomar cuando quieras</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span><span className="font-semibold text-white">Sin fechas límite:</span> No hay presión, aprende cuando mejor te convenga</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-400 italic">
            La duración estimada es solo una referencia. Algunos alumnos completan los cursos más rápido, otros prefieren ir más despacio.
          </p>
        </div>
      ),
    },
    {
      id: 'certificado',
      title: '¿Recibo un certificado al finalizar?',
      icon: <Award className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">¡Sí! Al completar un curso con éxito, recibirás un certificado profesional:</p>
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#a1db87]/20">
            <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#a1db87]" />
              Características del certificado:
            </h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                <span>Certificado oficial con sello de Evenor-Tech</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                <span>Incluye tu nombre, nombre del curso y fecha de finalización</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                <span>Formato PDF descargable e imprimible</span>
              </li>
              <li className="flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                <span>URL verificable para compartir en LinkedIn u otras plataformas</span>
              </li>
            </ul>
          </div>
          <div className="bg-[#23272f] p-4 rounded-lg border border-[#a1db87]/30 mt-4">
            <p className="text-sm text-gray-300">
              <span className="text-[#a1db87] font-semibold">📥 Descarga:</span> Podrás descargar tu certificado desde la sección "Mis Cursos" una vez completado el 100% del contenido.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'problemas',
      title: '¿Qué hago si tengo problemas técnicos?',
      icon: <HelpCircle className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Si encuentras algún problema técnico, sigue estos pasos:</p>
          
          <div className="space-y-3">
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-[#a1db87] text-[#1a1a1a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Soluciones rápidas
              </h4>
              <ul className="space-y-2 text-gray-300 ml-8">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                  <span>Actualiza la página (F5 o Ctrl+R)</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                  <span>Limpia la caché del navegador</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                  <span>Prueba en modo incógnito</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-[#a1db87] mt-1 flex-shrink-0" />
                  <span>Verifica tu conexión a internet</span>
                </li>
              </ul>
            </div>

            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <span className="bg-[#a1db87] text-[#1a1a1a] w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Contacta con soporte
              </h4>
              <div className="space-y-3 ml-8">
                <a href="/contacto" className="flex items-center gap-3 text-[#a1db87] hover:text-[#8bc76d] transition-colors">
                  <Mail className="w-4 h-4" />
                  <span>Envía un mensaje desde el formulario de contacto</span>
                </a>
                <div className="flex items-center gap-3 text-gray-300">
                  <MessageCircle className="w-4 h-4 text-[#a1db87]" />
                  <span>Incluye capturas de pantalla si es posible</span>
                </div>
                <div className="flex items-center gap-3 text-gray-300">
                  <Clock className="w-4 h-4 text-[#a1db87]" />
                  <span>Tiempo de respuesta: 24-48 horas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'navegacion',
      title: 'Navegación de la plataforma',
      icon: <Search className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Guía rápida para navegar por la plataforma:</p>
          <div className="grid gap-4">
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <div className="flex items-center gap-3 mb-3">
                <Book className="w-5 h-5 text-[#a1db87]" />
                <h4 className="font-semibold text-white">Catálogo de cursos</h4>
              </div>
              <p className="text-sm text-gray-400">Explora todos nuestros cursos disponibles, filtra por categoría y encuentra el curso perfecto para ti.</p>
            </div>
            
            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <div className="flex items-center gap-3 mb-3">
                <Play className="w-5 h-5 text-[#a1db87]" />
                <h4 className="font-semibold text-white">Mis cursos</h4>
              </div>
              <p className="text-sm text-gray-400">Accede a todos los cursos en los que estás inscrito y continúa donde lo dejaste.</p>
            </div>

            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <div className="flex items-center gap-3 mb-3">
                <Settings className="w-5 h-5 text-[#a1db87]" />
                <h4 className="font-semibold text-white">Ajustes</h4>
              </div>
              <p className="text-sm text-gray-400">Personaliza tu perfil, cambia tu contraseña y gestiona tus preferencias.</p>
            </div>

            <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
              <div className="flex items-center gap-3 mb-3">
                <Award className="w-5 h-5 text-[#a1db87]" />
                <h4 className="font-semibold text-white">Certificados</h4>
              </div>
              <p className="text-sm text-gray-400">Descarga y comparte tus certificados de cursos completados.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'pagos',
      title: 'Métodos de pago y facturación',
      icon: <CreditCard className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Información sobre pagos y facturación:</p>
          
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#a1db87]/20">
            <h4 className="font-semibold text-white mb-4">Métodos de pago aceptados:</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>PayPal</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>Transferencia bancaria (para empresas)</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#23272f] p-5 rounded-lg border border-[#a1db87]/30">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-white mb-2">Seguridad de pagos</h4>
                <p className="text-sm text-gray-400">Todos los pagos están protegidos con encriptación SSL. No almacenamos tus datos de tarjeta.</p>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-5 rounded-lg border border-[#a1db87]/20">
            <h4 className="font-semibold text-white mb-3">Facturación:</h4>
            <p className="text-gray-300 text-sm">Recibirás tu factura automáticamente por correo electrónico después de completar la compra. También puedes descargarla desde tu área de ajustes.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'privacidad',
      title: 'Privacidad y protección de datos',
      icon: <Shield className="w-6 h-6" />,
      content: (
        <div className="space-y-4">
          <p className="text-gray-300">Tu privacidad es nuestra prioridad:</p>
          
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#a1db87]/20">
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>Cumplimos con el <span className="font-semibold text-white">RGPD</span> (Reglamento General de Protección de Datos)</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>Tus datos personales están encriptados y protegidos</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>Nunca compartimos tu información con terceros sin tu consentimiento</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-[#a1db87] mt-0.5 flex-shrink-0" />
                <span>Puedes solicitar la eliminación de tus datos en cualquier momento</span>
              </li>
            </ul>
          </div>

          <div className="bg-[#23272f] p-4 rounded-lg border border-[#a1db87]/30">
            <p className="text-sm text-gray-300">
              Para más información, consulta nuestra <a href="/politica-privacidad" className="text-[#a1db87] hover:underline">Política de Privacidad</a> y <a href="/cookies" className="text-[#a1db87] hover:underline">Política de Cookies</a>.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const toggleSection = (id) => {
    setActiveSection(activeSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d0d0d] via-[#1a1a1a] to-[#0d0d0d] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-[#a1db87]/10 rounded-full mb-6">
            <Book className="w-10 h-10 text-[#a1db87]" />
          </div>
          <h1 className="font-[Rondana] text-4xl sm:text-5xl font-bold text-white mb-4">
            Guía de Usuario
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Todo lo que necesitas saber para aprovechar al máximo tu experiencia de aprendizaje
          </p>
        </motion.div>

        {/* Secciones de ayuda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="bg-[#23272f] rounded-xl border border-[#a1db87]/20 overflow-hidden shadow-lg hover:border-[#a1db87]/40 transition-all duration-300"
            >
              {/* Título clickeable */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-[#2a2e36] transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#a1db87]/10 rounded-lg flex items-center justify-center text-[#a1db87]">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white font-[Rondana]">
                    {section.title}
                  </h3>
                </div>
                <motion.div
                  animate={{ rotate: activeSection === section.id ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-[#a1db87]"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.div>
              </button>

              {/* Contenido expandible */}
              <motion.div
                initial={false}
                animate={{
                  height: activeSection === section.id ? 'auto' : 0,
                  opacity: activeSection === section.id ? 1 : 0,
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 border-t border-[#a1db87]/10">
                  {section.content}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer de ayuda adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-[#a1db87]/10 to-[#a1db87]/5 rounded-2xl p-8 border border-[#a1db87]/20"
        >
          <div className="text-center">
            <MessageCircle className="w-12 h-12 text-[#a1db87] mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-3 font-[Rondana]">
              ¿Necesitas más ayuda?
            </h3>
            <p className="text-gray-300 mb-6">
              Nuestro equipo de soporte está aquí para ayudarte con cualquier pregunta o problema que tengas.
            </p>
            <a
              href="/contacto"
              className="inline-flex items-center gap-2 bg-[#a1db87] text-[#1a1a1a] px-8 py-3 rounded-lg font-semibold hover:bg-[#8bc76d] transition-colors duration-200"
            >
              Contáctanos
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

        {/* Recursos adicionales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 grid md:grid-cols-3 gap-4"
        >
          <a
            href="/sobre"
            className="bg-[#23272f] p-6 rounded-xl border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-all duration-300 text-center group"
          >
            <FileText className="w-8 h-8 text-[#a1db87] mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="text-white font-semibold mb-2">Sobre nosotros</h4>
            <p className="text-sm text-gray-400">Conoce más sobre Evenor-Tech</p>
          </a>

          <a
            href="/cookies"
            className="bg-[#23272f] p-6 rounded-xl border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-all duration-300 text-center group"
          >
            <Shield className="w-8 h-8 text-[#a1db87] mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="text-white font-semibold mb-2">Política de Cookies</h4>
            <p className="text-sm text-gray-400">Información sobre cookies</p>
          </a>

          <a
            href="/cursos"
            className="bg-[#23272f] p-6 rounded-xl border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-all duration-300 text-center group"
          >
            <Book className="w-8 h-8 text-[#a1db87] mx-auto mb-3 group-hover:scale-110 transition-transform duration-200" />
            <h4 className="text-white font-semibold mb-2">Ver cursos</h4>
            <p className="text-sm text-gray-400">Explora nuestro catálogo</p>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default GuiaUsuario;
