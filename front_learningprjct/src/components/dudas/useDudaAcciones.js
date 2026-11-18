// Acciones de moderación y respuesta sobre una lista de dudas, compartidas por useDudas, «Mis dudas
// pendientes» y la pestaña de administración. Cada acción espera la respuesta del servidor y sustituye
// la duda que devuelve: nada de permisos supuestos en el cliente.
import { useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import * as api from '../../lib/dudasApi';
import { dudasCopy } from './dudasCopy';

/**
 * `setDudas` es el setter de la lista. `conservarCurso` mantiene el `curso` de la fila cuando la lista
 * mezcla cursos (la duda que devuelve el servidor no lo trae). Devuelve `{ acciones, run, sustituir }`:
 * cada acción resuelve con la respuesta del servidor o con `null` si falló (el error ya se ha avisado);
 * `run` y `sustituir` permiten añadir acciones propias de la lista (p. ej. crear).
 */
export default function useDudaAcciones({ setDudas, lang = 'es', conservarCurso = false }) {
  const { showToast } = useToast();

  return useMemo(() => {
    const copy = dudasCopy(lang);
    const avisar = (err) => showToast(err?.body?.error || copy.errorGuardar, 'error', 4000);
    const sustituir = (duda) =>
      setDudas((list) =>
        list.map((d) => {
          if (d._id !== duda._id) return d;
          return conservarCurso ? { ...d, ...duda, curso: d.curso } : duda;
        }),
      );

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

    const acciones = {
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
    return { acciones, run, sustituir };
  }, [setDudas, lang, conservarCurso, showToast]);
}
