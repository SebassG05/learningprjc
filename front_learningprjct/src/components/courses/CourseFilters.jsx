/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Search, X } from 'lucide-react';
import { spring } from '../../lib/motion';
import { FILTERS } from './coursesCopy';
import { levelLabel } from './courseFormat';

// Barra de filtros: búsqueda, área (filtro principal) y nivel. Desde md queda fijada bajo la cabecera;
// en móvil no, para no comerse la pantalla. Cristal solo con puntero fino (el blur cuesta en gama baja).
export default function CourseFilters({ catalog, loading = false, filters, onChange, count }) {
  const searchId = useId();
  const levelId = useId();
  const areas = catalog?.areas ?? [];
  const levels = catalog?.niveles ?? [];

  return (
    <div
      role="search"
      aria-label={FILTERS.region}
      className="relative z-30 -mx-gutter border-y border-line bg-canvas px-gutter py-3 md:sticky md:top-header md:bg-canvas/95 pointer-fine:material lg:top-header-lg"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative md:w-72 md:shrink-0">
          <label htmlFor={searchId} className="sr-only">{FILTERS.searchLabel}</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input
            id={searchId}
            type="search"
            value={filters.q}
            onChange={(e) => onChange({ q: e.target.value })}
            placeholder={FILTERS.searchPlaceholder}
            autoComplete="off"
            enterKeyHint="search"
            className="h-11 w-full rounded-full border border-line bg-surface-2 pl-10 pr-10 text-callout text-ink placeholder:text-ink-3 focus:border-brand-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40 [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.q ? (
            <button
              type="button"
              onClick={() => onChange({ q: '' })}
              aria-label={FILTERS.clearSearch}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-3 hover:bg-white/[0.06] hover:text-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {/* Áreas y nivel: carrusel horizontal que en móvil sangra hasta el borde */}
        <div className="-mx-gutter flex min-w-0 flex-1 items-center gap-2 overflow-x-auto px-gutter [scrollbar-width:none] max-xl:[mask-image:linear-gradient(to_right,black_calc(100%-2.5rem),transparent)] md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
          {loading && areas.length === 0 ? (
            <div aria-hidden="true" className="flex shrink-0 gap-2">
              {['w-16', 'w-40', 'w-32', 'w-36'].map((w) => <span key={w} className={`h-10 ${w} rounded-full bg-surface-2`} />)}
            </div>
          ) : null}
          {areas.length > 0 ? (
            <div role="group" aria-label={FILTERS.areaGroup} className="flex shrink-0 gap-2">
              {[{ slug: '', label: FILTERS.allAreas }, ...areas].map((a) => {
                const active = filters.area === a.slug;
                return (
                  <button
                    key={a.slug || 'todas'}
                    type="button"
                    aria-pressed={active}
                    onClick={() => onChange({ area: a.slug })}
                    className={`relative isolate shrink-0 rounded-full px-4 py-2 text-callout font-medium ${
                      active ? 'text-on-brand' : 'text-ink-2 ring-1 ring-inset ring-line hover:text-ink'
                    }`}
                  >
                    {active ? (
                      <motion.span layoutId="course-area-pill" transition={spring.glide} className="absolute inset-0 -z-10 rounded-full bg-brand" />
                    ) : null}
                    {a.label}
                  </button>
                );
              })}
            </div>
          ) : null}

          {levels.length > 0 ? (
            <>
              {areas.length > 0 ? <span aria-hidden="true" className="mx-1 h-6 w-px shrink-0 bg-line" /> : null}
              <div className="relative shrink-0">
                <label htmlFor={levelId} className="sr-only">{FILTERS.levelLabel}</label>
                <select
                  id={levelId}
                  value={filters.nivel}
                  onChange={(e) => onChange({ nivel: e.target.value })}
                  className="h-10 appearance-none rounded-full border border-line bg-surface-2 pl-4 pr-10 text-callout font-medium text-ink-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400/40"
                >
                  <option value="">{FILTERS.allLevels}</option>
                  {levels.map((n) => (
                    <option key={n} value={n}>{levelLabel(n)}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              </div>
            </>
          ) : null}
        </div>

        {/* Recuento: visible desde md; anunciado siempre al filtrar */}
        <p className="hidden shrink-0 text-footnote font-medium tabular-nums text-ink-3 md:block" aria-hidden="true">
          {loading ? '' : FILTERS.count(count)}
        </p>
        <p className="sr-only" aria-live="polite">{loading ? '' : FILTERS.count(count)}</p>
      </div>
    </div>
  );
}
