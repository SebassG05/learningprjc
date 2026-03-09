import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, ChevronLeft, ChevronRight, Clock, Award, AlertCircle } from 'lucide-react';

export default function TestEvaluacion({ cursoId, temaId, onComplete }) {
  const [test, setTest] = useState(null);
  const [respuestas, setRespuestas] = useState({});
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3007';

  useEffect(() => {
    cargarTest();
  }, [cursoId, temaId]);

  const cargarTest = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/tests/${cursoId}/temas/${temaId}/test`);
      
      if (!response.ok) {
        throw new Error('No se pudo cargar el test');
      }

      const data = await response.json();
      setTest(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar test:', error);
      setLoading(false);
    }
  };

  const seleccionarRespuesta = (numeroPregunta, opcionId) => {
    setRespuestas({
      ...respuestas,
      [numeroPregunta]: opcionId
    });
  };

  const siguientePregunta = () => {
    if (preguntaActual < test.preguntas.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    }
  };

  const preguntaAnterior = () => {
    if (preguntaActual > 0) {
      setPreguntaActual(preguntaActual - 1);
    }
  };

  const enviarTest = async () => {
    // Validar que todas las preguntas estén respondidas
    const preguntasSinResponder = test.preguntas.filter(
      p => !respuestas[p.numero]
    );

    if (preguntasSinResponder.length > 0) {
      alert(`Faltan ${preguntasSinResponder.length} preguntas por responder`);
      return;
    }

    setEnviando(true);

    try {
      const respuestasArray = Object.entries(respuestas).map(([numero, respuesta]) => ({
        numero: parseInt(numero),
        respuesta
      }));

      const response = await fetch(
        `${apiUrl}/api/tests/${cursoId}/temas/${temaId}/test/validar`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ respuestas: respuestasArray })
        }
      );

      const data = await response.json();
      setResultado(data);
      setMostrarResultado(true);

      // Si se aprobó el test, marcarlo como completado
      if (data.aprobado) {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await fetch(
              `${apiUrl}/api/users/enrollment/${cursoId}/test/${temaId}/complete`,
              {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                }
              }
            );
          } catch (error) {
            console.error('Error al marcar test como completado:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error al enviar test:', error);
      alert('Error al enviar el test');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#a1db87]/20 border-t-[#a1db87] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-400">No se pudo cargar el test</p>
        </div>
      </div>
    );
  }

  if (mostrarResultado && resultado) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] via-[#23272f] to-[#1a1a1a] p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-3xl w-full bg-[#23272f]/80 backdrop-blur-sm rounded-3xl p-10 border-2 border-[#a1db87]/20 shadow-2xl"
        >
          <div className="text-center mb-10">
            {resultado.aprobado ? (
              <>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.5, duration: 0.8 }}
                  className="mb-6"
                >
                  <Award className="w-32 h-32 text-[#a1db87] mx-auto drop-shadow-[0_0_30px_rgba(161,219,135,0.5)]" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-3"
                >
                  ¡Felicidades!
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-300 text-lg"
                >
                  Has aprobado el test con éxito
                </motion.p>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", bounce: 0.3 }}
                  className="mb-6"
                >
                  <X className="w-32 h-32 text-red-500 mx-auto drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-5xl font-bold text-red-500 mb-3"
                >
                  No aprobado
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-gray-300 text-lg"
                >
                  Necesitas estudiar un poco más el material
                </motion.p>
              </>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="grid grid-cols-2 gap-6 mb-8"
          >
            <div className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#23272f]/50 p-8 rounded-2xl text-center border border-[#a1db87]/10 shadow-lg">
              <p className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Tu nota</p>
              <p className={`text-6xl font-bold mb-2 ${
                resultado.aprobado 
                  ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6]' 
                  : 'text-red-500'
              }`}>
                {resultado.nota}%
              </p>
              {resultado.aprobado && (
                <div className="flex items-center justify-center gap-2 text-[#a1db87] text-sm">
                  <Check className="w-4 h-4" />
                  <span>Aprobado</span>
                </div>
              )}
            </div>
            <div className="bg-gradient-to-br from-[#1a1a1a]/80 to-[#23272f]/50 p-8 rounded-2xl text-center border border-[#a1db87]/10 shadow-lg">
              <p className="text-gray-400 text-sm font-medium mb-3 uppercase tracking-wider">Aciertos</p>
              <p className="text-6xl font-bold text-white mb-2">
                {resultado.correctas}<span className="text-3xl text-gray-500">/{resultado.totalPreguntas}</span>
              </p>
              <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden mt-4">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(resultado.correctas / resultado.totalPreguntas) * 100}%` }}
                  transition={{ delay: 0.8, duration: 1, ease: "easeOut" }}
                  className={`h-full ${
                    resultado.aprobado 
                      ? 'bg-gradient-to-r from-[#a1db87] to-[#5ec6a6]' 
                      : 'bg-red-500'
                  }`}
                />
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="bg-[#1a1a1a]/50 p-6 rounded-xl mb-8 border border-[#a1db87]/10"
          >
            <div className="flex items-center justify-between">
              <p className="text-gray-300">
                Nota mínima requerida
              </p>
              <span className="text-2xl font-bold text-white">{resultado.notaMinima}%</span>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex gap-4"
          >
            {!resultado.aprobado && (
              <button
                onClick={() => {
                  setMostrarResultado(false);
                  setResultado(null);
                  setRespuestas({});
                  setPreguntaActual(0);
                }}
                className="flex-1 px-8 py-4 bg-[#23272f] text-white font-semibold rounded-xl hover:bg-[#2a2e36] border-2 border-gray-700 hover:border-[#a1db87]/30 transition-all shadow-lg hover:shadow-xl"
              >
                Reintentar Test
              </button>
            )}
            <button
              onClick={onComplete}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold rounded-xl hover:shadow-2xl hover:shadow-[#a1db87]/50 transition-all transform hover:scale-105"
            >
              {resultado.aprobado ? 'Continuar al Siguiente Tema' : 'Volver al Material de Estudio'}
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  const pregunta = test.preguntas[preguntaActual];
  const progreso = ((preguntaActual + 1) / test.preguntas.length) * 100;
  const preguntasRespondidas = Object.keys(respuestas).length;

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-[#1a1a1a] via-[#23272f] to-[#1a1a1a]">
      {/* Header del Test */}
      <div className="bg-[#23272f]/80 backdrop-blur-sm border-b border-[#a1db87]/20 p-6 shadow-lg">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6]">
                {test.titulo}
              </h2>
              <p className="text-sm text-gray-400 mt-2">{test.descripcion}</p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-[#1a1a1a]/50 rounded-lg border border-[#a1db87]/20">
              <Clock className="w-5 h-5 text-[#a1db87]" />
              <span className="text-sm font-medium text-white">{test.duracionMinutos} min</span>
            </div>
          </div>

          {/* Barra de progreso mejorada */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-300 font-medium">
                Pregunta <span className="text-[#a1db87]">{preguntaActual + 1}</span> de {test.preguntas.length}
              </span>
              <span className="text-gray-300 font-medium">
                <span className="text-[#a1db87]">{preguntasRespondidas}</span>/{test.preguntas.length} respondidas
              </span>
            </div>
            <div className="relative h-3 bg-[#1a1a1a]/80 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progreso}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#a1db87] via-[#5ec6a6] to-[#a1db87] shadow-lg"
                style={{
                  boxShadow: '0 0 20px rgba(161, 219, 135, 0.5)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Pregunta */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={preguntaActual}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <div className="mb-8">
                <motion.span 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#a1db87]/20 to-[#5ec6a6]/20 text-[#a1db87] rounded-full text-sm font-semibold border border-[#a1db87]/30 mb-6"
                >
                  {pregunta.bloque}
                </motion.span>
                <motion.h3 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-white mb-2 leading-tight"
                >
                  {pregunta.pregunta}
                </motion.h3>
                <p className="text-gray-500 text-sm">Selecciona la respuesta correcta</p>
              </div>

              <div className="grid gap-4">
                {pregunta.opciones.map((opcion, idx) => {
                  const isSelected = respuestas[pregunta.numero] === opcion.id;
                  
                  return (
                    <motion.button
                      key={opcion.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (idx * 0.1) }}
                      whileHover={{ scale: 1.01, x: 5 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => seleccionarRespuesta(pregunta.numero, opcion.id)}
                      className={`relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 group ${
                        isSelected
                          ? 'border-[#a1db87] bg-gradient-to-r from-[#a1db87]/15 to-[#5ec6a6]/15 shadow-lg shadow-[#a1db87]/20'
                          : 'border-[#a1db87]/10 bg-[#23272f]/50 hover:border-[#a1db87]/40 hover:bg-[#23272f]/80'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="selected"
                          className="absolute inset-0 bg-gradient-to-r from-[#a1db87]/5 to-[#5ec6a6]/5 rounded-2xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="relative flex items-center gap-5">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                          isSelected 
                            ? 'border-[#a1db87] bg-gradient-to-br from-[#a1db87] to-[#5ec6a6] shadow-lg shadow-[#a1db87]/50'
                            : 'border-gray-600 group-hover:border-[#a1db87]/50'
                        }`}>
                          {isSelected ? (
                            <Check className="w-5 h-5 text-[#1a1a1a] font-bold" />
                          ) : (
                            <span className="text-gray-500 group-hover:text-[#a1db87] font-semibold">{opcion.id}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`text-base leading-relaxed transition-colors ${
                            isSelected ? 'text-white font-medium' : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {opcion.texto}
                          </p>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navegación mejorada */}
      <div className="bg-[#23272f]/80 backdrop-blur-sm border-t border-[#a1db87]/20 p-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            {/* Botón Anterior */}
            <button
              onClick={preguntaAnterior}
              disabled={preguntaActual === 0}
              className="flex-shrink-0 px-6 py-3 border-2 border-[#a1db87]/30 text-gray-400 hover:text-white hover:border-[#a1db87] rounded-xl transition-all flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            {/* Mini-mapa de navegación scrollable */}
            <div 
              className="flex-1 overflow-x-auto test-navigation-scroll px-2 py-1"
            >
              <div className="flex gap-2 min-w-max">
                {test.preguntas.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPreguntaActual(index)}
                    className={`flex-shrink-0 w-10 h-10 rounded-lg text-sm font-bold transition-all duration-300 ${
                      index === preguntaActual
                        ? 'bg-gradient-to-br from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] shadow-lg shadow-[#a1db87]/50 scale-110'
                        : respuestas[test.preguntas[index].numero]
                        ? 'bg-[#a1db87]/20 text-[#a1db87] border border-[#a1db87]/50 hover:bg-[#a1db87]/30'
                        : 'bg-[#1a1a1a]/80 text-gray-500 border border-gray-700 hover:text-white hover:border-[#a1db87]/30'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón Siguiente/Finalizar */}
            {preguntaActual === test.preguntas.length - 1 ? (
              <button
                onClick={enviarTest}
                disabled={enviando || preguntasRespondidas < test.preguntas.length}
                className="flex-shrink-0 px-8 py-3 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold rounded-xl hover:shadow-xl hover:shadow-[#a1db87]/50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
              >
                <span className="hidden sm:inline">{enviando ? 'Enviando...' : 'Finalizar Test'}</span>
                <span className="sm:hidden">{enviando ? '...' : 'Finalizar'}</span>
                <Check className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={siguientePregunta}
                className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold rounded-xl hover:shadow-xl hover:shadow-[#a1db87]/50 transition-all flex items-center gap-2"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
