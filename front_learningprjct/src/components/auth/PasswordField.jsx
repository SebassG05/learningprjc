/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Contraseña: mostrar/ocultar (botón de 44 × 44 con aria-pressed) y aviso de Bloq Mayús.
import { forwardRef, useState } from 'react';
import { ArrowBigUp, Eye, EyeOff } from 'lucide-react';
import TextField from './TextField';

const PasswordField = forwardRef(function PasswordField({ id, hint, onBlur, ...props }, ref) {
  const [shown, setShown] = useState(false);
  const [caps, setCaps] = useState(false);
  const readCaps = (e) => setCaps(!!e.getModifierState?.('CapsLock'));

  const capsNote = caps && (
    <p className="flex items-center gap-1.5 text-sm text-ink-2">
      <ArrowBigUp className="h-4 w-4 shrink-0" aria-hidden="true" />
      Bloq Mayús activado
    </p>
  );

  return (
    <>
      <TextField
        ref={ref}
        id={id}
        type={shown ? 'text' : 'password'}
        hint={capsNote || hint ? <>{capsNote}{hint}</> : undefined}
        onKeyDown={readCaps}
        onKeyUp={readCaps}
        onBlur={(e) => { setCaps(false); onBlur?.(e); }}
        trailing={(
          <button
            type="button"
            aria-label="Mostrar contraseña"
            aria-pressed={shown}
            aria-controls={id}
            onClick={() => setShown((v) => !v)}
            className="absolute right-0.5 top-0.5 flex h-11 w-11 items-center justify-center rounded-lg text-ink-3 transition-colors duration-200 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/60"
          >
            {shown ? <EyeOff className="h-5 w-5" aria-hidden="true" /> : <Eye className="h-5 w-5" aria-hidden="true" />}
          </button>
        )}
        {...props}
      />
      {/* Anuncio del aviso de mayúsculas (la nota visible no se anuncia en cada tecla) */}
      <span className="sr-only" aria-live="polite">{caps ? 'Bloq Mayús activado' : ''}</span>
    </>
  );
});

export default PasswordField;
