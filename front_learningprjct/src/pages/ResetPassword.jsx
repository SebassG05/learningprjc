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
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const id = searchParams.get('id');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || !confirmPassword) {
      setError('Por favor, completa ambos campos.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
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
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#595959', fontWeight: 600, fontSize: 14 }}>Nueva contraseña</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #a1db87', marginTop: 6, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} />
        </div>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#595959', fontWeight: 600, fontSize: 14 }}>Confirmar nueva contraseña</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #a1db87', marginTop: 6, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} />
        </div>
        {/* Notificaciones visuales solo con toast, no texto aquí */}
        <button type="submit" disabled={loading} style={{ background: '#a1db87', color: '#333333', fontWeight: 700, padding: '14px 0', borderRadius: 8, border: 'none', width: '100%', fontSize: 16, boxShadow: '0 2px 8px rgba(161,219,135,0.10)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {loading ? 'Actualizando...' : 'Actualizar contraseña'}
        </button>
      </form>
    </div>
  );
}
