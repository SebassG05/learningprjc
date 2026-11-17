// Clases compartidas por los componentes de las dudas (botones discretos de acción y marcas).

// Acción de texto con área táctil de 44 px
export const ACCION =
  'inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-ink-2 transition-colors duration-200 ' +
  '[@media(hover:hover)]:hover:bg-white/[0.06] [@media(hover:hover)]:hover:text-ink ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] disabled:pointer-events-none disabled:opacity-50';

// Marca pequeña (fijada, oculta, reportes…) en tono neutro
export const MARCA = 'inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-footnote font-medium text-ink-2';

// Marca con el color del tema (resuelta, respuesta nueva)
export const MARCA_ACENTO =
  'inline-flex items-center gap-1 rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] px-2.5 py-1 text-footnote font-semibold text-[var(--accent)]';
