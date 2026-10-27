import { verifyMaterialTicket } from '../config/jwt.js';

// GET de un material con ?ticket= (pestaña nueva sin cabecera Authorization): si el ticket es válido y es
// de ESTE curso y ESTE material, deja req.user con su usuario; requireCourseAccess vuelve a comprobar la
// cohorte en el momento. Un ticket caducado, ajeno o manipulado → 401. Sin ticket, no hace nada.
export const materialTicket = (req, res, next) => {
  const { ticket } = req.query;
  if (ticket === undefined) return next();
  try {
    const t = verifyMaterialTicket(String(ticket));
    if (t.c !== req.params.id || t.m !== req.params.materialId) throw new Error('ticket de otro material');
    req.user = { id: t.id };
    req.viaTicket = true;
    return next();
  } catch {
    return res.status(401).json({ error: 'El enlace ha caducado. Vuelve a abrir el temario desde el curso.' });
  }
};
