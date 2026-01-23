import React, { useEffect, useState } from "react";
import AuthModal from '../components/auth/AuthModal';
import { BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function Cursos() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [pendingCourseId, setPendingCourseId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3007/api/courses")
      .then(res => res.json())
      .then(data => {
        setCourses(data);
        setLoading(false);
      });
  }, []);

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
      navigate(`/curso/${courseId}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      {/* Encabezado animado */}
      <section className="mb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 relative z-10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            className="inline-flex items-center px-1 py-2 bg-[#2a2a2a] border border-[#a1db87]/30 rounded-full mb-1"
          >
            <Sparkles className="w-4 h-4 text-[#a1db87] mr-2 ml-2" />
            <span className="text-xs sm:text-sm font-semibold text-[#a1db87] mr-2">
              Cursos
            </span>
          </motion.div>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-white mb-16 text-center"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.4, 0.0, 0.2, 1] }}
        >
          Nuestros <span className="text-[#a1db87]">Cursos</span>
        </motion.h1>
      </section>

      {/* Modal de login si es necesario */}
      <AuthModal open={showLogin} onClose={handleCloseLogin} />
      {/* Tarjetas de cursos */}
      {/* Grid original: visible en móvil y escritorio, oculto en md (tablet) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-y-10 gap-x-120 place-items-center block md:hidden lg:grid">
        {loading ? (
          <div className="text-center text-gray-400 col-span-3">Cargando cursos...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-400 col-span-3">No hay cursos disponibles.</div>
        ) : (
          courses.map(course => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#23272f] border border-[#a1db87]/30 rounded-2xl shadow-xl p-0 flex flex-col cursor-pointer group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full lg:min-w-[450px] lg:min-h-[340px] xl:min-w-[450px] xl:min-h-[340px] sm:max-w-[95vw] sm:min-h-[220px]"
              style={{}}
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="w-full h-56 rounded-t-2xl overflow-hidden bg-[#a1db87]/30 flex items-center justify-center">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <BookOpen className="w-16 h-16 text-[#a1db87]" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between p-10">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#a1db87] mb-2 leading-tight group-hover:text-white transition-colors duration-200">
                    {course.title}
                  </h3>
                  <p className="text-gray-300 text-base mb-6 min-h-[48px]">{course.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="bg-[#a1db87] text-[#23272f] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-white group-hover:text-[#23272f] transition-colors duration-200 border border-[#a1db87]">
                    {course.duration}
                  </span>
                  {Array.isArray(course.category)
                    ? course.category.map((cat, idx) => (
                        <span key={idx} className="bg-[#23272f] text-[#a1db87] border border-[#a1db87] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-[#a1db87] group-hover:text-[#23272f] transition-colors duration-200">
                          {cat}
                        </span>
                      ))
                    : course.category && (
                        <span className="bg-[#23272f] text-[#a1db87] border border-[#a1db87] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-[#a1db87] group-hover:text-[#23272f] transition-colors duration-200">
                          {course.category}
                        </span>
                      )
                  }
                </div>
                {/* Barra de progreso */}
                <div className="w-full mt-4">
                  <div className="w-full h-2 bg-[#23272f] rounded-full overflow-hidden border border-[#a1db87]/40">
                  </div>
                  <div className="text-xs text-[#a1db87] mt-1 text-right">0%</div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>

      {/* Grid alternativo SOLO para tablets (md) */}
      <section className="grid grid-cols-1 gap-y-10 gap-x-8 hidden md:grid lg:hidden md:place-items-center">
        {loading ? (
          <div className="text-center text-gray-400 col-span-1">Cargando cursos...</div>
        ) : courses.length === 0 ? (
          <div className="text-center text-gray-400 col-span-1">No hay cursos disponibles.</div>
        ) : (
          courses.map(course => (
            <motion.div
              key={course._id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#23272f] border border-[#a1db87]/30 rounded-2xl shadow-xl p-0 flex flex-col cursor-pointer group hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 w-full max-w-md min-h-[320px]"
              style={{}}
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="w-full h-56 rounded-t-2xl overflow-hidden bg-[#a1db87]/30 flex items-center justify-center">
                {course.image ? (
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <BookOpen className="w-16 h-16 text-[#a1db87]" />
                )}
              </div>
              <div className="flex-1 flex flex-col justify-between p-10">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#a1db87] mb-2 leading-tight group-hover:text-white transition-colors duration-200">
                    {course.title}
                  </h3>
                  <p className="text-gray-300 text-base mb-6 min-h-[48px]">{course.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  <span className="bg-[#a1db87] text-[#23272f] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-white group-hover:text-[#23272f] transition-colors duration-200 border border-[#a1db87]">
                    {course.duration}
                  </span>
                  {Array.isArray(course.category)
                    ? course.category.map((cat, idx) => (
                        <span key={idx} className="bg-[#23272f] text-[#a1db87] border border-[#a1db87] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-[#a1db87] group-hover:text-[#23272f] transition-colors duration-200">
                          {cat}
                        </span>
                      ))
                    : course.category && (
                        <span className="bg-[#23272f] text-[#a1db87] border border-[#a1db87] font-bold px-3 py-1 rounded-full text-xs shadow group-hover:bg-[#a1db87] group-hover:text-[#23272f] transition-colors duration-200">
                          {course.category}
                        </span>
                      )
                  }
                </div>
              </div>
            </motion.div>
          ))
        )}
      </section>
    </div>
  );
}
