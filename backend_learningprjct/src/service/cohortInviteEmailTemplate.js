// Email de invitación a un curso privado (y de activación de plaza). Misma estética que el resto de
// correos del campus (contactEmailTemplate.js): noche verde, tarjeta oscura, acento verde. HTML de
// email: tablas, estilos en línea y colores sólidos para que se vea igual en Gmail, Outlook y Apple Mail.
import { C, FONT, MONO, escapeHtml, singleLine } from './contactEmailTemplate.js';

const longDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', year: 'numeric' });
};

// Fila de la ficha del curso; si no hay valor no se pinta
const detailRow = (label, value) =>
  value
    ? `<tr>
        <td style="padding: 10px 0; border-top: 1px solid ${C.cardLine}; font-family: ${FONT}; font-size: 13px; color: ${C.ink3}; width: 38%; vertical-align: top;">${label}</td>
        <td style="padding: 10px 0; border-top: 1px solid ${C.cardLine}; font-family: ${FONT}; font-size: 14px; font-weight: 600; color: ${C.ink}; vertical-align: top;">${value}</td>
      </tr>`
    : '';

const COPY = {
  invite: {
    badge: 'Invitación',
    title: 'Tienes una plaza esperándote',
    lead: 'Te han invitado a un curso privado del Campus Evenor-Tech. Acepta la invitación para reservar tu plaza: solo tienes que entrar o crear tu cuenta.',
    cta: 'Aceptar invitación',
    subject: (course) => `Invitación al curso «${course}»`,
  },
  claim: {
    badge: 'Activa tu plaza',
    title: 'Confirma que este email es tuyo',
    lead: 'Tienes una plaza reservada en un curso privado. Para vincularla a tu cuenta, confirma que este email es tuyo con el botón.',
    cta: 'Activar mi plaza',
    subject: (course) => `Activa tu plaza en «${course}»`,
  },
};

/**
 * @param {{ url, courseTitle, cohortName?, startsAt?, expiresAt?, reason?: 'invite'|'claim' }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildCohortInviteEmail({ url, courseTitle, cohortName, startsAt, expiresAt, reason = 'invite' }) {
  const copy = COPY[reason] ?? COPY.invite;
  const course = singleLine(courseTitle) || 'Curso del Campus';
  const s = { course: escapeHtml(course), cohort: escapeHtml(singleLine(cohortName)), url: escapeHtml(url) };
  const starts = longDate(startsAt);
  const expires = longDate(expiresAt);
  const preheader = escapeHtml(`${copy.title}: ${course}${starts ? ` · empieza el ${starts}` : ''}`);

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${escapeHtml(copy.subject(course))}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.night};">
  <div style="display:none; max-height: 0; overflow: hidden; opacity: 0; color: ${C.night};">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background-color: ${C.night}; background-image: radial-gradient(70% 50% at 10% 0%, ${C.brandDeep}, transparent 70%), radial-gradient(60% 50% at 100% 10%, ${C.teal}, transparent 70%);">
    <tr>
      <td align="center" style="padding: 40px 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">

          <!-- Cabecera: la marca como en la web -->
          <tr>
            <td style="padding: 0 8px 22px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <span style="font-family: ${FONT}; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: ${C.brand};">Evenor Tech</span>
                    <span style="display: inline-block; width: 1px; height: 18px; margin: 0 10px; background-color: ${C.cardLine}; vertical-align: -3px;"></span>
                    <span style="font-family: ${FONT}; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: ${C.ink2};">Campus</span>
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; border: 1px solid ${C.cardLine}; border-radius: 999px; padding: 6px 12px; font-family: ${FONT}; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${C.brand};">&#9679; ${copy.badge}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Tarjeta -->
          <tr>
            <td bgcolor="${C.card}" style="background-color: ${C.card}; border: 1px solid ${C.cardLine}; border-radius: 24px; padding: 36px 28px;">
              <p style="margin: 0 0 10px; font-family: ${MONO}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: ${C.brand};">Curso privado · acceso por invitación</p>
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 28px; line-height: 1.15; font-weight: 800; letter-spacing: -0.5px; color: ${C.ink};">${copy.title}<span style="color: ${C.brand};">.</span></h1>
              <p style="margin: 14px 0 0; font-family: ${FONT}; font-size: 16px; line-height: 1.6; color: ${C.ink2};">${copy.lead}</p>

              <!-- Ficha del curso -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td bgcolor="${C.panel}" style="background-color: ${C.panel}; border: 1px solid ${C.cardLine}; border-radius: 16px; padding: 20px 22px;">
                    <p style="margin: 0; font-family: ${FONT}; font-size: 20px; line-height: 1.3; font-weight: 800; letter-spacing: -0.3px; color: ${C.ink};">${s.course}</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 14px;">
                      ${detailRow('Edición', s.cohort)}
                      ${detailRow('Empieza', starts)}
                      ${detailRow('Modalidad', 'Online, a tu ritmo')}
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Botón (tabla: funciona también en Outlook) -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
                <tr>
                  <td bgcolor="${C.brand}" style="background-color: ${C.brand}; border-radius: 999px;">
                    <a href="${s.url}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT}; font-size: 16px; font-weight: 700; color: ${C.onBrand}; text-decoration: none; border-radius: 999px;">${copy.cta} &rarr;</a>
                  </td>
                </tr>
              </table>
              ${expires ? `<p style="margin: 14px 0 0; font-family: ${FONT}; font-size: 13px; line-height: 1.5; color: ${C.ink3};">El enlace es personal y caduca el ${expires}. No lo reenvíes: da acceso al curso.</p>` : ''}

              <!-- Enlace alternativo -->
              <p style="margin: 24px 0 6px; font-family: ${FONT}; font-size: 12px; color: ${C.ink3};">¿El botón no funciona? Copia este enlace en el navegador:</p>
              <p style="margin: 0; font-family: ${MONO}; font-size: 12px; line-height: 1.5; word-break: break-all;"><a href="${s.url}" style="color: ${C.brandSoft}; text-decoration: none;">${s.url}</a></p>
            </td>
          </tr>

          <!-- Pie -->
          <tr>
            <td align="center" style="padding: 32px 8px 40px;">
              <p style="margin: 0 0 8px; font-family: ${FONT}; font-size: 20px; font-weight: 800; letter-spacing: -0.4px; color: ${C.ink};">Campus<span style="color: ${C.brand};">.</span></p>
              <p style="margin: 0; font-family: ${FONT}; font-size: 12px; line-height: 1.6; color: ${C.ink3};">Si no esperabas este correo, puedes ignorarlo: sin aceptar la invitación no se crea nada.<br>Evenor-Tech · Av. de la República Argentina, 27 · 41011 Sevilla</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    `${copy.title}.`,
    '',
    reason === 'claim' ? 'Tienes una plaza reservada en:' : 'Te han invitado a un curso privado del Campus Evenor-Tech:',
    course,
    cohortName ? `Edición: ${singleLine(cohortName)}` : null,
    starts ? `Empieza: ${starts}` : null,
    '',
    `${copy.cta}: ${url}`,
    expires ? `El enlace es personal y caduca el ${expires}.` : null,
    '',
    'Si no esperabas este correo, puedes ignorarlo.',
    'Evenor-Tech · Sevilla',
  ]
    .filter((line) => line !== null)
    .join('\n');

  return { subject: copy.subject(course), html, text };
}
