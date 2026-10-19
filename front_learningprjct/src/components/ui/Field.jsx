/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef, useId } from 'react';

// Clases compartidas para inputs, textareas y selects existentes
export const inputClass =
  'w-full rounded-xl bg-surface-3/70 border border-line-strong px-4 h-12 text-base text-ink placeholder:text-ink-3 ' +
  'transition-[border-color,background-color,box-shadow] duration-200 ease-standard ' +
  'hover:border-white/20 focus:outline-none focus:border-brand-400/70 focus:bg-surface-3 focus:ring-4 focus:ring-brand-400/15 ' +
  // Campo con error (aria-invalid): borde y anillo del color de peligro
  'aria-invalid:border-danger/70 aria-invalid:focus:border-danger aria-invalid:focus:ring-danger/20';

// Campo con etiqueta asociada
const Field = forwardRef(function Field({ label, id, className = '', ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-ink-2">
          {label}
        </label>
      )}
      <input ref={ref} id={fieldId} className={`${inputClass} ${className}`} {...props} />
    </div>
  );
});

export default Field;
