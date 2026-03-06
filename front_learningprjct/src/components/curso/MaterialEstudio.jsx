import React, { useState } from 'react';
import { FileText, Download, ExternalLink, ChevronDown, ChevronUp, Check } from 'lucide-react';

export default function MaterialEstudio({ temas, completedMaterials, setCompletedMaterials }) {
  const [expandedTemas, setExpandedTemas] = useState({});

  if (!temas || temas.length === 0) {
    return null;
  }

  const getIconByType = (tipo) => {
    switch (tipo) {
      case 'pdf':
        return <FileText className="w-5 h-5" />;
      case 'enlace':
        return <ExternalLink className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleOpenMaterial = (archivo, titulo) => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3007';
    const url = `${apiUrl}${archivo}`;
    window.open(url, '_blank');
  };

  const toggleCompleted = (e, materialId) => {
    e.stopPropagation(); // Evitar que se abra el material al marcar como completado
    setCompletedMaterials(prev => ({
      ...prev,
      [materialId]: !prev[materialId]
    }));
  };

  const toggleDescripcion = (temaId) => {
    setExpandedTemas(prev => ({
      ...prev,
      [temaId]: !prev[temaId]
    }));
  };

  const truncateText = (text, maxLength = 300) => {
    if (!text || text.length <= maxLength) return { text, isTruncated: false };
    return {
      text: text.substring(0, maxLength),
      isTruncated: true
    };
  };

  return (
    <div className="mb-16 space-y-8">
      <div className="border-t border-[#a1db87]/30">
        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mt-8 mb-8">
          📚 Aquí Comienza el Curso
        </h2>
        
        <div className="space-y-8">
          {temas.map((tema) => {
            const isExpanded = expandedTemas[tema._id];
            const { text: truncatedText, isTruncated } = truncateText(tema.descripcion);
            const displayText = isExpanded ? tema.descripcion : truncatedText;

            return (
              <div key={tema._id} className="bg-[#23272f]/50 rounded-xl p-10 border border-[#a1db87]/20 hover:border-[#a1db87]/40 transition-colors">
                <div className="flex items-start gap-4 mb-6">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] flex items-center justify-center text-[#1a1a1a] font-bold text-sm">
                    {tema.numeroTema}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{tema.titulo}</h3>
                    {tema.descripcion && (
                      <div>
                        <div 
                          className={`overflow-hidden transition-all duration-700 ease-in-out ${
                            isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-[120px] opacity-95'
                          }`}
                        >
                          <p className="text-gray-400 text-sm text-justify leading-relaxed">
                            {displayText}
                            {isTruncated && !isExpanded && (
                              <span className="inline-block animate-pulse">...</span>
                            )}
                          </p>
                        </div>
                        {isTruncated && (
                          <button
                            onClick={() => toggleDescripcion(tema._id)}
                            className="cursor-pointer flex items-center gap-1 text-[#a1db87] hover:text-[#5ec6a6] text-sm font-medium mt-2 transition-all duration-300 group/btn"
                          >
                            {isExpanded ? (
                              <>
                                <span className="transition-opacity">Leer menos</span>
                                <ChevronUp className="w-4 h-4 transition-all duration-300 group-hover/btn:translate-y-[-3px]" />
                              </>
                            ) : (
                              <>
                                <span className="transition-opacity">Leer más</span>
                                <ChevronDown className="w-4 h-4 transition-all duration-300 group-hover/btn:translate-y-[3px]" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

              {tema.materiales && tema.materiales.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-[#a1db87] uppercase tracking-wide mb-3">
                    Material de Estudio
                  </h4>
                  {tema.materiales.map((material) => {
                    const isCompleted = completedMaterials[material._id];
                    
                    return (
                      <div
                        key={material._id}
                        onClick={() => material.archivo && handleOpenMaterial(material.archivo, material.titulo)}
                        className={`group flex items-center justify-between rounded-lg py-2 px-4 transition-all duration-300 border ${
                          isCompleted 
                            ? 'bg-[#a1db87]/10 border-[#a1db87]/40 hover:bg-[#a1db87]/15' 
                            : 'bg-[#1a1a1a]/50 border-transparent hover:bg-[#1a1a1a] hover:border-[#a1db87]/30'
                        } ${material.archivo ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-[#a1db87]' : 'text-[#a1db87]'}`}>
                            {getIconByType(material.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium transition-colors truncate ${isCompleted ? 'text-[#a1db87]' : 'text-white'}`}>
                              {material.titulo}
                            </p>
                          </div>
                        </div>
                        
                        {material.archivo && (
                          <button
                            onClick={(e) => toggleCompleted(e, material._id)}
                            className={`cursor-pointer flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                              isCompleted
                                ? 'bg-[#a1db87] text-[#1a1a1a] hover:bg-[#5ec6a6] scale-100 opacity-100'
                                : 'bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] hover:shadow-lg hover:shadow-[#a1db87]/30 transform hover:scale-105 opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Completado</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm">Marcar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
