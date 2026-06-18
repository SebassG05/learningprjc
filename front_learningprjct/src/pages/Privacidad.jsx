import React from 'react';
import { Shield, Eye, Lock, FileText, Mail, Users, Database, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Privacidad() {
  const derechos = [
    { icon: Eye, title: 'Derecho de Acceso', desc: 'Obtener confirmación sobre si se están tratando sus datos y los concretos datos personales tratados (finalidades, base legitimadora, plazos, cesiones, origen, etc.).' },
    { icon: FileText, title: 'Derecho de Rectificación', desc: 'Modificar los datos que resulten inexactos o incompletos.' },
    { icon: Lock, title: 'Derecho a la Limitación', desc: 'Limitar los fines del tratamiento previstos de forma original por el responsable en determinados supuestos.' },
    { icon: Shield, title: 'Derecho de Supresión', desc: 'Suprimir los datos, a excepción de lo previsto en el propio RGPD (libertad de expresión, obligaciones de conservación, etc.).' },
    { icon: Database, title: 'Derecho a la Portabilidad', desc: 'Recibir sus datos en formato estructurado, de uso común y lectura mecánica, y transmitirlos a otro responsable.' },
    { icon: Users, title: 'Derecho de Oposición', desc: 'Oponerse a que se lleve a cabo el tratamiento de sus datos o que cese el mismo, cuando esté basado en interés legítimo o mercadotecnia directa.' },
    { icon: CheckCircle, title: 'Derecho a no ser objeto de decisiones automatizadas', desc: 'No ser objeto de una decisión basada únicamente en el tratamiento automatizado, incluida la elaboración de perfiles, que produzca efectos jurídicos significativos.' },
    { icon: Mail, title: 'Derecho a retirar el consentimiento', desc: 'Retirar el consentimiento prestado en cualquier momento y de forma gratuita, sin que ello afecte a la licitud del tratamiento previo.' },
  ];

  const tratamientos = [
    {
      nombre: 'Acciones comerciales formulario web',
      finalidad: 'Captación, registro y tratamiento de datos con finalidades de atender sus consultas y/o solicitudes, así como de publicidad y prospección comercial.',
      conservacion: 'Mientras se mantenga el consentimiento prestado, salvo obligación legal.',
      base: 'El consentimiento del interesado.',
      datos: 'Nombre y apellidos, Dirección electrónica.',
    },
    {
      nombre: 'Gestión usuarios web',
      finalidad: 'Captación, registro y tratamiento de datos del usuario.',
      conservacion: 'Mientras se mantenga el consentimiento prestado, salvo obligación legal.',
      base: 'El consentimiento del interesado.',
      datos: 'Nombre y apellidos, Dirección electrónica.',
    },
    {
      nombre: 'Newsletter',
      finalidad: 'Gestión de la suscripción a la newsletter, para realizar los envíos correspondientes.',
      conservacion: 'Mientras se mantenga el consentimiento prestado.',
      base: 'El consentimiento del interesado.',
      datos: 'Nombre y apellidos, Dirección electrónica.',
    },
    {
      nombre: 'Instalación de cookies',
      finalidad: 'Gestión e instalación de las cookies.',
      conservacion: 'Mientras se mantenga el consentimiento prestado.',
      base: 'El consentimiento del interesado.',
      datos: 'Dirección electrónica, Dirección IP.',
    },
    {
      nombre: 'Gestión Formulario web',
      finalidad: 'Atender sus consultas y/o solicitudes.',
      conservacion: 'Mientras se mantenga el consentimiento prestado.',
      base: 'El consentimiento del interesado.',
      datos: 'Nombre y apellidos, Dirección electrónica, Dirección IP.',
    },
  ];

  const redesSociales = [
    ['Facebook', 'https://es-es.facebook.com/privacy/explanation'],
    ['X (Twitter)', 'https://x.com/es/privacy'],
    ['Instagram', 'http://instagram.com/about/legal/privacy/'],
    ['LinkedIn', 'https://es.linkedin.com/legal/privacy-policy'],
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a1db87] to-[#5ec6a6] mb-6 shadow-lg shadow-[#a1db87]/30">
            <Shield className="w-10 h-10 text-[#1a1a1a]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-2 font-[Rondana]">
            Política de Privacidad
          </h1>
          <p className="text-gray-500 text-sm mt-2">Última actualización: <span className="text-[#a1db87]">4 de mayo de 2026</span></p>
        </motion.div>

        <div className="space-y-6">

          {/* Datos del propietario */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-4">Datos del Responsable del Tratamiento</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <tbody>
                  {[
                    ['Razón Social', 'EVENOR TECH, S.L.U.'],
                    ['NIF', 'B91790527'],
                    ['Dominio', 'WWW.EVENOS-TECH.COM'],
                    ['Dirección Postal', 'Avda. República Argentina 27 B, 41011 Sevilla (Sevilla)'],
                    ['Dirección Electrónica', 'info@evenor-tech.com'],
                    ['Teléfono', '651 549 721'],
                  ].map(([key, val]) => (
                    <tr key={key} className="border-b border-[#a1db87]/10 last:border-0">
                      <td className="py-2.5 pr-4 font-semibold text-gray-200 w-2/5">{key}</td>
                      <td className="py-2.5 text-gray-400">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Intro */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <p className="text-gray-300 text-sm leading-relaxed">
              De conformidad con la normativa vigente y aplicable en protección de datos de carácter personal, le informamos que sus datos serán incorporados al sistema de tratamiento titularidad de{' '}
              <strong className="text-white">EVENOR TECH, S.L.U.</strong> con NIF B91790527 y domicilio social sito en Avda. República Argentina 27 B, 41011 Sevilla (Sevilla). A continuación, se facilita la información de los tratamientos realizados:
            </p>
          </motion.div>

          {/* Tratamientos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-4">Tratamientos Realizados</h2>
            <div className="space-y-3">
              {tratamientos.map((t) => (
                <div key={t.nombre} className="bg-[#1a1a1a] rounded-xl p-4 border border-[#a1db87]/10">
                  <h3 className="font-bold text-white text-sm mb-2">{t.nombre}</h3>
                  <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                    <div><span className="text-[#a1db87] font-semibold">Finalidad: </span><span className="text-gray-300">{t.finalidad}</span></div>
                    <div><span className="text-[#a1db87] font-semibold">Base legítima: </span><span className="text-gray-300">{t.base}</span></div>
                    <div><span className="text-[#a1db87] font-semibold">Conservación: </span><span className="text-gray-300">{t.conservacion}</span></div>
                    <div><span className="text-[#a1db87] font-semibold">Datos básicos: </span><span className="text-gray-300">{t.datos}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Derechos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-2">Derechos de los Interesados</h2>
            <p className="text-gray-400 text-sm mb-4">EVENOR TECH, S.L.U. informa a los usuarios que podrán ejercer los siguientes derechos ante el Responsable del Tratamiento:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {derechos.map((d) => {
                const Icon = d.icon;
                return (
                  <div key={d.title} className="flex items-start gap-3 bg-[#1a1a1a] rounded-xl p-3 border border-[#a1db87]/10">
                    <div className="flex-shrink-0 p-2 bg-[#a1db87]/10 rounded-lg mt-0.5">
                      <Icon className="w-4 h-4 text-[#a1db87]" />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{d.title}</p>
                      <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{d.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Cómo ejercer derechos */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-3">Cómo Ejercer tus Derechos</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              Para ejercer cualquiera de los derechos descritos, puede dirigir su solicitud a:
            </p>
            <ul className="text-gray-300 text-sm space-y-1.5 list-disc list-inside ml-2">
              <li><strong className="text-white">Dirección postal:</strong> Avda. República Argentina 27 B, 41011 Sevilla (Sevilla), a la atención de EVENOR TECH, S.L.U.</li>
              <li><strong className="text-white">Correo electrónico:</strong>{' '}<a href="mailto:info@evenor-tech.com" className="text-[#a1db87] hover:underline">info@evenor-tech.com</a></li>
            </ul>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed">
              La solicitud deberá identificar fehacientemente al solicitante, especificar el/los derecho/s que se pretenden ejercer e incluir dirección de notificación. Tiene asimismo derecho a presentar una reclamación ante la <strong className="text-white">Agencia Española de Protección de Datos (AEPD)</strong>.
            </p>
          </motion.div>

          {/* Redes sociales */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-3">Privacidad en Redes Sociales</h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              De conformidad con la Ley 34/2002, EVENOR TECH, S.L.U. ha creado perfiles en{' '}
              <strong className="text-white">Facebook, X (Twitter), Instagram y LinkedIn</strong> con la finalidad principal de publicitar sus productos y servicios. Al unirse a nuestra página, el usuario facilita su consentimiento para el tratamiento de sus datos públicos.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              EVENOR TECH, S.L.U. solo accede a la información pública del perfil (principalmente, nombre de contacto). Estos datos se usan exclusivamente dentro de la Red Social y no se incorporan a ningún sistema de tratamiento externo.
            </p>
            <p className="text-gray-400 text-xs font-semibold mb-2 uppercase tracking-wide">Políticas de privacidad de cada red:</p>
            <ul className="flex flex-wrap gap-3">
              {redesSociales.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#a1db87] hover:text-[#5ec6a6] text-sm transition-colors hover:underline">
                    {name} →
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Compromiso seguridad */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-[#a1db87]/10 to-[#5ec6a6]/5 rounded-2xl p-6 border border-[#a1db87]/30 text-center">
            <p className="text-gray-300 text-sm leading-relaxed">
              <strong className="text-white">EVENOR TECH, S.L.U.</strong> se compromete a adoptar las medidas técnicas y organizativas necesarias para garantizar la seguridad, integridad y confidencialidad de los datos personales tratados.
            </p>
            <p className="text-gray-500 text-xs mt-3">Última actualización: 4 de mayo de 2026</p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
