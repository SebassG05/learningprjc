import { useState, useEffect } from 'react';

const COOKIE_CONSENT_KEY = 'evenortech_cookie_consent';
const COOKIE_CONSENT_DATE_KEY = 'evenortech_cookie_consent_date';
const COOKIE_PREFERENCES_KEY = 'evenortech_cookie_preferences';

// Duración de validez del consentimiento (6 meses en milisegundos)
const CONSENT_VALIDITY_PERIOD = 6 * 30 * 24 * 60 * 60 * 1000;

/**
 * Hook personalizado para gestionar el consentimiento de cookies
 * @returns {Object} Estado y funciones para gestionar cookies
 */
export const useCookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true, // Siempre true, no se puede desactivar
    functional: false,
    analytics: false,
    marketing: false,
  });

  // Verificar si el consentimiento es válido
  const isConsentValid = () => {
    const consentDate = localStorage.getItem(COOKIE_CONSENT_DATE_KEY);
    if (!consentDate) return false;

    const dateGiven = new Date(consentDate);
    const now = new Date();
    const timeDiff = now - dateGiven;

    return timeDiff < CONSENT_VALIDITY_PERIOD;
  };

  // Cargar preferencias guardadas
  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);

    if (consent && isConsentValid()) {
      setShowBanner(false);
      if (savedPreferences) {
        try {
          setCookiePreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('Error al parsear preferencias de cookies:', error);
        }
      }
    } else {
      // Si el consentimiento expiró, limpiar datos antiguos
      if (consent && !isConsentValid()) {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
        localStorage.removeItem(COOKIE_CONSENT_DATE_KEY);
        localStorage.removeItem(COOKIE_PREFERENCES_KEY);
      }
      setShowBanner(true);
    }
  }, []);

  // Guardar preferencias
  const savePreferences = (preferences) => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
    setCookiePreferences(preferences);
    setShowBanner(false);

    // Aplicar preferencias (aquí puedes integrar Google Analytics, etc.)
    applyPreferences(preferences);
  };

  // Aceptar todas las cookies
  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    };
    savePreferences(allAccepted);
  };

  // Rechazar cookies no esenciales
  const rejectNonEssential = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    };
    savePreferences(onlyNecessary);
  };

  // Guardar preferencias personalizadas
  const saveCustomPreferences = (preferences) => {
    savePreferences({ ...preferences, necessary: true });
  };

  // Aplicar las preferencias de cookies
  const applyPreferences = (preferences) => {
    // Aquí puedes implementar la lógica para activar/desactivar servicios
    
    // Ejemplo: Google Analytics
    if (preferences.analytics) {
      // Activar Google Analytics
      console.log('Google Analytics activado');
      // window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      // Desactivar Google Analytics
      console.log('Google Analytics desactivado');
      // window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }

    // Ejemplo: Cookies de marketing
    if (preferences.marketing) {
      console.log('Cookies de marketing activadas');
      // Activar scripts de marketing
    } else {
      console.log('Cookies de marketing desactivadas');
    }

    // Ejemplo: Cookies funcionales
    if (preferences.functional) {
      console.log('Cookies funcionales activadas');
    } else {
      console.log('Cookies funcionales desactivadas');
    }
  };

  // Resetear consentimiento (útil para testing o cambios de política)
  const resetConsent = () => {
    localStorage.removeItem(COOKIE_CONSENT_KEY);
    localStorage.removeItem(COOKIE_CONSENT_DATE_KEY);
    localStorage.removeItem(COOKIE_PREFERENCES_KEY);
    setShowBanner(true);
    setCookiePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  return {
    showBanner,
    cookiePreferences,
    acceptAll,
    rejectNonEssential,
    saveCustomPreferences,
    resetConsent,
    hasConsent: !showBanner,
  };
};

export default useCookieConsent;
