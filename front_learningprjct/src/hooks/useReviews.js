import { useCallback, useEffect, useState } from 'react';
import { deleteReview, fetchReviews, postReview, updateReview } from '../lib/reviewsApi';

const LOAD_ERROR = 'No se pudieron cargar las reseñas';
const token = () => localStorage.getItem('token');
// El POST y el PUT responden { message, review }; la lista guarda la reseña
const unwrap = (response) => response?.review ?? response;
const idOf = (review) => String(review?._id ?? '');

// Lista de reseñas y sus escrituras. Con sesión, el servidor marca las propias (`mine`) y la lista
// se vuelve a pedir al entrar o salir. Las acciones lanzan ReviewApiError para que el formulario
// muestre el error donde toca.
export default function useReviews(viewer) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

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
    return () => {
      alive = false;
    };
  }, [viewer]);

  const create = useCallback(async (review) => {
    const saved = unwrap(await postReview(review, token()));
    setReviews((current) => [saved, ...current]);
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

  return { reviews, loading, loadError, reload: load, create, update, remove };
}
