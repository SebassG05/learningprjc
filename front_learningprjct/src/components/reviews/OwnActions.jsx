/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
// Editar y Borrar una reseña propia. Borrar pide confirmación en el mismo sitio (sin diálogo del
// navegador); el foco va a "Cancelar" al preguntar y vuelve a "Borrar" al cancelar. Se usa en el panel
// "Tu turno" y en cada tarjeta tuya del muro: `scope` separa ambos sitios (la misma reseña puede estar
// en los dos) para que los ids no se repitan y la confirmación salga solo donde se pulsó.
import { motion } from 'framer-motion';
import { Pencil, Trash2 } from 'lucide-react';
import Button from '../ui/Button';
import { OWN } from './reviewsCopy';
import { disclose } from '../../lib/motion';

export default function OwnActions({ review, actions, scope, size = 'md', children }) {
  const { confirmingId, deleting, startEdit, askDelete, cancelDelete, confirmDelete } = actions;
  const key = `${scope}-${review.id}`;
  const small = size === 'sm';

  // Cambio inmediato (sin esperar a una salida) para que el foco llegue a su sitio
  if (confirmingId === key) {
    return (
      <motion.div
        key="confirm"
        initial={disclose.initial}
        animate={disclose.animate}
        role="group"
        aria-labelledby={`${key}-confirm`}
        className="flex flex-col gap-3"
      >
        <p id={`${key}-confirm`} className={`font-semibold text-ink ${small ? 'text-sm' : 'text-base'}`}>
          {OWN.confirm}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            size={small ? 'sm' : 'md'}
            variant="secondary"
            className="border-danger/50! text-danger hover:bg-danger/10!"
            onClick={() => confirmDelete(review, scope)}
            disabled={deleting}
            aria-busy={deleting || undefined}
          >
            <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
            {deleting ? OWN.deleting : OWN.confirmYes}
          </Button>
          <Button id={`${key}-cancel-delete`} size={small ? 'sm' : 'md'} variant="ghost" onClick={() => cancelDelete(review, scope)} disabled={deleting}>
            {OWN.cancel}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button id={`${key}-edit`} size={small ? 'sm' : 'md'} variant="secondary" onClick={() => startEdit(review, scope)}>
        <Pencil className="h-4 w-4 shrink-0" aria-hidden="true" />
        {OWN.edit}
        <span className="sr-only"> {OWN.editWhich}</span>
      </Button>
      <Button id={`${key}-delete`} size={small ? 'sm' : 'md'} variant="ghost" onClick={() => askDelete(review, scope)}>
        <Trash2 className="h-4 w-4 shrink-0" aria-hidden="true" />
        {OWN.delete}
        <span className="sr-only"> {OWN.editWhich}</span>
      </Button>
      {children}
    </div>
  );
}
