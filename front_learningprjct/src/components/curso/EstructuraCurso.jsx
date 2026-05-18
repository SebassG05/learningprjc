import React, { useState } from "react";
import { BookOpen, FileCheck, Trophy, Info, ChevronRight, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EstructuraCurso({ idioma = 'es' }) {
  const [activeSection, setActiveSection] = useState(null);

  const t = (es, en) => (idioma === 'en' && en ? en : es);

  const sections = [
    {
      id: 'metodologia',
      title: t('Metodología del Curso', 'Course Methodology'),
      icon: <Zap className="w-5 h-5" />,
      color: '#a1db87',
      content: (
        <div className="space-y-4">
          <p className="text-gray-300 text-justify leading-relaxed">
            {t(
              <>Hemos diseñado una experiencia de aprendizaje basada en la <span className="text-[#a1db87] font-semibold">teoría del aprendizaje activo</span>, donde cada concepto teórico se valida inmediatamente mediante evaluaciones prácticas sobre la plataforma ANFORA.</>,
              <>We designed a learning experience based on <span className="text-[#a1db87] font-semibold">active learning theory</span>, where every theoretical concept is immediately validated through practical assessments on the ANFORA platform.</>
            )}
          </p>
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-[#111827]/50 rounded-lg">
              <div className="text-2xl font-bold text-[#a1db87]">60%</div>
              <div className="text-xs text-gray-400 mt-1">{t('Teoría', 'Theory')}</div>
            </div>
            <div className="text-center p-4 bg-[#111827]/50 rounded-lg">
              <div className="text-2xl font-bold text-[#5ec6a6]">30%</div>
              <div className="text-xs text-gray-400 mt-1">{t('Evaluación', 'Assessment')}</div>
            </div>
            <div className="text-center p-4 bg-[#111827]/50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-500">10%</div>
              <div className="text-xs text-gray-400 mt-1">{t('Práctica', 'Practice')}</div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'ciclo',
      title: t('Ciclo de Aprendizaje', 'Learning Cycle'),
      icon: <BookOpen className="w-5 h-5" />,
      color: '#5ec6a6',
      content: (
        <div className="space-y-6">
          {[
            {
              n: '1',
              color: '#a1db87',
              title: t('Estudio de la Unidad', 'Unit Study'),
              desc: t(
                'Accede al material teórico de cada unidad (PDF descargable). El curso cuenta con 6 unidades temáticas, cada una enfocada en un aspecto clave de la plataforma ANFORA y la huella hídrica.',
                'Access the study material for each unit (downloadable PDF). The course has 6 thematic units, each focused on a key aspect of the ANFORA platform and water footprint management.'
              )
            },
            {
              n: '2',
              color: '#5ec6a6',
              title: t('Test de Evaluación', 'Evaluation Test'),
              desc: t(
                'Realiza el test de 25 preguntas asociado a cada unidad (30 min). Obtendrás feedback inmediato y necesitas un mínimo del 60% para avanzar.',
                'Complete the 25-question test linked to each unit (30 min). You will receive immediate feedback and need at least 60% to progress.'
              )
            },
            {
              n: '3',
              color: '#a1db87',
              title: t('Progresión al Siguiente Nivel', 'Progression to Next Level'),
              desc: t(
                'Una vez aprobado el test, desbloqueas la siguiente unidad. El ciclo se repite hasta completar las 6 unidades y acceder al Test Final de Certificación.',
                'Once you pass the test, you unlock the next unit. The cycle repeats until all 6 units are completed and you unlock the Final Certification Test.'
              )
            }
          ].map(({ n, color, title, desc }) => (
            <div key={n} className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2" style={{ backgroundColor: `${color}15`, borderColor: color }}>
                <span className="font-bold text-sm" style={{ color }}>{n}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1" style={{ color }}>{title}</h4>
                <p className="text-sm text-gray-400 text-justify">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'evaluacion',
      title: t('Sistema de Evaluación', 'Assessment System'),
      icon: <FileCheck className="w-5 h-5" />,
      color: '#f59e0b',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <h4 className="text-orange-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('Nota Mínima por Unidad: 60%', 'Minimum Grade per Unit: 60%')}
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              {t(
                'Necesitas al menos un 60% de respuestas correctas en los tests de cada unidad temática (25 preguntas, 30 minutos).',
                'You need at least 60% correct answers in each unit test (25 questions, 30 minutes).'
              )}
            </p>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('Nota Mínima Test Final: 70%', 'Minimum Grade Final Test: 70%')}
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              {t(
                'El Test Final de Certificación requiere un mínimo del 70% para obtener el certificado (40 preguntas, 60 minutos).',
                'The Final Certification Test requires a minimum of 70% to obtain the certificate (40 questions, 60 minutes).'
              )}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <h4 className="text-blue-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('3 Oportunidades', '3 Attempts')}
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              {t(
                'Cada test puede realizarse hasta 3 veces. Entre intentos, puedes revisar el material del tema para reforzar los conceptos.',
                'Each test can be taken up to 3 times. Between attempts, you can review the unit material to reinforce concepts.'
              )}
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-pink-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              {t('Política de Fallos', 'Failure Policy')}
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              {t(
                'Si agotas los 3 intentos sin aprobar, el curso quedará bloqueado. Deberás contactar con soporte para reinscribirte.',
                'If you exhaust all 3 attempts without passing, the course will be locked. You will need to contact support to re-enrol.'
              )}
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'certificacion',
      title: t('Test Final y Certificación', 'Final Test & Certification'),
      icon: <Trophy className="w-5 h-5" />,
      color: '#eab308',
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-2 border-yellow-500/30 p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <h4 className="text-yellow-400 font-bold text-lg">{t('Evaluación Final Integral', 'Comprehensive Final Assessment')}</h4>
            </div>
            <p className="text-gray-300 text-justify mb-4">
              {t(
                'Al completar y aprobar los tests de las 6 unidades, se desbloquea el Test Final de Certificación, que evalúa de forma integrada todos los contenidos del curso ANFORA.',
                'After completing and passing all 6 unit tests, the Final Certification Test is unlocked, providing an integrated evaluation of all ANFORA course content.'
              )}
            </p>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-[#111827]/50 p-3 rounded-lg">
                <div className="text-yellow-500 font-semibold text-sm mb-1">{t('Duración', 'Duration')}</div>
                <div className="text-gray-400 text-xs">60 {t('minutos', 'minutes')}</div>
              </div>
              <div className="bg-[#111827]/50 p-3 rounded-lg">
                <div className="text-yellow-500 font-semibold text-sm mb-1">{t('Preguntas', 'Questions')}</div>
                <div className="text-gray-400 text-xs">40 {t('ítems', 'items')}</div>
              </div>
              <div className="bg-[#111827]/50 p-3 rounded-lg">
                <div className="text-yellow-500 font-semibold text-sm mb-1">{t('Nota mín.', 'Min. grade')}</div>
                <div className="text-gray-400 text-xs">70%</div>
              </div>
            </div>
          </div>

          <div className="bg-[#1f2937] border border-emerald-500/30 p-4 rounded-lg">
            <h4 className="text-emerald-400 font-semibold mb-2">🎓 {t('Certificado Digital', 'Digital Certificate')}</h4>
            <p className="text-sm text-gray-300 text-justify">
              {t(
                'Al aprobar el Test Final, recibirás un certificado digital verificable que acredita tus conocimientos sobre la gestión de la huella hídrica con la plataforma ANFORA.',
                'Upon passing the Final Test, you will receive a verifiable digital certificate accrediting your knowledge of water footprint management using the ANFORA platform.'
              )}
            </p>
          </div>

          <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {t('Sistema Anti-Copia', 'Anti-Cheating System')}
            </h4>
            <p className="text-sm text-gray-300 text-justify">
              {t(
                <>Durante el Test Final, el sistema detecta automáticamente si <span className="text-red-400 font-semibold">cambias de pestaña, ventana o aplicación</span>. Cualquier intento de abandonar la pantalla del test se registrará y podría resultar en la <span className="text-red-400 font-semibold">anulación automática</span> del examen.</>,
                <>During the Final Test, the system automatically detects if you <span className="text-red-400 font-semibold">switch tabs, windows or applications</span>. Any attempt to leave the test screen will be logged and may result in the <span className="text-red-400 font-semibold">automatic cancellation</span> of the exam.</>
              )}
            </p>
          </div>
        </div>
      )
    }
  ];
  ];

  return (
    <div className="w-full mb-12">
      {/* Título Principal */}
      <div className="text-center mb-10">
        <h2 className="text-4xl font-extrabold text-white mb-3">
          {t('Estructura del Curso', 'Course Structure')}
        </h2>
        <div className="h-1 w-32 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mx-auto rounded-full"></div>
      </div>

      {/* Descripción */}
      <div className="max-w-2xl mx-auto text-center mb-12">
        <p className="text-gray-400 text-lg leading-relaxed">
          {t(
            <> Un sistema de aprendizaje estructurado que combina teoría, práctica y evaluación continua para garantizar la <span className="text-[#a1db87] font-semibold">máxima retención de conocimientos</span>.</>,
            <> A structured learning system combining theory, practice and continuous assessment to ensure <span className="text-[#a1db87] font-semibold">maximum knowledge retention</span>.</>
          )}
        </p>
      </div>

      {/* Secciones expandibles */}
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
              <div
                className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-[#1f2937] to-[#111827] border-2'
                    : 'bg-[#1f2937] border border-gray-700 hover:border-gray-600'
                }`}
                style={{
                  backgroundColor: 'rgb(31, 41, 55)',
                  borderColor: activeSection === section.id ? section.color : undefined
                }}
              >
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
                  <div className="bg-[#111827] rounded-b-xl p-6 mt-[-8px] pt-8" style={{ backgroundColor: 'rgb(17, 24, 39)' }}>
                    {section.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1f2937] to-[#111827] border border-[#a1db87]/30 rounded-full">
          <Zap className="w-4 h-4 text-[#a1db87]" />
          <span className="text-sm text-gray-300">
            {t(
              <> Diseñado para <span className="text-[#a1db87] font-semibold">maximizar tu aprendizaje</span></>,
              <> Designed to <span className="text-[#a1db87] font-semibold">maximise your learning</span></>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
