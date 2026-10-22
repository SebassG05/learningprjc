import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import ObjetivosSuelos from '../components/cursoSuelos/ObjetivosSuelos';
import ObjetivosCurso from '../components/curso/ObjetivosCurso';
import MaterialEstudio from '../components/curso/MaterialEstudio';
import EjercicioOptativo from '../components/curso/EjercicioOptativo';
import TermsGate from '../components/courses/TermsGate';
import { authFetch } from '../lib/courseFiles';
import { PRIVATE } from '../components/courses/coursesCopy';
import { courseIsOpen, formatCohortDate } from '../components/courses/sheet/privateAccess';
import { BookOpen, Lock, AlertCircle, Clock, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { duration, ease, spring } from '../lib/motion';

export default function CursoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completedMaterials, setCompletedMaterials] = useState({});
  const [completedTests, setCompletedTests] = useState([]);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);
  const [ejerciciosOptativos, setEjerciciosOptativos] = useState([]);
  const [idiomaSeleccionado, setIdiomaSeleccionado] = useState(() => localStorage.getItem(`lang_${id}`) || null);
  const [showLangModal, setShowLangModal] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';

  // Devuelve el texto en el idioma seleccionado
  const t = (es, en) => {
    if (idiomaSeleccionado === 'en' && en) return en;
    return es || en || '';
  };

  const seleccionarIdioma = (lang) => {
    localStorage.setItem(`lang_${id}`, lang);
    setIdiomaSeleccionado(lang);
    setShowLangModal(false);
  };

  // Releer el idioma desde localStorage al montar (por si se guardó justo antes de navegar aquí)
  useEffect(() => {
    const saved = localStorage.getItem(`lang_${id}`);
    if (saved) setIdiomaSeleccionado(saved);
  }, [id]);

  // Verificar si el usuario está logueado y verificar inscripción
  useEffect(() => {
    if (!user) {
      navigate('/cursos');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/cursos');
      return;
    }

    // Verificar estado de inscripción
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
        
        // Cargar tests completados si existen
        if (data.completedTests) {
          setCompletedTests(data.completedTests);
        }
        
        // Cargar materiales completados si existen
        if (data.completedMaterials && data.completedMaterials.length > 0) {
          const materialsObj = {};
          data.completedMaterials.forEach(materialId => {
            materialsObj[materialId] = true;
          });
          setCompletedMaterials(materialsObj);
        }
        
        // Si no está inscrito, redirigir a la página de inscripción
        if (!data.enrolled) {
          navigate(`/curso/${id}/inscripcion`);
        }
      })
      .catch(err => {
        console.error('Error al verificar inscripción:', err);
        setCheckingEnrollment(false);
        navigate(`/curso/${id}/inscripcion`);
      });
  }, [id, user, apiUrl, navigate]);

  useEffect(() => {
    // Con el token: en un curso privado el backend solo da el contenido a quien tiene acceso
    authFetch(`${apiUrl}/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        // Curso privado sin acceso (plaza aún reservada, edición retirada…): la ficha lo explica
        if (data.accessMode === 'private' && data.access && !['full', 'readonly'].includes(data.access.level)) {
          navigate(`/curso/${id}/inscripcion`, { replace: true });
          return;
        }
        setCurso(data);
        setLoading(false);
        // Si el curso es bilingüe y el usuario no ha elegido idioma aún, mostrar modal
        const esBilingue = (data.idiomasDisponibles?.includes('es') && data.idiomasDisponibles?.includes('en')) || !!(data.title && data.titleEn);
        if (esBilingue && !localStorage.getItem(`lang_${id}`)) {
          setShowLangModal(true);
        }
      });
  }, [id, apiUrl, navigate]);

  // Cargar ejercicios optativos
  useEffect(() => {
    authFetch(`${apiUrl}/api/ejercicios/curso/${id}?temaId=final`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEjerciciosOptativos(data);
        }
      })
      .catch(err => console.error('Error al cargar ejercicios:', err));
  }, [id, apiUrl]);

  // Calcular el porcentaje de progreso
  const calculateProgress = () => {
    if (!curso || !curso.temas) return 0;
    
    let totalItems = 0;
    let completedItems = 0;
    
    curso.temas.forEach(tema => {
      // Contar materiales
      if (tema.materiales && tema.materiales.length > 0) {
        tema.materiales.forEach(material => {
          if (material.archivo) {
            totalItems++;
            if (completedMaterials[material._id]) {
              completedItems++;
            }
          }
        });
      }
      
      // Contar tests (cada tema tiene 1 test)
      totalItems++;
      if (completedTests.includes(tema._id)) {
        completedItems++;
      }
    });
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  };

  // Verificar si el curso está completado (test final de certificación aprobado)
  const isCursoCompletado = () => {
    return completedTests.includes('test-final-certificacion');
  };

  // Actualizar progreso en el backend cuando cambie
  useEffect(() => {
    if (!user || !enrollmentStatus?.enrolled || !curso) return;

    const progress = calculateProgress();
    const token = localStorage.getItem('token');
    
    // Convertir completedMaterials object a array de IDs
    const completedMaterialsArray = Object.keys(completedMaterials).filter(
      key => completedMaterials[key]
    );
    
    if (token) {
      fetch(`${apiUrl}/api/users/enrollment/${id}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          progress,
          completedMaterials: completedMaterialsArray
        })
      })
        .then(res => res.json())
        .catch(err => console.error('Error al actualizar progreso:', err));
    }
  }, [completedMaterials, completedTests, curso, user, enrollmentStatus, id, apiUrl]);

  // Recargar enrollment cuando el documento vuelva a estar visible (usuario regresa del test)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user) {
        const token = localStorage.getItem('token');
        if (token) {
          fetch(`${apiUrl}/api/users/enrollment/${id}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
            .then(res => res.json())
            .then(data => {
              setEnrollmentStatus(data);
              if (data.completedTests) {
                setCompletedTests(data.completedTests);
              }
              if (data.completedMaterials && data.completedMaterials.length > 0) {
                const materialsObj = {};
                data.completedMaterials.forEach(materialId => {
                  materialsObj[materialId] = true;
                });
                setCompletedMaterials(materialsObj);
              }
            })
            .catch(err => console.error('Error al actualizar enrollment:', err));
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [id, user, apiUrl]);

  const progress = calculateProgress();

  if (loading || checkingEnrollment) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:px-8" role="status" aria-busy="true">
        <span className="sr-only">Cargando curso...</span>
        <div className="mb-10 aspect-[16/9] w-full animate-pulse rounded-3xl bg-surface sm:aspect-[21/7]" />
        <div className="h-12 w-3/4 animate-pulse rounded-2xl bg-surface" />
        <div className="mt-3 h-12 w-1/2 animate-pulse rounded-2xl bg-surface" />
        <div className="mt-10 max-w-3xl space-y-3">
          {[100, 96, 92, 70].map((w) => (
            <div key={w} className="h-4 animate-pulse rounded-lg bg-surface" style={{ width: `${w}%` }} />
          ))}
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-64 animate-pulse rounded-3xl bg-surface" />
          <div className="h-64 animate-pulse rounded-3xl bg-surface" />
        </div>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
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

  // Si no está inscrito, no mostrar contenido
  if (!enrollmentStatus?.enrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <Lock className="w-16 h-16 text-brand mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-ink mb-4">Acceso Restringido</h2>
          <p className="text-gray-400 mb-6">
            Debes inscribirte en este curso para acceder al contenido.
          </p>
          <button
            onClick={() => navigate(`/curso/${id}/inscripcion`)}
            className="bg-brand hover:bg-brand-300 text-on-brand font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-brand/30 transition-all"
          >
            Ir a la página de inscripción
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Condiciones de confidencialidad: se vuelven a pedir si cambió la versión */}
      <TermsGate courseId={id} courseTitle={t(curso.title, curso.titleEn)} enabled={Boolean(enrollmentStatus?.enrolled)} />
      {/* Modal de selección de idioma para cursos bilingües */}
      <AnimatePresence>
        {showLangModal && (
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
              <h2 className="text-2xl font-bold text-ink mb-2">
                {curso.title && curso.titleEn ? 'Selecciona el idioma' : 'Select your language'}
              </h2>
              <p className="text-gray-400 mb-8 text-sm">
                {curso.title && curso.titleEn
                  ? 'Este curso está disponible en español e inglés. ¿En qué idioma quieres seguirlo?'
                  : 'This course is available in Spanish and English. Which language would you like?'}
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

      <div className="mx-auto max-w-[1200px] px-4 pt-14 pb-10 sm:px-6 sm:pt-20 lg:px-8">
        {curso.image && (
          <motion.div
            initial={{ opacity: 0, scale: 0.86, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0, transition: { ...spring.gentle, opacity: { duration: duration.slow, ease: ease.outExpo } } }}
            className="relative mb-10 aspect-[16/9] w-full origin-top overflow-hidden rounded-3xl border border-line bg-surface shadow-raised sm:aspect-[21/7]"
          >
            <motion.img
              src={curso.image}
              alt=""
              decoding="async"
              initial={{ scale: 1.12 }}
              animate={{ scale: 1, transition: { duration: duration.reveal * 1.4, ease: ease.outExpo } }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/70 via-transparent to-transparent" aria-hidden="true" />
          </motion.div>
        )}
        <div className="mb-8 flex w-full flex-row items-start justify-between gap-8">
          {/* Título a la izquierda */}
          <div className="flex-1">
            <h1 className="max-w-4xl text-title-1 font-bold text-ink text-left">
              {t(curso.title, curso.titleEn)}
            </h1>
            {/* Curso privado con la edición terminada: se puede repasar, no entregar */}
            {curso.access?.level === 'readonly' ? (
              <p role="note" className="mt-4 inline-flex max-w-2xl items-start gap-2 rounded-xl bg-white/[0.04] px-4 py-3 text-callout text-ink-2 ring-1 ring-inset ring-line-strong">
                <Lock className="mt-0.5 h-4 w-4 shrink-0 text-dawn" aria-hidden="true" />
                <span>{PRIVATE.lead.readonly(formatCohortDate(curso.access.endsAt))}</span>
              </p>
            ) : null}
            {/* Selector de idioma para cursos bilingües */}
            {curso.idiomasDisponibles?.includes('es') && curso.idiomasDisponibles?.includes('en') && (
              <div className="mt-5 inline-flex items-center gap-1 rounded-full bg-white/[0.05] p-1">
                <Globe className="mx-1.5 h-4 w-4 text-ink-3" />
                <button
                  onClick={() => seleccionarIdioma('es')}
                  className={`relative rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    idiomaSeleccionado !== 'en'
                      ? 'text-on-brand'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {idiomaSeleccionado !== 'en' && <motion.span layoutId="idioma-curso" transition={spring.glide} className="absolute inset-0 rounded-full bg-brand" />}
                  <span className="relative">🇪🇸 ES</span>
                </button>
                <button
                  onClick={() => seleccionarIdioma('en')}
                  className={`relative rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    idiomaSeleccionado === 'en'
                      ? 'text-on-brand'
                      : 'text-ink-2 hover:text-ink'
                  }`}
                >
                  {idiomaSeleccionado === 'en' && <motion.span layoutId="idioma-curso" transition={spring.glide} className="absolute inset-0 rounded-full bg-brand" />}
                  <span className="relative">🇬🇧 EN</span>
                </button>
              </div>
            )}
          </div>
          {/* Círculo de progreso a la derecha */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fondo */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="rgb(255 255 255 / 0.08)"
                strokeWidth="6"
              />
              {/* Círculo de progreso */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#a1db87"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                className="transition-[stroke-dashoffset] duration-1000 ease-out-expo"
              />
            </svg>
            {/* Porcentaje en el centro */}
            <span className="absolute text-xl font-semibold tabular-nums text-ink">
              {progress}%
            </span>
          </div>
        </div>

        {/* Descripción del curso */}
        {(curso.description || curso.descriptionEn) && (
          <p className="mb-12 max-w-3xl text-lg leading-relaxed text-ink-2">
            {t(curso.description, curso.descriptionEn)}
          </p>
        )}

        {/* Banner apertura próximamente */}
        {!courseIsOpen(curso) && (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-6 py-4 mb-10">
            <Clock className="w-6 h-6 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-300 font-bold text-lg">Curso próximamente</p>
              <p className="text-gray-400 text-sm">El contenido del curso estará disponible próximamente. Tu plaza ya está reservada.</p>
            </div>
          </div>
        )}
        <ObjetivosCurso 
          objetivosGenerales={idiomaSeleccionado === 'en' ? (curso.objetivosGeneralesEn?.length ? curso.objetivosGeneralesEn : curso.objetivosGenerales) : curso.objetivosGenerales}
          objetivosEspecificos={idiomaSeleccionado === 'en' ? (curso.objetivosEspecificosEn?.length ? curso.objetivosEspecificosEn : curso.objetivosEspecificos) : curso.objetivosEspecificos}
          idioma={idiomaSeleccionado || 'es'}
        />
      </div>

      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Botón para ver la estructura del curso */}
        <div className="mb-24 flex justify-start">
          <button
            onClick={() => navigate(`/curso/${id}/estructura`)}
            className="group flex items-center gap-2.5 rounded-full bg-brand px-7 py-3.5 font-semibold text-on-brand shadow-card transition-colors duration-200 hover:bg-brand-300"
          >
            <BookOpen className="h-5 w-5" />
            <span className="text-base">{idiomaSeleccionado === 'en' ? 'View Course Structure' : 'Ver Estructura del Curso'}</span>
          </button>
        </div>
      </div>

      {/* Material de Estudio - Temas y PDFs */}
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <MaterialEstudio 
          cursoId={id}
          temas={curso.temas} 
          completedMaterials={completedMaterials}
          setCompletedMaterials={setCompletedMaterials}
          completedTests={completedTests}
          idioma={idiomaSeleccionado || 'es'}
        />
        
        {/* Mensaje de Curso Completado */}
        {isCursoCompletado() && (
          <div className="mt-16 mb-16">
            <div className="bg-gradient-to-r from-brand/10 to-brand-500/10 border border-line-strong rounded-3xl p-10 shadow-card shadow-brand/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-brand hover:bg-brand-300 rounded-full flex items-center justify-center mb-6 shadow-card shadow-brand/50 animate-pulse">
                  <span className="text-5xl">🎓</span>
                </div>
                <h2 className="text-4xl font-bold text-ink mb-4">
                  ¡Curso Completado!
                </h2>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                  Felicidades, has completado exitosamente todos los temas y tests del curso. 
                  Tu certificado será enviado a tu correo electrónico en los próximos días.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="bg-surface px-6 py-3 rounded-xl border border-line">
                    <p className="text-gray-400 text-sm">Progreso</p>
                    <p className="text-2xl font-bold text-brand">{progress}%</p>
                  </div>
                  <div className="bg-surface px-6 py-3 rounded-xl border border-line">
                    <p className="text-gray-400 text-sm">Tests completados</p>
                    <p className="text-2xl font-bold text-brand">{completedTests.length}/{curso.temas?.length || 0}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mt-8 px-8 py-3 bg-brand hover:bg-brand-300 text-on-brand font-bold rounded-xl hover:shadow-glow transition-all"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Ejercicios Optativos */}
        {ejerciciosOptativos.length > 0 && (
          <div className="mt-16 mb-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-ink mb-3">
                🎯 Ejercicios Prácticos Optativos
              </h2>
              <p className="text-gray-400 text-lg">
                Complementa tu aprendizaje con estos ejercicios prácticos diseñados para aplicar los conocimientos del curso en escenarios reales.
              </p>
            </div>
            <div className="space-y-6">
              {ejerciciosOptativos.map((ejercicio) => (
                <EjercicioOptativo key={ejercicio._id} ejercicio={ejercicio} cursoId={id} soloLectura={curso.access?.level === 'readonly'} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4">
        {/* Componente específico para el curso de Suelos (mantener compatibilidad) */}
        {curso.title === 'Curso Profesional en Gestión de Suelos, Carbono y Cambio Climático' && (
          <ObjetivosSuelos />
        )}
        {/* Aquí puedes añadir más detalles del curso */}
      </div>
    </>
  );
}
