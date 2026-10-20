import { useCallback, useRef } from 'react';
import { fetchSubmissions } from '../../../lib/adminApi';
import usePagedList from '../shared/usePagedList';
import { apiParams, legacyPage } from './submissionQuery';

/**
 * Entregas paginadas en servidor (scroll infinito). `patch` aplica la corrección optimista
 * (o la deshace) y mueve las cifras por estado.
 *
 * Compatibilidad: si el backend aún es el anterior (responde con todas las entregas y sin
 * `total`), se filtra, ordena y pagina en el navegador con las mismas reglas. `courseTitle`
 * resuelve el título del curso que ese backend no devuelve.
 */
export default function useSubmissions(filters, courseTitle) {
  const key = JSON.stringify(filters);
  const legacy = useRef(null); // todas las entregas, solo con el backend anterior
  const titleRef = useRef(courseTitle);
  titleRef.current = courseTitle;

  const fetchPage = useCallback(
    async (page, signal) => {
      if (page > 1 && legacy.current) return legacyPage(legacy.current, filters, page, titleRef.current);
      const r = await fetchSubmissions(apiParams(filters, page), signal);
      if (typeof r.total !== 'number' || !r.stats) {
        legacy.current = Array.isArray(r.entregas) ? r.entregas : [];
        return legacyPage(legacy.current, filters, page, titleRef.current);
      }
      legacy.current = null;
      return { items: r.entregas, stats: r.stats, total: r.total, page: r.page, pages: r.pages };
    },
    // `key` resume los filtros (el objeto cambia de identidad en cada lectura de la URL)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key]
  );
  const list = usePagedList(fetchPage, key);
  const patch = useCallback((id, changes) => list.patch(id, changes, 'estado'), [list.patch]); // eslint-disable-line react-hooks/exhaustive-deps
  return { ...list, patch };
}
