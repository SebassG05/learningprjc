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
          <div className="material-thick border border-line rounded-3xl shadow-overlay p-6 sm:p-8">
            {!showSettings ? (
              <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
                {/* Icono y contenido principal */}
                <div className="flex-1">
                  <div className="flex items-start gap-4">
                    {/* Icono de cookie */}
                    <div className="flex-shrink-0">
                      <div className="w-11 h-11 bg-brand/10 rounded-2xl flex items-center justify-center">
                        <svg 
                          className="w-6 h-6 text-brand" 
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
                      <h2 className="font-sans text-lg font-semibold text-ink mb-2">
                        Utilizamos Cookies
                      </h2>
                      <p className="text-ink-2 text-sm leading-relaxed">
                        Este sitio web utiliza Cookies propias y de terceros, para recopilar información con la finalidad de mejorar nuestros servicios y mostrarle publicidad relacionada con sus preferencias, en base a un perfil elaborado a partir de sus hábitos de navegación. Puede obtener más información en la{' '}
                        <Link 
                          to="/politica-cookies" 
                          className="text-brand hover:text-brand-500 underline transition-colors"
                        >
                          Política de Cookies
                        </Link>.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto lg:flex-shrink-0">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="px-5 h-11 bg-transparent text-ink-2 rounded-full font-semibold hover:bg-white/[0.06] hover:text-ink transition-colors duration-200 whitespace-nowrap text-sm"
                  >
                    Configurar
                  </button>
                  <button
                    onClick={handleRejectNonEssential}
                    className="px-5 h-11 bg-white/[0.08] border border-line-strong text-ink rounded-full font-semibold hover:bg-white/[0.12] transition-colors duration-200 whitespace-nowrap text-sm"
                  >
                    Solo esenciales
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="px-5 h-11 bg-brand hover:bg-brand-300 text-on-brand rounded-full font-semibold transition-colors duration-200 whitespace-nowrap text-sm"
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
