/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Selector de puntuación accesible y con alegría: un grupo de radios nativos (flechas para cambiar,
// Tab para salir) que se ven como estrellas grandes (44 × 44 px de zona táctil). Al pasar se
// encienden en cadena; al elegir, salta una chispa (mayor y de amanecer con 5) y la estrella se
// asienta con un muelle. Con teclado ocurre lo mismo (la chispa sale del cambio del radio, no del
// clic). El valor se lee también en texto. Con reduced motion, se encienden sin chispas.
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { StarShape } from './StarRating';
import { MAX_RATING, starsLabel } from './reviewFormat';
import { duration, ease, spring } from '../../lib/motion';

// Chispa: puntos que salen en estrella desde el centro y se apagan (solo transform y opacidad)
function Spark({ big }) {
  const count = big ? 10 : 6;
  const reach = big ? 30 : 20;
  return (
    <span aria-hidden="true" className="pointer-events-none absolute inset-0 grid place-items-center">
      {Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 - Math.PI / 2;
        return (
          <motion.span
            key={i}
            className={`absolute h-1.5 w-1.5 rounded-full ${big && i % 2 ? 'bg-dawn' : 'bg-brand-200'}`}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: Math.cos(a) * reach, y: Math.sin(a) * reach, opacity: 0, scale: 0.4 }}
            transition={{ duration: big ? 0.7 : duration.slow, ease: ease.outExpo }}
          />
        );
      })}
      {big && (
        <motion.span
          className="absolute h-14 w-14 rounded-full bg-dawn/40"
          initial={{ scale: 0.3, opacity: 0.9 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 0.7, ease: ease.outExpo }}
        />
      )}
    </span>
  );
}

export default function StarRatingInput({ id, legend, hint, value, onChange, disabled, error }) {
  const reduce = useReducedMotion();
  const [preview, setPreview] = useState(0);
  // Cada elección cuenta una vez: la chispa se vuelve a montar aunque se repita el mismo valor
  const [spark, setSpark] = useState({ n: 0, key: 0 });
  const prevShown = useRef(0);
  const shown = preview || value;
  const rising = shown > prevShown.current;
  prevShown.current = shown;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const choose = (n) => {
    onChange(n);
    if (!reduce) setSpark((s) => ({ n, key: s.key + 1 }));
  };

  return (
    <fieldset className="flex flex-col gap-2" aria-describedby={error ? `${errorId} ${hintId}` : hintId} disabled={disabled}>
      <legend className="mb-2 text-sm font-medium text-ink-2">{legend}</legend>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="-ml-1.5 flex" onPointerLeave={() => setPreview(0)}>
          {Array.from({ length: MAX_RATING }, (_, i) => {
            const n = i + 1;
            const on = n <= shown;
            return (
              <label
                key={n}
                onPointerEnter={() => setPreview(n)}
                className="group/star relative grid h-11 w-11 cursor-pointer place-items-center rounded-full has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-300 has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-surface has-[:disabled]:cursor-not-allowed"
              >
                <input
                  type="radio"
                  name="rating"
                  value={n}
                  checked={value === n}
                  onChange={(e) => choose(Number(e.target.value))}
                  onFocus={() => setPreview(0)}
                  aria-invalid={error ? true : undefined}
                  className="sr-only"
                />
                <span className="sr-only">{starsLabel(n)}</span>
                {/* Estrella vacía siempre debajo; la llena se enciende encima, en cadena al subir */}
                <span aria-hidden="true" className="relative grid h-9 w-9 place-items-center">
                  <StarShape fill={0} className="absolute h-9 w-9" />
                  <motion.span
                    key={value === n ? `picked-${spark.key}` : 'idle'}
                    className="absolute text-brand-300 drop-shadow-[0_0_10px_rgb(161_219_135/0.55)]"
                    initial={value === n && !reduce ? { scale: 1.35 } : false}
                    animate={{ opacity: on ? 1 : 0, scale: on || reduce ? 1 : 0.7 }}
                    transition={reduce ? { duration: duration.fast } : { ...spring.pop, delay: on && rising ? i * 0.035 : 0 }}
                  >
                    <StarShape fill={1} className={`h-9 w-9 ${value === MAX_RATING && on ? 'text-brand-200' : ''}`} />
                  </motion.span>
                </span>
                {spark.n === n && spark.key > 0 && <Spark key={spark.key} big={n === MAX_RATING} />}
              </label>
            );
          })}
        </div>
        <p id={hintId} className="min-w-16 text-sm tabular-nums text-ink-2">
          {shown ? <span className="font-semibold text-ink">{`${shown} de ${MAX_RATING}`}</span> : hint}
        </p>
      </div>
      {error && (
        <p id={errorId} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      )}
    </fieldset>
  );
}
