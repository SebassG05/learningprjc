/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { forwardRef } from 'react';
import { ArrowRight, Check, Loader } from 'lucide-react';
import Button from '../../ui/Button';
import { ENROLL } from '../coursesCopy';

const LABEL = { enroll: ENROLL.enroll, reserve: ENROLL.reserve, enrolled: ENROLL.goToCourse, reserved: ENROLL.reserved };

// Botón principal de la ficha. «Plaza reservada» es un estado, no una acción: aria-disabled y sin efecto.
const EnrollButton = forwardRef(function EnrollButton({ state, sending, onClick, size = 'lg', className = '' }, ref) {
  const reserved = state === 'reserved';
  return (
    <Button
      ref={ref}
      size={size}
      variant={reserved ? 'secondary' : 'primary'}
      onClick={onClick}
      aria-disabled={reserved || sending || undefined}
      aria-busy={sending || undefined}
      className={`${reserved ? 'cursor-default' : ''} ${className}`}
    >
      {sending ? (
        <>
          <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          {ENROLL.sending}
        </>
      ) : (
        <>
          {reserved ? <Check className="h-4 w-4 text-brand" aria-hidden="true" /> : null}
          {LABEL[state]}
          {state === 'enrolled' ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
        </>
      )}
    </Button>
  );
});

export default EnrollButton;
