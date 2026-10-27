/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { duration, ease } from '../../lib/motion';
import useTestInfo from './useTestInfo';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, ChevronDown, ChevronUp, Check, ClipboardCheck } from 'lucide-react';

export default function MaterialEstudio({ cursoId, temas, completedMaterials, setCompletedMaterials, completedTests, idioma = 'es' }) {
  const [expandedTemas, setExpandedTemas] = useState({});
  const navigate = useNavigate();

  // Devuelve el texto en el idioma seleccionado
  const t = (es, en) => {
    if (idioma === 'en' && en) return en;
    return es || en || '';
  };

  // Devuelve la URL del material en el idioma seleccionado
  const getMaterialUrl = (material) => {
    if (idioma === 'en' && material.archivoEn) return material.archivoEn;
    return material.archivo || material.archivoEn || null;
  };

  const testInfo = useTestInfo(cursoId, temas);

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
          material: { titulo: idioma === 'en' ? 'Evaluation Test' : 'Test de Evaluación' }, 
          startPhase: 2,
          temaId: tema._id
        }
      });
    } else {
      // Para materiales normales, pasar el archivo según el idioma seleccionado
      const materialConIdioma = {
        ...material,
        archivo: getMaterialUrl(material)
      };
      navigate(`/curso/${cursoId}/tema-estudio`, {
        state: { tema, material: materialConIdioma, temaId: tema._id }
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
    
    // Obtener temas regulares (excluir el propio test final) para verificar requisitos
    const temasDelCurso = temas.filter(t =>
      !t.titulo?.toLowerCase().includes('test final') &&
      !t.titulo?.toLowerCase().includes('certificación')
    );
    if (temasDelCurso.includes(tema)) return false; // Es un tema regular, no bloquear
    
    // Verificar si todos los tests de los temas regulares están completados
    const todosTestsCompletados = temasDelCurso.every(t => 
      completedTests && completedTests.includes(t._id)
    );
    
    return !todosTestsCompletados;
  };

  return (
    <div className="mb-16 space-y-8">
      <div className="border-t border-line">
        <h2 className="mt-12 mb-8 text-title-2 font-bold text-ink">
          {idioma === 'en' ? '📚 Course Content' : '📚 Aquí Comienza el Curso'}
        </h2>
        
        <div className="space-y-8">
          {temas.map((tema) => {
            const isExpanded = expandedTemas[tema._id];
            const tituloTema = t(tema.titulo, tema.tituloEn);
            const descTema = t(tema.descripcion, tema.descripcionEn);
            const { text: truncatedText, isTruncated } = truncateText(descTema);
            const displayText = isExpanded ? descTema : truncatedText;
            const testBloqueado = isTestFinalBloqueado(tema);

            return (
              <div key={tema._id} className="rounded-3xl border border-line bg-surface p-6 shadow-card transition-colors hover:border-line-strong sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold tabular-nums text-brand">
                    {tema.numeroTema}
                  </span>
                  <div className="flex-1">
                    <h3 className="mb-2 font-sans text-xl font-semibold text-ink">{tituloTema}</h3>
                    {descTema && (
                      <div>
                        <div>
                          <motion.p
                            key={isExpanded ? 'completo' : 'resumen'}
                            initial={{ opacity: 0.4 }}
                            animate={{ opacity: 1, transition: { duration: duration.base, ease: ease.outExpo } }}
                            className="text-sm leading-relaxed text-ink-2"
                          >
                            {displayText}
                            {isTruncated && !isExpanded && (
                              <span className="inline-block">...</span>
                            )}
                          </motion.p>
                        </div>
                        {isTruncated && (
                          <button
                            onClick={() => toggleDescripcion(tema._id)}
                            className="cursor-pointer flex items-center gap-1 text-brand hover:text-brand-500 text-sm font-medium mt-2 transition-all duration-300 group/btn"
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
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                    {idioma === 'en' ? 'Study Material' : 'Material de Estudio'}
                  </h4>
                  {tema.materiales.filter(m => getMaterialUrl(m)).map((material) => {
                    const isCompleted = completedMaterials[material._id];
                    const archivoFinal = getMaterialUrl(material);
                    
                    return (
                      <div
                        key={material._id}
                        onClick={() => archivoFinal && handleOpenMaterial(tema, material)}
                        className={`group flex items-center justify-between rounded-xl py-3 px-4 transition-colors duration-200 border ${
                          isCompleted 
                            ? 'bg-brand/[0.08] border-transparent hover:bg-brand/[0.12]' 
                            : 'bg-white/[0.03] border-transparent hover:bg-white/[0.06]'
                        } ${archivoFinal ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-brand' : 'text-brand'}`}>
                            {getIconByType(material.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium transition-colors truncate ${isCompleted ? 'text-brand' : 'text-ink'}`}>
                              {idioma === 'en' ? `Unit ${tema.numeroTema}` : `Tema ${tema.numeroTema}`}
                            </p>
                          </div>
                        </div>
                        
                        {archivoFinal && (
                          <button
                            onClick={(e) => toggleCompleted(e, material._id)}
                            className={`flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-[background-color,color,opacity] duration-200 ${
                              isCompleted
                                ? 'bg-brand text-on-brand hover:bg-brand-300'
                                : 'bg-white/[0.08] text-ink hover:bg-brand hover:text-on-brand opacity-0 group-hover:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm">{idioma === 'en' ? 'Done' : 'Completado'}</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-4 h-4" />
                                <span className="text-sm">{idioma === 'en' ? 'Mark' : 'Marcar'}</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Test de Evaluación — solo si existe test para este tema */}
              {testInfo[tema._id] && <div className="mt-6 space-y-2">
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                  {idioma === 'en' ? 'Evaluation Test' : 'Test de Evaluación'}
                </h4>
                <div
                  onClick={() => !testBloqueado && handleOpenMaterial(tema, { titulo: 'Test de Evaluación', _id: `test-${tema._id}` })}
                  className={`group flex items-center justify-between rounded-xl py-3 px-4 transition-colors duration-200 border ${
                    testBloqueado 
                      ? 'bg-white/[0.02] border-transparent cursor-not-allowed opacity-50'
                      : completedTests && completedTests.includes(tema._id)
                      ? 'bg-brand/[0.08] border-transparent cursor-pointer'
                      : 'bg-white/[0.03] border-transparent hover:bg-white/[0.06] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`flex-shrink-0 transition-colors ${
                      testBloqueado 
                        ? 'text-gray-600'
                        : completedTests && completedTests.includes(tema._id) ? 'text-brand-500' : 'text-brand-500'
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
                          : completedTests && completedTests.includes(tema._id) ? 'text-brand-500' : 'text-ink'
                      }`}>
                        {idioma === 'en' ? `Topic ${tema.numeroTema} - Evaluation Test` : `Test de Evaluación - Tema ${tema.numeroTema}`}
                        {completedTests && completedTests.includes(tema._id) && (
                          <span className="ml-2 text-xs bg-brand-500/20 text-brand-500 px-2 py-0.5 rounded-full">
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
                          idioma === 'en' ? 'Complete and pass the tests for Topics 1, 2, 3 and 4 to unlock' : 'Completa y aprueba los tests de los Temas 1, 2, 3 y 4 para desbloquear'
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
                    <div className={`flex-shrink-0 ml-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                      completedTests && completedTests.includes(tema._id)
                        ? 'bg-brand-500/20 text-brand-500 border border-brand-500/50'
                        : 'bg-white/[0.08] text-ink group-hover:bg-brand group-hover:text-on-brand opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
                    }`}>
                      {completedTests && completedTests.includes(tema._id)
                      ? (idioma === 'en' ? 'View results' : 'Ver resultados')
                      : (idioma === 'en' ? 'Start Test' : 'Iniciar Test')}
                    </div>
                  )}
                </div>
              </div>}

              {tema.actividadesOptativas && tema.actividadesOptativas.length > 0 && (
                <div className="mt-6 space-y-2">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink-3">
                    {idioma === 'en' ? 'Optional Activities' : 'Actividades Optativas'}
                  </h4>
                  {tema.actividadesOptativas.map((actividad) => {
                    const isCompleted = completedMaterials[actividad._id];
                    
                    return (
                      <div
                        key={actividad._id}
                        onClick={() => actividad.archivo && handleOpenMaterial(tema, actividad)}
                        className={`group flex items-center justify-between rounded-xl py-3 px-4 transition-colors duration-200 border ${
                          isCompleted 
                            ? 'bg-brand-500/10 border-line hover:bg-brand-500/15' 
                            : 'bg-white/[0.03] border-transparent hover:bg-white/[0.06]'
                        } ${actividad.archivo ? 'cursor-pointer' : ''}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`flex-shrink-0 transition-colors ${isCompleted ? 'text-brand-500' : 'text-brand-500'}`}>
                            {getIconByType(actividad.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium transition-colors truncate ${isCompleted ? 'text-brand-500' : 'text-ink'}`}>
                              {actividad.titulo}
                            </p>
                          </div>
                        </div>
                        
                        {actividad.archivo && (
                          <button
                            onClick={(e) => toggleCompleted(e, actividad._id)}
                            className={`flex-shrink-0 ml-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-[background-color,color,opacity] duration-200 ${
                              isCompleted
                                ? 'bg-brand-500 text-on-brand hover:bg-brand-600 scale-100 opacity-100'
                                : 'bg-white/[0.08] text-ink group-hover:bg-brand group-hover:text-on-brand opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100'
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
