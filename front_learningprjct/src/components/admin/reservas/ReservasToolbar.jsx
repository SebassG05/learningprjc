/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo, useMemo } from 'react';
import FilterBar from '../ui/FilterBar';
import SearchInput from '../ui/SearchInput';
import SelectField from '../ui/SelectField';
import { courseName } from '../shared/adminFormat';
import { DATE_PRESETS } from '../shared/urlFilters';
import { SORTS } from './reservasQuery';
import { COPY } from './reservasCopy';

// Búsqueda, curso y, en la lista, fecha y orden (en el calendario los marca el propio mes)
const ReservasToolbar = memo(function ReservasToolbar({ filters, onChange, onClear, active, courses, resultLabel, calendar }) {
  const courseOptions = useMemo(
    () => [{ value: '', label: COPY.allCourses }, ...courses.map((c) => ({ value: c._id, label: courseName(c) }))],
    [courses]
  );
  return (
    <FilterBar active={active} onClear={onClear} resultLabel={resultLabel} label="Filtros de inscripciones">
      <SearchInput
        value={filters.q}
        onChange={(q) => onChange({ q })}
        label={COPY.searchLabel}
        placeholder={COPY.searchPlaceholder}
        className="md:min-w-64 md:flex-1 lg:max-w-md"
      />
      <div className="grid grid-cols-2 gap-3 md:contents">
        <SelectField
          label={COPY.courseLabel}
          value={filters.curso}
          onChange={(curso) => onChange({ curso })}
          options={courseOptions}
          className="col-span-2 md:w-auto md:max-w-72"
        />
        {calendar ? null : (
          <>
            <SelectField label={COPY.dateLabel} value={filters.fecha} onChange={(fecha) => onChange({ fecha })} options={DATE_PRESETS} className="md:w-auto" />
            <SelectField label={COPY.sortLabel} value={filters.orden} onChange={(orden) => onChange({ orden })} options={SORTS} className="md:w-auto" />
          </>
        )}
      </div>
    </FilterBar>
  );
});

export default ReservasToolbar;
