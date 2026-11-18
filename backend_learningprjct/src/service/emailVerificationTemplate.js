// Correo con el código para confirmar el correo al registrarse con contraseña.
// Misma estética que el resto de correos: tablas, estilos en línea y colores sólidos.
import { C, FONT, MONO, escapeHtml, singleLine } from './contactEmailTemplate.js';

/**
 * @param {{ name?: string, code: string, minutes: number }} input
 * @returns {{ subject: string, html: string, text: string }}
 */
export function buildEmailVerificationEmail({ name, code, minutes }) {
  const nombre = singleLine(name).split(' ')[0] || '';
  const subject = `${code} es tu código del Campus Evenor-Tech`;
  const saludo = nombre ? `Hola, ${nombre}.` : 'Hola.';
  const lead = 'Escribe este código en el Campus para confirmar tu correo y terminar de crear tu cuenta.';
  const note = `Caduca en ${minutes} minutos. No lo compartas con nadie: el equipo del Campus nunca te lo pedirá.`;
  const footer = 'Si no has creado una cuenta, ignora este correo: sin el código no se activa nada.';

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.night};">
  <div style="display:none; max-height: 0; overflow: hidden; opacity: 0; color: ${C.night};">Tu código: ${code}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background-color: ${C.night};">
    <tr>
      <td align="center" style="padding: 40px 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          <tr>
            <td style="padding: 0 8px 22px;">
              <span style="font-family: ${FONT}; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: ${C.brand};">Evenor Tech</span>
              <span style="display: inline-block; width: 1px; height: 18px; margin: 0 10px; background-color: ${C.cardLine}; vertical-align: -3px;"></span>
              <span style="font-family: ${FONT}; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: ${C.ink2};">Campus</span>
            </td>
          </tr>
          <tr>
            <td bgcolor="${C.card}" style="background-color: ${C.card}; border: 1px solid ${C.cardLine}; border-radius: 24px; padding: 36px 28px;">
              <p style="margin: 0 0 10px; font-family: ${MONO}; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: ${C.brand};">Confirma tu correo</p>
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 28px; line-height: 1.15; font-weight: 800; letter-spacing: -0.5px; color: ${C.ink};">${escapeHtml(saludo)}</h1>
              <p style="margin: 14px 0 0; font-family: ${FONT}; font-size: 16px; line-height: 1.6; color: ${C.ink2};">${lead}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td align="center" bgcolor="${C.panel}" style="background-color: ${C.panel}; border: 1px solid ${C.cardLine}; border-radius: 16px; padding: 22px;">
                    <p style="margin: 0; font-family: ${MONO}; font-size: 36px; line-height: 1; font-weight: 700; letter-spacing: 10px; color: ${C.ink};">${code}</p>
                  </td>
                </tr>
              </table>
              <p style="margin: 18px 0 0; font-family: ${FONT}; font-size: 13px; line-height: 1.5; color: ${C.ink3};">${note}</p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 32px 8px 40px;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 12px; line-height: 1.6; color: ${C.ink3};">${footer}<br>Evenor-Tech · Av. de la República Argentina, 27 · 41011 Sevilla</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
  const text = [saludo, '', lead, '', `Tu código: ${code}`, '', note, '', footer, 'Evenor-Tech · Sevilla'].join('\n');
  return { subject, html, text };
}
