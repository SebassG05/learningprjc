// Filtros de un listado guardados en la URL. Cada pestaña define sus valores por defecto y
// validadores; lo inválido se ignora (un enlace viejo o editado a mano no rompe la vista).

export const DATE_PRESETS = [
  { value: '', label: 'Cualquier fecha', days: null },
  { value: '7d', label: 'Últimos 7 días', days: 7 },
  { value: '30d', label: 'Últimos 30 días', days: 30 },
  { value: '90d', label: 'Últimos 3 meses', days: 90 },
];

export const isObjectId = (v) => /^[a-f0-9]{24}$/i.test(v);
export const isDatePreset = (v) => DATE_PRESETS.some((p) => p.value === v);

// ISO de «hace N días» para el preset elegido (o undefined)
export function presetSince(value, now = Date.now()) {
  const days = DATE_PRESETS.find((p) => p.value === value)?.days;
  return days ? new Date(now - days * 864e5).toISOString() : undefined;
}

/**
 * @param defaults { clave: valorPorDefecto }
 * @param valid    { clave: (valor) => boolean }
 * @param ignore   claves que no cuentan como «filtro activo» (p. ej. el orden o la vista)
 */
export function createUrlFilters({ defaults, valid, ignore = [] }) {
  const keys = Object.keys(defaults);

  const fromParams = (params) => {
    const f = { ...defaults };
    keys.forEach((k) => {
      const v = params.get(k);
      if (v && (valid[k]?.(v) ?? true)) f[k] = k === 'q' ? v.slice(0, 100) : v;
    });
    return f;
  };

  // Solo lo que difiere del valor por defecto va a la URL; `tab` se conserva
  const toParams = (filters, current) => {
    const next = new URLSearchParams();
    const tab = current?.get?.('tab');
    if (tab) next.set('tab', tab);
    keys.forEach((k) => {
      if (filters[k] && filters[k] !== defaults[k]) next.set(k, filters[k]);
    });
    return next;
  };

  const hasActive = (f) => keys.some((k) => !ignore.includes(k) && f[k] !== defaults[k]);

  // Al limpiar se conservan las claves ignoradas (orden, vista…)
  const cleared = (f) => ({ ...defaults, ...Object.fromEntries(ignore.map((k) => [k, f[k]])) });

  return { defaults, fromParams, toParams, hasActive, cleared };
}
