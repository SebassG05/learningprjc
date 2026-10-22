import { useEffect, useRef, useState } from 'react';
import { fetchCourseVideo, readToken } from '../../../lib/coursesApi';
import { isCourseId } from '../courseFormat';

/**
 * Vídeo de la ficha: { status: 'loading' | 'ready' | 'none', video: { mode, src, poster } | null }.
 * La petición sale ya con el token, en paralelo a la de la inscripción: decide el backend, no el front.
 * Se repite al entrar o salir (userId) y una vez cuando el alumno se inscribe en la propia ficha.
 */
export default function useCourseVideo(id, userId, enrolled) {
  const [state, setState] = useState({ status: 'loading', video: null });
  const [attempt, setAttempt] = useState(0);
  const upgraded = useRef(null);

  useEffect(() => {
    if (!isCourseId(id)) {
      setState({ status: 'none', video: null });
      return undefined;
    }
    const ctrl = new AbortController();
    fetchCourseVideo(id, readToken(), ctrl.signal)
      .then((video) => setState({ status: 'ready', video }))
      .catch((err) => {
        // Sin vídeo (404) o sin servidor: la ficha simplemente no muestra la sección
        if (err.name !== 'AbortError') setState({ status: 'none', video: null });
      });
    return () => ctrl.abort();
  }, [id, userId, attempt]);

  // Se acaba de inscribir y aún ve la preview: se pide otra vez (una sola por curso y alumno; si el
  // curso está cerrado seguirá siendo preview y no se insiste)
  const mode = state.video?.mode;
  useEffect(() => {
    const key = `${id}|${userId}`;
    if (!enrolled || mode !== 'preview' || upgraded.current === key) return;
    upgraded.current = key;
    setAttempt((n) => n + 1);
  }, [enrolled, mode, id, userId]);

  return state;
}
