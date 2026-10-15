/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Selector de puntuación accesible: un grupo de radios nativos (flechas para cambiar, Tab para salir)
// que se ven como estrellas. Hover y foco previsualizan; el valor elegido se lee también en texto, no
// solo por el color. Cada estrella tiene 44 × 44 px de zona táctil. Al elegir, un pequeño muelle.
import { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { StarShape } from './StarRating';
import { MAX_RATING, starsLabel } from './reviewFormat';
import { spring } from '../../lib/motion';

export default function StarRatingInput({ id, legend, hint, value, onChange, disabled }) {
  const reduce = useReducedMotion();
  const [preview, setPreview] = useState(0);
  const shown = preview || value;
  const hintId = `${id}-hint`;

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={hintId} disabled={disabled}>
      <legend className="mb-2 text-sm font-medium text-ink-2">{legend}</legend>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="-ml-2.5 flex" onPointerLeave={() => setPreview(0)}>
          {Array.from({ length: MAX_RATING }, (_, i) => {
            const n = i + 1;
            const on = n <= shown;
            return (
              <label
                key={n}
                onPointerEnter={() => setPreview(n)}
                className="group/star relative grid h-11 w-11 cursor-pointer place-items-center rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-400 has-[:disabled]:cursor-not-allowed"
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={value === n}
                  onChange={(e) => onChange(Number(e.target.value))}
                  onFocus={() => setPreview(0)}
                  className="sr-only"
                />
                <span className="sr-only">{starsLabel(n)}</span>
                {/* Al elegir, la estrella se vuelve a montar y se asienta con un muelle */}
                <motion.span
                  key={value === n ? 'picked' : 'idle'}
                  aria-hidden="true"
                  className={`block ${on ? 'text-brand-400' : 'text-transparent'}`}
                  initial={value === n && !reduce ? { scale: 1.3 } : false}
                  animate={{ scale: 1 }}
                  transition={spring.pop}
                >
                  <StarShape fill={on ? 1 : 0} className="h-7 w-7" />
                </motion.span>
              </label>
            );
          })}
        </div>
        <p id={hintId} className="text-sm tabular-nums text-ink-2">
          {shown ? <span className="font-semibold text-ink">{`${shown} de ${MAX_RATING}`}</span> : hint}
        </p>
      </div>
    </fieldset>
  );
}
