import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TestEvaluacion from '../components/curso/TestEvaluacion';
import { duration, ease } from '../lib/motion';
import { isCloudinaryRaw, loadCourseFile } from '../lib/courseFiles';

export default function TemaEstudio() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener datos del tema desde el estado de navegación
  const { tema, material, startPhase, temaId } = location.state || {};
  
  const [currentPhase, setCurrentPhase] = useState(startPhase || 1); // 1: Material, 2: Test
  const idioma = localStorage.getItem(`lang_${cursoId}`) || 'es';
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    if (!tema || !material) {
      // Si no hay datos, redirigir al curso
      navigate(`/curso/${cursoId}`);
      return;
    }

    // Si empezamos directamente en el test, no necesitamos cargar el PDF
    if (startPhase === 2) {
      setIsLoading(false);
      return;
    }

    // PDF de Cloudinary: lo sirve el backend tras comprobar el acceso (cursos privados), con el token.
    // Se pide con fetch y se muestra desde una URL blob: (el <iframe> no puede mandar el token).
    let blobUrl = null;
    const ctrl = new AbortController();
    if (material.archivo && material._id && isCloudinaryRaw(material.archivo)) {
      const lang = material.archivoEn && material.archivo === material.archivoEn ? 'en' : 'es';
      loadCourseFile(cursoId, material._id, lang, ctrl.signal)
        .then(({ url, external }) => {
          blobUrl = url ?? null;
          setPdfUrl(url ?? external);
          setIsLoading(false);
        })
        .catch((err) => {
          if (err.name === 'AbortError') return;
          // Sin acceso (curso privado): de vuelta a la ficha, que explica por qué
          if (err.status === 401 || err.status === 403) navigate(`/curso/${cursoId}/inscripcion`, { replace: true });
          else setIsLoading(false);
        });
      return () => {
        ctrl.abort();
        if (blobUrl) URL.revokeObjectURL(blobUrl);
      };
    }

    // Otros enlaces: tal cual (o relativos al backend)
    if (material.archivo) {
      setPdfUrl(/^https?:\/\//.test(material.archivo) ? material.archivo : `${apiUrl}${material.archivo}`);
    }

    // Simular carga suave
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, [tema, material, cursoId, navigate, apiUrl, startPhase]);

  const handleClose = () => {
    navigate(`/curso/${cursoId}`);
  };

  const handleNextPhase = () => {
    if (currentPhase < 2) {
      setCurrentPhase(currentPhase + 1);
    }
  };

  const handlePrevPhase = () => {
    if (currentPhase > 1) {
      setCurrentPhase(currentPhase - 1);
    }
  };

  const phases = [
    { id: 1, name: idioma === 'en' ? 'Study Material' : 'Material de Estudio', icon: BookOpen },
    { id: 2, name: idioma === 'en' ? 'Evaluation Test' : 'Test de Evaluación', icon: ClipboardCheck }
  ];

  if (!tema || !material) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: duration.base, ease: ease.inOutQuart }}
      className="fixed inset-0 bg-surface z-50 flex flex-col"
    >
      {/* Overlay de carga */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base, ease: ease.outExpo }}
            className="absolute inset-0 bg-surface z-[60] flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-line border-t-brand rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">{idioma === 'en' ? 'Loading material...' : 'Cargando material...'}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: duration.slow, delay: 0.2, ease: ease.outExpo }}
        className="bg-surface border-b border-line px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-surface rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-ink">
                {idioma === 'en'
                  ? `Topic ${tema.numeroTema}: ${tema.tituloEn || tema.titulo}`
                  : `Tema ${tema.numeroTema}: ${tema.titulo}`}
              </h1>
              <p className="text-sm text-gray-400">{material.titulo}</p>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = phase.id === currentPhase;
              const isCompleted = phase.id < currentPhase;
              
              return (
                <React.Fragment key={phase.id}>
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-brand hover:bg-brand-300 text-on-brand'
                        : isCompleted
                        ? 'bg-brand/20 text-brand'
                        : 'bg-surface text-gray-500'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium hidden md:inline">{phase.name}</span>
                  </div>
                  {index < phases.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentPhase === 1 && (
            <motion.div
              key="material"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: duration.base, ease: ease.outExpo }}
              className="h-full flex flex-col"
            >
              {/* PDF Viewer */}
              <div className="flex-1 bg-surface p-4">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full rounded-lg border border-line"
                    title={material.titulo}
                    style={{ minHeight: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">{idioma === 'en' ? 'No material available' : 'No hay material disponible'}</p>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="bg-surface border-t border-line px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <button
                    onClick={handleClose}
                    className="cursor-pointer px-6 py-2 border border-line text-gray-400 hover:text-white hover:border-brand rounded-lg transition-colors"
                  >
                    {idioma === 'en' ? 'Back to Course' : 'Volver al Curso'}
                  </button>
                  <button
                    onClick={handleNextPhase}
                    className="cursor-pointer px-6 py-2 bg-brand hover:bg-brand-300 text-on-brand font-medium rounded-lg hover:shadow-lg hover:shadow-brand/30 transition-all flex items-center gap-2"
                  >
                    {idioma === 'en' ? 'Continue to Test' : 'Continuar al Test'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {currentPhase === 2 && (
            <motion.div
              key="test"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: duration.base, ease: ease.outExpo }}
              className="h-full"
            >
              <TestEvaluacion 
                cursoId={cursoId} 
                temaId={temaId || tema._id}
                onComplete={handleClose}
                idioma={idioma}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
