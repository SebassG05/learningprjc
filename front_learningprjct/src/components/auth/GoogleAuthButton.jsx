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
        locale="es"
        useOneTap
        width="100%"
        theme="filled_black"
        text="signin_with"
        shape="pill"
        logo_alignment="left"
        render={renderProps => (
          <button
            type="button"
            onClick={renderProps.onClick}
            disabled={renderProps.disabled}
            className="flex items-center justify-center gap-3 w-full py-2 mt-2 rounded-lg shadow-md font-semibold text-base transition bg-[#181f1b] border border-[#22332a] hover:bg-[#232e26] text-green-200 hover:text-green-100 focus:outline-none focus:ring-2 focus:ring-green-400"
            style={{ minHeight: 44 }}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
            <span>Iniciar sesión con Google</span>
          </button>
        )}
      />
    </div>
  );
};

export default GoogleAuthButton;
