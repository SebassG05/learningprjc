/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { ChevronDown, ChevronUp } from 'lucide-react';
import Drawer from '../ui/Drawer';
import { focusRing } from '../ui/tones';
import { courseName, exerciseName, studentName } from '../shared/adminFormat';
import GradePanel from './GradePanel';
import { COPY } from './correccionesCopy';

const navButton = `flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink disabled:pointer-events-none disabled:opacity-35 active:scale-[0.97] ${focusRing}`;

/**
 * Corrección sin salir de la lista: panel lateral en escritorio y hoja a pantalla completa en móvil.
 * Navegar entre entregas cambia el contenido sin volver a animar el panel.
 */
export default function SubmissionDrawer({ entrega, index, count, hasNext, onPrev, onNext, onClose, onSave, onDirtyChange, apiRef, returnFocus }) {
  const open = Boolean(entrega);
  return (
    <Drawer
      open={open}
      onClose={onClose}
      size="lg"
      bare
      returnFocus={returnFocus}
      closeLabel={COPY.drawer.close}
      title={open ? studentName(entrega.userId) : ''}
      subtitle={open ? `${exerciseName(entrega.ejercicioId)} · ${courseName(entrega.cursoId)}` : ''}
      headerExtra={
        open ? (
          <div className="flex items-center gap-1">
            <span className="mr-1 hidden text-footnote tabular-nums text-ink-3 sm:inline" aria-live="polite">
              {COPY.drawer.position(index + 1, count)}
            </span>
            <button type="button" onClick={onPrev} disabled={index <= 0} aria-label={COPY.drawer.prev} title={COPY.drawer.prev} className={navButton}>
              <ChevronUp className="h-5 w-5" aria-hidden="true" />
            </button>
            <button type="button" onClick={onNext} disabled={!hasNext} aria-label={COPY.drawer.next} title={COPY.drawer.next} className={navButton}>
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        ) : null
      }
    >
      {open ? (
        <GradePanel key={entrega._id} entrega={entrega} apiRef={apiRef} onDirtyChange={onDirtyChange} onSave={onSave} hasNext={hasNext} />
      ) : null}
    </Drawer>
  );
}
