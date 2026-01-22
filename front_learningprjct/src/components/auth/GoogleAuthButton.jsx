import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useToast } from '../../context/ToastContext.jsx';
import { useUser } from '../../context/UserContext.jsx';

const GoogleAuthButton = ({ onSuccess }) => {
  const { showToast } = useToast();
  const { login: setUserLogin } = useUser();

  const handleGoogleSuccess = async (credentialResponse) => {
    if (!credentialResponse.credential) {
      showToast('No se recibió el token de Google.', 'error');
      return;
    }
    try {
      const res = await fetch('/api/users/auth/google', {
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

  return (
    <div className="flex flex-col items-center mt-6">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => showToast('Error al autenticar con Google', 'error')}
        width="100%"
        locale="es"
        useOneTap
      />
    </div>
  );
};

export default GoogleAuthButton;
