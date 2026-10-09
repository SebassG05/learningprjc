import React from "react";
import { Target, CheckCircle2, ListChecks } from 'lucide-react';

export default function ObjetivosCurso({ objetivosGenerales, objetivosEspecificos, idioma = 'es' }) {
  // Si no hay objetivos, no mostrar nada
  if ((!objetivosGenerales || objetivosGenerales.length === 0) && 
      (!objetivosEspecificos || objetivosEspecificos.length === 0)) {
    return null;
  }

  return (
    <div className="mb-16 grid w-full grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Objetivos generales */}
      {objetivosGenerales && objetivosGenerales.length > 0 && (
        <section className="rounded-3xl border border-line bg-surface p-7 shadow-card sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Target className="h-5 w-5" />
            </span>
            <h2 className="font-sans text-lg font-semibold text-ink">
              {idioma === 'en' ? 'General Objectives' : 'Objetivos Generales'}
            </h2>
          </div>
          <ul className="space-y-4">
            {objetivosGenerales.map((objetivo, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand" />
                <span className="text-base leading-relaxed text-ink-2">{objetivo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Objetivos específicos */}
      {objetivosEspecificos && objetivosEspecificos.length > 0 && (
        <section className="rounded-3xl border border-line bg-surface p-7 shadow-card sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ListChecks className="h-5 w-5" />
            </span>
            <h2 className="font-sans text-lg font-semibold text-ink">
              {idioma === 'en' ? 'Specific Objectives' : 'Objetivos Específicos'}
            </h2>
          </div>
          <ul className="space-y-4">
            {objetivosEspecificos.map((objetivo, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-2.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand"></span>
                <span className="text-base leading-relaxed text-ink-2">{objetivo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
