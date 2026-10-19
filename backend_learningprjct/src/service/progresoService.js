// Resumen de entregas por alumno en un curso (pestaña Progreso del panel): cuántas ha entregado,
// cuántas están pendientes de corregir, cuántas aprobadas y su nota media.
import mongoose from 'mongoose';
import EntregaEjercicio from '../models/EntregaEjercicio.js';
import Ejercicio from '../models/Ejercicio.js';

export const resumenVacio = () => ({ total: 0, pendientes: 0, aprobadas: 0, media: null, ultima: null });

export function buildResumenPipeline(courseId) {
  return [
    { $match: { cursoId: new mongoose.Types.ObjectId(courseId) } },
    {
      $group: {
        _id: '$userId',
        total: { $sum: 1 },
        pendientes: { $sum: { $cond: [{ $eq: ['$estado', 'enviado'] }, 1, 0] } },
        aprobadas: { $sum: { $cond: [{ $eq: ['$estado', 'aprobado'] }, 1, 0] } },
        // $avg ignora las entregas sin nota
        media: { $avg: '$calificacion' },
        ultima: { $max: '$fechaEntrega' },
      },
    },
  ];
}

// Map userId (string) → resumen; la media se redondea a 2 decimales
export function indexarResumen(filas = []) {
  const map = new Map();
  filas.forEach(({ _id, total, pendientes, aprobadas, media, ultima }) => {
    if (!_id) return;
    map.set(String(_id), {
      total,
      pendientes,
      aprobadas,
      media: typeof media === 'number' ? Math.round(media * 100) / 100 : null,
      ultima: ultima ?? null,
    });
  });
  return map;
}

export async function resumenCurso(courseId) {
  const [filas, ejercicios] = await Promise.all([
    EntregaEjercicio.aggregate(buildResumenPipeline(courseId)),
    Ejercicio.countDocuments({ cursoId: courseId, activo: { $ne: false } }),
  ]);
  return { porAlumno: indexarResumen(filas), ejercicios };
}
