/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useEffect, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { fetchCatalog } from '../../../lib/coursesApi';
import { levelLabel } from '../../courses/courseFormat';
import { inputClass } from '../../ui/Field';
import FormField from '../ui/FormField';
import SelectField from '../ui/SelectField';
import { focusRing } from '../ui/tones';
import useObjectUrl from './useObjectUrl';

const MAX_FOTO = 5 * 1024 * 1024;

// Área, nivel y profesor del curso (todos opcionales). Áreas y niveles vienen del backend
// (config/courseCatalog.js): aquí no hay ninguna lista escrita.
export default function CourseCatalogFields({ value, onChange, onError, error }) {
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
      onError?.('La foto no debe superar los 5 MB');
      return;
    }
    set({ profesorFotoFile: file, profesorQuitarFoto: false });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <SelectField
            label="Área"
            hideLabel={false}
            value={value.area}
            onChange={(area) => set({ area })}
            options={[{ value: '', label: 'Sin área' }, ...areaOptions.map((a) => ({ value: a.slug, label: a.label }))]}
          />
          <p className="mt-1.5 text-footnote text-ink-3">{failed ? 'No se pudo cargar la lista de áreas.' : 'Filtro principal del listado de cursos.'}</p>
        </div>
        <div>
          <SelectField
            label="Nivel"
            hideLabel={false}
            value={value.nivel}
            onChange={(nivel) => set({ nivel })}
            options={[{ value: '', label: 'Sin nivel' }, ...nivelOptions.map((n) => ({ value: n, label: levelLabel(n) }))]}
          />
          <p className="mt-1.5 text-footnote text-ink-3">Opcional: si falta, la ficha no lo muestra.</p>
        </div>
      </div>

      <fieldset className="space-y-4 rounded-2xl border border-line p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Profesor (opcional)</legend>
        <p className="text-footnote text-ink-3">Sin nombre, la ficha no muestra este bloque.</p>
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2">
            {foto ? <img src={foto} alt="" className="h-full w-full object-cover" /> : <ImageOff className="h-5 w-5 text-ink-3" aria-hidden="true" />}
          </div>
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-line-strong bg-white/[0.06] px-4 text-sm font-semibold text-ink hover:bg-white/[0.1] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-400">
              {foto ? 'Cambiar foto' : 'Subir foto'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickFoto} className="sr-only" />
            </label>
            {foto ? (
              <button
                type="button"
                onClick={() => set({ profesorFotoFile: null, profesorQuitarFoto: Boolean(value.profesorFoto) })}
                className={`min-h-11 rounded-full px-3 text-sm text-ink-2 hover:bg-white/[0.06] hover:text-ink ${focusRing}`}
              >
                Quitar foto
              </button>
            ) : null}
            <p className="w-full text-footnote text-ink-3">JPG, PNG o WebP, hasta 5 MB. Se recorta en cuadrado sobre la cara.</p>
          </div>
        </div>
        <FormField label="Nombre" error={error} name="profesorNombre">
          {(props) => (
            <input
              {...props}
              type="text"
              value={value.profesorNombre}
              maxLength={120}
              onChange={(e) => set({ profesorNombre: e.target.value })}
              className={inputClass}
              placeholder="Ej: Ana Ruiz"
            />
          )}
        </FormField>
        <FormField label="Bio corta" hint={`${value.profesorBio.length}/400`} name="profesorBio">
          {(props) => (
            <textarea
              {...props}
              value={value.profesorBio}
              maxLength={400}
              rows={3}
              onChange={(e) => set({ profesorBio: e.target.value })}
              className={`${inputClass} h-auto py-3`}
              placeholder="Una o dos frases sobre su experiencia"
            />
          )}
        </FormField>
      </fieldset>
    </div>
  );
}
