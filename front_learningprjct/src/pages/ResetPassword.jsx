import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const token = searchParams.get('token');
  const id = searchParams.get('id');

  // Reglas de validación
  const rules = [
    { label: 'Al menos 8 caracteres', valid: password.length >= 8 },
    { label: 'Una letra mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Un número', valid: /\d/.test(password) },
    { label: 'Un símbolo', valid: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password) },
  ];
  const allValid = rules.every(r => r.valid);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      showToast('Por favor, completa ambos campos.', 'error');
      return;
    }
    if (password !== confirmPassword) {
      showToast('Las contraseñas no coinciden.', 'error');
      return;
    }
    if (!allValid) {
      showToast('La contraseña no cumple todos los requisitos.', 'error');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id, token, newPassword: password })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess('¡Contraseña actualizada correctamente!');
        showToast('¡Contraseña actualizada correctamente!', 'success');
        setTimeout(() => {
          navigate('/');
        }, 1800);
      } else {
        setError(data.error || 'Error al actualizar la contraseña.');
        showToast(data.error || 'Error al actualizar la contraseña.', 'error');
      }
    } catch (err) {
      setError('Error de red.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#23272f] via-[#1e2d23] to-[#23272f] py-12 px-4">
      <div className="flex flex-col md:flex-row items-center justify-center w-full max-w-4xl gap-8">
        {/* Bloque de requisitos de contraseña */}
        <div
          className="password-rules-block mb-8 md:mb-0"
          style={{
            marginTop: '-38.5%',
            background: '#181f1b',
            borderRadius: 16,
            boxShadow: '0 1px 6px rgba(90,168,51,0.07)',
            padding: '20px 24px',
            border: '1.5px solid #a1db87',
            minWidth: 240,
            maxWidth: 260,
            zIndex: 2,
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#a1db87', marginBottom: '0.5rem', fontSize: '1rem' }}>Requisitos de la contraseña:</div>
          {rules.map((rule, i) => (
            <div key={i} className={`flex items-center gap-2 mb-1 text-sm font-semibold ${rule.valid ? 'text-[#a1db87]' : 'text-gray-500'}`}> 
              <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full border-2 ${rule.valid ? 'border-[#a1db87] bg-[#23272f]' : 'border-gray-500 bg-[#23272f]'}`}>{rule.valid ? (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#23272f"/><path d="M6 10.5l3 3 5-5" stroke="#a1db87" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#23272f"/><path d="M7 7l6 6M13 7l-6 6" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round"/></svg>
              )}</span>
              {rule.label}
            </div>
          ))}
        </div>
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-[#181f1b] border border-[#a1db87]/30 rounded-2xl shadow-2xl p-8 sm:p-12 flex flex-col items-center relative"
          style={{ boxShadow: '0 8px 32px rgba(90,168,51,0.10)' }}
        >
          <div className="flex flex-col items-center mb-6">
            <span className="inline-block bg-[#a1db87] rounded-full p-3 mb-3">
              <svg width="32" height="32" fill="#23272f" viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V8a6 6 0 1 0-12 0v2a4 4 0 0 0-2 3.465V18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3.535A4 4 0 0 0 18 10zm-8-2a4 4 0 1 1 8 0v2H6V8zm10 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3.535A2 2 0 0 1 8 12h8a2 2 0 0 1 2 2.465V18z"/></svg>
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#a1db87] mb-2 text-center font-[Rondana]">Actualiza tu contraseña</h2>
            <p className="text-gray-300 text-base text-center">Introduce y confirma tu nueva contraseña para tu cuenta.</p>
          </div>
          <div className="w-full mb-6 relative">
            <label className="block text-[#a1db87] font-semibold mb-2">Nueva contraseña</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setTouched(true)}
              className={`w-full px-4 py-3 rounded-lg border ${touched && !allValid ? 'border-red-400 bg-[#2a2323]' : 'border-[#a1db87] bg-[#23272f]'} text-[#a1db87] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition`}
              placeholder="Nueva contraseña"
              required
            />
            <button
              type="button"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              className="absolute right-3 top-[44px] text-[#a1db87] hover:text-emerald-400 focus:outline-none"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
              onClick={() => setShowPassword(v => !v)}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#a1db87" strokeWidth="2" d="M3 3l18 18M10.7 10.7A2 2 0 0 0 12 14a2 2 0 0 0 1.3-3.3m-2.6 0A2 2 0 0 1 12 10a2 2 0 0 1 2 2c0 .5-.2 1-.5 1.4m-2.6-2.7C7.6 10.7 5.5 12.5 4 14c2.5 2.5 6.5 4 8 4s5.5-1.5 8-4c-1.1-1.1-2.7-2.5-4.6-3.3"/></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="#a1db87" strokeWidth="2" d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12Zm11-3a3 3 0 1 1 0 6 3 3 0 0 1 0-6Z"/></svg>
              )}
            </button>
          </div>
          <div className="w-full mb-6">
            <label className="block text-[#a1db87] font-semibold mb-2">Confirmar nueva contraseña</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg border ${touched && confirmPassword && password !== confirmPassword ? 'border-red-400 bg-[#2a2323]' : 'border-[#a1db87] bg-[#23272f]'} text-[#a1db87] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:border-[#a1db87] transition`}
              placeholder="Confirma la contraseña"
              required
              onCopy={e => e.preventDefault()}
              onPaste={e => e.preventDefault()}
              onCut={e => e.preventDefault()}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-bold text-lg shadow-md transition bg-[#a1db87] text-[#181f1b] hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#a1db87] focus:ring-offset-2 disabled:opacity-60"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </div>
      <style>{`
        @media (max-width: 900px) {
          .password-rules-block {
            position: static !important;
            margin: 0 0 24px 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
