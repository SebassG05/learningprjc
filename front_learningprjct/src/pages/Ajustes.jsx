import { useNavigate } from 'react-router-dom';
import { MailCheck, ShieldCheck } from 'lucide-react';

export default function Ajustes() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl md:max-w-3xl mx-auto py-12 px-4">
      <div className="bg-[#23272f]/80 backdrop-blur-md rounded-2xl shadow-2xl p-0 border border-[#a1db87]/20 relative overflow-hidden">
        {/* Glow decorativo */}
        <div className="absolute -top-10 -left-10 w-60 h-60 bg-[#a1db87]/10 rounded-full blur-3xl z-0" />
        <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl z-0" />
        <div className="relative z-10 p-6 md:p-10">
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-3 justify-center">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight drop-shadow text-center">Configuración de Seguridad</h1>
              <ShieldCheck className="w-7 h-7 text-[#a1db87] animate-pulse ml-2" />
            </div>
          </div>
          <div className="flex flex-col items-center justify-center">
            {/* Reestablecer contraseña */}
            <div className="bg-[#181b20] rounded-xl p-6 flex flex-col justify-between border border-blue-500/20 shadow-lg group transition-all duration-300 hover:scale-[1.025] hover:shadow-2xl relative overflow-hidden max-w-md w-full">
              <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl z-0 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <MailCheck className="w-5 h-5 text-blue-400" />
                <span className="text-white font-semibold text-lg">¿Necesitas reestablecer tu contraseña?</span>
              </div>
              <p className="text-gray-400 text-sm mb-4 relative z-10">Recibe un enlace seguro en tu email para crear una nueva contraseña y recuperar el acceso a tu cuenta.</p>
              <button
                className="mt-auto px-5 py-2 rounded-lg font-bold bg-blue-500 text-white hover:bg-blue-600 transition-all shadow-lg cursor-pointer w-full relative z-10"
                onClick={() => navigate('/forgot-password')}
              >
                Reestablecer Contraseña
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
