import React from 'react';
import { Scale, Shield, Link2, Edit3, Tag, Copyright, Gavel, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AvisoLegal() {
  const sections = [
    {
      icon: Shield,
      title: 'Usuario y Régimen de Responsabilidades',
      content: (
        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
          <p>La navegación, acceso y uso por el sitio web de <strong className="text-white">EVENOR TECH, S.L.U.</strong> confiere la condición de usuario. El usuario asume su responsabilidad en el uso correcto del sitio web. Esta responsabilidad se extenderá a:</p>
          <ul className="space-y-2 mt-2">
            <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#a1db87] flex-shrink-0 mt-0.5" /><span>La veracidad y licitud de las informaciones aportadas por el usuario en los formularios para el acceso a ciertos contenidos o servicios ofrecidos por el web.</span></li>
            <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-[#a1db87] flex-shrink-0 mt-0.5" /><span>El uso de la información, servicios y datos ofrecidos por EVENOR TECH, S.L.U. contrariamente a lo dispuesto por las presentes condiciones, la Ley, la moral, las buenas costumbres o el orden público, o que de cualquier otro modo puedan suponer lesión de los derechos de terceros.</span></li>
          </ul>
        </div>
      ),
    },
    {
      icon: Link2,
      title: 'Política de Enlaces y Exenciones de Responsabilidad',
      content: (
        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
          <p>EVENOR TECH, S.L.U. no se hace responsable del contenido de los sitios web a los que el usuario pueda acceder a través de los enlaces establecidos en su sitio web, siempre que no tenga conocimiento efectivo de que la actividad o la información a la que remite es ilícita o lesiona bienes o derechos de un tercero.</p>
          <p>EVENOR TECH, S.L.U. declara haber adoptado todas las medidas necesarias para evitar cualquier daño a los usuarios de su sitio web. En consecuencia, no se hace responsable, en ningún caso, de los eventuales daños que por la navegación por Internet pudiera sufrir el usuario.</p>
        </div>
      ),
    },
    {
      icon: Edit3,
      title: 'Modificaciones',
      content: (
        <p className="text-gray-300 text-sm leading-relaxed">
          EVENOR TECH, S.L.U. se reserva la facultad de efectuar, en cualquier momento y sin necesidad de previo aviso, modificaciones y actualizaciones de la información contenida en su sitio web o en la configuración y presentación de esta. Los contenidos podrán ser modificados, corregidos, eliminados o añadidos en cualquier momento, por cualquier forma admisible en derecho.
        </p>
      ),
    },
    {
      icon: Tag,
      title: 'Indicación de Precios',
      content: (
        <div className="space-y-2 text-gray-300 text-sm leading-relaxed">
          <p>En caso de que se muestren precios de productos y/o servicios, los indicados en pantalla serán los vigentes en cada momento. Los precios serán indicados en euros e incorporarán el Impuesto sobre el Valor Añadido (IVA). En caso de que no se incorpore el IVA en el precio, se indicará de manera expresa.</p>
          <p>Si fuera aplicable cualquier otro impuesto, así se indicaría, incluyendo el importe de los incrementos o descuentos y los gastos adicionales que puedan repercutir al consumidor.</p>
        </div>
      ),
    },
    {
      icon: Copyright,
      title: 'Propiedad Intelectual e Industrial',
      content: (
        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
          <p>EVENOR TECH, S.L.U., por sí misma o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, etc.).</p>
          <p>Todos los derechos reservados. En virtud de lo dispuesto en la Ley de Propiedad Intelectual, quedan expresamente <strong className="text-white">prohibidas</strong> la reproducción, la distribución y la comunicación pública, incluida su modalidad de puesta a disposición, de la totalidad o parte de los contenidos de esta página web con fines comerciales, sin la autorización de EVENOR TECH, S.L.U.</p>
          <p>El usuario podrá visualizar los elementos del portal e imprimirlos, copiarlos y almacenarlos en su equipo siempre y cuando sea, única y exclusivamente, para su <strong className="text-white">uso personal y privado</strong>.</p>
        </div>
      ),
    },
    {
      icon: Gavel,
      title: 'Acciones Legales, Legislación Aplicable y Jurisdicción',
      content: (
        <div className="space-y-3 text-gray-300 text-sm leading-relaxed">
          <p>Si el usuario desea presentar una reclamación, deberá contactar mediante el correo electrónico <a href="mailto:info@evenor-tech.com" className="text-[#a1db87] hover:underline">info@evenor-tech.com</a>. Asimismo, EVENOR TECH, S.L.U. dispone de hojas oficiales de reclamación a disposición de los consumidores y usuarios.</p>
          <p>EVENOR TECH, S.L.U. se reserva la facultad de presentar las acciones civiles o penales que considere oportunas por la utilización indebida de su sitio web y contenidos, o por el incumplimiento de las presentes condiciones.</p>
          <p>La relación entre el usuario y el prestador se regirá por la normativa vigente y de aplicación en el territorio español. De surgir cualquier controversia, las partes podrán someter sus conflictos a arbitraje o acudir a la jurisdicción ordinaria.</p>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-4xl mx-auto">

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-2 font-[Rondana]">
            Aviso Legal
          </h1>
          <p className="text-gray-500 text-sm">Última actualización: <span className="text-[#a1db87]">4 de mayo de 2026</span></p>
        </motion.div>

        {/* Datos identificativos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20 mb-6"
        >
          <h2 className="text-xl font-bold text-[#a1db87] mb-4">Datos Identificativos del Titular</h2>
          <p className="text-gray-400 text-sm mb-4">
            En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), EVENOR TECH, S.L.U. informa de los siguientes datos:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {[
                  ['Razón Social', 'EVENOR TECH, S.L.U.'],
                  ['NIF', 'B91790527'],
                  ['Dominio', 'WWW.EVENOS-TECH.COM'],
                  ['Dirección Postal', 'Avda. República Argentina 27 B, 41011 Sevilla (Sevilla)'],
                  ['Dirección Electrónica', 'info@evenor-tech.com'],
                  ['Teléfonos', '651 549 721'],
                  ['Nº Registro / Datos Adicionales', '—'],
                ].map(([key, val]) => (
                  <tr key={key} className="border-b border-[#a1db87]/10 last:border-0">
                    <td className="py-2.5 pr-4 font-semibold text-gray-200 w-2/5 align-top">{key}</td>
                    <td className="py-2.5 text-gray-400 align-top">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-5">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.07 }}
                className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-shrink-0 p-2.5 bg-gradient-to-br from-[#a1db87]/20 to-[#5ec6a6]/10 rounded-xl border border-[#a1db87]/30">
                    <Icon className="w-5 h-5 text-[#a1db87]" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{section.title}</h2>
                </div>
                <div className="ml-0 md:ml-12">
                  {section.content}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center text-xs text-gray-500"
        >
          <p>Última actualización: 4 de mayo de 2026 · EVENOR TECH, S.L.U. · NIF B91790527</p>
        </motion.div>

      </div>
    </div>
  );
}
