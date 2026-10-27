import { useEffect, useState } from 'react';
import { API_URL } from '../../lib/coursesApi';
import { authFetch } from '../../lib/courseFiles';

// Preguntas, duración y nota mínima del test de cada tema: { [temaId]: { totalPreguntas, duracion, notaMinima } }.
// Un tema sin test (404) simplemente no aparece.
export default function useTestInfo(cursoId, temas) {
  const [info, setInfo] = useState({});

  useEffect(() => {
    if (!temas?.length) return undefined;
    const ctrl = new AbortController();
    Promise.all(temas.map(async (tema) => {
      try {
        const res = await authFetch(`${API_URL}/api/tests/${cursoId}/temas/${tema._id}/test`, { signal: ctrl.signal });
        if (!res.ok) return null;
        const data = await res.json();
        return [tema._id, { totalPreguntas: data.preguntas.length, duracion: data.duracionMinutos, notaMinima: data.notaMinima }];
      } catch (error) {
        if (error.name !== 'AbortError') console.error(`Error cargando info test tema ${tema._id}:`, error);
        return null;
      }
    })).then((entries) => {
      if (!ctrl.signal.aborted) setInfo(Object.fromEntries(entries.filter(Boolean)));
    });
    return () => ctrl.abort();
  }, [temas, cursoId]);

  return info;
}
