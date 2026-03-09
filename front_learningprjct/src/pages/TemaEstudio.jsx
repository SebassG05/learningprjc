import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, BookOpen, ClipboardCheck, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TemaEstudio() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener datos del tema desde el estado de navegación
  const { tema, material } = location.state || {};
  
  const [currentPhase, setCurrentPhase] = useState(1); // 1: Material, 2: Test
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3007';

  useEffect(() => {
    if (!tema || !material) {
      // Si no hay datos, redirigir al curso
      navigate(`/curso/${cursoId}`);
      return;
    }

    // Construir URL del PDF
    if (material.archivo) {
      let finalUrl = material.archivo;
      
      // Si la URL ya es completa (Cloudinary), usar proxy para archivos raw
      if (material.archivo.startsWith('http://') || material.archivo.startsWith('https://')) {
        // Si es un archivo raw de Cloudinary, usar el proxy para visualización
        if (material.archivo.includes('cloudinary.com/') && material.archivo.includes('/raw/')) {
          finalUrl = `${apiUrl}/api/pdf-proxy?url=${encodeURIComponent(material.archivo)}`;
        } else {
          finalUrl = material.archivo;
        }
      } else {
        // Si es una ruta relativa, agregar la URL base del servidor
        finalUrl = `${apiUrl}${material.archivo}`;
      }
      
      setPdfUrl(finalUrl);
    }
    
    // Simular carga suave
    setTimeout(() => setIsLoading(false), 400);
  }, [tema, material, cursoId, navigate, apiUrl]);

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
    { id: 1, name: 'Material de Estudio', icon: BookOpen },
    { id: 2, name: 'Test de Evaluación', icon: ClipboardCheck }
  ];

  if (!tema || !material) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed inset-0 bg-[#1a1a1a] z-50 flex flex-col"
    >
      {/* Overlay de carga */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-[#1a1a1a] z-[60] flex items-center justify-center"
          >
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-[#a1db87]/20 border-t-[#a1db87] rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400">Cargando material...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
        className="bg-[#23272f] border-b border-[#a1db87]/20 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleClose}
              className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400 hover:text-white" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">Tema {tema.numeroTema}: {tema.titulo}</h1>
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
                        ? 'bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a]'
                        : isCompleted
                        ? 'bg-[#a1db87]/20 text-[#a1db87]'
                        : 'bg-[#1a1a1a] text-gray-500'
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
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* PDF Viewer */}
              <div className="flex-1 bg-[#23272f] p-4">
                {pdfUrl ? (
                  <iframe
                    src={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`}
                    className="w-full h-full rounded-lg border border-[#a1db87]/20"
                    title={material.titulo}
                    style={{ minHeight: '100%' }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-400">No hay material disponible</p>
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="bg-[#23272f] border-t border-[#a1db87]/20 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <button
                    onClick={handleClose}
                    className="cursor-pointer px-6 py-2 border border-[#a1db87]/30 text-gray-400 hover:text-white hover:border-[#a1db87] rounded-lg transition-colors"
                  >
                    Volver al Curso
                  </button>
                  <button
                    onClick={handleNextPhase}
                    className="cursor-pointer px-6 py-2 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-medium rounded-lg hover:shadow-lg hover:shadow-[#a1db87]/30 transition-all flex items-center gap-2"
                  >
                    Continuar al Test
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
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Test Content */}
              <div className="flex-1 bg-[#23272f] p-8">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-[#1a1a1a]/50 rounded-xl p-12 border border-[#a1db87]/20 text-center">
                    <ClipboardCheck className="w-16 h-16 text-[#a1db87] mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-4">Test de Evaluación</h2>
                    <p className="text-gray-400 mb-8">
                      Esta funcionalidad estará disponible próximamente. Aquí podrás evaluar tus conocimientos sobre el tema estudiado.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-[#23272f] p-4 rounded-lg border border-[#a1db87]/10">
                        <p className="text-sm text-gray-400">
                          💡 El test incluirá preguntas de selección múltiple basadas en el material de estudio
                        </p>
                      </div>
                      <div className="bg-[#23272f] p-4 rounded-lg border border-[#a1db87]/10">
                        <p className="text-sm text-gray-400">
                          📊 Recibirás retroalimentación inmediata sobre tus respuestas
                        </p>
                      </div>
                      <div className="bg-[#23272f] p-4 rounded-lg border border-[#a1db87]/10">
                        <p className="text-sm text-gray-400">
                          ✅ Necesitarás aprobar para continuar con el siguiente tema
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="bg-[#23272f] border-t border-[#a1db87]/20 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                  <button
                    onClick={handlePrevPhase}
                    className="px-6 py-2 border border-[#a1db87]/30 text-gray-400 hover:text-white hover:border-[#a1db87] rounded-lg transition-colors flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver al Material
                  </button>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-medium rounded-lg hover:shadow-lg hover:shadow-[#a1db87]/30 transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Finalizar y Volver
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
