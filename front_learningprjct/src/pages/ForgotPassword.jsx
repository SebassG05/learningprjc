import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Introduce tu email', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Si el email está registrado, recibirás instrucciones.', 'success');
        setEmail('');
        setTimeout(() => {
          navigate('/');
        }, 1800);
      } else {
        showToast(data.error || 'Error al enviar el correo.', 'error');
      }
    } catch (err) {
      showToast('Error de red.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#23272f] via-[#1e2d23] to-[#23272f] py-12 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-[#181f1b] border border-[#a1db87]/30 rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center"
        style={{ boxShadow: '0 8px 32px rgba(90,168,51,0.10)' }}
      >
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#a1db87] mb-2 text-center font-[Rondana]">¿Olvidaste tu contraseña?</h2>
        <p className="text-gray-300 text-base text-center mb-6">Introduce tu email y te enviaremos instrucciones para restablecer tu contraseña.</p>
        <div className="w-full mb-6">
          <label className="block text-[#a1db87] font-semibold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-[#a1db87] bg-[#23272f] text-[#a1db87] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition"
            placeholder="tu@email.com"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer w-full py-3 rounded-lg font-bold text-lg shadow-md transition bg-[#a1db87] text-[#181f1b] hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? 'Enviando...' : 'Enviar Mail'}
        </button>
      </form>
    </div>
  );
}
