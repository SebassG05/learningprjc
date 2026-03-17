import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ExternalLink, Clock, Target, CheckCircle, ChevronDown, ChevronUp, AlertCircle, FileUp } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export default function EjercicioOptativo({ ejercicio, cursoId }) {
  const [expandido, setExpandido] = useState(false);
  const [entrega, setEntrega] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  useEffect(() => {
    if (!user || !ejercicio?._id) return;
    const token = localStorage.getItem('token');
    fetch(`${apiUrl}/api/entregas/ejercicio/${ejercicio._id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.entregado) setEntrega(data.entrega); })
      .catch(() => {});
  }, [user, ejercicio?._id]);

  if (!ejercicio) return null;

  const getDificultadColor = (dificultad) => {
    switch (dificultad) {
      case 'basico':
        return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'intermedio':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'avanzado':
        return 'text-red-400 bg-red-400/10 border-red-400/30';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'simulacion':
        return '🔬';
      case 'practica':
        return '🛠️';
      case 'analisis':
        return '📊';
      case 'investigacion':
        return '🔍';
      default:
        return '📋';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-[#23272f]/80 to-[#1a1a1a]/80 rounded-2xl border-2 border-[#5ec6a6]/30 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-[#5ec6a6]/20 transition-all duration-300"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-[#5ec6a6]/20 to-[#4da992]/20 border-b border-[#5ec6a6]/30 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getTipoIcon(ejercicio.tipo)}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">
                    {ejercicio.titulo}
                  </h3>
                  {ejercicio.esOptativo && (
                    <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs font-semibold rounded-full border border-purple-500/30">
                      Optativo
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold border ${getDificultadColor(ejercicio.dificultad)}`}>
                    {ejercicio.dificultad.charAt(0).toUpperCase() + ejercicio.dificultad.slice(1)}
                  </span>
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-4 h-4" />
                    {ejercicio.duracionEstimada}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sello de calificación */}
          {entrega && entrega.calificacion != null && (
            <div className="flex-shrink-0 flex flex-col items-center justify-center relative mr-2">
              <div
                className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center shadow-lg rotate-[-12deg]
                  ${entrega.estado === 'aprobado'
                    ? 'border-green-400 bg-green-900/40 shadow-green-500/30'
                    : entrega.estado === 'rechazado'
                    ? 'border-red-400 bg-red-900/40 shadow-red-500/30'
                    : 'border-yellow-400 bg-yellow-900/40 shadow-yellow-500/30'
                  }`}
              >
                <span
                  className={`text-2xl font-extrabold leading-none
                    ${entrega.estado === 'aprobado' ? 'text-green-400'
                    : entrega.estado === 'rechazado' ? 'text-red-400'
                    : 'text-yellow-400'}`}
                >
                  {entrega.calificacion % 1 === 0 ? entrega.calificacion : entrega.calificacion.toFixed(1)}
                </span>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest
                    ${entrega.estado === 'aprobado' ? 'text-green-400/80'
                    : entrega.estado === 'rechazado' ? 'text-red-400/80'
                    : 'text-yellow-400/80'}`}
                >
                  /10
                </span>
              </div>
              <span
                className={`mt-1 text-[10px] font-bold uppercase tracking-wider rotate-[-12deg]
                  ${entrega.estado === 'aprobado' ? 'text-green-400'
                  : entrega.estado === 'rechazado' ? 'text-red-400'
                  : 'text-yellow-400'}`}
              >
                {entrega.estado === 'aprobado' ? 'Aprobado' : entrega.estado === 'rechazado' ? 'Rechazado' : 'Revisado'}
              </span>
            </div>
          )}

          <button
            onClick={() => setExpandido(!expandido)}
            className="flex-shrink-0 p-2 hover:bg-[#5ec6a6]/10 rounded-lg transition-colors"
          >
            {expandido ? (
              <ChevronUp className="w-6 h-6 text-[#5ec6a6]" />
            ) : (
              <ChevronDown className="w-6 h-6 text-[#5ec6a6]" />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {expandido && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Contexto */}
              <div>
                <h4 className="flex items-center gap-2 text-[#5ec6a6] font-semibold text-sm uppercase tracking-wide mb-3">
                  <Target className="w-4 h-4" />
                  Contexto
                </h4>
                <p className="text-gray-300 leading-relaxed text-justify">
                  {ejercicio.contexto}
                </p>
              </div>

              {/* Enunciado */}
              <div>
                <h4 className="flex items-center gap-2 text-[#5ec6a6] font-semibold text-sm uppercase tracking-wide mb-3">
                  <BookOpen className="w-4 h-4" />
                  Enunciado
                </h4>
                <p className="text-gray-300 leading-relaxed text-justify">
                  {ejercicio.enunciado}
                </p>
              </div>

              {/* Pasos */}
              {ejercicio.pasos && ejercicio.pasos.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-[#5ec6a6] font-semibold text-sm uppercase tracking-wide mb-4">
                    <CheckCircle className="w-4 h-4" />
                    Pasos a seguir
                  </h4>
                  <div className="space-y-4">
                    {ejercicio.pasos.map((paso) => (
                      <div key={paso.numero} className="bg-[#1a1a1a]/50 rounded-lg p-4 border border-[#5ec6a6]/10">
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#5ec6a6] to-[#4da992] flex items-center justify-center text-[#1a1a1a] font-bold text-sm">
                            {paso.numero}
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-white mb-1">
                              {paso.titulo}
                            </h5>
                            <p className="text-gray-400 text-sm mb-2">
                              {paso.descripcion}
                            </p>
                            {paso.detalles && paso.detalles.length > 0 && (
                              <ul className="space-y-1 ml-4">
                                {paso.detalles.map((detalle, idx) => (
                                  <li key={idx} className="text-gray-400 text-sm flex items-start gap-2">
                                    <span className="text-[#5ec6a6] mt-1">•</span>
                                    <span>{detalle}</span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Entregable */}
              {ejercicio.entregable && (
                <div className="bg-gradient-to-br from-[#5ec6a6]/10 to-[#4da992]/10 border border-[#5ec6a6]/30 rounded-xl p-6">
                  <h4 className="flex items-center gap-2 text-[#5ec6a6] font-semibold text-sm uppercase tracking-wide mb-3">
                    <AlertCircle className="w-4 h-4" />
                    Entregable
                  </h4>
                  <p className="text-gray-300 mb-3">
                    {ejercicio.entregable.descripcion}
                  </p>
                  {ejercicio.entregable.preguntas && ejercicio.entregable.preguntas.length > 0 && (
                    <ul className="space-y-2">
                      {ejercicio.entregable.preguntas.map((pregunta, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-gray-300">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#5ec6a6]/20 text-[#5ec6a6] flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{pregunta}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {ejercicio.entregable.limiteCaracteres && (
                    <p className="text-xs text-gray-500 mt-3">
                      * Límite sugerido: {ejercicio.entregable.limiteCaracteres} caracteres (aprox. {Math.round(ejercicio.entregable.limiteCaracteres / 6)} palabras)
                    </p>
                  )}
                </div>
              )}

              {/* Recursos */}
              {ejercicio.recursos && ejercicio.recursos.length > 0 && (
                <div>
                  <h4 className="flex items-center gap-2 text-[#5ec6a6] font-semibold text-sm uppercase tracking-wide mb-3">
                    <ExternalLink className="w-4 h-4" />
                    Recursos necesarios
                  </h4>
                  <div className="space-y-2">
                    {ejercicio.recursos.map((recurso, idx) => (
                      <a
                        key={idx}
                        href={recurso.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between p-4 bg-[#1a1a1a]/50 hover:bg-[#1a1a1a] border border-[#5ec6a6]/10 hover:border-[#5ec6a6]/30 rounded-lg transition-all duration-300"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-white group-hover:text-[#5ec6a6] transition-colors">
                            {recurso.titulo}
                          </p>
                          {recurso.descripcion && (
                            <p className="text-sm text-gray-400 mt-1">
                              {recurso.descripcion}
                            </p>
                          )}
                        </div>
                        <ExternalLink className="w-5 h-5 text-[#5ec6a6] group-hover:scale-110 transition-transform" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Botón de acción */}
              <div className="pt-4 border-t border-[#5ec6a6]/20 flex gap-3">
                {ejercicio.recursos && ejercicio.recursos.length > 0 && (
                  <button
                    onClick={() => window.open(ejercicio.recursos[0].url, '_blank')}
                    className="cursor-pointer flex-1 px-6 py-3 bg-[#1a1a1a]/80 border-2 border-[#5ec6a6]/30 text-[#5ec6a6] font-semibold rounded-xl hover:bg-[#1a1a1a] hover:border-[#5ec6a6]/50 transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Abrir Herramienta</span>
                  </button>
                )}
                <button
                  onClick={() => navigate(`/curso/${cursoId}/ejercicio/${ejercicio._id}/entregar`, {
                    state: { ejercicio }
                  })}
                  className="cursor-pointer flex-1 px-6 py-3 bg-gradient-to-r from-[#5ec6a6] to-[#4da992] text-[#1a1a1a] font-bold rounded-xl hover:shadow-xl hover:shadow-[#5ec6a6]/50 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <FileUp className="w-5 h-5" />
                  <span>Entregar Ejercicio</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Preview cuando está colapsado */}
      {!expandido && (
        <div className="p-6">
          <p className="text-gray-400 text-sm line-clamp-2">
            {ejercicio.contexto}
          </p>
          <button
            onClick={() => setExpandido(true)}
            className="mt-3 text-[#5ec6a6] hover:text-[#4da992] text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            Ver detalles del ejercicio
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>
      )}
    </motion.div>
  );
}
