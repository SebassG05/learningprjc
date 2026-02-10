import React, { createContext, useContext } from 'react';
import useCookieConsent from '../hooks/useCookieConsent';

const CookieConsentContext = createContext(null);

/**
 * Provider para el contexto de cookies
 * Permite acceder al estado de cookies desde cualquier componente
 */
export const CookieConsentProvider = ({ children }) => {
  const cookieConsent = useCookieConsent();

  return (
    <CookieConsentContext.Provider value={cookieConsent}>
      {children}
    </CookieConsentContext.Provider>
  );
};

/**
 * Hook para acceder al contexto de cookies
 * @returns {Object} Estado y funciones de cookies
 */
export const useCookieConsentContext = () => {
  const context = useContext(CookieConsentContext);
  
  if (!context) {
    throw new Error(
      'useCookieConsentContext debe ser usado dentro de un CookieConsentProvider'
    );
  }
  
  return context;
};

export default CookieConsentContext;
