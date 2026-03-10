import React, { useEffect, useRef } from 'react';
import { FileText, CheckCircle, AlertTriangle, Scale, Users, Clock, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TerminosUso() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.classList.add('fade-in');
    }
  }, []);

  const sections = [
    {
      icon: FileText,
      title: "1. Aceptación de los Términos",
      content: [
        {
          text: "Al acceder y utilizar la plataforma CAMPUS (\"el Servicio\"), aceptas estar sujeto a estos Términos de Uso. Si no estás de acuerdo con alguna parte de estos términos, no debes utilizar nuestro servicio."
        },
        {
          text: "Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación en el sitio web. Es tu responsabilidad revisar periódicamente los términos."
        }
      ]
    },
    {
      icon: Users,
      title: "2. Cuenta de Usuario",
      content: [
        {
          subtitle: "Registro",
          text: "Para acceder a ciertas funciones del Servicio, debes crear una cuenta. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta."
        },
        {
          subtitle: "Requisitos",
          text: "Debes tener al menos 16 años para utilizar este servicio. Al registrarte, garantizas que toda la información proporcionada es precisa y veraz."
        },
        {
          subtitle: "Responsabilidad",
          text: "Debes notificarnos inmediatamente sobre cualquier uso no autorizado de tu cuenta. No seremos responsables de ninguna pérdida derivada del uso no autorizado de tu cuenta."
        }
      ]
    },
    {
      icon: CheckCircle,
      title: "3. Uso Aceptable",
      content: [
        {
          subtitle: "Conducta Permitida",
          text: "Puedes utilizar el Servicio exclusivamente con fines educativos y de aprendizaje personal. Puedes acceder a los cursos inscritos, interactuar con los materiales de estudio y participar en las actividades proporcionadas."
        },
        {
          subtitle: "Propiedad Intelectual",
          text: "Todos los contenidos del curso, incluyendo videos, textos, imágenes y materiales de aprendizaje, están protegidos por derechos de autor y son propiedad de CAMPUS o sus licenciantes."
        }
      ]
    },
    {
      icon: XCircle,
      title: "4. Conductas Prohibidas",
      content: [
        {
          text: "No está permitido: (a) copiar, distribuir o compartir contenido del curso sin autorización; (b) utilizar el Servicio para actividades ilegales o fraudulentas; (c) intentar obtener acceso no autorizado a sistemas o datos; (d) interferir con el funcionamiento del Servicio."
        },
        {
          text: "No puedes vender, revender o explotar comercialmente ninguna parte del Servicio sin nuestro consentimiento expreso por escrito."
        },
        {
          text: "Está prohibido el uso de bots, scripts o cualquier método automatizado para acceder al Servicio sin autorización previa."
        }
      ]
    },
    {
      icon: Scale,
      title: "5. Propiedad Intelectual",
      content: [
        {
          subtitle: "Derechos de Autor",
          text: "Todo el contenido disponible en el Servicio, incluyendo pero no limitado a textos, gráficos, logos, iconos, imágenes, clips de audio, descargas digitales y compilaciones de datos, es propiedad de CAMPUS o sus proveedores de contenido."
        },
        {
          subtitle: "Licencia Limitada",
          text: "Te otorgamos una licencia limitada, no exclusiva e intransferible para acceder y usar el Servicio únicamente para tu uso personal y educativo. Esta licencia no incluye el derecho a descargar o copiar contenido para uso comercial."
        },
        {
          subtitle: "Contenido del Usuario",
          text: "Al enviar contenido al Servicio (como reseñas, comentarios o trabajos), nos otorgas una licencia mundial, no exclusiva y libre de regalías para usar, reproducir y mostrar dicho contenido."
        }
      ]
    },
    {
      icon: AlertTriangle,
      title: "6. Limitación de Responsabilidad",
      content: [
        {
          subtitle: "Servicio 'Tal Como Es'",
          text: "El Servicio se proporciona 'tal como es' y 'según disponibilidad', sin garantías de ningún tipo, ya sean expresas o implícitas. No garantizamos que el Servicio sea ininterrumpido, seguro o libre de errores."
        },
        {
          subtitle: "Exclusión de Daños",
          text: "En ningún caso seremos responsables de daños directos, indirectos, incidentales, especiales o consecuentes que resulten del uso o la incapacidad de usar el Servicio."
        },
        {
          subtitle: "Límite de Responsabilidad",
          text: "Nuestra responsabilidad total hacia ti por cualquier reclamación relacionada con el Servicio no excederá el monto que hayas pagado por el Servicio durante los 12 meses anteriores."
        }
      ]
    },
    {
      icon: Clock,
      title: "7. Suspensión y Terminación",
      content: [
        {
          subtitle: "Derecho de Suspensión",
          text: "Nos reservamos el derecho de suspender o cancelar tu cuenta y acceso al Servicio en cualquier momento, sin previo aviso, si consideramos que has violado estos Términos de Uso."
        },
        {
          subtitle: "Terminación Voluntaria",
          text: "Puedes cancelar tu cuenta en cualquier momento desde la configuración de tu perfil. Tras la cancelación, perderás el acceso a todos los cursos y contenidos."
        },
        {
          subtitle: "Efectos de la Terminación",
          text: "Al terminar tu cuenta, se eliminarán todos tus datos personales de acuerdo con nuestra Política de Privacidad, excepto aquellos que estemos obligados a conservar por ley."
        }
      ]
    },
    {
      icon: FileText,
      title: "8. Ley Aplicable y Jurisdicción",
      content: [
        {
          text: "Estos Términos de Uso se regirán e interpretarán de acuerdo con las leyes de España, sin tener en cuenta sus disposiciones sobre conflictos de leyes."
        },
        {
          text: "Cualquier disputa que surja en relación con estos términos se someterá a la jurisdicción exclusiva de los tribunales de Sevilla, España."
        }
      ]
    }
  ];

  return (
    <div ref={containerRef} className="fade-init min-h-screen bg-gradient-to-br from-[#1a1a1a] via-[#23272f] to-[#1a1a1a] py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a1db87] to-[#5ec6a6] mb-6 shadow-lg shadow-[#a1db87]/30">
            <Scale className="w-10 h-10 text-[#1a1a1a]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-4">
            Términos de Uso
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Estos términos rigen tu acceso y uso de la plataforma CAMPUS. 
            Por favor, léelos cuidadosamente antes de utilizar nuestros servicios.
          </p>
          <div className="mt-4 text-sm text-gray-500">
            Última actualización: <span className="text-[#a1db87] font-semibold">Marzo 2026</span>
          </div>
        </motion.div>

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-8"
        >
          {sections.map((section, idx) => {
            const IconComponent = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 + (idx * 0.1) }}
                className="bg-[#23272f] rounded-2xl p-8 border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-all duration-300 shadow-lg"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="flex-shrink-0 p-3 bg-gradient-to-br from-[#a1db87]/20 to-[#5ec6a6]/10 rounded-xl border border-[#a1db87]/30">
                    <IconComponent className="w-6 h-6 text-[#a1db87]" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-2">{section.title}</h2>
                </div>

                <div className="space-y-6 ml-0 md:ml-16">
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx} className="group">
                      {item.subtitle && (
                        <h3 className="text-lg font-semibold text-[#a1db87] mb-2 group-hover:text-[#5ec6a6] transition-colors">
                          {item.subtitle}
                        </h3>
                      )}
                      <p className="text-gray-300 leading-relaxed text-justify">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Aviso importante */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 bg-gradient-to-br from-[#a1db87]/10 to-[#5ec6a6]/5 rounded-2xl p-8 border border-[#a1db87]/30"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-[#a1db87]/20 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-[#a1db87]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Aviso Importante</h3>
              <p className="text-gray-300">
                Al utilizar la plataforma CAMPUS, confirmas que has leído, comprendido y aceptado estos Términos de Uso. 
                Si tienes alguna pregunta o inquietud sobre estos términos, por favor contáctanos antes de usar el servicio.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mt-8 text-center text-sm text-gray-500"
        >
          <p>
            Estos términos pueden ser actualizados periódicamente. 
            Cualquier cambio significativo será notificado a los usuarios registrados.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
