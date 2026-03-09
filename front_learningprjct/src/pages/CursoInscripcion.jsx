import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { BookOpen, CheckCircle, Clock, Users, Award, ArrowRight, Loader } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CursoInscripcion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3007';

  // Verificar si el usuario está logueado
  useEffect(() => {
    if (!user) {
      navigate('/cursos');
    }
  }, [user, navigate]);

  // Cargar datos del curso
  useEffect(() => {
    fetch(`${apiUrl}/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCurso(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error al cargar curso:', err);
        setLoading(false);
      });
  }, [id, apiUrl]);

  // Verificar estado de inscripción
  useEffect(() => {
    if (!user) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setCheckingEnrollment(true);
    fetch(`${apiUrl}/api/users/enrollment/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setEnrollmentStatus(data);
        setCheckingEnrollment(false);
        
        // Si ya está inscrito, redirigir al curso
        if (data.enrolled) {
          navigate(`/curso/${id}`);
        }
      })
      .catch(err => {
        console.error('Error al verificar inscripción:', err);
        setCheckingEnrollment(false);
      });
  }, [id, user, apiUrl, navigate]);

  // Función para inscribirse
  const handleEnroll = async () => {
    if (!user) {
      navigate('/cursos');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/cursos');
      return;
    }

    setEnrolling(true);

    try {
      const response = await fetch(`${apiUrl}/api/users/enroll/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Inscripción exitosa, redirigir al curso
        setTimeout(() => {
          navigate(`/curso/${id}`);
        }, 500);
      } else {
        console.error('Error al inscribirse:', data.error);
        alert(data.error || 'Error al inscribirse en el curso');
        setEnrolling(false);
      }
    } catch (error) {
      console.error('Error de red:', error);
      alert('Error de conexión. Por favor intenta de nuevo.');
      setEnrolling(false);
    }
  };

  if (loading || checkingEnrollment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-[#a1db87] animate-spin" />
          <p className="text-gray-400">Cargando información del curso...</p>
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Curso no encontrado</h2>
          <button
            onClick={() => navigate('/cursos')}
            className="text-[#a1db87] hover:underline"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  // Calcular número de temas y materiales
  const totalTemas = curso.temas?.length || 0;
  const totalMateriales = curso.temas?.reduce((acc, tema) => {
    return acc + (tema.materiales?.length || 0) + (tema.actividadesOptativas?.length || 0);
  }, 0) || 0;

  return (
    <div className="max-w-7xl mx-auto py-16 px-4">
      {/* Header del curso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-[#23272f] to-[#1a1a1a] rounded-2xl p-8 md:p-12 border border-[#a1db87]/20 shadow-2xl mb-8"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {/* Imagen del curso */}
          <div className="md:col-span-1 flex flex-col">
            <div className="w-full h-64 rounded-xl overflow-hidden bg-[#a1db87]/10 flex items-center justify-center border-2 border-[#a1db87]/30">
              {curso.image ? (
                <img src={curso.image} alt={curso.title} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-24 h-24 text-[#a1db87]" />
              )}
            </div>
            
            {/* Categorías */}
            {curso.category && (
              <div className="flex flex-wrap gap-2 mt-4 mb-6">
                {Array.isArray(curso.category) ? (
                  curso.category.map((cat, idx) => (
                    <span
                      key={idx}
                      className="bg-[#a1db87]/10 text-[#a1db87] border border-[#a1db87]/30 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="bg-[#a1db87]/10 text-[#a1db87] border border-[#a1db87]/30 px-3 py-1 rounded-full text-sm font-semibold">
                    {curso.category}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Información del curso */}
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              {curso.title}
            </h1>
            <p className="text-gray-300 text-lg mb-6 leading-relaxed text-justify">
              {curso.description}
            </p>

            {/* Stats del curso */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 bg-[#1a1a1a]/50 rounded-lg p-3 border border-[#a1db87]/20">
                <Clock className="w-5 h-5 text-[#a1db87]" />
                <div>
                  <p className="text-xs text-gray-400">Duración</p>
                  <p className="text-white font-semibold">{curso.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#1a1a1a]/50 rounded-lg p-3 border border-[#a1db87]/20">
                <BookOpen className="w-5 h-5 text-[#a1db87]" />
                <div>
                  <p className="text-xs text-gray-400">Temas</p>
                  <p className="text-white font-semibold">{totalTemas} temas</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-[#1a1a1a]/50 rounded-lg p-3 border border-[#a1db87]/20">
                <Award className="w-5 h-5 text-[#a1db87]" />
                <div>
                  <p className="text-xs text-gray-400">Materiales</p>
                  <p className="text-white font-semibold">{totalMateriales} recursos</p>
                </div>
              </div>
            </div>

            {/* Botón de inscripción */}
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className={`cursor-pointer w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                enrolling
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] hover:shadow-lg hover:shadow-[#a1db87]/30 hover:scale-105'
              }`}
            >
              {enrolling ? (
                <>
                  <Loader className="w-6 h-6 animate-spin" />
                  <span>Inscribiendo...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-6 h-6" />
                  <span>Inscribirse al Curso</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Qué aprenderás */}
      {(curso.objetivosGenerales?.length > 0 || curso.objetivosEspecificos?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-[#23272f] rounded-2xl p-8 border border-[#a1db87]/20 mb-8"
        >
          <h2 className="text-2xl font-bold text-[#a1db87] mb-6 flex items-center gap-3">
            <CheckCircle className="w-7 h-7" />
            ¿Qué aprenderás?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {curso.objetivosGenerales?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Objetivos Generales</h3>
                <ul className="space-y-2">
                  {curso.objetivosGenerales.map((objetivo, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#a1db87] flex-shrink-0 mt-0.5" />
                      <span>{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {curso.objetivosEspecificos?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">Objetivos Específicos</h3>
                <ul className="space-y-2">
                  {curso.objetivosEspecificos.map((objetivo, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <CheckCircle className="w-5 h-5 text-[#5ec6a6] flex-shrink-0 mt-0.5" />
                      <span>{objetivo}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Contenido del curso */}
      {curso.temas?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-[#23272f] rounded-2xl p-8 border border-[#a1db87]/20"
        >
          <h2 className="text-2xl font-bold text-[#a1db87] mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            Contenido del Curso
          </h2>
          
          <div className="space-y-4">
            {curso.temas.map((tema, idx) => (
              <div
                key={tema._id}
                className="bg-[#1a1a1a]/50 rounded-lg p-5 border border-[#a1db87]/10 hover:border-[#a1db87]/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-[#a1db87] text-[#1a1a1a] flex items-center justify-center font-bold">
                    {tema.numeroTema}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-2">{tema.titulo}</h3>
                    {tema.descripcion && (
                      <p className="text-gray-400 text-sm mb-3">{tema.descripcion}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{tema.materiales?.length || 0} materiales</span>
                      {tema.actividadesOptativas?.length > 0 && (
                        <span>{tema.actividadesOptativas.length} actividades optativas</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
