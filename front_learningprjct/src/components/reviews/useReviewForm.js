import { useCallback, useEffect, useRef, useState } from 'react';
import { COMPOSER, OWN } from './reviewsCopy';

const EMPTY = { description: '', rating: 0 };
const SUCCESS_MS = 2400; // lo que dura el momento de éxito antes de volver al panel

// Copia sin una clave (para limpiar el error de un campo al editarlo)
const without = (obj, key) => {
  if (!(key in obj)) return obj;
  const next = { ...obj };
  delete next[key];
  return next;
};

// Foco tras pintar (el elemento puede aparecer en este mismo render)
const focusSoon = (selector) => requestAnimationFrame(() => document.querySelector(selector)?.focus());

// Estado del panel "Tu turno" y de las acciones de tus reseñas: escribir (una cada 24 h), editar
// cualquiera de las tuyas o borrarla. Las acciones son estables (useCallback + ref) para que las
// tarjetas memoizadas del muro no se vuelvan a pintar en cada tecla.
export default function useReviewForm({ user, create, update, remove, reload, blockUntil }) {
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [sendError, setSendError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null); // reseña que se está editando (y desde dónde: scope)
  const [confirmingId, setConfirmingId] = useState(null); // `${scope}-${id}` pendiente de confirmar el borrado
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(null); // mensaje del momento de éxito
  const timer = useRef(null);
  const latest = useRef({});
  latest.current = { form, editing, submitting, deleting, user };

  useEffect(() => () => clearTimeout(timer.current), []);

  const flash = (message) => {
    setSuccess(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSuccess(null), SUCCESS_MS);
  };

  const fail = (err, fallback) => {
    const fields = err?.fields || {};
    if (Object.keys(fields).length) {
      setFieldErrors(fields);
      // Foco al primer campo con error, en el orden del formulario
      if (fields.rating) focusSoon('input[name="rating"]');
      else if (fields.description) focusSoon('#review-description');
      return;
    }
    // 429 por el plazo diario: el panel pasa a mostrar cuándo podrá escribir la siguiente
    if (err?.status === 429 && err.data?.nextReviewAt) {
      blockUntil(err.data.nextReviewAt);
      setSendError(null);
      return;
    }
    if (err?.status === 404) reload();
    setSendError([401, 403, 404, 429].includes(err?.status) ? err.message : fallback);
  };

  const onTextChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErrors((current) => without(current, e.target.name));
  };

  const onRate = (rating) => {
    setForm((f) => ({ ...f, rating }));
    setFieldErrors((current) => without(current, 'rating'));
  };

  // Editar cualquiera de las tuyas (desde el panel o desde su tarjeta del muro)
  const startEdit = useCallback((review, scope) => {
    setForm({ description: review.text, rating: review.rating });
    setFieldErrors({});
    setSendError(null);
    setConfirmingId(null);
    setEditing({ ...review, scope });
    focusSoon('#review-description');
  }, []);

  const cancelEdit = useCallback(() => {
    const from = latest.current.editing;
    setEditing(null);
    setForm(EMPTY);
    setFieldErrors({});
    setSendError(null);
    // Vuelve al botón Editar desde el que se abrió
    focusSoon(from ? `#${from.scope}-${from.id}-edit` : '#composer-title');
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.rating || submitting) return;
    setSubmitting(true);
    setSendError(null);
    setFieldErrors({});
    const review = { description: form.description, rating: form.rating };
    try {
      if (editing) {
        await update(editing.id, review);
        setEditing(null);
        flash(OWN.updated);
      } else {
        await create({ ...review, name: user?.name || '' });
        flash(COMPOSER.success);
      }
      setForm(EMPTY);
    } catch (err) {
      fail(err, editing ? OWN.updateError : COMPOSER.error);
    } finally {
      setSubmitting(false);
    }
  };

  const askDelete = useCallback((review, scope) => {
    setSendError(null);
    setConfirmingId(`${scope}-${review.id}`);
    focusSoon(`#${scope}-${review.id}-cancel-delete`);
  }, []);

  const cancelDelete = useCallback((review, scope) => {
    setConfirmingId(null);
    focusSoon(`#${scope}-${review.id}-delete`);
  }, []);

  const confirmDelete = useCallback(async (review) => {
    if (latest.current.deleting) return;
    setDeleting(true);
    setSendError(null);
    try {
      await remove(review.id);
      setConfirmingId(null);
      if (latest.current.editing?.id === review.id) {
        setEditing(null);
        setForm(EMPTY);
      }
      flash(OWN.deleted);
      focusSoon('#composer-title');
    } catch (err) {
      fail(err, OWN.deleteError);
    } finally {
      setDeleting(false);
    }
    // flash y fail solo usan setters y props estables
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remove]);

  return {
    form, fieldErrors, sendError, submitting, success, editing, confirmingId, deleting,
    onTextChange, onRate, onSubmit, startEdit, cancelEdit, askDelete, cancelDelete, confirmDelete,
  };
}
