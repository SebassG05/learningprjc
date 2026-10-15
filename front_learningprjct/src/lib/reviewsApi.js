// Cliente de la API de reseñas, compartido por la home y la página de Reseñas.

const apiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:8547';

// Error con el detalle que devuelve el servidor: estado, mensaje y errores por campo
export class ReviewApiError extends Error {
  constructor(message, { status, fields = {} } = {}) {
    super(message);
    this.name = 'ReviewApiError';
    this.status = status;
    this.fields = fields;
  }
}

// Con token, el servidor marca las reseñas propias (`mine: true`)
export async function fetchReviews(token) {
  const res = await fetch(`${apiUrl()}/api/reviews`, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
  if (!res.ok) throw new ReviewApiError('Error al cargar reseñas', { status: res.status });
  const json = await res.json();
  return json.data || json;
}

export async function postReview(review, token) {
  const res = await fetch(`${apiUrl()}/api/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(review),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // express-validator: [{ path: 'rating', msg: '…' }] → { rating: '…' }
    const fields = Object.fromEntries((body.errors || []).filter((e) => e.path).map((e) => [e.path, e.msg]));
    throw new ReviewApiError(body.error || 'Error al enviar reseña', { status: res.status, fields });
  }
  return res.json();
}
