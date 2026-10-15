/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { COOKIE_TYPES, PRIVACY } from './settingsCopy';

// Resumen de solo lectura de lo que hay guardado ahora mismo (no de los cambios sin guardar).
const ConsentStatus = memo(function ConsentStatus({ saved }) {
  const active = COOKIE_TYPES.filter(({ id }) => saved[id]).length;
  return (
    <p className="inline-flex items-center gap-2 text-sm text-ink-2">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-brand" />
      {PRIVACY.status(active, COOKIE_TYPES.length)}
    </p>
  );
});

export default ConsentStatus;
