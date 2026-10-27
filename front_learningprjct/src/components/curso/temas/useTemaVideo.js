import { useEffect, useState } from 'react';
import { API_URL } from '../../../lib/coursesApi';
import { authFetch } from '../../../lib/courseFiles';

/**
 * URLs del vídeo de un tema: { status: 'idle' | 'loading' | 'ready' | 'none' | 'error', video }.
 * Solo se piden cuando `enabled` (la escena se acerca a la pantalla): las URLs firmadas no se piden
 * para escenas que el alumno no llega a ver. `attempt` permite reintentar tras un error.
 */
export default function useTemaVideo(cursoId, temaId, enabled, attempt = 0) {
  const [state, setState] = useState({ status: 'idle', video: null });

  useEffect(() => {
    if (!enabled) return undefined;
    const ctrl = new AbortController();
    setState((s) => (s.status === 'ready' ? s : { status: 'loading', video: null }));
    authFetch(`${API_URL}/api/courses/${cursoId}/temas/${temaId}/video`, { signal: ctrl.signal })
      .then(async (res) => {
        if (res.status === 404) return setState({ status: 'none', video: null });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return setState({ status: 'ready', video: await res.json() });
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ status: 'error', video: null });
      });
    return () => ctrl.abort();
  }, [cursoId, temaId, enabled, attempt]);

  return state;
}
