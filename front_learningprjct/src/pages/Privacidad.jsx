import React, { useEffect, useRef } from 'react';
import { Shield, Lock, Eye, User, Database, FileText, Mail, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function Privacidad() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.classList.add('fade-in');
    }
  }, []);

  const sections = [
    {
      icon: Shield,
      title: "1. Información que Recopilamos",
      content: [
        {
          subtitle: "Información Personal",
          text: "Recopilamos información que nos proporcionas directamente, incluyendo nombre, correo electrónico, información de cuenta y datos de perfil cuando te registras en nuestra plataforma."
        },
        {
          subtitle: "Información de Uso",
          text: "Recopilamos automáticamente información sobre tu interacción con nuestros servicios, incluyendo páginas visitadas, tiempo de navegación, cursos visualizados y progreso de aprendizaje."
        },
        {
          subtitle: "Información Técnica",
          text: "Recopilamos datos técnicos como dirección IP, tipo de navegador, dispositivo, sistema operativo y datos de cookies para mejorar la funcionalidad del sitio."
        }
      ]
    },
    {
      icon: Eye,
      title: "2. Cómo Usamos tu Información",
      content: [
        {
          subtitle: "Provisión de Servicios",
          text: "Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios educativos, incluyendo la personalización de tu experiencia de aprendizaje."
        },
        {
          subtitle: "Comunicaciones",
          text: "Te enviamos actualizaciones sobre cursos, novedades de la plataforma, confirmaciones de registro y notificaciones importantes relacionadas con tu cuenta."
        },
        {
          subtitle: "Análisis y Mejoras",
          text: "Analizamos el uso de la plataforma para identificar tendencias, entender las necesidades de los usuarios y mejorar continuamente nuestros servicios."
        },
        {
          subtitle: "Seguridad",
          text: "Utilizamos tu información para detectar, prevenir y responder a actividades fraudulentas, abusos o problemas de seguridad."
        }
      ]
    },
    {
      icon: Lock,
      title: "3. Protección de Datos",
      content: [
        {
          subtitle: "Medidas de Seguridad",
          text: "Implementamos medidas técnicas y organizativas apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción."
        },
        {
          subtitle: "Cifrado",
          text: "Toda la información sensible se transmite mediante tecnología SSL (Secure Socket Layer) y se almacena de forma cifrada en nuestros servidores seguros."
        },
        {
          subtitle: "Acceso Limitado",
          text: "El acceso a los datos personales está restringido únicamente al personal autorizado que necesita dicha información para realizar sus funciones."
        }
      ]
    },
    {
      icon: Database,
      title: "4. Compartir Información",
      content: [
        {
          subtitle: "Proveedores de Servicios",
          text: "Podemos compartir información con proveedores de servicios de confianza que nos ayudan a operar nuestra plataforma, siempre bajo estrictos acuerdos de confidencialidad."
        },
        {
          subtitle: "Cumplimiento Legal",
          text: "Podemos divulgar información personal cuando sea requerido por ley o en respuesta a procesos legales válidos."
        },
        {
          subtitle: "No Venta de Datos",
          text: "No vendemos, alquilamos ni compartimos tu información personal con terceros para sus propios fines de marketing."
        }
      ]
    },
    {
      icon: User,
      title: "5. Tus Derechos",
      content: [
        {
          subtitle: "Acceso y Rectificación",
          text: "Tienes derecho a acceder a tu información personal y solicitar su corrección si es inexacta o está incompleta."
        },
        {
          subtitle: "Eliminación",
          text: "Puedes solicitar la eliminación de tu información personal, sujeto a ciertas excepciones legales y contractuales."
        },
        {
          subtitle: "Portabilidad",
          text: "Tienes derecho a recibir una copia de tu información personal en un formato estructurado y de uso común."
        },
        {
          subtitle: "Oposición",
          text: "Puedes oponerte al procesamiento de tu información personal en determinadas circunstancias."
        },
        {
          subtitle: "Revocación del Consentimiento",
          text: "Puedes retirar tu consentimiento en cualquier momento cuando el procesamiento se base en dicho consentimiento."
        }
      ]
    },
    {
      icon: FileText,
      title: "6. Retención de Datos",
      content: [
        {
          subtitle: "Período de Retención",
          text: "Conservamos tu información personal durante el tiempo necesario para cumplir con los propósitos descritos en esta política, a menos que la ley requiera o permita un período de retención más largo."
        },
        {
          subtitle: "Eliminación Automática",
          text: "Cuando tu información ya no sea necesaria, la eliminaremos de forma segura o la anonimizaremos de manera que no pueda identificarte."
        }
      ]
    },
    {
      icon: AlertCircle,
      title: "7. Cookies y Tecnologías Similares",
      content: [
        {
          subtitle: "Uso de Cookies",
          text: "Utilizamos cookies y tecnologías similares para mejorar tu experiencia, analizar el uso del sitio y personalizar el contenido."
        },
        {
          subtitle: "Control de Cookies",
          text: "Puedes controlar y gestionar las cookies a través de la configuración de tu navegador. Ten en cuenta que deshabilitar ciertas cookies puede afectar la funcionalidad del sitio."
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
            <Shield className="w-10 h-10 text-[#1a1a1a]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-4">
            Política de Privacidad
          </h1>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            En CAMPUS, nos comprometemos a proteger tu privacidad y tus datos personales. 
            Esta política describe cómo recopilamos, usamos y protegemos tu información.
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
                      <h3 className="text-lg font-semibold text-[#a1db87] mb-2 group-hover:text-[#5ec6a6] transition-colors">
                        {item.subtitle}
                      </h3>
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

        {/* Contacto */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-12 bg-gradient-to-br from-[#a1db87]/10 to-[#5ec6a6]/5 rounded-2xl p-8 border border-[#a1db87]/30"
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-[#a1db87]/20 rounded-xl">
              <Mail className="w-6 h-6 text-[#a1db87]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">¿Tienes dudas sobre tu privacidad?</h3>
              <p className="text-gray-300 mb-4">
                Si tienes preguntas sobre esta política de privacidad o sobre cómo manejamos tu información, 
                no dudes en contactarnos.
              </p>
              <Link 
                to="/contacto"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold rounded-xl hover:shadow-xl hover:shadow-[#a1db87]/50 transition-all duration-300 hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Contactar
              </Link>
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
            Esta política de privacidad puede ser actualizada periódicamente. 
            Te notificaremos sobre cambios significativos publicando la nueva política en esta página.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
