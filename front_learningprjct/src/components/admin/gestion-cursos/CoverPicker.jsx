/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useId } from 'react';
import { AlertCircle, ImagePlus } from 'lucide-react';
import useObjectUrl from './useObjectUrl';

/**
 * Portada del curso con vista previa. El archivo se valida al enviar (tipo y 5 MB) y el
 * error se muestra aquí. El input es nativo (accesible) y se ve como un botón.
 */
export default function CoverPicker({ image, file, onChange, error }) {
  const id = useId();
  const preview = useObjectUrl(file);
  const src = preview || image || null;
  return (
    <div className="flex flex-col gap-2">
      <span id={`${id}-label`} className="text-sm font-medium text-ink-2">Portada</span>
      <div className="flex items-center gap-4">
        <div className={`flex aspect-[16/10] w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-surface-2 ${error ? 'border-danger/70' : 'border-line'}`}>
          {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-ink-3" aria-hidden="true" />}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="inline-flex min-h-11 w-fit cursor-pointer items-center rounded-full border border-line-strong bg-white/[0.06] px-4 text-sm font-semibold text-ink hover:bg-white/[0.1] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-400">
            {src ? 'Cambiar portada' : 'Subir portada'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              data-field="image"
              aria-labelledby={`${id}-label`}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : `${id}-hint`}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) onChange(f);
              }}
              className="sr-only"
            />
          </label>
          <p id={`${id}-hint`} className="text-footnote text-ink-3">{file ? file.name : 'JPG, PNG o WebP, hasta 5 MB.'}</p>
        </div>
      </div>
      {error ? (
        <p id={`${id}-error`} className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
