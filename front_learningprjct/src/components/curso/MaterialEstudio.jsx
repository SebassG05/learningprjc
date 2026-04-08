import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Download, ExternalLink, ChevronDown, ChevronUp, Check, ClipboardCheck, Lock, Trophy } from 'lucide-react';

export default function MaterialEstudio({ cursoId, temas, completedMaterials, setCompletedMaterials, completedTests }) {
  const [expandedTemas, setExpandedTemas] = useState({});
  const [testInfo, setTestInfo] = useState({});
  const navigate = useNavigate();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    // Cargar información de los tests para cada tema
    const cargarInfoTests = async () => {
      const infoTests = {};
      for (const tema of temas) {
        try {
          const response = await fetch(`${apiUrl}/api/tests/${cursoId}/temas/${tema._id}/test`);
          if (response.ok) {
            const testData = await response.json();
            infoTests[tema._id] = {
              totalPreguntas: testData.preguntas.length,
              duracion: testData.duracionMinutos,
              notaMinima: testData.notaMinima
            };
          }
        } catch (error) {
          console.error(`Error cargando info test tema ${tema._id}:`, error);
        }
      }
      setTestInfo(infoTests);
    };

    if (temas && temas.length > 0) {
      cargarInfoTests();
    }
  }, [temas, cursoId, apiUrl]);

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

  const handleOpenMaterial = (tema, material) => {
    // Si es el test, ir directamente a la fase 2 (test)
    if (material._id && material._id.startsWith('test-')) {
      navigate(`/curso/${cursoId}/tema-estudio`, {
        state: { 
          tema, 
          material: { titulo: 'Test de Evaluación' }, 
          startPhase: 2,
          temaId: tema._id
        }
      });
    } else {
      // Para materiales normales, ir a la fase 1 (material de estudio)
      navigate(`/curso/${cursoId}/tema-estudio`, {
        state: { tema, material, temaId: tema._id }
      });
    }
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

  // Verificar si es el test final y si está bloqueado
  const isTestFinalBloqueado = (tema) => {
    if (!temas || temas.length === 0) return false;
    
    // El test final es el que tiene "Test Final" en el título o es el tema 5 (último del curso)
    const isTestFinal = tema.titulo?.toLowerCase().includes('test final') || 
                       tema.titulo?.toLowerCase().includes('certificación');
    
    if (!isTestFinal) return false;
    
    // Solo bloquear si es realmente el último tema (tema 5 o superior)
    // Los temas 1-4 son los temas normales del curso
    if (tema.numeroTema <= 4) return false;
    
    // Verificar si todos los tests de los temas 1-4 están completados
    const temasDelCurso = temas.filter(t => t.numeroTema >= 1 && t.numeroTema <= 4);
    const todosTestsCompletados = temasDelCurso.every(t => 
      completedTests && completedTests.includes(t._id)
    );
    
    return !todosTestsCompletados;
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
            const testBloqueado = isTestFinalBloqueado(tema);

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
                        onClick={() => material.archivo && handleOpenMaterial(tema, material)}
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

              {/* Test de Evaluación */}
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold text-[#5ec6a6] uppercase tracking-wide mb-3">
                  Test de Evaluación
                </h4>
                <div
                  onClick={() => !testBloqueado && handleOpenMaterial(tema, { titulo: 'Test de Evaluación', _id: `test-${tema._id}` })}
                  className={`group flex items-center justify-between rounded-lg py-2 px-4 transition-all duration-300 border ${
                    testBloqueado 
                      ? 'bg-[#1a1a1a]/30 border-gray-700/50 cursor-not-allowed opacity-60'
                      : completedTests && completedTests.includes(tema._id)
                      ? 'bg-[#5ec6a6]/10 border-[#5ec6a6]/50 cursor-pointer'
                      : 'bg-[#1a1a1a]/50 border-transparent hover:bg-[#1a1a1a] hover:border-[#5ec6a6]/30 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 transition-colors ${
                      testBloqueado 
                        ? 'text-gray-600'
                        : completedTests && completedTests.includes(tema._id) ? 'text-[#5ec6a6]' : 'text-[#5ec6a6]'
                    }`}>
                      {completedTests && completedTests.includes(tema._id) ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium transition-colors truncate ${
                        testBloqueado 
                          ? 'text-gray-500'
                          : completedTests && completedTests.includes(tema._id) ? 'text-[#5ec6a6]' : 'text-white'
                      }`}>
                        Test de Evaluación - Tema {tema.numeroTema}
                        {completedTests && completedTests.includes(tema._id) && (
                          <span className="ml-2 text-xs bg-[#5ec6a6]/20 text-[#5ec6a6] px-2 py-0.5 rounded-full">
                            Aprobado
                          </span>
                        )}
                        {testBloqueado && (
                          <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">
                            🔒 Bloqueado
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {testBloqueado ? (
                          'Completa y aprueba los tests de los Temas 1, 2, 3 y 4 para desbloquear'
                        ) : testInfo[tema._id] ? (
                          <>
                            {testInfo[tema._id].totalPreguntas} preguntas • {testInfo[tema._id].duracion} minutos • Nota mínima: {testInfo[tema._id].notaMinima}%
                          </>
                        ) : (
                          'Cargando información del test...'
                        )}
                      </p>
                    </div>
                  </div>
                  
                  {!testBloqueado && (
                    <div className={`flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                      completedTests && completedTests.includes(tema._id)
                        ? 'bg-[#5ec6a6]/20 text-[#5ec6a6] border border-[#5ec6a6]/50'
                        : 'bg-gradient-to-r from-[#5ec6a6] to-[#4da992] text-[#1a1a1a] hover:shadow-lg hover:shadow-[#5ec6a6]/30 opacity-0 group-hover:opacity-100'
                    }`}>
                      {completedTests && completedTests.includes(tema._id) ? 'Ver resultados' : 'Iniciar Test'}
                    </div>
                  )}
                </div>
              </div>

              {tema.actividadesOptativas && tema.actividadesOptativas.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="text-sm font-semibold text-[#5ec6a6] uppercase tracking-wide mb-3">
                    Actividades Optativas
                  </h4>
                  {tema.actividadesOptativas.map((actividad) => {
                    const isCompleted = completedMaterials[actividad._id];
                    
                    return (
                      <div
                        key={actividad._id}
                        onClick={() => actividad.archivo && handleOpenMaterial(tema, actividad)}
                        className={`group flex items-center justify-between rounded-lg py-2 px-4 transition-all duration-300 border ${
                          isCompleted 
                            ? 'bg-[#5ec6a6]/10 border-[#5ec6a6]/40 hover:bg-[#5ec6a6]/15' 
                            : 'bg-[#1a1a1a]/50 border-transparent hover:bg-[#1a1a1a] hover:border-[#5ec6a6]/30'
                        } ${actividad.archivo ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-[#5ec6a6]' : 'text-[#5ec6a6]'}`}>
                            {getIconByType(actividad.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium transition-colors truncate ${isCompleted ? 'text-[#5ec6a6]' : 'text-white'}`}>
                              {actividad.titulo}
                            </p>
                          </div>
                        </div>
                        
                        {actividad.archivo && (
                          <button
                            onClick={(e) => toggleCompleted(e, actividad._id)}
                            className={`cursor-pointer flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                              isCompleted
                                ? 'bg-[#5ec6a6] text-[#1a1a1a] hover:bg-[#4da992] scale-100 opacity-100'
                                : 'bg-gradient-to-r from-[#5ec6a6] to-[#4da992] text-[#1a1a1a] hover:shadow-lg hover:shadow-[#5ec6a6]/30 transform hover:scale-105 opacity-0 group-hover:opacity-100'
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

        {/* ── Test Final de Certificación ── */}
        {(() => {
          const todosAprobados = temas.length > 0 && temas.every(t => completedTests && completedTests.includes(t._id));
          const aprobado = completedTests && completedTests.includes('test-final-certificacion');
          return (
            <div className="mt-8 bg-[#23272f]/50 rounded-xl p-10 border border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
              {/* Header igual que los temas */}
              <div className="flex items-start gap-4 mb-6">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-500 flex items-center justify-center text-[#1a1a1a] font-bold text-sm">
                  5
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">Test Final de Certificación</h3>
                  <p className="text-gray-400 text-sm text-justify leading-relaxed">
                    Evaluación final integradora sobre todos los contenidos del curso. Cubre los 4 módulos: fundamentos de la dinámica del carbono, estructura y tipos de modelos, formulación matemática y práctica en R con el ensemble multimodelo.
                  </p>
                </div>
              </div>

              {/* Fila del test */}
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide mb-3">
                  Test de Certificación
                </h4>
                <div
                  onClick={() => {
                    if (todosAprobados) {
                      navigate(`/curso/${cursoId}/tema-estudio`, {
                        state: {
                          tema: { _id: 'test-final-certificacion', titulo: 'Test Final de Certificación', numeroTema: 5 },
                          material: { titulo: 'Test Final de Certificación' },
                          startPhase: 2,
                          temaId: 'test-final-certificacion'
                        }
                      });
                    }
                  }}
                  className={`group flex items-center justify-between rounded-lg py-2 px-4 transition-all duration-300 border ${
                    !todosAprobados
                      ? 'bg-[#1a1a1a]/30 border-gray-700/50 cursor-not-allowed opacity-60'
                      : aprobado
                        ? 'bg-yellow-400/10 border-yellow-400/50 cursor-pointer'
                        : 'bg-[#1a1a1a]/50 border-transparent hover:bg-[#1a1a1a] hover:border-yellow-400/40 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 ${todosAprobados ? 'text-yellow-400' : 'text-gray-600'}`}>
                      {!todosAprobados ? (
                        <Lock className="w-5 h-5" />
                      ) : aprobado ? (
                        <Trophy className="w-5 h-5" />
                      ) : (
                        <ClipboardCheck className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium truncate ${todosAprobados ? 'text-white' : 'text-gray-500'}`}>
                        Test Final de Certificación
                        {aprobado && (
                          <span className="ml-2 text-xs bg-yellow-400/20 text-yellow-400 px-2 py-0.5 rounded-full">Aprobado ✓</span>
                        )}
                        {!todosAprobados && (
                          <span className="ml-2 text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">🔒 Bloqueado</span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {todosAprobados
                          ? '40 preguntas • 90 minutos • Nota mínima: 70%'
                          : 'Aprueba los tests de los 4 módulos para desbloquear el test final'}
                      </p>
                    </div>
                  </div>
                  {todosAprobados && !aprobado && (
                    <div className="flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-yellow-400 to-yellow-500 text-[#1a1a1a] opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-105">
                      Iniciar Test
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
