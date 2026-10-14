import React, { useEffect, useState } from "react";
import AuthModal from '../components/auth/LazyAuthModal';
import { preloadAuthModal } from '../components/auth/loadAuthModal';
import { BookOpen, Clock, Globe, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Container from '../components/ui/Container';
import Reveal from '../components/ui/Reveal';
import SplitText from '../components/ui/SplitText';
import StickyIntro from '../components/ui/StickyIntro';
import ParallaxImage from '../components/ui/ParallaxImage';
import { fadeUp, spring, stagger } from '../lib/motion';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Cursos() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState(null);
  const [courseProgress, setCourseProgress] = useState({});
  const [showLangModal, setShowLangModal] = useState(false);
  const [pendingLangCourse, setPendingLangCourse] = useState(null);

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
    fetch(`${apiUrl}/api/courses`)
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      });
  }, []);

  // Obtener progreso de cada curso si el usuario está autenticado
  useEffect(() => {
    if (!user || courses.length === 0) return;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
    const token = localStorage.getItem('token');
    
    if (!token) return;

    // Obtener progreso de todos los cursos en paralelo
    const progressPromises = courses.map(course =>
      fetch(`${apiUrl}/api/users/enrollment/${course._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => ({
          courseId: course._id,
          progress: data.enrolled ? data.progress || 0 : 0
        }))
        .catch(() => ({
          courseId: course._id,
          progress: 0
        }))
    );

    Promise.all(progressPromises).then(results => {
      const progressMap = {};
      results.forEach(({ courseId, progress }) => {
        progressMap[courseId] = progress;
      });
      setCourseProgress(progressMap);
    });
  }, [user, courses]);

  // Cuando se cierra el modal, si no hay usuario, redirige al home
  const handleCloseLogin = () => {
    setShowLogin(false);
    setPendingCourseId(null);
    if (!user) navigate('/');
  };

  // Cuando el usuario hace clic en un curso
  const handleCourseClick = (courseId) => {
    if (!user) {
      setPendingCourseId(courseId);
      setShowLogin(true);
    } else {
      const course = courses.find(c => c._id === courseId);
      const isBilingual = (course?.idiomasDisponibles?.includes('es') && course?.idiomasDisponibles?.includes('en')) || !!(course?.title && course?.titleEn);
      const langSaved = localStorage.getItem(`lang_${courseId}`);
      if (isBilingual && !langSaved) {
        setPendingLangCourse(course);
        setShowLangModal(true);
      } else {
        navigate(`/curso/${courseId}/inscripcion`);
      }
    }
  };

  const seleccionarIdioma = (lang) => {
    if (!pendingLangCourse) return;
    localStorage.setItem(`lang_${pendingLangCourse._id}`, lang);
    setShowLangModal(false);
    navigate(`/curso/${pendingLangCourse._id}/inscripcion`);
  };

  // Devuelve título y descripción en el idioma guardado para ese curso
  const getCourseText = (course) => {
    const lang = localStorage.getItem(`lang_${course._id}`);
    if (lang === 'en' && course.titleEn) {
      return {
        title: course.titleEn,
        description: course.descriptionEn || course.description
      };
    }
    return {
      title: course.title || course.titleEn,
      description: course.description || course.descriptionEn
    };
  };

  return (
    <Container className="pt-16 pb-24 sm:pt-24">
      {/* Encabezado fijado: las tarjetas se deslizan por encima */}
      <StickyIntro className="mb-14 sm:mb-20">
        <div className="flex flex-col items-start gap-4">
          <Reveal as="span" className="eyebrow">Cursos</Reveal>
          <SplitText as="h1" trigger="mount" className="block text-display font-bold text-ink">
            Nuestros <span className="text-brand">cursos</span>
          </SplitText>
        </div>
      </StickyIntro>

      {/* Modal de login si es necesario */}
      <AuthModal open={showLogin} onClose={handleCloseLogin} />

      {/* Modal de selección de idioma para cursos bilingües */}
      <AnimatePresence>
        {showLangModal && pendingLangCourse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="lang-title"
              initial={{ scale: 0.96, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={spring.gentle}
              className="w-full max-w-md rounded-3xl border border-line bg-surface-2 p-8 text-center shadow-overlay"
            >
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <Globe className="h-6 w-6" />
              </span>
              <h2 id="lang-title" className="mt-5 text-title-3 font-bold text-ink">Selecciona el idioma</h2>
              <p className="mt-2 text-sm text-ink-2">
                Este curso está disponible en español e inglés. ¿En qué idioma quieres seguirlo?
              </p>
              <div className="mt-7 grid grid-cols-2 gap-3">
                <button
                  onClick={() => seleccionarIdioma('es')}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white/[0.03] p-5 transition-colors hover:border-brand/50 hover:bg-brand/[0.06]"
                >
                  <span className="text-3xl" aria-hidden="true">🇪🇸</span>
                  <span className="font-semibold text-ink">Español</span>
                  <span className="text-xs text-ink-3">Continuar en español</span>
                </button>
                <button
                  onClick={() => seleccionarIdioma('en')}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-line bg-white/[0.03] p-5 transition-colors hover:border-brand/50 hover:bg-brand/[0.06]"
                >
                  <span className="text-3xl" aria-hidden="true">🇬🇧</span>
                  <span className="font-semibold text-ink">English</span>
                  <span className="text-xs text-ink-3">Continue in English</span>
                </button>
              </div>
              <button
                onClick={() => setShowLangModal(false)}
                className="mt-6 rounded-full px-4 py-2 text-sm text-ink-3 transition-colors hover:text-ink"
              >
                Cancelar
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tarjetas de cursos (por encima del encabezado fijado) */}
      <div className="relative z-10">
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-3xl border border-line bg-surface">
              <div className="aspect-[16/10] animate-pulse bg-surface-2" />
              <div className="space-y-3 p-7">
                <div className="h-6 w-3/4 animate-pulse rounded-lg bg-surface-2" />
                <div className="h-4 w-full animate-pulse rounded-lg bg-surface-2" />
                <div className="h-4 w-2/3 animate-pulse rounded-lg bg-surface-2" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-line bg-surface py-20 text-center text-ink-2">No hay cursos disponibles.</div>
      ) : (
        <Reveal group step={stagger.cards} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => {
            const { title: courseTitle, description: courseDesc } = getCourseText(course);
            const progress = courseProgress[course._id] || 0;
            return (
              <motion.button
                key={course._id}
                type="button"
                variants={fadeUp}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.985 }}
                transition={spring.snappy}
                className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-surface text-left shadow-card transition-[border-color,box-shadow] duration-300 hover:border-line-strong hover:shadow-raised"
                onClick={() => handleCourseClick(course._id)}
                onPointerEnter={user ? undefined : preloadAuthModal}
                onFocus={user ? undefined : preloadAuthModal}
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-surface-2">
                  {course.image ? (
                    <ParallaxImage
                      src={course.image}
                      strength={6}
                      className="h-full w-full transition-[scale] duration-700 ease-out-expo group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-brand"><BookOpen className="h-12 w-12" /></div>
                  )}
                  {!course.isOpen && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
                      <Clock className="h-3 w-3" />
                      Próximamente
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-sans text-xl font-semibold leading-snug text-ink">{courseTitle}</h3>
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/[0.06] text-ink-2 transition-colors duration-200 group-hover:bg-brand group-hover:text-on-brand">
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-2">{courseDesc}</p>
                  <div className="mt-6 flex flex-wrap gap-1.5">
                    {course.duration && (
                      <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">
                        {course.duration}
                      </span>
                    )}
                    {Array.isArray(course.category)
                      ? course.category.map((cat, idx) => (
                          <span key={idx} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-ink-2">
                            {cat}
                          </span>
                        ))
                      : course.category && (
                          <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-ink-2">
                            {course.category}
                          </span>
                        )
                    }
                  </div>
                  {/* Barra de progreso */}
                  <div className="mt-auto pt-7">
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-ink-3">Progreso</span>
                      <span className="font-semibold tabular-nums text-ink-2">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.08]">
                      <div
                        className="h-full origin-left rounded-full bg-brand transition-transform duration-700 ease-out-expo"
                        style={{ transform: `scaleX(${progress / 100})` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </Reveal>
      )}
      </div>
    </Container>
  );
}
