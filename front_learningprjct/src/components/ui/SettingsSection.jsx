/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { Children, isValidElement, useId } from 'react';
import { motion } from 'framer-motion';
import { fadeUpSoft } from '../../lib/motion';

/**
 * Grupo de ajustes (lista agrupada "inset"): título pequeño fuera de la superficie y
 * las filas dentro de una sola superficie, separadas por filetes que empiezan tras el icono.
 * Sirve para cualquier pantalla de cuenta; no sabe nada de lo que contienen sus filas.
 *
 * - `title`: texto del `<h2>`; `description`: nodo bajo el título (puede llevar enlaces).
 * - `aside`: nodo alineado a la derecha del título (un estado de solo lectura, por ejemplo).
 * - `footer`: nodo tras la superficie (acciones del grupo, notas).
 * - Entra con `fadeUpSoft` cuando un contenedor padre con `staggerGroup` lo orquesta.
 */
export default function SettingsSection({ title, description, aside, footer, inset = true, className = '', children }) {
  const titleId = useId();
  const rows = Children.toArray(children).filter(isValidElement);

  return (
    <motion.section aria-labelledby={titleId} variants={fadeUpSoft} className={className}>
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-1 px-1">
        <div className="min-w-0">
          <h2 id={titleId} className="font-sans text-lg font-semibold tracking-tight text-ink">
            {title}
          </h2>
          {description && <div className="mt-1 text-sm text-ink-2">{description}</div>}
        </div>
        {aside}
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
        {rows.map((row, i) => (
          <div key={row.key ?? i}>
            {i > 0 && <div aria-hidden="true" className={`h-px bg-line ${inset ? 'ms-14' : 'ms-4'}`} />}
            {row}
          </div>
        ))}
      </div>

      {footer}
    </motion.section>
  );
}
