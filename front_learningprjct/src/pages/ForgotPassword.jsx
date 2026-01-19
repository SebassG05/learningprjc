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
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 40, borderRadius: 16, boxShadow: '0 8px 32px rgba(90,168,51,0.10)', border: 'none', maxWidth: 400, width: '100%' }}>
        <h2 style={{ color: '#5aa833', fontFamily: 'Rondana, Arial, sans-serif', marginBottom: 24, textAlign: 'center' }}>¿Olvidaste tu contraseña?</h2>
        <p style={{ color: '#595959', fontSize: 15, textAlign: 'center', marginBottom: 24 }}>Introduce tu email y te enviaremos instrucciones para restablecer tu contraseña.</p>
        <div style={{ marginBottom: 18 }}>
          <label style={{ color: '#595959', fontWeight: 600, fontSize: 14 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 8, border: '1.5px solid #a1db87', marginTop: 6, fontSize: 15, outline: 'none', transition: 'border-color 0.2s' }} />
        </div>
        <button type="submit" disabled={loading} style={{ background: '#a1db87', color: '#333333', fontWeight: 700, padding: '14px 0', borderRadius: 8, border: 'none', width: '100%', fontSize: 16, boxShadow: '0 2px 8px rgba(161,219,135,0.10)', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}>
          {loading ? 'Enviando...' : 'Enviar Mail'}
        </button>
      </form>
    </div>
  );
}
