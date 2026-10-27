// Firma y verificación de tokens en un solo sitio.
// - Sin secreto de respaldo: si falta JWT_SECRET (o es demasiado corto) el servidor no arranca, en vez
//   de firmar con una clave conocida que permitiría fabricar tokens.
// - Algoritmo fijado (HS256) al firmar y al verificar: no se aceptan tokens con otro algoritmo.
// - El secreto se lee al usarse, no al importar: dotenv se carga después de importar la app.
import jwt from 'jsonwebtoken';

const ALGORITHM = 'HS256';
const MIN_SECRET_LENGTH = 32;
const EXPIRES_IN = '7d';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET no está definido. Añádelo al entorno (.env) antes de arrancar el servidor.');
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET es demasiado corto (mínimo ${MIN_SECRET_LENGTH} caracteres).`);
  }
  return secret;
}

// Para llamarlo al arrancar: falla pronto y con un mensaje claro
export const assertJwtConfig = () => void getJwtSecret();

export const signToken = (payload) => jwt.sign(payload, getJwtSecret(), { algorithm: ALGORITHM, expiresIn: EXPIRES_IN });

export const verifyToken = (token) => jwt.verify(token, getJwtSecret(), { algorithms: [ALGORITHM] });

// ============= Tickets de un material =============
// Para abrir un PDF del aula en una pestaña nueva (móvil: visor nativo) sin cabecera Authorization: la URL
// lleva un ticket de 60 s ligado a un usuario, un curso y un material. Se firma con una clave DERIVADA,
// así que un ticket nunca vale como sesión (verifyToken lo rechaza) ni una sesión como ticket.
const TICKET_TTL = '60s';
const TICKET_AUDIENCE = 'material-ticket';
const ticketSecret = () => `${getJwtSecret()}|${TICKET_AUDIENCE}`;

export const signMaterialTicket = ({ userId, courseId, materialId }) =>
  jwt.sign({ id: String(userId), c: String(courseId), m: String(materialId) }, ticketSecret(), {
    algorithm: ALGORITHM, expiresIn: TICKET_TTL, audience: TICKET_AUDIENCE,
  });

export const verifyMaterialTicket = (ticket) =>
  jwt.verify(ticket, ticketSecret(), { algorithms: [ALGORITHM], audience: TICKET_AUDIENCE });
