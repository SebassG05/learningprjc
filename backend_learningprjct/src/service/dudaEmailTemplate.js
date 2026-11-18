// Correos de Dudas: aviso al profesorado de una duda nueva y aviso al autor de que le han respondido.
// Misma estética que teacherEmailTemplate.js: tablas, estilos en línea y colores sólidos.
// Todo valor que llega de usuarios se escapa; el asunto pasa por singleLine.
import { C, FONT, MONO, escapeHtml, singleLine } from './contactEmailTemplate.js';

const MAX_SUBJECT = 150;
const clip = (s) => (s.length > MAX_SUBJECT ? `${s.slice(0, MAX_SUBJECT - 1)}…` : s);

// Texto del usuario en HTML: escapado y con los saltos de línea conservados
const multiline = (value) => escapeHtml(String(value ?? '')).replace(/\r?\n/g, '<br>');

const shell = ({ subject, badge, title, lead, context, body, button, footer }) => `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.night};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background-color: ${C.night};">
    <tr>
      <td align="center" style="padding: 40px 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">
          <tr>
            <td style="padding: 0 8px 22px;">
              <span style="font-family: ${FONT}; font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: ${C.brand};">Evenor Tech</span>
              <span style="font-family: ${FONT}; font-size: 11px; font-weight: 600; letter-spacing: 3px; text-transform: uppercase; color: ${C.ink2};"> · Campus · ${badge}</span>
            </td>
          </tr>
          <tr>
            <td bgcolor="${C.card}" style="background-color: ${C.card}; border: 1px solid ${C.cardLine}; border-radius: 24px; padding: 36px 28px;">
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 26px; line-height: 1.2; font-weight: 800; color: ${C.ink};">${title}</h1>
              <p style="margin: 12px 0 0; font-family: ${FONT}; font-size: 15px; line-height: 1.6; color: ${C.ink2};">${lead}</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 22px;">
                <tr>
                  <td bgcolor="${C.panel}" style="background-color: ${C.panel}; border: 1px solid ${C.cardLine}; border-radius: 16px; padding: 18px 22px;">
                    <p style="margin: 0 0 8px; font-family: ${MONO}; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: ${C.brand};">${context}</p>
                    ${body}
                  </td>
                </tr>
              </table>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 26px;">
                <tr>
                  <td bgcolor="${C.brand}" style="background-color: ${C.brand}; border-radius: 999px;">
                    <a href="${button.url}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT}; font-size: 16px; font-weight: 700; color: ${C.onBrand}; text-decoration: none; border-radius: 999px;">${button.label} &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 22px 0 0; font-family: ${MONO}; font-size: 12px; line-height: 1.5; word-break: break-all;"><a href="${button.url}" style="color: ${C.brandSoft}; text-decoration: none;">${button.url}</a></p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 28px 8px 40px;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 12px; line-height: 1.6; color: ${C.ink3};">${footer}<br>Evenor-Tech · Av. de la República Argentina, 27 · 41011 Sevilla</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

const bodyBlock = (heading, text) => `<p style="margin: 0 0 8px; font-family: ${FONT}; font-size: 18px; line-height: 1.3; font-weight: 800; color: ${C.ink};">${heading}</p>
                    <p style="margin: 0; font-family: ${FONT}; font-size: 15px; line-height: 1.6; color: ${C.ink2};">${text}</p>`;

/**
 * Aviso al profesorado de una duda nueva.
 * @param {{ url, cursoTitulo, temaTitulo, titulo, texto, autorNombre }} input
 */
export function buildDudaNuevaEmail({ url, cursoTitulo, temaTitulo, titulo, texto, autorNombre }) {
  const curso = singleLine(cursoTitulo) || 'Curso del Campus';
  const tema = singleLine(temaTitulo) || 'General';
  const autor = singleLine(autorNombre);
  const subject = clip(`Nueva duda en ${curso} · ${tema}`);
  const lead = autor ? `${autor} ha publicado una duda en el curso.` : 'Se ha publicado una duda en el curso.';
  const html = shell({
    subject: escapeHtml(subject),
    badge: 'Dudas',
    title: 'Nueva duda en tu curso',
    lead: escapeHtml(lead),
    context: escapeHtml(`${curso} · ${tema}`),
    body: bodyBlock(multiline(titulo), multiline(texto)),
    button: { url: escapeHtml(url), label: 'Responder' },
    footer: 'Recibes este aviso por ser profesor del curso.',
  });
  const text = [
    `Nueva duda en ${curso} · ${tema}`,
    '',
    lead,
    '',
    String(titulo ?? ''),
    String(texto ?? ''),
    '',
    `Responder: ${url}`,
    '',
    'Recibes este aviso por ser profesor del curso.',
    'Evenor-Tech · Sevilla',
  ].join('\n');
  return { subject, html, text };
}

/**
 * Aviso al autor de que han respondido a su duda.
 * @param {{ url, cursoTitulo, temaTitulo, tituloDuda, respuestaTexto, respondeNombre }} input
 */
export function buildDudaRespuestaEmail({ url, cursoTitulo, temaTitulo, tituloDuda, respuestaTexto, respondeNombre }) {
  const curso = singleLine(cursoTitulo) || 'Curso del Campus';
  const tema = singleLine(temaTitulo) || 'General';
  const nombre = singleLine(respondeNombre) || 'El equipo';
  const subject = clip(`${nombre} ha respondido a tu duda`);
  const html = shell({
    subject: escapeHtml(subject),
    badge: 'Dudas',
    title: escapeHtml(subject),
    lead: `Tu duda «${escapeHtml(singleLine(tituloDuda))}» tiene una respuesta nueva.`,
    context: escapeHtml(`${curso} · ${tema}`),
    body: bodyBlock(escapeHtml(nombre), multiline(respuestaTexto)),
    button: { url: escapeHtml(url), label: 'Ver la respuesta' },
    footer: 'Recibes este aviso porque preguntaste en el curso.',
  });
  const text = [
    subject,
    '',
    `Tu duda «${singleLine(tituloDuda)}» (${curso} · ${tema}) tiene una respuesta nueva:`,
    '',
    String(respuestaTexto ?? ''),
    '',
    `Ver la respuesta: ${url}`,
    '',
    'Recibes este aviso porque preguntaste en el curso.',
    'Evenor-Tech · Sevilla',
  ].join('\n');
  return { subject, html, text };
}
