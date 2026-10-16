/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { fetchCatalog } from '../../lib/coursesApi';
import { levelLabel } from '../courses/courseFormat';

const input =
  'w-full px-4 py-2 bg-surface-2 border border-line rounded-lg text-ink placeholder-gray-500 focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors';
const labelClass = 'block text-sm font-medium text-gray-300 mb-2';
const MAX_FOTO = 5 * 1024 * 1024;

// Vista previa de un File sin fugas de memoria
function useObjectUrl(file) {
  const [url, setUrl] = useState(null);
  useEffect(() => {
    if (!file) {
      setUrl(null);
      return undefined;
    }
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url;
}

// Área, nivel y profesor del curso (todos opcionales). Áreas y niveles vienen del backend
// (config/courseCatalog.js): aquí no hay ninguna lista escrita.
export default function CourseCatalogFields({ value, onChange, onError }) {
  const [catalog, setCatalog] = useState(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    fetchCatalog()
      .then((c) => alive && setCatalog(c))
      .catch(() => alive && setFailed(true));
    return () => {
      alive = false;
    };
  }, []);

  const set = (patch) => onChange({ ...value, ...patch });
  const preview = useObjectUrl(value.profesorFotoFile);
  const foto = preview || (!value.profesorQuitarFoto && value.profesorFoto) || null;

  const areas = catalog?.areas ?? [];
  const niveles = catalog?.niveles ?? [];
  // Si el curso guarda un valor que ya no está en la lista, se sigue viendo (y se puede quitar)
  const areaOptions = value.area && !areas.some((a) => a.slug === value.area) ? [...areas, { slug: value.area, label: value.area }] : areas;
  const nivelOptions = value.nivel && !niveles.includes(value.nivel) ? [...niveles, value.nivel] : niveles;

  const pickFoto = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > MAX_FOTO) {
      onError?.('La foto no debe superar los 5MB');
      return;
    }
    set({ profesorFotoFile: file, profesorQuitarFoto: false });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="curso-area" className={labelClass}>Área</label>
          <select id="curso-area" value={value.area} onChange={(e) => set({ area: e.target.value })} disabled={failed && !value.area} className={input}>
            <option value="">Sin área</option>
            {areaOptions.map((a) => (
              <option key={a.slug} value={a.slug}>{a.label}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-3">
            {failed ? 'No se pudo cargar la lista de áreas.' : 'Filtro principal del listado de cursos.'}
          </p>
        </div>
        <div>
          <label htmlFor="curso-nivel" className={labelClass}>Nivel</label>
          <select id="curso-nivel" value={value.nivel} onChange={(e) => set({ nivel: e.target.value })} disabled={failed && !value.nivel} className={input}>
            <option value="">Sin nivel</option>
            {nivelOptions.map((n) => (
              <option key={n} value={n}>{levelLabel(n)}</option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-3">Opcional: si falta, la ficha no lo muestra.</p>
        </div>
      </div>

      <fieldset className="space-y-4 rounded-xl border border-line p-4">
        <legend className="px-1 text-sm font-medium text-gray-300">Profesor (opcional)</legend>
        <p className="text-xs text-ink-3">Sin nombre, la ficha no muestra este bloque.</p>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2">
            {foto ? <img src={foto} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-ink-3" aria-hidden="true" />}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand hover:bg-brand-300">
              {foto ? 'Cambiar foto' : 'Subir foto'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFoto} className="sr-only" />
            </label>
            {foto ? (
              <button
                type="button"
                onClick={() => set({ profesorFotoFile: null, profesorQuitarFoto: Boolean(value.profesorFoto) })}
                className="rounded-lg px-3 py-2 text-sm text-ink-2 hover:bg-white/[0.06] hover:text-ink"
              >
                Quitar foto
              </button>
            ) : null}
            <p className="w-full text-xs text-ink-3">JPG, PNG o WebP, hasta 5 MB. Se recorta en cuadrado sobre la cara.</p>
          </div>
        </div>
        <div>
          <label htmlFor="curso-profesor-nombre" className={labelClass}>Nombre</label>
          <input
            id="curso-profesor-nombre"
            type="text"
            value={value.profesorNombre}
            maxLength={120}
            onChange={(e) => set({ profesorNombre: e.target.value })}
            className={input}
            placeholder="Ej: Ana Ruiz"
          />
        </div>
        <div>
          <label htmlFor="curso-profesor-bio" className={labelClass}>Bio corta</label>
          <textarea
            id="curso-profesor-bio"
            value={value.profesorBio}
            maxLength={400}
            rows={3}
            onChange={(e) => set({ profesorBio: e.target.value })}
            className={input}
            placeholder="Una o dos frases sobre su experiencia"
          />
          <p className="mt-1 text-right text-xs tabular-nums text-ink-3">{value.profesorBio.length}/400</p>
        </div>
      </fieldset>
    </div>
  );
}
