/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef } from 'react';
import { ArrowRight, Bell, Check, Loader } from 'lucide-react';
import Button from '../../ui/Button';
import { ENROLL, PRIVATE } from '../coursesCopy';
import { INERT_CTA } from './privateAccess';

const LABEL = { enroll: ENROLL.enroll, reserve: ENROLL.reserve, enrolled: ENROLL.goToCourse, reserved: ENROLL.reserved, ...PRIVATE.cta };
const CHECKED = new Set(['reserved', 'cohort-reserved', 'interested']);

// Botón principal de la ficha. «Plaza reservada», «Edición cerrada»… son estados, no acciones:
// aria-disabled y sin efecto.
const EnrollButton = forwardRef(function EnrollButton({ state, sending, onClick, size = 'lg', className = '' }, ref) {
  const reserved = INERT_CTA.has(state);
  const busy = sending || state === 'checking';
  return (
    <Button
      ref={ref}
      size={size}
      variant={reserved ? 'secondary' : 'primary'}
      onClick={onClick}
      aria-disabled={reserved || busy || undefined}
      aria-busy={busy || undefined}
      className={`${reserved ? 'cursor-default' : ''} ${className}`}
    >
      {busy ? (
        <>
          <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {ENROLL.sending}
        </>
      ) : (
        <>
          {CHECKED.has(state) ? <Check className="h-4 w-4 text-brand" aria-hidden="true" /> : null}
          {state === 'interest' ? <Bell className="h-4 w-4" aria-hidden="true" /> : null}
          {LABEL[state]}
          {state === 'enrolled' ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </>
      )}
    </Button>
  );
});

export default EnrollButton;
