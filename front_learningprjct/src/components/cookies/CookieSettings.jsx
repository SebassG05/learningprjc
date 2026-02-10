import React, { useState } from 'react';

const CookieSettings = ({ onSave, onBack }) => {
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre activado
    functional: false,
    analytics: false,
    marketing: false,
  });

  const handleToggle = (type) => {
    if (type === 'necessary') return; // No se puede desactivar
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSave = () => {
    onSave(preferences);
  };

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Cookies esenciales',
      description: 'Necesarias para el funcionamiento básico de la web. Incluyen autenticación, seguridad y funcionalidades esenciales.',
      required: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      id: 'functional',
      name: 'Cookies funcionales',
      description: 'Mejoran la funcionalidad y personalización del sitio. Recuerdan tus preferencias y configuraciones.',
      required: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      id: 'analytics',
      name: 'Cookies analíticas',
      description: 'Nos ayudan a entender cómo los visitantes interactúan con nuestra web mediante la recopilación y análisis de información de forma anónima.',
      required: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'marketing',
      name: 'Cookies de marketing',
      description: 'Se utilizan para rastrear a los visitantes en las páginas web con la intención de mostrar anuncios relevantes y atractivos.',
      required: false,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Encabezado */}
      <div className="flex items-center gap-3 pb-4 border-b border-[#a1db87]/30">
        <button
          onClick={onBack}
          className="text-gray-400 hover:text-white transition-colors"
          aria-label="Volver"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-xl font-bold text-white font-[Rondana]">
          Configuración de cookies
        </h3>
      </div>

      {/* Lista de tipos de cookies */}
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
        {cookieTypes.map((cookie) => (
          <div
            key={cookie.id}
            className="bg-[#23272f]/50 rounded-xl p-4 border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-all duration-200"
          >
            <div className="flex items-start gap-4">
              {/* Icono */}
              <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                preferences[cookie.id] 
                  ? 'bg-[#a1db87]/20 text-[#a1db87]' 
                  : 'bg-gray-700/50 text-gray-400'
              }`}>
                {cookie.icon}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h4 className="text-white font-semibold text-base">
                      {cookie.name}
                      {cookie.required && (
                        <span className="ml-2 text-xs text-[#a1db87] font-normal">
                          (Requeridas)
                        </span>
                      )}
                    </h4>
                  </div>
                  
                  {/* Toggle switch */}
                  <button
                    onClick={() => handleToggle(cookie.id)}
                    disabled={cookie.required}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:ring-offset-2 focus:ring-offset-[#1a1f1c] ${
                      preferences[cookie.id]
                        ? 'bg-[#a1db87]'
                        : 'bg-gray-600'
                    } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    aria-label={`Toggle ${cookie.name}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences[cookie.id] ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {cookie.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[#a1db87]/30">
        <button
          onClick={onBack}
          className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-[#a1db87] to-[#8bc970] text-[#1a1f1c] rounded-xl font-bold hover:from-[#8bc970] hover:to-[#75b55e] transition-all duration-200 shadow-lg hover:shadow-[#a1db87]/50"
        >
          Guardar preferencias
        </button>
      </div>
    </div>
  );
};

export default CookieSettings;
