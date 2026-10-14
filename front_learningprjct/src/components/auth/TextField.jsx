/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Campo del acceso: etiqueta visible, input y mensajes enlazados (aria-describedby / aria-invalid).
// Rejilla: la acción de la etiqueta (p. ej. "¿Has olvidado…?") se ve a la derecha de la etiqueta
// pero va después del input en el DOM, así el orden de tabulación es campo → acción.
import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { inputClass } from '../ui/Field';

const errorClass = 'border-danger! hover:border-danger! focus:border-danger! focus:ring-danger/20!';

const TextField = forwardRef(function TextField(
  { id, label, error, hint, labelAction, trailing, className = '', ...props },
  ref
) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error && errorId, hint && hintId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2">
      <label htmlFor={id} className="col-start-1 row-start-1 text-sm font-medium text-ink-2">
        {label}
      </label>
      <div className="relative col-span-2 row-start-2">
        <input
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${inputClass} auth-input read-only:cursor-progress ${error ? errorClass : ''} ${trailing ? 'pr-14' : ''} ${className}`}
          {...props}
        />
        {trailing}
      </div>
      {labelAction && <div className="col-start-2 row-start-1 justify-self-end">{labelAction}</div>}
      {(error || hint) && (
        <div className="col-span-2 flex flex-col gap-1.5">
          {error && (
            <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </p>
          )}
          {hint && <div id={hintId}>{hint}</div>}
        </div>
      )}
    </div>
  );
});

export default TextField;
