import { useCallback, useMemo, useState } from 'react';
import { hasGrade, isPending, normalizeGrade, suggestStatus } from '../shared/submissionStatus';

const fromEntrega = (e) => ({
  nota: hasGrade(e?.calificacion) ? e.calificacion : null,
  // Una entrega pendiente aún no tiene resultado: hay que elegirlo
  estado: e && !isPending(e.estado) ? e.estado : null,
  feedback: e?.feedbackProfesor ?? '',
  estadoTocado: false,
});

/**
 * Estado del formulario de corrección de una entrega. Mientras el profesor no elija el resultado
 * a mano, la nota lo sugiere (≥ 5 aprobado; por debajo, «Requiere cambios»).
 * Se reinicia al cambiar de entrega (la clave del componente es su id).
 */
export default function useGradeForm(entrega) {
  const [initial] = useState(() => fromEntrega(entrega));
  const [form, setForm] = useState(initial);

  const setNota = useCallback((value) => {
    const nota = normalizeGrade(value);
    setForm((f) => ({ ...f, nota, estado: f.estadoTocado ? f.estado : suggestStatus(nota) ?? f.estado }));
  }, []);

  const setEstado = useCallback((estado) => setForm((f) => ({ ...f, estado, estadoTocado: true })), []);
  const setFeedback = useCallback((feedback) => setForm((f) => ({ ...f, feedback })), []);

  const dirty = form.nota !== initial.nota || form.estado !== initial.estado || form.feedback.trim() !== initial.feedback.trim();
  const autoSuggested = !form.estadoTocado && form.estado !== null && form.estado === suggestStatus(form.nota) && form.estado !== initial.estado;

  const body = useMemo(
    () => ({ estado: form.estado, calificacion: form.nota, feedbackProfesor: form.feedback.trim() }),
    [form]
  );

  return { form, setNota, setEstado, setFeedback, dirty, canSave: Boolean(form.estado) && dirty, autoSuggested, body };
}
