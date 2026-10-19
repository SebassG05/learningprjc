/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useId, useImperativeHandle, useRef } from 'react';
import { AlertTriangle, Sparkles } from 'lucide-react';
import Button from '../../ui/Button';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { coherenceWarning, isPending } from '../shared/submissionStatus';
import { studentName } from '../shared/adminFormat';
import FeedbackField from './FeedbackField';
import GradeInput from './GradeInput';
import StatusPicker from './StatusPicker';
import SubmissionMeta from './SubmissionMeta';
import SubmissionPreview from './SubmissionPreview';
import useGradeForm from './useGradeForm';
import { COPY } from './correccionesCopy';

/**
 * Contenido del panel de corrección de UNA entrega (se monta de nuevo al cambiar de entrega).
 * Expone por `apiRef` lo que necesitan los atajos (A/R, guardar) y avisa de si hay cambios.
 * Escritorio ancho: PDF a la izquierda y corrección a la derecha. Resto: todo en una columna.
 */
export default function GradePanel({ entrega, apiRef, onDirtyChange, onSave, hasNext }) {
  const { form, setNota, setEstado, setFeedback, dirty, canSave, autoSuggested, body } = useGradeForm(entrega);
  const wide = useMediaQuery('(min-width: 1280px)');
  const inlinePdf = useMediaQuery('(min-width: 768px)');
  const fine = useMediaQuery('(pointer: fine)');
  const formRef = useRef(null);
  const hintId = useId();
  const warning = coherenceWarning(form.estado, form.nota);
  const name = studentName(entrega.userId);
  const rejecting = form.estado === 'rechazado' && entrega.estado !== 'rechazado';

  const save = (next) => {
    if (!canSave) return;
    onSave(entrega, body, { next });
  };

  useImperativeHandle(apiRef, () => ({ setEstado, save }));

  useEffect(() => onDirtyChange(dirty), [dirty, onDirtyChange]);

  // Avisa al cerrar o recargar la pestaña con cambios sin guardar
  useEffect(() => {
    if (!dirty) return undefined;
    const onBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [dirty]);

  // En escritorio el foco va a la nota para corregir sin ratón (en móvil abriría el teclado)
  useEffect(() => {
    if (!fine) return undefined;
    const r = requestAnimationFrame(() => formRef.current?.querySelector('input')?.focus({ preventScroll: true }));
    return () => cancelAnimationFrame(r);
    // Solo al montar: cada entrega monta su propio panel
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const preview = <SubmissionPreview entrega={entrega} studentLabel={name} inline={inlinePdf} />;

  return (
    <>
      <div data-lenis-prevent className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className={wide ? 'grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] gap-6 p-6' : 'space-y-6 px-5 py-5 md:px-6'}>
          {wide ? <div className="min-w-0">{preview}</div> : null}
          <div className="min-w-0 space-y-6">
            <SubmissionMeta entrega={entrega} />
            {wide ? null : preview}
            <form
              ref={formRef}
              aria-label={`Corrección de ${name}`}
              onSubmit={(e) => {
                e.preventDefault();
                save(false);
              }}
              className="space-y-6 border-t border-line pt-6"
            >
              <GradeInput value={form.nota} onChange={setNota} />
              <div className="space-y-2">
                <StatusPicker value={form.estado} onChange={setEstado} label={COPY.drawer.status} describedBy={hintId} />
                <div id={hintId} aria-live="polite" className="space-y-2">
                  {autoSuggested ? (
                    <p className="flex items-center gap-1.5 text-footnote text-ink-3">
                      <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                      {COPY.drawer.suggested}
                    </p>
                  ) : null}
                  {warning ? (
                    <p className="flex items-start gap-2 rounded-xl bg-dawn/10 px-3 py-2 text-sm text-dawn">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {warning}
                    </p>
                  ) : null}
                  {rejecting ? (
                    <p className="flex items-start gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                      {COPY.drawer.rejectWarning(entrega.intentos || 0)}
                    </p>
                  ) : null}
                </div>
              </div>
              <FeedbackField value={form.feedback} onChange={setFeedback} />
            </form>
          </div>
        </div>
      </div>

      <footer className="shrink-0 border-t border-line bg-surface px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <p className="text-footnote text-ink-3 lg:mr-auto">
            {!form.estado && isPending(entrega.estado) ? COPY.drawer.chooseStatus : COPY.drawer.emailNote}
            {fine ? <span className="hidden xl:inline"> · {COPY.drawer.shortcuts}</span> : null}
          </p>
          <div className="grid grid-cols-2 gap-3 lg:flex">
            <Button variant="secondary" disabled={!canSave} onClick={() => save(false)}>
              {COPY.drawer.save}
            </Button>
            <Button disabled={!canSave} onClick={() => save(true)} title={hasNext ? undefined : COPY.toast.end}>
              {COPY.drawer.saveNext}
            </Button>
          </div>
        </div>
      </footer>
    </>
  );
}
