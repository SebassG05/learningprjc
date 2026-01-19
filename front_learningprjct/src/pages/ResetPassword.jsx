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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 8px 32px rgba(90,168,51,0.10)', border: 'none', maxWidth: 400, width: '100%', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <span style={{ display: 'inline-block', background: '#a1db87', borderRadius: '50%', padding: 12, marginBottom: 8 }}>
            <svg width="32" height="32" fill="#5aa833" viewBox="0 0 24 24"><path d="M12 17a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm6-7V8a6 6 0 1 0-12 0v2a4 4 0 0 0-2 3.465V18a4 4 0 0 0 4 4h8a4 4 0 0 0 4-4v-3.535A4 4 0 0 0 18 10zm-8-2a4 4 0 1 1 8 0v2H6V8zm10 10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-3.535A2 2 0 0 1 8 12h8a2 2 0 0 1 2 2.465V18z"/></svg>
          </span>
          <h2 style={{ color: '#5aa833', fontFamily: 'Rondana, Arial, sans-serif', marginBottom: 4, fontSize: 22 }}>Actualiza tu contraseña</h2>
          <p style={{ color: '#595959', fontSize: 15 }}>Introduce y confirma tu nueva contraseña para tu cuenta.</p>
        </div>
        {/* Bloque de requisitos de contraseña: esquina superior derecha en escritorio, debajo en móvil */}
        <div
          className="password-rules-block"
          style={{
            position: 'absolute',
            top: 24,
            right: 424,
            background: '#f7fafc',
            borderRadius: 10,
            boxShadow: '0 1px 6px rgba(90,168,51,0.07)',
            padding: '14px 18px',
            border: '1.5px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            minWidth: 210,
            maxWidth: 240,
            zIndex: 2
          }}
        >
          <div style={{fontWeight: 600, fontSize: 13, color: '#5aa833', marginBottom: 2}}>Requisitos de la contraseña:</div>
          {rules.map((rule, i) => (
            <div key={i} style={{
              color: rule.valid ? '#5aa833' : '#bdbdbd',
              fontWeight: rule.valid ? 600 : 500,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: rule.valid ? 1 : 0.7
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 20,
                height: 20,
                borderRadius: '50%',
                border: rule.valid ? '2px solid #5aa833' : '2px solid #bdbdbd',
                background: rule.valid ? '#eafbe7' : '#f7fafc',
                marginRight: 6,
                fontSize: 14,
                transition: 'all 0.2s'
              }}>{rule.valid ? (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#eafbe7"/><path d="M6 10.5l3 3 5-5" stroke="#5aa833" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#f7fafc"/><path d="M7 7l6 6M13 7l-6 6" stroke="#bdbdbd" strokeWidth="2" strokeLinecap="round"/></svg>
              )}</span>
              {rule.label}
            </div>
          ))}
        </div>
      {/* Responsive: mostrar el bloque de requisitos debajo en móvil */}
      <style>{`
        @media (max-width: 600px) {
          .password-rules-block {
            position: static !important;
            margin: 24px auto 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>

        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#595959', fontWeight: 600, fontSize: 14 }}>Nueva contraseña</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onBlur={() => setTouched(true)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: touched && !allValid ? '2px solid #e57373' : '1.5px solid #a1db87',
              marginTop: 6,
              fontSize: 15,
              outline: 'none',
              transition: 'border-color 0.2s',
              background: touched && !allValid ? '#fff6f6' : undefined
            }}
          />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#595959', fontWeight: 600, fontSize: 14 }}>Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: touched && confirmPassword && password !== confirmPassword ? '2px solid #e57373' : '1.5px solid #a1db87',
              marginTop: 6,
              fontSize: 15,
              outline: 'none',
              transition: 'border-color 0.2s',
              background: touched && confirmPassword && password !== confirmPassword ? '#fff6f6' : undefined
            }}
          />
        </div>
        {/* Notificaciones visuales solo con toast, no texto aquí */}
        <button type="submit" disabled={loading} style={{ background: '#a1db87', color: '#333333', fontWeight: 700, padding: '14px 0', borderRadius: 8, border: 'none', width: '100%', fontSize: 16, boxShadow: '0 2px 8px rgba(161,219,135,0.10)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  );
}
