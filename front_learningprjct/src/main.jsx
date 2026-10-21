
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { preloadPath } from './lib/lazyRoute';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// Entrada directa a una ruta en chunk aparte: el primer render espera a su chunk (que ya baja en
// paralelo con este bundle por modulepreload), así la página se pinta entera, sin estado intermedio
preloadPath(decodeURIComponent(window.location.pathname)).then(() => createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <ToastProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </ToastProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
))
