// Correos de profesores de un curso: aviso de alta (con enlace de activación) y aviso de vinculación.
// Misma estética que cohortInviteEmailTemplate.js: tablas, estilos en línea y colores sólidos.
import { C, FONT, MONO, escapeHtml, singleLine } from './contactEmailTemplate.js';

const longDate = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', year: 'numeric' });
};

// Carcasa común: cabecera de marca, tarjeta con título/texto/ficha del curso y botón opcional.
// Todos los valores llegan ya escapados.
const shell = ({ subject, badge, title, lead, course, button, note, footer }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.night};">
  <div style="display:none; max-height: 0; overflow: hidden; opacity: 0; color: ${C.night};">${title}: ${course}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background-color: ${C.night}; background-image: radial-gradient(70% 50% at 10% 0%, ${C.brandDeep}, transparent 70%), radial-gradient(60% 50% at 100% 10%, ${C.teal}, transparent 70%);">
    <tr>
      <td align="center" style="padding: 40px 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
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
                    <span style="display: inline-block; border: 1px solid ${C.cardLine}; border-radius: 999px; padding: 6px 12px; font-family: ${FONT}; font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; color: ${C.brand};">&#9679; ${badge}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="${C.card}" style="background-color: ${C.card}; border: 1px solid ${C.cardLine}; border-radius: 24px; padding: 36px 28px;">
              <p style="margin: 0 0 10px; font-family: ${MONO}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: ${C.brand};">Profesorado</p>
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 28px; line-height: 1.15; font-weight: 800; letter-spacing: -0.5px; color: ${C.ink};">${title}<span style="color: ${C.brand};">.</span></h1>
              <p style="margin: 14px 0 0; font-family: ${FONT}; font-size: 16px; line-height: 1.6; color: ${C.ink2};">${lead}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td bgcolor="${C.panel}" style="background-color: ${C.panel}; border: 1px solid ${C.cardLine}; border-radius: 16px; padding: 20px 22px;">
                    <p style="margin: 0; font-family: ${FONT}; font-size: 20px; line-height: 1.3; font-weight: 800; letter-spacing: -0.3px; color: ${C.ink};">${course}</p>
                  </td>
                </tr>
              </table>
              ${button ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
                <tr>
                  <td bgcolor="${C.brand}" style="background-color: ${C.brand}; border-radius: 999px;">
                    <a href="${button.url}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT}; font-size: 16px; font-weight: 700; color: ${C.onBrand}; text-decoration: none; border-radius: 999px;">${button.label} &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 24px 0 6px; font-family: ${FONT}; font-size: 12px; color: ${C.ink3};">¿El botón no funciona? Copia este enlace en el navegador:</p>
              <p style="margin: 0; font-family: ${MONO}; font-size: 12px; line-height: 1.5; word-break: break-all;"><a href="${button.url}" style="color: ${C.brandSoft}; text-decoration: none;">${button.url}</a></p>` : ''}
              ${note ? `<p style="margin: 14px 0 0; font-family: ${FONT}; font-size: 13px; line-height: 1.5; color: ${C.ink3};">${note}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 8px 40px;">
              <p style="margin: 0 0 8px; font-family: ${FONT}; font-size: 20px; font-weight: 800; letter-spacing: -0.4px; color: ${C.ink};">Campus<span style="color: ${C.brand};">.</span></p>
              <p style="margin: 0; font-family: ${FONT}; font-size: 12px; line-height: 1.6; color: ${C.ink3};">${footer}<br>Evenor-Tech · Av. de la República Argentina, 27 · 41011 Sevilla</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

/**
 * @param {{ url, courseTitle, expiresAt? }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildTeacherInviteEmail({ url, courseTitle, expiresAt }) {
  const course = singleLine(courseTitle) || 'Curso del Campus';
  const expires = longDate(expiresAt);
  const subject = `Te han añadido como profesor del curso ${course}`;
  const lead = 'Te han dado acceso de profesor a un curso del Campus Evenor-Tech. Activa el acceso con el botón.';
  const note = `Si aún no tienes cuenta en el Campus, el enlace te llevará a crearla.${expires ? ` Caduca el ${expires}.` : ''} El enlace es personal y de un solo uso: no lo reenvíes.`;

  const html = shell({
    subject: escapeHtml(subject),
    badge: 'Profesor',
    title: 'Te han añadido como profesor',
    lead,
    course: escapeHtml(course),
    button: { url: escapeHtml(url), label: 'Activar acceso de profesor' },
    note,
    footer: 'Si no esperabas este correo, puedes ignorarlo: sin activar el enlace no se concede nada.',
  });
  const text = [
    `Te han añadido como profesor del curso ${course}.`,
    '',
    lead,
    `Activar acceso de profesor: ${url}`,
    '',
    note,
    '',
    'Si no esperabas este correo, puedes ignorarlo.',
    'Evenor-Tech · Sevilla',
  ].join('\n');
  return { subject, html, text };
}

/**
 * @param {{ courseTitle, accountMasked }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildTeacherLinkedEmail({ courseTitle, accountMasked }) {
  const course = singleLine(courseTitle) || 'Curso del Campus';
  const account = singleLine(accountMasked);
  const subject = `Tu acceso de profesor de ${course} se ha activado`;
  const lead = `Se activó en la cuenta ${account}. Si no has sido tú, responde a este correo.`;

  const html = shell({
    subject: escapeHtml(subject),
    badge: 'Profesor',
    title: 'Tu acceso de profesor se ha activado',
    lead: escapeHtml(lead),
    course: escapeHtml(course),
    footer: 'Este aviso se envía a la dirección con la que te invitaron.',
  });
  const text = [
    `Tu acceso de profesor de ${course} se ha activado.`,
    '',
    lead,
    '',
    'Evenor-Tech · Sevilla',
  ].join('\n');
  return { subject, html, text };
}
