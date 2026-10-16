import TermsAcceptance from '../models/TermsAcceptance.js';
import { TERMS } from '../content/terms.js';
import { clientIp, forwardedFor, userAgent } from '../utils/requestInfo.js';

export const currentTermsVersion = () => TERMS.version;

// Lo que ve el alumno (sin la marca interna de revisión legal)
export const publicTerms = () => ({
  version: TERMS.version,
  updatedAt: TERMS.updatedAt,
  title: TERMS.title,
  intro: TERMS.intro,
  sections: TERMS.sections,
});

export const hasAcceptedCurrentTerms = async (userId, courseId) =>
  Boolean(await TermsAcceptance.exists({ userId, courseId, termsVersion: TERMS.version }));

// El cliente tiene que aceptar de forma explícita la versión vigente: una versión vieja no vale
export const isValidAcceptance = (body) => body?.acceptTerms === true && body?.termsVersion === TERMS.version;

export const termsRequired = () => ({
  error: 'Debes aceptar las condiciones de confidencialidad antes de continuar',
  code: 'TERMS_REQUIRED',
  termsVersion: TERMS.version,
});

// Guarda la aceptación (usuario, curso, versión, fecha, IP y navegador). Idempotente: si ya existía
// para esta versión se conserva el primer registro, que es la prueba original.
export async function recordAcceptance(req, userId, courseId) {
  const record = {
    userId,
    courseId,
    termsVersion: TERMS.version,
    acceptedAt: new Date(),
    ip: clientIp(req).slice(0, 64),
    forwardedFor: forwardedFor(req),
    userAgent: userAgent(req),
  };
  await TermsAcceptance.updateOne(
    { userId, courseId, termsVersion: TERMS.version },
    { $setOnInsert: record },
    { upsert: true }
  );
  return record;
}
