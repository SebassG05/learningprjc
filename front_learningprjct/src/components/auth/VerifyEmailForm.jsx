/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Paso «Confirma tu correo» del modal de acceso: código de 6 cifras enviado al correo.
// Se muestra tras registrarse con contraseña o al intentar entrar con el correo aún sin confirmar.
import { useEffect, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import TextField from './TextField';
import SubmitButton from './SubmitButton';
import { REENVIO_SEG, limpiarCodigo, mensajeVerificacion, pideNuevoCodigo } from './verifyEmail';

const apiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8547';

const post = async (path, body) => {
  const res = await fetch(`${apiUrl()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { res, data };
};

const linkClass = 'inline-flex min-h-11 items-center rounded-md text-sm text-brand transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60 disabled:cursor-default disabled:text-ink-3';

// `codigoEnviado` false: el primer correo falló; se ofrece reenviar enseguida
export default function VerifyEmailForm({ email, codigoEnviado = true, onVerified, onBack, ServerAlert, inputRef }) {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(codigoEnviado ? '' : 'No hemos podido enviarte el código. Pide otro.');
  const [aviso, setAviso] = useState('');
  const [espera, setEspera] = useState(codigoEnviado ? REENVIO_SEG : 0);
  const [reenviando, setReenviando] = useState(false);
  const ownRef = useRef(null);
  const ref = inputRef || ownRef;

  useEffect(() => {
    if (espera <= 0) return undefined;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  const confirmar = async (e) => {
    e.preventDefault();
    if (loading) return;
    if (codigo.length !== 6) {
      setError('Escribe las 6 cifras del código.');
      ref.current?.focus();
      return;
    }
    setError('');
    setAviso('');
    setLoading(true);
    try {
      const { res, data } = await post('/api/users/verificar-correo', { email, codigo });
      if (res.ok) {
        onVerified(data);
        return;
      }
      setError(mensajeVerificacion(res.status, data));
      if (pideNuevoCodigo(data)) setCodigo('');
      ref.current?.focus();
    } catch {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  const reenviar = async () => {
    if (reenviando || espera > 0) return;
    setReenviando(true);
    setError('');
    setAviso('');
    try {
      const { res, data } = await post('/api/users/verificar-correo/reenviar', { email });
      if (res.ok) {
        setCodigo('');
        setAviso('Te hemos enviado un código nuevo. El anterior ya no sirve.');
        setEspera(REENVIO_SEG);
        ref.current?.focus();
      } else {
        setError(data.error || 'No se ha podido enviar el código.');
        if (data.code === 'cooldown') setEspera(REENVIO_SEG);
      }
    } catch {
      setError('Error de red');
    } finally {
      setReenviando(false);
    }
  };

  return (
    <form noValidate className="flex flex-col gap-5" aria-busy={loading || undefined} onSubmit={confirmar}>
      <TextField
        ref={ref}
        id="verify-code"
        label="Código de 6 cifras"
        name="codigo"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{6}"
        placeholder="000000"
        className="text-center font-mono text-2xl tracking-[0.5em]"
        value={codigo}
        onChange={(e) => setCodigo(limpiarCodigo(e.target.value))}
        readOnly={loading}
        required
        hint={<p className="text-sm text-ink-3">Mira también en la carpeta de spam. Caduca en 15 minutos.</p>}
      />
      {aviso && (
        <p role="status" className="flex items-start gap-2.5 rounded-xl bg-brand/10 px-4 py-3 text-sm font-medium text-brand">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{aviso}</span>
        </p>
      )}
      <ServerAlert message={error} />
      <SubmitButton loading={loading} loadingText="Comprobando...">Confirmar correo</SubmitButton>
      <div className="-mt-2 flex flex-wrap items-center justify-between gap-x-4">
        <button type="button" className={linkClass} onClick={reenviar} disabled={reenviando || espera > 0}>
          {espera > 0 ? `Reenviar código en ${espera} s` : reenviando ? 'Enviando...' : 'Reenviar código'}
        </button>
        <button type="button" className={linkClass} onClick={onBack}>Usar otro correo</button>
      </div>
    </form>
  );
}
