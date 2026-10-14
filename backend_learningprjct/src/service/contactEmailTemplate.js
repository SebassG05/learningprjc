// Correo que recibe el equipo del campus cuando alguien escribe desde /contacto.
// Misma estética que la página: noche verde y petróleo, tarjeta oscura, acento verde y el horizonte
// de Sevilla al pie. HTML de email: tablas, estilos en línea y colores sólidos (sin variables CSS ni
// fuentes externas) para que se vea igual en Gmail, Outlook y Apple Mail.

const C = {
  night: '#0b1311',
  card: '#141816',
  cardLine: '#232b27',
  panel: '#1c211e',
  ink: '#f5f5f7',
  ink2: '#a1a1a6',
  ink3: '#86868b',
  brand: '#a1db87',
  brandSoft: '#c9ecb7',
  brandDeep: '#26451d',
  onBrand: '#0c1709',
  teal: '#0e2a2d',
};

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
const MONO = "'SFMono-Regular', Menlo, Consolas, 'Liberation Mono', monospace";

// Escapa el texto del usuario antes de meterlo en el HTML (evita HTML o enlaces inyectados)
export const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

// Una sola línea: el asunto no puede llevar saltos (evita cabeceras inyectadas)
export const singleLine = (value) => String(value ?? '').replace(/[\r\n]+/g, ' ').trim();

const firstName = (name) => singleLine(name).split(' ')[0] || 'la persona';

const formatDate = (date) =>
  date.toLocaleString('es-ES', {
    timeZone: 'Europe/Madrid',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

// Fila de dato: etiqueta pequeña y valor; si el valor está vacío no se pinta
const detailRow = (label, valueHtml) =>
  valueHtml
    ? `<tr>
        <td style="padding: 10px 0; border-top: 1px solid ${C.cardLine}; font-family: ${FONT}; font-size: 13px; color: ${C.ink3}; width: 38%; vertical-align: top;">${label}</td>
        <td style="padding: 10px 0; border-top: 1px solid ${C.cardLine}; font-family: ${FONT}; font-size: 14px; color: ${C.ink}; vertical-align: top; word-break: break-word;">${valueHtml}</td>
      </tr>`
    : '';

const link = (href, text) =>
  `<a href="${href}" style="color: ${C.brand}; text-decoration: none; font-weight: 600;">${text}</a>`;

export function buildContactEmail({ name, email, phone, company, subject, message }, now = new Date()) {
  const s = {
    name: escapeHtml(singleLine(name)),
    email: escapeHtml(singleLine(email)),
    phone: escapeHtml(singleLine(phone)),
    company: escapeHtml(singleLine(company)),
    subject: escapeHtml(singleLine(subject)),
    message: escapeHtml(message).replace(/\r?\n/g, '<br>'),
    first: escapeHtml(firstName(name)),
  };
  const when = formatDate(now);
  const replyHref = `mailto:${encodeURIComponent(singleLine(email))}?subject=${encodeURIComponent(`Re: ${singleLine(subject)}`)}`;
  const telHref = `tel:${singleLine(phone).replace(/[^\d+]/g, '')}`;
  const preheader = escapeHtml(singleLine(message).slice(0, 110));

  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="dark light">
<meta name="supported-color-schemes" content="dark light">
<title>Nuevo mensaje de contacto</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${C.night};">
  <div style="display: none; max-height: 0; overflow: hidden; opacity: 0; color: ${C.night};">${preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.night}" style="background-color: ${C.night}; background-image: radial-gradient(70% 50% at 10% 0%, ${C.brandDeep}, transparent 70%), radial-gradient(60% 50% at 100% 10%, ${C.teal}, transparent 70%);">
    <tr>
      <td align="center" style="padding: 40px 16px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px;">

          <!-- Cabecera -->
          <tr>
            <td style="padding: 0 8px 20px;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: ${C.brand};">Contacto · Campus Evenor-Tech</p>
            </td>
          </tr>

          <!-- Tarjeta -->
          <tr>
            <td bgcolor="${C.card}" style="background-color: ${C.card}; border: 1px solid ${C.cardLine}; border-radius: 24px; padding: 32px 28px;">
              <h1 style="margin: 0; font-family: ${FONT}; font-size: 28px; line-height: 1.15; font-weight: 800; letter-spacing: -0.5px; color: ${C.ink};">
                ${s.first} tiene una duda<span style="color: ${C.brand};">.</span>
              </h1>
              <p style="margin: 8px 0 0; font-family: ${FONT}; font-size: 14px; color: ${C.ink2};">Recibido el ${when}</p>

              <!-- Asunto como píldora -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 22px;">
                <tr>
                  <td style="border: 1px solid ${C.brand}; border-radius: 999px; padding: 7px 14px; font-family: ${FONT}; font-size: 13px; font-weight: 600; color: ${C.brandSoft};">${s.subject}</td>
                </tr>
              </table>

              <!-- Mensaje -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 20px;">
                <tr>
                  <td bgcolor="${C.panel}" style="background-color: ${C.panel}; border: 1px solid ${C.cardLine}; border-radius: 14px; padding: 20px 22px; font-family: ${FONT}; font-size: 16px; line-height: 1.6; color: ${C.ink};">${s.message}</td>
                </tr>
              </table>

              <!-- Responder -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td bgcolor="${C.brand}" style="background-color: ${C.brand}; border-radius: 999px;">
                    <a href="${replyHref}" style="display: inline-block; padding: 13px 26px; font-family: ${FONT}; font-size: 15px; font-weight: 700; color: ${C.onBrand}; text-decoration: none; border-radius: 999px;">Responder a ${s.first} &rarr;</a>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0; font-family: ${FONT}; font-size: 12px; color: ${C.ink3};">También puedes pulsar «Responder» en tu correo: va directo a ${s.email}.</p>

              <!-- Datos -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top: 28px;">
                ${detailRow('Nombre', s.name)}
                ${detailRow('Email', link(`mailto:${s.email}`, s.email))}
                ${detailRow('Teléfono', s.phone ? link(telHref, s.phone) : '')}
                ${detailRow('Centro o empresa', s.company)}
              </table>
            </td>
          </tr>

          <!-- Horizonte de Sevilla -->
          <tr>
            <td align="center" style="padding: 36px 8px 0;">
              <p style="margin: 0 0 14px; font-family: ${MONO}; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: ${C.brand};">&#9679;&nbsp; Sevilla · 37°23′N 5°59′O</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 0;">
              <div style="height: 56px; border-top: 1px solid ${C.brand}; border-radius: 50% 50% 0 0 / 100% 100% 0 0; background-color: ${C.teal}; background-image: linear-gradient(180deg, #2c4a33 0%, ${C.night} 100%);"></div>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 18px 8px 36px;">
              <p style="margin: 0; font-family: ${FONT}; font-size: 12px; line-height: 1.6; color: ${C.ink3};">Mensaje enviado desde el formulario de contacto del Campus Evenor-Tech.<br>Av. de la República Argentina, 27 · 41011 Sevilla</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // Versión de texto plano para clientes que no muestran HTML
  const text = [
    `${firstName(name)} tiene una duda`,
    `Recibido el ${when}`,
    '',
    `Asunto: ${singleLine(subject)}`,
    '',
    String(message ?? ''),
    '',
    `Nombre: ${singleLine(name)}`,
    `Email: ${singleLine(email)}`,
    phone ? `Teléfono: ${singleLine(phone)}` : null,
    company ? `Centro o empresa: ${singleLine(company)}` : null,
    '',
    `Responde a este correo para contestar a ${singleLine(email)}.`,
  ]
    .filter((line) => line !== null)
    .join('\n');

  return {
    subject: `[Contacto Campus] ${singleLine(subject)} · ${singleLine(name)}`,
    html,
    text,
  };
}
