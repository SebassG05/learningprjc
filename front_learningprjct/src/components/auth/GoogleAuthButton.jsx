/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useLayoutEffect, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { googleButtonWidth } from './validation';
import { useToast } from '../../context/ToastContext.jsx';
import { useUser } from '../../context/UserContext.jsx';

const RESIZE_DELAY_MS = 150;

const GoogleAuthButton = ({ onSuccess }) => {
  const { showToast } = useToast();
  const { login: setUserLogin } = useUser();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      showToast('No se recibió el token de Google.', 'error');
      return;
    }
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
      const res = await fetch(`${apiUrl}/api/users/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.message || 'Error al iniciar sesión con Google', 'error');
      } else {
        setUserLogin(data.user, data.token);
        showToast('¡Bienvenido! Has iniciado sesión con Google.', 'info');
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      showToast('Error de red con Google', 'error');
    }
  };

  // Ancho en píxeles (GIS no acepta "100%", máximo 400). Se mide al abrir y se vuelve a medir con un
  // ResizeObserver (con un pequeño retardo) si cambia el contenedor, p. ej. al aparecer la barra de
  // scroll. offsetWidth no incluye la escala de entrada del diálogo.
  // Mientras llega el botón, un esqueleto ocupa su sitio con el mismo alto: sin saltos.
  const box = useRef(null);
  const [width, setWidth] = useState(null);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    const el = box.current;
    setWidth(googleButtonWidth(el.offsetWidth));
    let timer = null;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => setWidth(googleButtonWidth(el.offsetWidth)), RESIZE_DELAY_MS);
    });
    ro.observe(el);
    const mo = new MutationObserver(() => {
      // Botón estándar (div role=button) o personalizado (iframe), lo que llegue antes
      if (el.querySelector('iframe, [role="button"]')) { setReady(true); mo.disconnect(); }
    });
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      clearTimeout(timer);
      ro.disconnect();
      mo.disconnect();
    };
  }, []);

  return (
    // El iframe de Google es un documento claro dentro de una página `color-scheme: dark`: con
    // esquemas distintos el navegador le pinta un fondo blanco opaco. Con el mismo esquema, transparente
    <div ref={box} className="relative flex h-10 w-full justify-center [&_iframe]:[color-scheme:light]">
      <span
        className={`pointer-events-none absolute inset-y-0 rounded-full bg-surface-3 transition-opacity duration-300 ease-out ${ready ? 'opacity-0' : 'opacity-100'}`}
        style={{ width: width ?? '100%' }}
        aria-hidden="true"
      />
      {width && <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => showToast('Error al autenticar con Google', 'error')}
        locale="es"
        useOneTap
        width={width}
        theme="filled_black"
        text="signin_with"
        shape="pill"
        logo_alignment="left"
      />}
    </div>
  );
};

export default GoogleAuthButton;
