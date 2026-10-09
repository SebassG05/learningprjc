import React from "react";
import { Target, CheckCircle2 } from 'lucide-react';

export default function ObjetivosCurso({ objetivosGenerales, objetivosEspecificos, idioma = 'es' }) {
  // Si no hay objetivos, no mostrar nada
  if ((!objetivosGenerales || objetivosGenerales.length === 0) && 
      (!objetivosEspecificos || objetivosEspecificos.length === 0)) {
    return null;
  }

  return (
    <div className="w-full mb-16 flex flex-col items-center gap-8">
      {/* Objetivos generales */}
      {objetivosGenerales && objetivosGenerales.length > 0 && (
        <div className="bg-surface-2 border-2 border-brand rounded-xl shadow-lg p-8 w-full opacity-100" style={{backgroundColor: 'rgb(31, 41, 55)'}}>
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-6 h-6 text-brand flex-shrink-0" />
            <h2 className="text-xl font-bold text-brand tracking-wide uppercase">
              {idioma === 'en' ? 'General Objectives' : 'Objetivos Generales'}
            </h2>
          </div>
          <ul className="space-y-3">
            {objetivosGenerales.map((objetivo, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                <span className="text-base text-gray-300 leading-relaxed text-justify">{objetivo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Objetivos específicos */}
      {objetivosEspecificos && objetivosEspecificos.length > 0 && (
        <div className="bg-surface border-2 border-brand-500 rounded-xl shadow-xl p-8 w-full opacity-100" style={{backgroundColor: 'rgb(17, 24, 39)'}}>
          <div className="flex items-center gap-3 mb-6">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#85c869" className="flex-shrink-0">
              <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" />
              <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" />
            </svg>
            <h2 className="text-xl font-bold text-brand-500 tracking-wide uppercase">
              {idioma === 'en' ? 'Specific Objectives' : 'Objetivos Específicos'}
            </h2>
          </div>
          <ul className="space-y-4">
            {objetivosEspecificos.map((objetivo, index) => (
              <li key={index} className="flex items-start gap-3">
                <span className="mt-1.5 w-2 h-2 rounded-full bg-brand-500 flex-shrink-0"></span>
                <span className="text-base text-ink leading-relaxed text-justify">{objetivo}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
