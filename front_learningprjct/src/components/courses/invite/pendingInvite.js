// Token de una invitación pendiente de canjear. Se guarda en sessionStorage para que sobreviva al
// registro / inicio de sesión (y a quitarlo de la barra de direcciones). Solo vale para su curso.
const KEY = 'pendingInvite';

export function pendingInviteStore(storage) {
  const read = () => {
    try {
      return JSON.parse(storage?.getItem(KEY) ?? 'null');
    } catch {
      return null;
    }
  };
  const write = (value) => {
    try {
      storage?.setItem(KEY, JSON.stringify(value));
    } catch {
      /* sin almacenamiento: se usa solo el token de la URL */
    }
  };
  return {
    // Token para este curso: el de la URL (y se guarda) o el guardado antes
    take(courseId, urlToken) {
      if (urlToken) {
        write({ courseId, token: urlToken });
        return urlToken;
      }
      const saved = read();
      return saved?.courseId === courseId && typeof saved.token === 'string' ? saved.token : null;
    },
    clear() {
      try {
        storage?.removeItem(KEY);
      } catch {
        /* nada que borrar */
      }
    },
  };
}

const browserStorage = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export const pendingInvite = () => pendingInviteStore(typeof window === 'undefined' ? null : browserStorage());
