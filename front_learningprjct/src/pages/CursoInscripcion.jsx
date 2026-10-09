import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import { BookOpen, CheckCircle, Clock, Users, Award, ArrowRight, Loader, Target, Sparkles, GraduationCap, CalendarClock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CursoInscripcion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [reservaConfirmada, setReservaConfirmada] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [idioma, setIdioma] = useState(() => localStorage.getItem(`lang_${id}`) || 'es');

  const t = (es, en) => {
    if (idioma === 'en' && en) return en;
    return es || en || '';
  };

  const seleccionarIdioma = (lang) => {
    localStorage.setItem(`lang_${id}`, lang);
    setIdioma(lang);
    setShowLangModal(false);
    if (enrollmentStatus?.enrolled && curso?.isOpen) {
      navigate(`/curso/${id}`);
    }
  };

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

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
        // Mostrar modal de idioma si el curso es bilingüe y no hay preferencia guardada
        const isBilingual = (data.idiomasDisponibles?.includes('es') && data.idiomasDisponibles?.includes('en')) || !!(data.title && data.titleEn);
        const langSaved = localStorage.getItem(`lang_${id}`);
        if (isBilingual && !langSaved) {
          setShowLangModal(true);
        }
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
      })
      .catch(err => {
        console.error('Error al verificar inscripción:', err);
        setCheckingEnrollment(false);
      });
  }, [id, user, apiUrl, navigate]);

  // Manejar redirección cuando estén disponibles tanto el curso como el estado de inscripción
  useEffect(() => {
    if (checkingEnrollment || loading || !enrollmentStatus || !curso) return;
    if (showLangModal) return; // Esperar a que el usuario elija idioma
    if (enrollmentStatus.enrolled) {
      const isComingSoonCourse = !curso.isOpen;
      if (isComingSoonCourse) {
        setReservaConfirmada(true);
      } else {
        navigate(`/curso/${id}`);
      }
    }
  }, [enrollmentStatus, curso, checkingEnrollment, loading, navigate, id, showLangModal]);

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
        const isComingSoonCourse = !curso.isOpen;
        if (isComingSoonCourse) {
          setReservaConfirmada(true);
          setEnrolling(false);
        } else {
          setTimeout(() => {
            navigate(`/curso/${id}`);
          }, 500);
        }
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
          <Loader className="w-12 h-12 text-brand animate-spin" />
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
            className="text-brand hover:underline"
          >
            Volver a cursos
          </button>
        </div>
      </div>
    );
  }

  // Calcular número de temas y materiales
  const isComingSoon = !curso.isOpen;
  const totalTemas = curso.temas?.length || 0;
  const totalMateriales = curso.temas?.reduce((acc, tema) => {
    return acc + (tema.materiales?.length || 0) + (tema.actividadesOptativas?.length || 0);
  }, 0) || 0;

  return (
    <>
    {/* Modal de selección de idioma para cursos bilingües */}
    <AnimatePresence>
      {showLangModal && curso && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="bg-canvas border border-line rounded-2xl shadow-card shadow-black/50 p-10 mx-4 max-w-md w-full text-center"
          >
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-brand/10 rounded-full">
                <Globe className="w-8 h-8 text-brand" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-ink mb-2">Selecciona el idioma</h2>
            <p className="text-gray-400 mb-8 text-sm">
              Este curso está disponible en español e inglés. ¿En qué idioma quieres seguirlo?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => seleccionarIdioma('es')}
                className="flex-1 flex flex-col items-center gap-3 p-6 bg-surface-2 border-2 border-line rounded-xl hover:border-brand hover:bg-surface-2/80 transition-all group"
              >
                <span className="text-4xl">🇪🇸</span>
                <div>
                  <p className="text-ink font-bold text-lg group-hover:text-brand transition-colors">Español</p>
                  <p className="text-gray-500 text-xs mt-0.5">Continuar en español</p>
                </div>
              </button>
              <button
                onClick={() => seleccionarIdioma('en')}
                className="flex-1 flex flex-col items-center gap-3 p-6 bg-surface-2 border-2 border-line rounded-xl hover:border-brand hover:bg-surface-2/80 transition-all group"
              >
                <span className="text-4xl">🇬🇧</span>
                <div>
                  <p className="text-ink font-bold text-lg group-hover:text-brand transition-colors">English</p>
                  <p className="text-gray-500 text-xs mt-0.5">Continue in English</p>
                </div>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    <div className="max-w-7xl mx-auto py-16 px-4">
      {/* Header del curso */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-br from-surface to-surface rounded-2xl p-8 md:p-12 border border-line shadow-card mb-8"
      >
        <div className="grid md:grid-cols-3 gap-8">
          {/* Imagen del curso */}
          <div className="md:col-span-1 flex flex-col">
            <div className="w-full h-64 rounded-xl overflow-hidden bg-brand/10 flex items-center justify-center border-2 border-line">
              {curso.image ? (
                <img src={curso.image} alt={t(curso.title, curso.titleEn)} className="w-full h-full object-cover" />
              ) : (
                <BookOpen className="w-24 h-24 text-brand" />
              )}
            </div>
            
            {/* Categorías */}
            {curso.category && (
              <div className="flex flex-wrap gap-2 mt-4 mb-6">
                {Array.isArray(curso.category) ? (
                  curso.category.map((cat, idx) => (
                    <span
                      key={idx}
                      className="bg-brand/10 text-brand border border-line px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="bg-brand/10 text-brand border border-line px-3 py-1 rounded-full text-sm font-semibold">
                    {curso.category}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Información del curso */}
          <div className="md:col-span-2">
            <h1 className="text-3xl md:text-4xl font-bold text-ink mb-4">
              {t(curso.title, curso.titleEn)}
            </h1>

            {/* Banner próximo inicio */}
            {isComingSoon && (
              <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mb-4">
                <CalendarClock className="w-5 h-5 text-amber-400 flex-shrink-0" />
                <p className="text-amber-300 font-semibold">
                  Apertura: <span className="text-amber-400 font-bold">mayo de 2026</span>
                </p>
              </div>
            )}

            <p className="text-gray-300 text-lg mb-6 leading-relaxed ">
              {t(curso.description, curso.descriptionEn)}
            </p>

            {/* Stats del curso */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 bg-surface/50 rounded-lg p-3 border border-line">
                <Clock className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-xs text-gray-400">{idioma === 'en' ? 'Duration' : 'Duración'}</p>
                  <p className="text-ink font-semibold">{curso.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface/50 rounded-lg p-3 border border-line">
                <BookOpen className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-xs text-gray-400">{idioma === 'en' ? 'Topics' : 'Temas'}</p>
                  <p className="text-ink font-semibold">{totalTemas} {idioma === 'en' ? 'topics' : 'temas'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-surface/50 rounded-lg p-3 border border-line">
                <Award className="w-5 h-5 text-brand" />
                <div>
                  <p className="text-xs text-gray-400">{idioma === 'en' ? 'Materials' : 'Materiales'}</p>
                  <p className="text-ink font-semibold">{totalMateriales} {idioma === 'en' ? 'resources' : 'recursos'}</p>
                </div>
              </div>
            </div>

            {/* Botón de inscripción / reserva */}
            {reservaConfirmada ? (
              <div className="flex items-center gap-3 bg-brand/10 border border-line rounded-xl px-6 py-4">
                <CheckCircle className="w-6 h-6 text-brand flex-shrink-0" />
                <div>
                  <p className="font-bold text-lg text-brand">{idioma === 'en' ? '\uD83C\uDF89 Spot reserved!' : '\u00A1Plaza reservada!'}</p>
                  <p className="text-sm text-gray-300">{idioma === 'en' ? "We'll notify you when the course opens in May 2026." : 'Te notificaremos cuando el curso abra en mayo de 2026.'}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className={`cursor-pointer w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                  enrolling
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-brand hover:bg-brand-300 text-on-brand hover:shadow-lg hover:shadow-brand/30'
                }`}
              >
                {enrolling ? (
                  <>
                    <Loader className="w-6 h-6 animate-spin" />
                    <span>{isComingSoon ? (idioma === 'en' ? 'Reserving...' : 'Reservando...') : (idioma === 'en' ? 'Enrolling...' : 'Inscribiendo...')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    <span>{isComingSoon ? (idioma === 'en' ? 'Reserve my Spot' : 'Reservar mi Plaza') : (idioma === 'en' ? 'Enroll in Course' : 'Inscribirse al Curso')}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Qué aprenderás - Rediseño profesional */}
      {(curso.objetivosGenerales?.length > 0 || curso.objetivosEspecificos?.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          {/* Header de la sección */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand hover:bg-brand-300 mb-4 shadow-card shadow-brand/30"
            >
              <GraduationCap className="w-8 h-8 text-on-brand" />
            </motion.div>
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-3xl md:text-4xl font-bold text-ink mb-3"
            >
              {idioma === 'en' ? 'Learning Objectives' : 'Objetivos de Aprendizaje'}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="text-gray-400 max-w-2xl mx-auto"
            >
              {idioma === 'en' ? 'Master the essential skills and competencies of this course' : 'Domina las habilidades y competencias esenciales de este curso'}
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Objetivos Generales */}
            {curso.objetivosGenerales?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-brand hover:bg-brand-300 rounded-3xl opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
                <div className="relative bg-surface rounded-3xl p-8 border border-line hover:border-brand/40 transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 border border-line">
                      <Target className="w-6 h-6 text-brand" />
                    </div>
                    <h3 className="text-xl font-bold text-ink">{idioma === 'en' ? 'General Objectives' : 'Objetivos Generales'}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {(idioma === 'en' && curso.objetivosGeneralesEn?.length ? curso.objetivosGeneralesEn : curso.objetivosGenerales).map((objetivo, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 + (idx * 0.1) }}
                        className="flex items-start gap-3 group/item"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-brand/10 border border-line flex items-center justify-center group-hover/item:bg-brand/20 group-hover/item:border-brand/50 transition-all">
                            <div className="w-2 h-2 rounded-full bg-brand"></div>
                          </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed group-hover/item:text-white transition-colors ">
                          {objetivo}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Objetivos Específicos */}
            {curso.objetivosEspecificos?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="group relative"
              >
                <div className="absolute -inset-0.5 bg-brand hover:bg-brand-300 rounded-3xl opacity-20 group-hover:opacity-30 transition duration-500 blur"></div>
                <div className="relative bg-surface rounded-3xl p-8 border border-line hover:border-brand-500/40 transition-all duration-500 h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-line">
                      <Sparkles className="w-6 h-6 text-brand-500" />
                    </div>
                    <h3 className="text-xl font-bold text-ink">{idioma === 'en' ? 'Specific Objectives' : 'Objetivos Específicos'}</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {(idioma === 'en' && curso.objetivosEspecificosEn?.length ? curso.objetivosEspecificosEn : curso.objetivosEspecificos).map((objetivo, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.7 + (idx * 0.1) }}
                        className="flex items-start gap-3 group/item"
                      >
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-brand-500/10 border border-line flex items-center justify-center group-hover/item:bg-brand-500/20 group-hover/item:border-brand-500/50 transition-all">
                            <div className="w-2 h-2 rounded-full bg-brand-500"></div>
                          </div>
                        </div>
                        <p className="text-gray-300 leading-relaxed group-hover/item:text-white transition-colors ">
                          {objetivo}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
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
          className="bg-surface rounded-2xl p-8 border border-line"
        >
          <h2 className="text-2xl font-bold text-brand mb-6 flex items-center gap-3">
            <BookOpen className="w-7 h-7" />
            {idioma === 'en' ? 'Course Content' : 'Contenido del Curso'}
          </h2>
          
          <div className="space-y-4">
            {curso.temas.map((tema, idx) => (
              <div
                key={tema._id}
                className="bg-surface/50 rounded-lg p-5 border border-line hover:border-brand/30 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-10 h-10 rounded-full bg-brand text-on-brand flex items-center justify-center font-bold">
                    {tema.numeroTema}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-ink mb-2">{t(tema.titulo, tema.tituloEn)}</h3>
                    {tema.descripcion && (
                      <p className="text-gray-400 text-sm mb-3 ">{t(tema.descripcion, tema.descripcionEn)}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{tema.materiales?.length || 0} {idioma === 'en' ? 'materials' : 'materiales'}</span>
                      {tema.actividadesOptativas?.length > 0 && (
                        <span>{tema.actividadesOptativas.length} {idioma === 'en' ? 'optional activities' : 'actividades optativas'}</span>
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
    </>
  );
}
