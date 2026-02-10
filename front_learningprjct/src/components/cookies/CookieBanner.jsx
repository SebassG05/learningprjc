import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useCookieConsent from '../../hooks/useCookieConsent';
import CookieSettings from './CookieSettings';

const CookieBanner = () => {
  const {
    showBanner,
    acceptAll,
    rejectNonEssential,
    saveCustomPreferences,
  } = useCookieConsent();

  const [showSettings, setShowSettings] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showBanner) {
      // Pequeño delay para la animación de entrada
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showBanner]);

  if (!showBanner) return null;

  const handleAcceptAll = () => {
    setIsVisible(false);
    setTimeout(() => acceptAll(), 300);
  };

  const handleRejectNonEssential = () => {
    setIsVisible(false);
    setTimeout(() => rejectNonEssential(), 300);
  };

  const handleSaveCustom = (preferences) => {
    setIsVisible(false);
    setTimeout(() => {
      saveCustomPreferences(preferences);
      setShowSettings(false);
    }, 300);
  };

  return (
    <>
      {/* Overlay de fondo */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: showBanner ? 'auto' : 'none' }}
      />

      {/* Banner de cookies */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-[9999] transform transition-transform duration-500 ease-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-label="Consentimiento de cookies"
      >
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#1a1f1c] to-[#23272f] border-2 border-[#a1db87]/40 rounded-2xl shadow-2xl p-6 sm:p-8">
            {!showSettings ? (
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Icono y contenido principal */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Icono de cookie */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-[#a1db87]/20 rounded-xl flex items-center justify-center">
                        <svg 
                          className="w-6 h-6 text-[#a1db87]" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
                          />
                          <circle cx="12" cy="12" r="10" strokeWidth={2} />
                        </svg>
                      </div>
                    </div>

                    {/* Texto */}
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-white mb-2 font-[Rondana]">
                        🍪 Utilizamos cookies
                      </h2>
                      <p className="text-gray-300 text-sm leading-relaxed">
                        Utilizamos cookies propias y de terceros para mejorar tu experiencia, 
                        analizar el tráfico y personalizar el contenido. Las cookies esenciales 
                        son necesarias para el funcionamiento de la web. 
                        <Link 
                          to="/politica-cookies" 
                          className="text-[#a1db87] hover:text-[#8bc970] underline ml-1 transition-colors"
                        >
                          Más información
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-6 py-3 bg-transparent border-2 border-[#a1db87]/50 text-[#a1db87] rounded-xl font-semibold hover:bg-[#a1db87]/10 transition-all duration-200 whitespace-nowrap text-sm"
                  >
                    Configurar
                  </button>
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-6 py-3 bg-gray-700 text-white rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200 whitespace-nowrap text-sm"
                  >
                    Solo esenciales
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-6 py-3 bg-gradient-to-r from-[#a1db87] to-[#8bc970] text-[#1a1f1c] rounded-xl font-bold hover:from-[#8bc970] hover:to-[#75b55e] transition-all duration-200 shadow-lg hover:shadow-[#a1db87]/50 whitespace-nowrap text-sm"
                  >
                    Aceptar todas
                  </button>
                </div>
              </div>
            ) : (
              <CookieSettings 
                onSave={handleSaveCustom}
                onBack={() => setShowSettings(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CookieBanner;
