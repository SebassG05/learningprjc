import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useCookieConsent from '../../hooks/useCookieConsent';
import SettingsSection from '../ui/SettingsSection';
import ConsentActions from './ConsentActions';
import ConsentStatus from './ConsentStatus';
import CookieCategoryRow from './CookieCategoryRow';
import { COOKIE_TYPES, PRIVACY } from './settingsCopy';

// Privacidad: preferencias de cookies. La lógica es la de siempre (useCookieConsent,
// guardado con botón, aceptar/rechazar todas); aquí solo cambia cómo se presenta.
const PrivacySection = () => {
  const {
    cookiePreferences,
    saveCustomPreferences,
    acceptAll,
    rejectNonEssential,
    resetConsent,
  } = useCookieConsent();

  const [preferences, setPreferences] = useState(cookiePreferences);
  const [showSuccess, setShowSuccess] = useState(false);

  // El hook lee localStorage después del primer render: sin esto, la copia local
  // se quedaba con los valores por defecto y "Guardar" sobrescribía el consentimiento real.
  useEffect(() => {
    setPreferences(cookiePreferences);
  }, [cookiePreferences]);

  // Estable para que cada fila memorizada solo se repinte cuando cambia su valor
  const handleToggle = useCallback((type) => {
    if (type === 'necessary') return; // No se puede desactivar
    setPreferences(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  }, []);

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

  const handleReset = () => {
    if (confirm(PRIVACY.resetConfirm)) {
      resetConsent();
    }
  };

  // Solo para mostrar el aviso "Cambios sin guardar"; no cambia cuándo se guarda
  const dirty = COOKIE_TYPES.some(({ id }) => preferences[id] !== cookiePreferences[id]);

  return (
    <SettingsSection
      title={PRIVACY.title}
      description={
        <p>
          {PRIVACY.description} {PRIVACY.policyLead}{' '}
          <Link
            to="/politica-cookies"
            className="text-brand-400 underline underline-offset-4 transition-colors duration-200 ease-standard hover:text-brand-300"
          >
            {PRIVACY.policyLink}
          </Link>
          .
        </p>
      }
      footer={
        <ConsentActions
          summary={<ConsentStatus saved={cookiePreferences} />}
          onReject={handleRejectAll}
          onAccept={handleAcceptAll}
          onSave={handleSave}
          onReset={handleReset}
          saved={showSuccess}
          dirty={dirty}
        />
      }
    >
      {COOKIE_TYPES.map((cookie) => (
        <CookieCategoryRow
          key={cookie.id}
          cookie={cookie}
          checked={preferences[cookie.id]}
          onToggle={handleToggle}
        />
      ))}
    </SettingsSection>
  );
};

export default PrivacySection;
