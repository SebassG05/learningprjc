/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Campo de formulario con etiqueta, ayuda y error en línea. El control lo pinta el hijo
 * (función) con los props de accesibilidad ya puestos: id, aria-invalid, aria-describedby
 * y data-field (para enfocar el primer campo con error al enviar).
 */
export default function FormField({ label, hint, error, name, required = false, children, className = '' }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-medium text-ink-2">
        {label}
        {required ? <span aria-hidden="true" className="text-ink-3"> *</span> : null}
      </label>
      {children({
        id,
        name,
        'data-field': name,
        'aria-invalid': error ? true : undefined,
        'aria-describedby': describedBy,
        'aria-required': required || undefined,
      })}
      {error ? (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      {hint ? <p id={hintId} className="text-footnote text-ink-3">{hint}</p> : null}
    </div>
  );
}
