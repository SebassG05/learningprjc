/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { X } from 'lucide-react';
import { focusRing } from './tones';

/**
 * Barra de herramientas de filtros. En móvil apila los controles; desde 768 px van en fila.
 * `onClear` muestra «Limpiar filtros» solo cuando hay algún filtro activo (`active`).
 */
export default function FilterBar({ children, active = false, onClear, resultLabel, label = 'Filtros' }) {
  return (
    <div role="search" aria-label={label} className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
      {children}
      <div className="flex min-h-11 items-center justify-between gap-3 md:ml-auto">
        {resultLabel ? <p aria-live="polite" className="text-footnote text-ink-3 tabular-nums">{resultLabel}</p> : null}
        {active && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className={`inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink active:scale-[0.97] ${focusRing}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Limpiar filtros
          </button>
        ) : null}
      </div>
    </div>
  );
}
