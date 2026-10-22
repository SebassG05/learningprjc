// Lógica pura de la pestaña Accesos (cohortes de cursos privados).

const normalize = (s) => String(s ?? '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

/** Activos primero; en cada grupo, los añadidos más recientes arriba. Filtro opcional por estado y texto. */
export function sortMembers(members = [], { status = '', q = '' } = {}) {
  const needle = normalize(q.trim());
  return members
    .filter((m) => !status || m.status === status)
    .filter((m) => !needle || normalize(m.email).includes(needle) || normalize(m.user?.name).includes(needle))
    .sort((a, b) => (a.status === b.status ? new Date(b.addedAt ?? 0) - new Date(a.addedAt ?? 0) : a.status === 'active' ? -1 : 1));
}

/** 'upcoming' | 'open' | 'ended' (la misma frontera que el backend: endsAt ya es fin) */
export function cohortPhase(cohort, now = new Date()) {
  if (now < new Date(cohort.startsAt)) return 'upcoming';
  if (now < new Date(cohort.endsAt)) return 'open';
  return 'ended';
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

export const inviteUsage = ({ uses, maxUses }) => `${uses} / ${plural(maxUses, 'uso', 'usos')}`;

/** Resumen de un alta masiva: «2 añadidos · 1 ya estaba · 1 inválido · 2 invitaciones enviadas» */
export function summaryText({ added = [], existing = [], invalid = [], emailed = [], emailFailed = [] }) {
  return [
    added.length ? plural(added.length, 'añadido', 'añadidos') : null,
    existing.length ? plural(existing.length, 'ya estaba', 'ya estaban') : null,
    invalid.length ? plural(invalid.length, 'inválido', 'inválidos') : null,
    emailed.length ? plural(emailed.length, 'invitación enviada', 'invitaciones enviadas') : null,
    emailFailed.length ? plural(emailFailed.length, 'correo sin enviar', 'correos sin enviar') : null,
  ]
    .filter(Boolean)
    .join(' · ');
}

const pad = (n) => String(n).padStart(2, '0');

/** Fecha → valor de <input type="datetime-local"> en la hora local del navegador */
export function toLocalInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Valor de <input type="datetime-local"> (hora local) → ISO, o null */
export function fromLocalInput(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
