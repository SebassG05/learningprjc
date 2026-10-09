import { useNavigate } from 'react-router-dom';
import { MailCheck, ShieldCheck, Cookie } from 'lucide-react';
import CookiePreferences from '../components/configuration/CookiePreferences';

export default function Ajustes() {
  const navigate = useNavigate();
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      {/* Configuración de Seguridad */}
      <div className="bg-surface/80 backdrop-blur-md rounded-2xl shadow-card p-0 border border-line relative overflow-hidden">
        {/* Glow decorativo */}
        <div className="relative z-10 p-6 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight drop-shadow text-center">Configuración de Seguridad</h1>
              <ShieldCheck className="w-7 h-7 text-brand animate-pulse ml-2" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            {/* Reestablecer contraseña */}
            <div className="bg-surface rounded-xl p-6 flex flex-col justify-between border border-line shadow-card group transition-all duration-300 hover:shadow-2xl relative overflow-hidden max-w-md w-full">
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <MailCheck className="w-5 h-5 text-brand" />
                <span className="text-ink font-semibold text-lg">¿Necesitas reestablecer tu contraseña?</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 relative z-10">Recibe un enlace seguro en tu email para crear una nueva contraseña y recuperar el acceso a tu cuenta.</p>
              <button
                className="mt-auto px-5 py-2 rounded-full font-semibold bg-brand text-on-brand hover:bg-brand-300 transition-all shadow-card cursor-pointer w-full relative z-10"
                onClick={() => navigate('/forgot-password')}
              >
                Reestablecer Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Configuración de Cookies */}
      <div className="bg-surface/80 backdrop-blur-md rounded-2xl shadow-card p-0 border border-line relative overflow-hidden">
        <div className="relative z-10 p-6 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 justify-center">
              <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight drop-shadow text-center">Configuración de Privacidad</h2>
              <Cookie className="w-7 h-7 text-brand animate-pulse ml-2" />
            </div>
          </div>
          <CookiePreferences />
        </div>
      </div>
    </div>
  );
}
