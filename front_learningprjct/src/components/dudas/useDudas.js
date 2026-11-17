// Estado y acciones de una lista de dudas (de un tema o de todo el curso). Cada acción espera la
// respuesta del servidor y sustituye la duda que devuelve: nada de permisos supuestos en el cliente.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '../../context/ToastContext';
import * as api from '../../lib/dudasApi';
import { dudasCopy } from './dudasCopy';

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
  const { showToast } = useToast();
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

  const acciones = useMemo(() => {
    const copy = dudasCopy(lang);
    const avisar = (err) => showToast(err?.body?.error || copy.errorGuardar, 'error', 4000);
    const sustituir = (duda) => setDudas((list) => list.map((d) => (d._id === duda._id ? duda : d)));

    // Ejecuta la petición, aplica el resultado y avisa del error con el mensaje del servidor
    const run = async (peticion, aplicar = sustituir, { silencioso = false } = {}) => {
      try {
        const res = await peticion();
        aplicar(res);
        return res ?? true;
      } catch (err) {
        if (!silencioso) avisar(err);
        return null;
      }
    };

    return {
      // `valores.temaId` permite elegir el tema cuando la lista es de todo el curso
      crear: (valores) =>
        run(
          () => api.createDuda(cursoId, { temaId: valores.temaId ?? temaId, lang, titulo: valores.titulo, texto: valores.texto }),
          (duda) => setDudas((list) => insertar(list, duda)),
        ),
      editar: (id, cambios) => run(() => api.updateDuda(id, cambios)),
      borrar: (id) =>
        run(
          () => api.deleteDuda(id),
          (res) => {
            if (res?.duda) sustituir(res.duda);
            else setDudas((list) => list.filter((d) => d._id !== id));
          },
        ),
      responder: (id, texto) => run(() => api.addRespuesta(id, texto)),
      editarRespuesta: (id, respuestaId, texto) => run(() => api.updateRespuesta(id, respuestaId, texto)),
      borrarRespuesta: (id, respuestaId) => run(() => api.deleteRespuesta(id, respuestaId)),
      estado: (id, accion, respuestaId) => run(() => api.setEstado(id, accion, respuestaId)),
      // Sin aviso: si falla, la marca «Respuesta nueva» simplemente vuelve a salir la próxima vez
      marcarVista: (id) => run(() => api.marcarVista(id), sustituir, { silencioso: true }),
      reportar: (id, motivo) =>
        run(
          () => api.reportar(id, motivo),
          () => showToast(copy.reportado, 'success', 3500),
        ),
    };
  }, [cursoId, temaId, lang, showToast]);

  return { dudas, estado, reintentar, acciones };
}
