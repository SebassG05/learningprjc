/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { AnimatePresence, motion } from 'framer-motion';
import { CircleCheck } from 'lucide-react';
import Button from '../ui/Button';
import { disclose } from '../../lib/motion';
import { PRIVACY } from './settingsCopy';

// Barra de acciones de las cookies, siempre bajo la lista. Con cambios sin guardar (y mientras
// se confirma el guardado) se queda pegada abajo para no tener que buscarla; en reposo no tapa
// nada. Rechazar y aceptar tienen el mismo peso.
export default function ConsentActions({ summary, onReject, onAccept, onSave, onReset, saved, dirty }) {
  const pinned = dirty || saved;
  return (
    <>
      <div className={`mt-3 ${pinned ? 'sticky bottom-0 z-10 pb-[env(safe-area-inset-bottom)]' : ''}`}>
        <div className="material flex flex-col gap-2 rounded-2xl border border-line p-3 shadow-raised">
          {/* Línea de estado con altura reservada: en reposo, el resumen de lo guardado; con
              cambios o tras guardar, el aviso (anunciado). Comparten celda: nada se mueve. */}
          <div className="grid min-h-6 items-center px-1 text-sm text-ink-2">
            <AnimatePresence initial={false}>
              {!saved && !dirty && (
                <motion.div key="summary" {...disclose} className="col-start-1 row-start-1">
                  {summary}
                </motion.div>
              )}
            </AnimatePresence>
            <p role="status" className="col-start-1 row-start-1 flex items-center">
              <AnimatePresence mode="wait" initial={false}>
                {saved ? (
                  <motion.span key="saved" {...disclose} className="inline-flex items-center gap-2 text-ink">
                    <CircleCheck aria-hidden="true" className="size-4 text-brand" />
                    {PRIVACY.saved}
                  </motion.span>
                ) : dirty ? (
                  <motion.span key="dirty" {...disclose} className="inline-flex items-center gap-2">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-dawn" />
                    {PRIVACY.unsaved}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
            <Button variant="secondary" onClick={onReject} className="px-3 sm:px-6">
              {PRIVACY.reject}
            </Button>
            <Button variant="secondary" onClick={onAccept} className="px-3 sm:px-6">
              {PRIVACY.accept}
            </Button>
            <Button onClick={onSave} className="col-span-2">
              {PRIVACY.save}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-3 px-1">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center text-sm text-ink-3 underline underline-offset-4 transition-colors duration-200 ease-standard hover:text-ink-2"
        >
          {PRIVACY.reset}
        </button>
      </div>
    </>
  );
}
