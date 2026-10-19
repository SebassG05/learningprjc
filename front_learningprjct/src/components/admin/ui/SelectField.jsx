/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { inputClass } from '../../ui/Field';

// Select nativo con el estilo de los campos (accesible y con el selector del sistema en móvil)
export default function SelectField({ label, value, onChange, options, hideLabel = true, className = '' }) {
  const id = useId();
  return (
    <div className={`relative min-w-0 ${className}`}>
      <label htmlFor={id} className={hideLabel ? 'sr-only' : 'mb-2 block text-sm font-medium text-ink-2'}>{label}</label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} cursor-pointer appearance-none pr-11`}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
      </div>
    </div>
  );
}
