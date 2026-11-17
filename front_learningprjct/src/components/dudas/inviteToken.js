// Token de la invitación de profesor. Llega en el fragmento (#token=…), que no viaja al servidor ni
// en el Referer. Se guarda en sessionStorage para sobrevivir al acceso o registro, y se quita de la barra.
const KEY = 'profesor-invitacion-token';

const defaultStorage = () => {
  try {
    return typeof sessionStorage === 'undefined' ? null : sessionStorage;
  } catch {
    return null;
  }
};

const safe = (fn) => {
  try {
    return fn();
  } catch {
    return null;
  }
};

export function takeTokenFromUrl(location, history, storage = defaultStorage()) {
  const fromUrl = new URLSearchParams(String(location.hash || '').replace(/^#/, '')).get('token');
  if (fromUrl) {
    if (storage) safe(() => storage.setItem(KEY, fromUrl));
    history.replaceState(null, '', `${location.pathname}${location.search || ''}`);
    return fromUrl;
  }
  return storage ? safe(() => storage.getItem(KEY)) || null : null;
}

export function clearStoredToken(storage = defaultStorage()) {
  if (storage) safe(() => storage.removeItem(KEY));
}

// La vista previa solo trae el correo enmascarado (p. ej. «l•••@uco.es»): se comparan la inicial y el dominio
export function emailCoincide(enmascarado, email) {
  const [local = '', dominio = ''] = String(enmascarado || '').toLowerCase().split('@');
  const [miLocal = '', miDominio = ''] = String(email || '').toLowerCase().split('@');
  if (!local || !dominio || !miLocal || !miDominio) return false;
  return local[0] === miLocal[0] && dominio === miDominio;
}
