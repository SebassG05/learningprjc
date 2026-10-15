/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { duration, ease, spring } from '../../lib/motion';

// Desplazamiento del círculo: pista w-12 (48 px) − círculo size-6 (24 px) − 2 × p-0.5 (4 px)
const TRAVEL = 20;

const fade = { duration: duration.fast, ease: ease.standard };

/**
 * Interruptor accesible (`role="switch"`). El estado se lee por la posición del círculo
 * y por su icono (✓ encendido, candado bloqueado), no solo por el color.
 *
 * - `locked`: encendido y bloqueado. Sigue siendo enfocable y se anuncia como no
 *   disponible (`aria-disabled`); explica el motivo con `aria-describedby`.
 * - El resto de props (`aria-labelledby`, `aria-describedby`, `id`…) llegan al botón.
 * - La zona táctil se amplía a 44 × 44 px con un pseudo-elemento.
 */
const Switch = memo(function Switch({ checked, onCheckedChange, locked = false, className = '', ...props }) {
  const reduce = useReducedMotion();
  const on = locked || checked;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-disabled={locked || undefined}
      onClick={locked ? undefined : () => onCheckedChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full bg-gray-600 p-0.5 after:absolute after:-inset-2 after:content-[''] ${
        locked ? 'cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
      {...props}
    >
      {/* Pista encendida: se funde encima de la apagada (solo opacidad) */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-brand"
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={fade}
      />
      <motion.span
        aria-hidden="true"
        className="relative flex size-6 items-center justify-center rounded-full bg-ink shadow-card"
        initial={false}
        animate={{ x: on ? TRAVEL : 0 }}
        transition={reduce ? { duration: 0 } : spring.snappy}
      >
        {locked ? (
          <Lock className="size-3 text-brand-800" strokeWidth={2.5} />
        ) : (
          <motion.span initial={false} animate={{ opacity: on ? 1 : 0 }} transition={fade}>
            <Check className="size-3.5 text-brand-800" strokeWidth={3} />
          </motion.span>
        )}
      </motion.span>
    </button>
  );
});

export default Switch;
