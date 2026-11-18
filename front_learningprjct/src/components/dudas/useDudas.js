// Estado y acciones de una lista de dudas (de un tema o de todo el curso). Cada acción espera la
// respuesta del servidor y sustituye la duda que devuelve: nada de permisos supuestos en el cliente.
import { useCallback, useEffect, useMemo, useState } from 'react';
import * as api from '../../lib/dudasApi';
import useDudaAcciones from './useDudaAcciones';

// Una duda nueva tiene la actividad más reciente: va justo detrás de las fijadas (el orden del servidor)
const insertar = (list, duda) => {
  const i = list.findIndex((d) => !d.fijada);
  if (i === -1) return [...list, duda];
  return [...list.slice(0, i), duda, ...list.slice(i)];
};

/**
 * `enabled` permite esperar a que el bloque se acerque a la pantalla antes de pedir la lista.
 * Devuelve `{ dudas, estado: 'cargando'|'listo'|'error', reintentar, acciones }`; cada acción
 * resuelve con la respuesta del servidor o con `null` si falló (el error ya se ha avisado).
 */
export default function useDudas({ cursoId, temaId, lang = 'es', enabled = true }) {
  const [dudas, setDudas] = useState([]);
  const [estado, setEstado] = useState('cargando');
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    if (!enabled || !cursoId) return undefined;
    const ctrl = new AbortController();
    setEstado('cargando');
    api
      .fetchDudas(cursoId, { temaId }, ctrl.signal)
      .then((list) => {
        setDudas(Array.isArray(list) ? list : []);
        setEstado('listo');
      })
      .catch((err) => {
        if (err?.name === 'AbortError') return;
        setEstado('error');
      });
    return () => ctrl.abort();
  }, [cursoId, temaId, enabled, intento]);

  const reintentar = useCallback(() => setIntento((n) => n + 1), []);

  const { acciones: base, run } = useDudaAcciones({ setDudas, lang });

  const acciones = useMemo(
    () => ({
      ...base,
      // `valores.temaId` permite elegir el tema cuando la lista es de todo el curso
      crear: (valores) =>
        run(
          () => api.createDuda(cursoId, { temaId: valores.temaId ?? temaId, lang, titulo: valores.titulo, texto: valores.texto }),
          (duda) => setDudas((list) => insertar(list, duda)),
        ),
    }),
    [base, run, cursoId, temaId, lang],
  );

  return { dudas, estado, reintentar, acciones };
}
