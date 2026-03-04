import React, { useState } from "react";
import { BookOpen, FileCheck, Trophy, Info, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EstructuraCurso() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      id: 'metodologia',
      title: 'Metodología del Curso',
      icon: <Zap className="w-5 h-5" />,
      color: '#a1db87',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-justify leading-relaxed">
            Hemos diseñado una experiencia de aprendizaje basada en la <span className="text-[#a1db87] font-semibold">teoría del aprendizaje activo</span>, 
            donde cada concepto teórico se valida inmediatamente mediante evaluaciones prácticas.
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-[#111827]/50 rounded-lg">
              <div className="text-2xl font-bold text-[#a1db87]">60%</div>
              <div className="text-xs text-gray-400 mt-1">Teoría</div>
            </div>
            <div className="text-center p-4 bg-[#111827]/50 rounded-lg">
              <div className="text-2xl font-bold text-[#5ec6a6]">30%</div>
              <div className="text-xs text-gray-400 mt-1">Evaluación</div>
            </div>
            <div className="text-center p-4 bg-[#111827]/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">10%</div>
              <div className="text-xs text-gray-400 mt-1">Práctica</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ciclo',
      title: 'Ciclo de Aprendizaje',
      icon: <BookOpen className="w-5 h-5" />,
      color: '#5ec6a6',
      content: (
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#a1db87]/10 border-2 border-[#a1db87] flex items-center justify-center">
              <span className="text-[#a1db87] font-bold text-sm">1</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#a1db87] font-semibold mb-1">Estudio del Tema</h4>
              <p className="text-sm text-gray-400 text-justify">
                Accede al material teórico con contenido multimedia, ejemplos prácticos y recursos descargables.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5ec6a6]/10 border-2 border-[#5ec6a6] flex items-center justify-center">
              <span className="text-[#5ec6a6] font-bold text-sm">2</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#5ec6a6] font-semibold mb-1">Evaluación del Conocimiento</h4>
              <p className="text-sm text-gray-400 text-justify">
                Realiza el test asociado al tema para validar tu comprensión. Obtendrás feedback inmediato.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#a1db87]/10 border-2 border-[#a1db87] flex items-center justify-center">
              <span className="text-[#a1db87] font-bold text-sm">3</span>
            </div>
            <div className="flex-1">
              <h4 className="text-[#a1db87] font-semibold mb-1">Progresión al Siguiente Nivel</h4>
              <p className="text-sm text-gray-400 text-justify">
                Una vez aprobado, desbloqueas el siguiente tema. El ciclo se repite hasta completar todos los módulos.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'evaluacion',
      title: 'Sistema de Evaluación',
      icon: <FileCheck className="w-5 h-5" />,
      color: '#f59e0b',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Nota Mínima: 70%
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              Necesitas obtener al menos un 70% de respuestas correctas para aprobar cada evaluación.
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              3 Oportunidades
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              Cada test puede realizarse hasta 3 veces. Entre intentos, puedes revisar el material del tema.
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Política de Fallos
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              Si agotas los 3 intentos, el curso quedará bloqueado. Deberás contactar con soporte para reinscribirte.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'certificacion',
      title: 'Test Final y Certificación',
      icon: <Trophy className="w-5 h-5" />,
      color: '#eab308',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-2 border-yellow-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h4 className="text-yellow-400 font-bold text-lg">Evaluación Final Integral</h4>
            </div>
            <p className="text-gray-300 text-justify mb-4">
              Al completar todos los temas, accederás al Test Final que evalúa de forma integrada todo el contenido del curso.
            </p>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[#111827]/50 p-3 rounded-lg">
                <div className="text-yellow-500 font-semibold text-sm mb-1">Duración</div>
                <div className="text-gray-400 text-xs">60-90 minutos</div>
              </div>
              <div className="bg-[#111827]/50 p-3 rounded-lg">
                <div className="text-yellow-500 font-semibold text-sm mb-1">Preguntas</div>
                <div className="text-gray-400 text-xs">30-50 ítems</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2937] border border-emerald-500/30 p-4 rounded-lg">
            <h4 className="text-emerald-400 font-semibold mb-2">🎓 Certificado Digital</h4>
            <p className="text-sm text-gray-300 text-justify">
              Al aprobar el Test Final, recibirás un certificado digital verificable que acredita tus conocimientos adquiridos.
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Sistema Anti-Copia
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              Durante el Test Final, el sistema detecta automáticamente si <span className="text-red-400 font-semibold">cambias de pestaña, ventana o aplicación</span>. 
              Cualquier intento de abandonar la pantalla del test se registrará y podría resultar en la <span className="text-red-400 font-semibold">anulación automática</span> del examen.
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full mb-12">
      {/* Título Principal */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-white mb-3">
          Estructura del Curso
        </h2>
        <div className="h-1 w-32 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mx-auto rounded-full"></div>
      </div>

      {/* Descripción elegante */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-gray-400 text-lg leading-relaxed">
          Un sistema de aprendizaje estructurado que combina teoría, práctica y evaluación continua 
          para garantizar la <span className="text-[#a1db87] font-semibold">máxima retención de conocimientos</span>.
        </p>
      </div>

      {/* Secciones expandibles elegantes */}
      <div className="space-y-3">
        {sections.map((section, index) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="group"
          >
            <button
              onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
              className="w-full cursor-pointer"
            >
              <div className={`
                relative overflow-hidden rounded-xl transition-all duration-300
                ${activeSection === section.id 
                  ? 'bg-gradient-to-r from-[#1f2937] to-[#111827] border-2' 
                  : 'bg-[#1f2937] border border-gray-700 hover:border-gray-600'
                }
              `}
              style={{
                backgroundColor: 'rgb(31, 41, 55)',
                borderColor: activeSection === section.id ? section.color : undefined
              }}>
                {/* Barra de acento lateral */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${
                    activeSection === section.id ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ backgroundColor: section.color }}
                />
                
                <div className="flex items-center justify-between p-5 pl-6">
                  <div className="flex items-center gap-4">
                    <div 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
                        activeSection === section.id ? 'scale-110' : 'scale-100'
                      }`}
                      style={{ 
                        backgroundColor: activeSection === section.id ? `${section.color}20` : '#111827',
                        color: section.color
                      }}
                    >
                      {section.icon}
                    </div>
                    <h3 className={`font-bold text-lg transition-colors duration-300 ${
                      activeSection === section.id ? 'text-white' : 'text-gray-300'
                    }`}>
                      {section.title}
                    </h3>
                  </div>
                  
                  <ChevronRight 
                    className={`w-5 h-5 transition-all duration-300 ${
                      activeSection === section.id ? 'rotate-90 text-white' : 'text-gray-500'
                    }`}
                  />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {activeSection === section.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#111827] rounded-b-xl p-6 mt-[-8px] pt-8" style={{backgroundColor: 'rgb(17, 24, 39)'}}>
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Footer elegante */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1f2937] to-[#111827] border border-[#a1db87]/30 rounded-full">
          <Zap className="w-4 h-4 text-[#a1db87]" />
          <span className="text-sm text-gray-300">
            Diseñado para <span className="text-[#a1db87] font-semibold">maximizar tu aprendizaje</span>
          </span>
        </div>
      </div>
    </div>
  );
}
