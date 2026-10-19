/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { AlertCircle } from 'lucide-react';
import Switch from '../../ui/Switch';
import { inputClass } from '../../ui/Field';
import FormField from '../ui/FormField';
import ListInput from '../ui/ListInput';
import TagInput from '../ui/TagInput';
import CourseCatalogFields from './CourseCatalogFields';
import CoverPicker from './CoverPicker';
import { COPY } from './gestionCopy';

const LANG_LABEL = { es: 'Español', en: 'Inglés' };

const Section = ({ title, description, children }) => (
  <section className="space-y-4 border-b border-line pb-8 last:border-b-0 last:pb-0">
    <header>
      <h3 className="font-sans text-base font-semibold text-ink">{title}</h3>
      {description ? <p className="mt-1 text-footnote text-ink-3">{description}</p> : null}
    </header>
    {children}
  </section>
);

/**
 * Formulario de un curso (presentación). El estado, la validación y el envío viven en CourseEditor:
 * aquí cada campo enseña su error en línea y anuncia el estado inválido (aria-invalid).
 */
export default function CourseForm({ form, setForm, errors, catalog, setCatalog, onCatalogError }) {
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const has = (lang) => form.idiomas.includes(lang);
  const toggleLang = (lang) => set({ idiomas: has(lang) ? form.idiomas.filter((l) => l !== lang) : [...form.idiomas, lang].sort() });

  const text = (name, label, { multiline = false, placeholder, required = true, hint } = {}) => (
    <FormField label={label} error={errors[name]} name={name} required={required} hint={hint}>
      {(props) =>
        multiline ? (
          <textarea {...props} rows={4} value={form[name]} onChange={(e) => set({ [name]: e.target.value })} placeholder={placeholder} className={`${inputClass} h-auto min-h-28 resize-y py-3`} />
        ) : (
          <input {...props} type="text" value={form[name]} onChange={(e) => set({ [name]: e.target.value })} placeholder={placeholder} className={inputClass} />
        )
      }
    </FormField>
  );

  return (
    <div className="space-y-8">
      <Section title={COPY.form.languages} description={COPY.form.languagesHint}>
        <fieldset aria-describedby={errors.idiomas ? 'idiomas-error' : undefined}>
          <legend className="sr-only">{COPY.form.languages}</legend>
          <div className="flex flex-wrap gap-2" data-field="idiomas" tabIndex={-1}>
            {['es', 'en'].map((lang) => (
              <label key={lang} className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-400 ${has(lang) ? 'border-brand/50 bg-brand/10 text-brand-300' : 'border-line-strong text-ink-2 hover:text-ink'}`}>
                <input type="checkbox" checked={has(lang)} onChange={() => toggleLang(lang)} className="h-4 w-4 accent-brand-400" />
                {LANG_LABEL[lang]}
              </label>
            ))}
          </div>
          {errors.idiomas ? (
            <p id="idiomas-error" className="mt-2 flex items-start gap-1.5 text-sm text-danger">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {errors.idiomas}
            </p>
          ) : null}
        </fieldset>
      </Section>

      <Section title={COPY.form.basics}>
        {has('es') ? text('title', COPY.form.titleEs, { placeholder: 'Ej: Modelización Dinámica de Carbono' }) : null}
        {has('en') ? text('titleEn', COPY.form.titleEn, { placeholder: 'Ex: Dynamic Carbon Modelling' }) : null}
        {has('es') ? text('description', COPY.form.descriptionEs, { multiline: true, placeholder: 'Qué aprenderá el alumno y a quién va dirigido' }) : null}
        {has('en') ? text('descriptionEn', COPY.form.descriptionEn, { multiline: true, placeholder: 'What students will learn and who it is for' }) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {text('duration', COPY.form.duration, { placeholder: 'Ej: 18 horas', required: false })}
        </div>
        <CoverPicker image={form.image} file={form.imageFile} error={errors.image} onChange={(imageFile) => set({ imageFile })} />
      </Section>

      <Section title={COPY.form.catalog} description={COPY.form.catalogHint}>
        <TagInput label={COPY.form.categories} hint={COPY.form.categoriesHint} value={form.category} onChange={(category) => set({ category })} placeholder="Ej: Ciencia del suelo" />
        <CourseCatalogFields value={catalog} onChange={setCatalog} onError={onCatalogError} error={errors.profesorNombre} />
      </Section>

      <Section title={COPY.form.objectives}>
        {has('es') ? <ListInput label={COPY.form.generalEs} value={form.objetivosGenerales} onChange={(v) => set({ objetivosGenerales: v })} placeholder="Añadir objetivo general" /> : null}
        {has('en') ? <ListInput label={COPY.form.generalEn} value={form.objetivosGeneralesEn} onChange={(v) => set({ objetivosGeneralesEn: v })} placeholder="Add a general objective" /> : null}
        {has('es') ? <ListInput label={COPY.form.specificEs} value={form.objetivosEspecificos} onChange={(v) => set({ objetivosEspecificos: v })} placeholder="Añadir objetivo específico" /> : null}
        {has('en') ? <ListInput label={COPY.form.specificEn} value={form.objetivosEspecificosEn} onChange={(v) => set({ objetivosEspecificosEn: v })} placeholder="Add a specific objective" /> : null}
      </Section>

      <Section title={COPY.form.visibility}>
        <div className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4">
          <div>
            <p id="curso-abierto" className="text-sm font-semibold text-ink">{COPY.form.open}</p>
            <p id="curso-abierto-hint" className="mt-1 text-footnote text-ink-3">{COPY.form.openHint}</p>
          </div>
          <Switch checked={form.isOpen} onCheckedChange={(isOpen) => set({ isOpen })} aria-labelledby="curso-abierto" aria-describedby="curso-abierto-hint" />
        </div>
      </Section>
    </div>
  );
}
