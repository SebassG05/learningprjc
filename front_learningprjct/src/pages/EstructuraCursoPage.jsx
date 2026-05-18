import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import EstructuraCurso from '../components/curso/EstructuraCurso';
import { ArrowLeft } from 'lucide-react';

export default function EstructuraCursoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [idioma, setIdioma] = useState(() => localStorage.getItem(`lang_${id}`) || 'es');

  const handleLang = (lang) => {
    setIdioma(lang);
    localStorage.setItem(`lang_${id}`, lang);
  };

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      {/* Cabecera: volver + selector de idioma */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate(`/curso/${id}`)}
          className="cursor-pointer flex items-center gap-2 text-[#a1db87] hover:text-white transition-colors duration-200 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
          <span className="font-semibold">{idioma === 'en' ? 'Back to course' : 'Volver al curso'}</span>
        </button>

        {/* Selector ES / EN */}
        <div className="flex items-center gap-1 bg-[#1f2937] border border-gray-700 rounded-lg p-1">
          <button
            onClick={() => handleLang('es')}
            className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              idioma === 'es'
                ? 'bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ES
          </button>
          <button
            onClick={() => handleLang('en')}
            className={`cursor-pointer px-3 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
              idioma === 'en'
                ? 'bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Componente de estructura */}
      <EstructuraCurso idioma={idioma} />
    </div>
  );
}
