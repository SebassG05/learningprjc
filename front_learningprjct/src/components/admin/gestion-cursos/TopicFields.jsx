/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { inputClass } from '../../ui/Field';
import FormField from '../ui/FormField';
import { COPY } from './gestionCopy';

/**
 * Título y descripción de un tema en los idiomas del curso. El error de «falta título» se
 * muestra en el primer título visible.
 */
export default function TopicFields({ value, onChange, langs, error, idPrefix }) {
  const set = (patch) => onChange({ ...value, ...patch });
  const firstTitle = langs.includes('es') ? 'titulo' : 'tituloEn';
  const field = (name, label, multiline) => (
    <FormField label={label} name={`${idPrefix}-${name}`} error={name === firstTitle ? error : null} required={name === firstTitle}>
      {(props) =>
        multiline ? (
          <textarea {...props} rows={3} value={value[name]} onChange={(e) => set({ [name]: e.target.value })} className={`${inputClass} h-auto min-h-24 resize-y py-3`} />
        ) : (
          <input {...props} type="text" value={value[name]} onChange={(e) => set({ [name]: e.target.value })} className={inputClass} />
        )
      }
    </FormField>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {langs.includes('es') ? field('titulo', COPY.topics.titleEs) : null}
      {langs.includes('en') ? field('tituloEn', COPY.topics.titleEn) : null}
      {langs.includes('es') ? field('descripcion', COPY.topics.descEs, true) : null}
      {langs.includes('en') ? field('descripcionEn', COPY.topics.descEn, true) : null}
    </div>
  );
}
