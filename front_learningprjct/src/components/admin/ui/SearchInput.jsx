/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { inputClass } from '../../ui/Field';

/**
 * Búsqueda con debounce: el texto responde al instante y `onChange` se llama al dejar de escribir.
 * La etiqueta es visible solo para lectores de pantalla (el icono y el placeholder la acompañan).
 */
const SearchInput = forwardRef(function SearchInput({ value, onChange, label, placeholder, delay = 250, className = '' }, ref) {
  const id = useId();
  const [text, setText] = useState(value ?? '');
  const emitted = useRef(value ?? '');

  // Solo se sincroniza si el valor cambia desde fuera («Limpiar filtros», la URL): el eco de lo que
  // acabamos de emitir no debe pisar lo que se haya seguido escribiendo
  useEffect(() => {
    if ((value ?? '') !== emitted.current) {
      emitted.current = value ?? '';
      setText(value ?? '');
    }
  }, [value]);

  useEffect(() => {
    if (text === emitted.current) return undefined;
    const t = setTimeout(() => {
      emitted.current = text;
      onChange(text);
    }, delay);
    return () => clearTimeout(t);
  }, [text, onChange, delay]);

  const clear = () => {
    setText('');
    emitted.current = '';
    onChange('');
  };

  return (
    <div className={`relative min-w-0 ${className}`}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
      <input
        ref={ref}
        id={id}
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && text) {
            e.stopPropagation();
            clear();
          }
        }}
        placeholder={placeholder}
        autoComplete="off"
        className={`${inputClass} pl-12 pr-11 [&::-webkit-search-cancel-button]:hidden`}
      />
      {text ? (
        <button
          type="button"
          onClick={clear}
          aria-label="Borrar búsqueda"
          className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 hover:text-ink"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
});

export default SearchInput;
