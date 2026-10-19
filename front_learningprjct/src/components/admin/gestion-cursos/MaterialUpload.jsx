/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import { AlertCircle, FileUp, Loader } from 'lucide-react';
import Button from '../../ui/Button';
import { COPY } from './gestionCopy';

const isPdf = (f) => f && (f.type === 'application/pdf' || /\.pdf$/i.test(f.name));

const Picker = ({ label, file, onPick }) => (
  <label className="flex min-h-11 min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl border border-dashed border-line-strong px-3 py-2 text-sm text-ink-2 hover:border-white/25 hover:text-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-400">
    <FileUp className="h-4 w-4 shrink-0" aria-hidden="true" />
    <span className="min-w-0">
      <span className="block font-medium text-ink">{label}</span>
      <span className="block truncate text-footnote text-ink-3">{file ? file.name : COPY.topics.pickPdf}</span>
    </span>
    <input
      type="file"
      accept="application/pdf,.pdf"
      className="sr-only"
      onChange={(e) => {
        onPick(e.target.files?.[0] ?? null);
        e.target.value = '';
      }}
    />
  </label>
);

// Subida de un material del tema: un PDF por idioma del curso (los dos a la vez = bilingüe)
export default function MaterialUpload({ langs, busy, onUpload }) {
  const [files, setFiles] = useState({ es: null, en: null });
  const [error, setError] = useState(null);

  const pick = (lang) => (file) => {
    if (file && !isPdf(file)) {
      setError(COPY.topics.onlyPdf);
      return;
    }
    setError(null);
    setFiles((f) => ({ ...f, [lang]: file }));
  };

  const submit = async () => {
    const fd = new FormData();
    if (files.es) {
      fd.append('archivo', files.es);
      fd.append('idioma', files.en ? 'both' : 'es');
    }
    if (files.en) {
      fd.append('archivoEn', files.en);
      if (!files.es) fd.append('idioma', 'en');
    }
    if (await onUpload(fd)) setFiles({ es: null, en: null });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        {langs.includes('es') ? <Picker label={COPY.topics.pdfEs} file={files.es} onPick={pick('es')} /> : null}
        {langs.includes('en') ? <Picker label={COPY.topics.pdfEn} file={files.en} onPick={pick('en')} /> : null}
      </div>
      {error ? (
        <p role="alert" className="flex items-start gap-1.5 text-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      ) : null}
      <Button variant="secondary" size="sm" className="min-h-11" disabled={busy || (!files.es && !files.en)} aria-busy={busy || undefined} onClick={submit}>
        {busy ? <Loader className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" /> : null}
        {busy ? COPY.topics.uploading : COPY.topics.upload}
      </Button>
    </div>
  );
}
