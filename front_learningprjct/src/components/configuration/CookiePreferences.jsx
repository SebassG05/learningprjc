import React, { useState } from 'react';
import useCookieConsent from '../../hooks/useCookieConsent';

const CookiePreferences = () => {
  const {
    cookiePreferences,
    saveCustomPreferences,
    acceptAll,
    rejectNonEssential,
    resetConsent,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState(cookiePreferences);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleToggle = (type) => {
    if (type === 'necessary') return; // No se puede desactivar
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleSave = () => {
    saveCustomPreferences(preferences);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    acceptAll();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    rejectNonEssential();
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const cookieTypes = [
    {
      id: 'necessary',
      name: 'Cookies esenciales',
      description: 'Necesarias para el funcionamiento básico de la web. No se pueden desactivar.',
      examples: 'Autenticación, sesión, seguridad',
      required: true,
    },
    {
      id: 'functional',
      name: 'Cookies funcionales',
      description: 'Permiten mejorar la funcionalidad y personalización del sitio.',
      examples: 'Preferencias de idioma, tema oscuro/claro',
      required: false,
    },
    {
      id: 'analytics',
      name: 'Cookies analíticas',
      description: 'Nos ayudan a entender cómo interactúas con nuestra web.',
      examples: 'Google Analytics, estadísticas de uso',
      required: false,
    },
    {
      id: 'marketing',
      name: 'Cookies de marketing',
      description: 'Se utilizan para mostrarte anuncios relevantes.',
      examples: 'Publicidad personalizada, remarketing',
      required: false,
    },
  ];

  return (
    <div className="bg-[#181f1b] border border-[#a1db87]/30 rounded-2xl p-6 sm:p-8">
      {/* Encabezado */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2 font-[Rondana]">
          🍪 Preferencias de cookies
        </h2>
        <p className="text-gray-400 text-sm">
          Gestiona tus preferencias de cookies. Las cookies esenciales siempre están activas.
        </p>
      </div>

      {/* Mensaje de éxito */}
      {showSuccess && (
        <div className="mb-4 bg-[#a1db87]/20 border border-[#a1db87] rounded-xl p-4 flex items-center gap-3 animate-fadeIn">
          <svg className="w-5 h-5 text-[#a1db87]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-white">Preferencias guardadas correctamente</span>
        </div>
      )}

      {/* Lista de tipos de cookies */}
      <div className="space-y-4 mb-6">
        {cookieTypes.map((cookie) => (
          <div
            key={cookie.id}
            className="bg-[#23272f]/50 rounded-xl p-5 border border-[#a1db87]/20"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg">
                  {cookie.name}
                  {cookie.required && (
                    <span className="ml-2 text-xs text-[#a1db87] font-normal">
                      (Siempre activas)
                    </span>
                  )}
                </h3>
              </div>
              
              {/* Toggle switch */}
              <button
                onClick={() => handleToggle(cookie.id)}
                disabled={cookie.required}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:ring-offset-2 focus:ring-offset-[#181f1b] ${
                  preferences[cookie.id]
                    ? 'bg-[#a1db87]'
                    : 'bg-gray-600'
                } ${cookie.required ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                aria-label={`Toggle ${cookie.name}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    preferences[cookie.id] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-gray-400 text-sm mb-2">
              {cookie.description}
            </p>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Ejemplos: {cookie.examples}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Botones de acción */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={handleRejectAll}
          className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 text-sm"
        >
          Rechazar todas
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-[#a1db87]/20 border-2 border-[#a1db87] text-[#a1db87] rounded-xl font-semibold hover:bg-[#a1db87]/30 transition-all duration-200 text-sm"
        >
          Guardar cambios
        </button>
        <button
          onClick={handleAcceptAll}
          className="px-6 py-3 bg-gradient-to-r from-[#a1db87] to-[#8bc970] text-[#1a1f1c] rounded-xl font-bold hover:from-[#8bc970] hover:to-[#75b55e] transition-all duration-200 shadow-lg hover:shadow-[#a1db87]/50 text-sm"
        >
          Aceptar todas
        </button>
      </div>

      {/* Botón de reset (útil para desarrollo/testing) */}
      <div className="mt-6 pt-6 border-t border-[#a1db87]/20">
        <button
          onClick={() => {
            if (confirm('¿Estás seguro de que quieres restablecer tus preferencias de cookies? Volverás a ver el banner de consentimiento.')) {
              resetConsent();
            }
          }}
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors underline"
        >
          Restablecer preferencias de cookies
        </button>
      </div>
    </div>
  );
};

export default CookiePreferences;
