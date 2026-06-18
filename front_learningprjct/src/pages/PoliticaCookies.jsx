import React from 'react';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

const cookiesPropias = [
  { tipo: 'Técnicas', titular: 'EVENOR TECH, S.L.U.', cookie: 'Sesión/Autenticación', finalidad: 'Identificar al usuario durante la sesión, gestión de la plataforma.', conservacion: 'Sesión / Hasta 1 año' },
  { tipo: 'Personalización', titular: 'EVENOR TECH, S.L.U.', cookie: 'Preferencias de idioma, tema', finalidad: 'Recordar las preferencias de configuración del usuario.', conservacion: 'Hasta 1 año' },
  { tipo: 'Análisis', titular: 'EVENOR TECH, S.L.U.', cookie: 'Estadísticas de uso web', finalidad: 'Analizar el comportamiento de los usuarios en la web para mejorar el servicio.', conservacion: 'Hasta 2 años' },
  { tipo: 'Publicidad / Comportamental', titular: 'EVENOR TECH, S.L.U.', cookie: 'Perfil de usuario', finalidad: 'Elaborar un perfil basado en hábitos de navegación para mostrar publicidad relacionada.', conservacion: 'Hasta 2 años' },
];

const cookiesTerceros = [
  { tipo: 'Análisis', titular: 'Google Analytics', cookie: '_ga, _gid', finalidad: 'Medir el tráfico y comportamiento de los usuarios.', conservacion: 'Hasta 2 años' },
  { tipo: 'Publicidad', titular: 'Google Ads', cookie: 'IDE, NID', finalidad: 'Mostrar anuncios personalizados según el perfil del usuario.', conservacion: 'Hasta 13 meses' },
];

const transferencias = [
  { titular: 'Google LLC', cookie: 'Google Analytics / Ads', pais: 'EE.UU.', regimen: 'Decisión de adecuación / Cláusulas contractuales tipo' },
];

const navegadores = [
  ['Firefox', 'https://support.mozilla.org/es/kb/cookies-informacion-que-los-sitios-web-guardan-en-'],
  ['Chrome', 'https://support.google.com/chrome/answer/95647?hl=es'],
  ['Internet Explorer / Edge', 'https://support.microsoft.com/es-es/windows/eliminar-y-administrar-cookies'],
  ['Safari', 'https://support.apple.com/es-es/guide/safari/sfri11471/mac'],
  ['Opera', 'https://help.opera.com/en/latest/web-preferences/#cookies'],
];

export default function PoliticaCookies() {
  return (
    <div className="min-h-screen bg-transparent py-12 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#a1db87] to-[#5ec6a6] mb-6 shadow-lg shadow-[#a1db87]/30">
            <Cookie className="w-10 h-10 text-[#1a1a1a]" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-2 font-[Rondana]">
            Política de Cookies
          </h1>
          <p className="text-gray-500 text-sm mt-2">Última actualización: <span className="text-[#a1db87]">4 de mayo de 2026</span></p>
        </motion.div>

        <div className="space-y-6">

          {/* Intro legal */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <p className="text-gray-300 text-sm leading-relaxed">
              De conformidad con el Art. 22.2 de la <strong className="text-white">Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE)</strong> y el{' '}
              <strong className="text-white">Reglamento (UE) 2016/679 (RGPD)</strong>, le informamos que este sitio web utiliza cookies propias y de terceros para mejorar la experiencia del usuario, analizar el tráfico y mostrar publicidad personalizada.
            </p>
            <p className="text-gray-300 text-sm leading-relaxed mt-3">
              Para gestionar sus preferencias de cookies, puede acceder en cualquier momento al panel de configuración haciendo clic{' '}
              <button
                onClick={() => {
                  const event = new CustomEvent('openCookieSettings');
                  window.dispatchEvent(event);
                }}
                className="text-[#a1db87] hover:underline font-semibold"
              >
                AQUÍ
              </button>.
            </p>
          </motion.div>

          {/* Tipos de cookies */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-4">Tipos de Cookies</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#a1db87]/30">
                    <th className="text-left py-2 pr-4 text-[#a1db87] font-semibold w-1/4">Criterio</th>
                    <th className="text-left py-2 pr-4 text-[#a1db87] font-semibold w-1/4">Tipo</th>
                    <th className="text-left py-2 text-[#a1db87] font-semibold">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Según entidad', 'Propias', 'Gestionadas por el propio titular del sitio web.'],
                    ['Según entidad', 'De terceros', 'Gestionadas por un tercero diferente del editor.'],
                    ['Según plazo', 'De sesión', 'Se eliminan al cerrar el navegador.'],
                    ['Según plazo', 'Persistentes', 'Se almacenan por un período determinado.'],
                    ['Según finalidad', 'Técnicas', 'Necesarias para el funcionamiento básico del sitio.'],
                    ['Según finalidad', 'Personalización', 'Recuerdan las preferencias del usuario.'],
                    ['Según finalidad', 'Análisis', 'Miden y analizan el comportamiento de los usuarios.'],
                    ['Según finalidad', 'Publicidad', 'Permiten gestionar los espacios publicitarios.'],
                    ['Según finalidad', 'Comportamental', 'Almacenan información del comportamiento para mostrar publicidad personalizada.'],
                  ].map(([criterio, tipo, desc], i) => (
                    <tr key={i} className="border-b border-[#a1db87]/10 last:border-0">
                      <td className="py-2.5 pr-4 text-gray-300">{criterio}</td>
                      <td className="py-2.5 pr-4 font-semibold text-white">{tipo}</td>
                      <td className="py-2.5 text-gray-400">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Cookies propias */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-4">Cookies Propias</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#a1db87]/30">
                    {['Tipo', 'Titular', 'Cookie', 'Finalidad', 'Conservación'].map(h => (
                      <th key={h} className="text-left py-2 pr-3 text-[#a1db87] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cookiesPropias.map((c, i) => (
                    <tr key={i} className="border-b border-[#a1db87]/10 last:border-0">
                      <td className="py-2.5 pr-3 font-semibold text-white">{c.tipo}</td>
                      <td className="py-2.5 pr-3 text-gray-300">{c.titular}</td>
                      <td className="py-2.5 pr-3 text-gray-400 font-mono">{c.cookie}</td>
                      <td className="py-2.5 pr-3 text-gray-300">{c.finalidad}</td>
                      <td className="py-2.5 text-gray-400">{c.conservacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Cookies de terceros */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-4">Cookies de Terceros</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[600px]">
                <thead>
                  <tr className="border-b border-[#a1db87]/30">
                    {['Tipo', 'Titular', 'Cookie', 'Finalidad', 'Conservación'].map(h => (
                      <th key={h} className="text-left py-2 pr-3 text-[#a1db87] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cookiesTerceros.map((c, i) => (
                    <tr key={i} className="border-b border-[#a1db87]/10 last:border-0">
                      <td className="py-2.5 pr-3 font-semibold text-white">{c.tipo}</td>
                      <td className="py-2.5 pr-3 text-gray-300">{c.titular}</td>
                      <td className="py-2.5 pr-3 text-gray-400 font-mono">{c.cookie}</td>
                      <td className="py-2.5 pr-3 text-gray-300">{c.finalidad}</td>
                      <td className="py-2.5 text-gray-400">{c.conservacion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Transferencias internacionales */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-4">Transferencias Internacionales de Datos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-[#a1db87]/30">
                    {['Titular', 'Cookie', 'País', 'Régimen de transferencia'].map(h => (
                      <th key={h} className="text-left py-2 pr-3 text-[#a1db87] font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {transferencias.map((t, i) => (
                    <tr key={i} className="border-b border-[#a1db87]/10 last:border-0">
                      <td className="py-2.5 pr-3 font-semibold text-white">{t.titular}</td>
                      <td className="py-2.5 pr-3 text-gray-400 font-mono">{t.cookie}</td>
                      <td className="py-2.5 pr-3 text-gray-300">{t.pais}</td>
                      <td className="py-2.5 text-gray-300">{t.regimen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Configuración del navegador */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-[#23272f] rounded-2xl p-6 border border-[#a1db87]/20">
            <h2 className="text-xl font-bold text-[#a1db87] mb-3">Configuración del Navegador</h2>
            <p className="text-gray-300 text-sm mb-4 leading-relaxed">
              Puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de su navegador. Acceda a la página de soporte de su navegador:
            </p>
            <ul className="flex flex-wrap gap-3">
              {navegadores.map(([name, url]) => (
                <li key={name}>
                  <a href={url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#a1db87] hover:text-[#5ec6a6] text-sm transition-colors hover:underline">
                    {name} →
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Footer */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gradient-to-br from-[#a1db87]/10 to-[#5ec6a6]/5 rounded-2xl p-6 border border-[#a1db87]/30 text-center">
            <p className="text-gray-400 text-sm">
              La presente política puede ser actualizada. Para ejercer sus derechos o consultas, diríjase a{' '}
              <a href="mailto:info@evenor-tech.com" className="text-[#a1db87] hover:underline">info@evenor-tech.com</a>
            </p>
            <p className="text-gray-500 text-xs mt-2">Última actualización: 4 de mayo de 2026</p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}

