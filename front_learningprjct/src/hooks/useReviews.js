import { useCallback, useEffect, useState } from 'react';
import { deleteReview, fetchReviewStatus, fetchReviews, postReview, updateReview } from '../lib/reviewsApi';

const LOAD_ERROR = 'No se pudieron cargar las reseñas';
const token = () => localStorage.getItem('token');
// El POST y el PUT responden { message, review }; la lista guarda la reseña
const unwrap = (response) => response?.review ?? response;
const idOf = (review) => String(review?._id ?? '');
const toDate = (value) => (value ? new Date(value) : null);

// Lista de reseñas, sus escrituras y el plazo diario. Con sesión, el servidor marca las propias
// (`mine`) y dice cuándo se puede publicar la siguiente (una cada 24 h); se vuelve a pedir al entrar
// o salir. Las acciones lanzan ReviewApiError para que el formulario muestre el error donde toca.
export default function useReviews(viewer) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [nextReviewAt, setNextReviewAt] = useState(null);

  const load = useCallback(() => {
    return fetchReviews(viewer ? token() : undefined)
      .then((data) => {
        setReviews(data);
        setLoadError(null);
      })
      .catch(() => setLoadError(LOAD_ERROR))
      .finally(() => setLoading(false));
  }, [viewer]);

  useEffect(() => {
    let alive = true;
    fetchReviews(viewer ? token() : undefined)
      .then((data) => alive && (setReviews(data), setLoadError(null)))
      .catch(() => alive && setLoadError(LOAD_ERROR))
      .finally(() => alive && setLoading(false));
    // Plazo diario: si falla, se deja publicar y el servidor decide (responde 429 si toca esperar)
    if (viewer) {
      fetchReviewStatus(token())
        .then((status) => alive && setNextReviewAt(toDate(status.nextReviewAt)))
        .catch(() => alive && setNextReviewAt(null));
    } else {
      setNextReviewAt(null);
    }
    return () => {
      alive = false;
    };
  }, [viewer]);

  // Cuando vence el plazo con la página abierta, el formulario vuelve solo
  useEffect(() => {
    if (!nextReviewAt) return undefined;
    const wait = nextReviewAt.getTime() - Date.now();
    if (wait <= 0) {
      setNextReviewAt(null);
      return undefined;
    }
    const timer = setTimeout(() => setNextReviewAt(null), Math.min(wait, 2 ** 31 - 1));
    return () => clearTimeout(timer);
  }, [nextReviewAt]);

  const create = useCallback(async (review) => {
    const response = await postReview(review, token());
    const saved = unwrap(response);
    setReviews((current) => [saved, ...current]);
    setNextReviewAt(toDate(response?.nextReviewAt));
    return saved;
  }, []);

  const update = useCallback(async (id, review) => {
    const saved = unwrap(await updateReview(id, review, token()));
    setReviews((current) => current.map((r) => (idOf(r) === id ? saved : r)));
    return saved;
  }, []);

  const remove = useCallback(async (id) => {
    await deleteReview(id, token());
    setReviews((current) => current.filter((r) => idOf(r) !== id));
  }, []);

  // Un 429 trae la hora exacta: se adopta para mostrar el plazo sin otra petición
  const blockUntil = useCallback((value) => setNextReviewAt(toDate(value)), []);

  return { reviews, loading, loadError, reload: load, create, update, remove, nextReviewAt, blockUntil };
}
