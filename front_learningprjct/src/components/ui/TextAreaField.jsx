/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Hermano de TextField para textos largos: misma etiqueta, estados y mensajes enlazados.
// Crece con el contenido donde el navegador lo permite (field-sizing) y si no, tamaño fijo cómodo.
import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { inputClass } from './Field';

const errorClass = 'border-danger! hover:border-danger! focus:border-danger! focus:ring-danger/20!';

const TextAreaField = forwardRef(function TextAreaField({ id, label, error, className = '', ...props }, ref) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      <textarea
        ref={ref}
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${inputClass} auth-input h-auto! min-h-32 max-h-80 resize-y py-3 leading-relaxed [field-sizing:content] ${error ? errorClass : ''} ${className}`}
        {...props}
      />
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

export default TextAreaField;
