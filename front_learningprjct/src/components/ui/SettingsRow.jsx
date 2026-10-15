/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId } from 'react';

// Clics dentro de controles propios de la fila: no deben activar la fila otra vez
const INTERACTIVE = 'a, button, input, select, textarea, label';

/**
 * Fila de ajustes: icono, título, descripción y un control a la derecha.
 *
 * - `control`: un nodo, o una función `({ labelId, descriptionId }) => nodo` para que el
 *   control tome su nombre y su descripción accesibles de los textos de la fila.
 * - `badge`: nodo junto al título (por ejemplo "Siempre activas").
 * - `meta`: línea secundaria bajo la descripción (ejemplos, detalles).
 * - `layout="stack"`: en móvil el control baja bajo el texto (acciones con texto largo).
 * - `onActivate`: hace pulsable la fila entera (sin quitarle el foco al control, que sigue
 *   siendo el objetivo del teclado y del lector de pantalla).
 */
export default function SettingsRow({
  icon: Icon,
  title,
  badge,
  description,
  meta,
  control,
  layout = 'inline',
  onActivate,
  titleAs: Title = 'h3',
}) {
  const labelId = useId();
  const descriptionId = useId();
  const hasDescription = Boolean(description || meta);
  const ids = { labelId, descriptionId: hasDescription ? descriptionId : undefined };
  const stack = layout === 'stack';

  const handleClick = onActivate
    ? (event) => {
        if (event.target.closest(INTERACTIVE)) return;
        onActivate();
      }
    : undefined;

  return (
    <div
      onClick={handleClick}
      className={`flex min-h-13 gap-3 px-4 py-3.5 ${stack ? 'flex-col sm:flex-row sm:items-center' : 'items-center'} ${
        onActivate
          ? 'cursor-pointer transition-colors duration-200 ease-standard hover:bg-glass active:bg-glass-strong'
          : ''
      }`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {Icon && (
          <span
            aria-hidden="true"
            className="mt-px flex size-7 shrink-0 items-center justify-center rounded-lg bg-brand/12 text-brand"
          >
            <Icon className="size-4" strokeWidth={2} />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Title id={labelId} className="font-sans text-base font-semibold text-ink">
              {title}
            </Title>
            {badge}
          </div>
          {hasDescription && (
            <div id={descriptionId} className="mt-0.5 text-sm text-ink-2 [overflow-wrap:anywhere]">
              {description && <p>{description}</p>}
              {meta && <p className="mt-1 text-xs text-ink-3">{meta}</p>}
            </div>
          )}
        </div>
      </div>

      {control && (
        <div className={stack ? 'ps-10 sm:ps-0' : 'shrink-0'}>
          {typeof control === 'function' ? control(ids) : control}
        </div>
      )}
    </div>
  );
}
