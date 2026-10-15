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

// Estado del panel "Tu turno": escribir una reseña, editar o borrar la propia (una por persona).
export default function useReviewForm({ user, ownReview, create, update, remove, reload }) {
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({});
  const [sendError, setSendError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState(null); // mensaje del momento de éxito
  const timer = useRef(null);

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
    // 409: ya tenía una reseña (p. ej. publicada en otra pestaña): se recarga para mostrarla
    if (err?.status === 409) reload();
    setSendError([401, 403, 409, 429].includes(err?.status) ? err.message : fallback);
  };

  const onTextChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFieldErrors((current) => without(current, e.target.name));
  };

  const onRate = (rating) => {
    setForm((f) => ({ ...f, rating }));
    setFieldErrors((current) => without(current, 'rating'));
  };

  const startEdit = useCallback(() => {
    if (!ownReview) return;
    setForm({ description: ownReview.text, rating: ownReview.rating });
    setFieldErrors({});
    setSendError(null);
    setConfirming(false);
    setEditing(true);
    focusSoon('#review-description');
  }, [ownReview]);

  const cancelEdit = () => {
    setEditing(false);
    setForm(EMPTY);
    setFieldErrors({});
    setSendError(null);
    focusSoon('#own-review-edit');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.description || !form.rating || submitting) return;
    setSubmitting(true);
    setSendError(null);
    setFieldErrors({});
    const review = { description: form.description, rating: form.rating };
    try {
      if (editing && ownReview) {
        await update(ownReview.id, review);
        setEditing(false);
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

  const askDelete = () => {
    setSendError(null);
    setConfirming(true);
    focusSoon('#own-review-cancel-delete');
  };

  const cancelDelete = () => {
    setConfirming(false);
    focusSoon('#own-review-delete');
  };

  const confirmDelete = async () => {
    if (!ownReview || deleting) return;
    setDeleting(true);
    setSendError(null);
    try {
      await remove(ownReview.id);
      setConfirming(false);
      setEditing(false);
      setForm(EMPTY);
      flash(OWN.deleted);
      focusSoon('#composer-title');
    } catch (err) {
      fail(err, OWN.deleteError);
    } finally {
      setDeleting(false);
    }
  };

  return {
    form, fieldErrors, sendError, submitting, success, editing, confirming, deleting,
    onTextChange, onRate, onSubmit, startEdit, cancelEdit, askDelete, cancelDelete, confirmDelete,
  };
}
