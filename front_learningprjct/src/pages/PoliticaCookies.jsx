import React, { useEffect, useRef } from 'react';

export default function PoliticaCookies() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) {
      el.classList.add('fade-in');
    }
  }, []);

  return (
    <div ref={containerRef} className="fade-init min-h-screen flex items-center justify-center bg-gradient-to-br from-[#23272f] via-[#1e2d23] to-[#23272f] py-12 px-4">
      <div className="max-w-2xl w-full bg-[#181f1b] border border-[#a1db87]/30 rounded-2xl shadow-2xl p-8 sm:p-12 text-gray-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#a1db87] mb-4 text-center font-[Rondana]">Política de Cookies</h1>
        <p className="mb-4">Esta web utiliza cookies propias y de terceros para mejorar la experiencia de usuario, analizar el tráfico y personalizar el contenido. Al navegar por nuestro sitio aceptas el uso de cookies.</p>
        <h2 className="text-lg font-bold text-[#a1db87] mt-6 mb-2">¿Qué son las cookies?</h2>
        <p className="mb-4">Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas una web. Sirven para recordar tus preferencias, iniciar sesión, analizar el uso del sitio, etc.</p>
        <h2 className="text-lg font-bold text-[#a1db87] mt-6 mb-2">¿Qué tipos de cookies usamos?</h2>
        <ul className="list-disc pl-6 mb-4">
          <li>Cookies técnicas y funcionales (necesarias para el funcionamiento de la web)</li>
          <li>Cookies de análisis (Google Analytics u otros)</li>
          <li>Cookies de personalización</li>
        </ul>
        <h2 className="text-lg font-bold text-[#a1db87] mt-6 mb-2">¿Cómo puedes gestionar las cookies?</h2>
        <p>Puedes permitir, bloquear o eliminar las cookies instaladas en tu equipo mediante la configuración de tu navegador. Consulta la ayuda de tu navegador para más información.</p>
        <p className="mt-8 text-xs text-gray-400 text-center">Última actualización: Enero 2026</p>
      </div>
    </div>
  );
}
