/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Indicador informativo bajo "Repetir contraseña". No valida ni bloquea el envío.
// La pista visible (enlazada al campo con aria-describedby) sigue cada tecla; el anunciador es una
// región viva aparte que solo habla tras una pausa o al salir del campo (flushKey cambia en el blur).
import { useEffect, useState } from 'react';
import { Check, X } from 'lucide-react';
import { passwordMatch } from './validation';

const TEXT = {
  match: 'Las contraseñas coinciden',
  mismatch: 'Las contraseñas no coinciden',
};
const PAUSE_MS = 800;

export function PasswordMatchHint({ password, confirm }) {
  const status = passwordMatch(password, confirm);
  if (!status) return null;
  return (
    <p className={`flex items-center gap-1.5 text-sm ${status === 'match' ? 'text-brand' : 'text-ink-2'}`}>
      {status === 'match'
        ? <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        : <X className="h-4 w-4 shrink-0" aria-hidden="true" />}
      {TEXT[status]}
    </p>
  );
}

export function PasswordMatchAnnouncer({ password, confirm, flushKey }) {
  const status = passwordMatch(password, confirm);
  const [spoken, setSpoken] = useState(null);

  useEffect(() => {
    const id = setTimeout(() => setSpoken(status), PAUSE_MS);
    return () => clearTimeout(id);
  }, [status]);

  useEffect(() => {
    if (flushKey) setSpoken(status);
    // Solo al salir del campo, con el estado de ese momento
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushKey]);

  return <span className="sr-only" aria-live="polite">{spoken ? TEXT[spoken] : ''}</span>;
}
