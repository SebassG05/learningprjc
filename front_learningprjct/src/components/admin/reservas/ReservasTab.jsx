// PROVISIONAL (fase 0): contenido anterior de la pestaña, movido tal cual desde CorrecionesAdmin.jsx.
// Se rehace en la fase 2.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, User, Calendar, BookOpen, Users, Lock, Unlock, ChevronLeft } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function ReservasTab() {
  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseEnrollments, setCourseEnrollments] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [togglingCourse, setTogglingCourse] = useState(false);

  const cargarCursos = async () => {
    try {
      setLoadingCourses(true);
      const response = await fetch(`${apiUrl}/api/courses`);
      const data = await response.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      showToast('Error al cargar los cursos', 'error');
    } finally {
      setLoadingCourses(false);
    }
  };

  const verReservasCurso = async (course) => {
    setSelectedCourse(course);
    setLoadingEnrollments(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/users/admin/courses/${course._id}/enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(`Error del servidor: ${data.error || response.status}`, 'error');
        setCourseEnrollments([]);
        return;
      }
      setCourseEnrollments(data.enrollments || []);
    } catch {
      showToast('Error de conexión al cargar las reservas', 'error');
      setCourseEnrollments([]);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const toggleAbrirCurso = async (course) => {
    setTogglingCourse(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/courses/${course._id}/toggle-open`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCourses(prev => prev.map(c => c._id === course._id ? { ...c, isOpen: data.isOpen } : c));
      if (selectedCourse?._id === course._id) {
        setSelectedCourse(prev => ({ ...prev, isOpen: data.isOpen }));
      }
      showToast(data.message, 'success');
    } catch {
      showToast('Error al cambiar el estado del curso', 'error');
    } finally {
      setTogglingCourse(false);
    }
  };

  useEffect(() => {
    cargarCursos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- provisional (fase 0)
  }, []);

  return (
          <motion.div key="reservas" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!selectedCourse ? (
              <>
                <h2 className="text-2xl font-bold text-ink mb-6">Reservas por Curso</h2>
                {loadingCourses ? (
                  <div className="flex justify-center py-16">
                    <Loader className="w-10 h-10 text-green-500 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                      <motion.div
                        key={course._id}
                        whileHover={{ y: -4, boxShadow: '0 12px 32px rgba(34,197,94,0.15)' }}
                        className="bg-surface-2/40 border border-line rounded-2xl overflow-hidden cursor-pointer hover:border-green-700/50 transition-colors"
                        onClick={() => verReservasCurso(course)}
                      >
                        <div className="h-36 bg-green-900/20 flex items-center justify-center overflow-hidden">
                          {course.image ? (
                            <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-14 h-14 text-green-700" />
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="text-ink font-bold text-base leading-snug mb-3">{course.title}</h3>
                          <div className="flex items-center justify-between">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${
                              course.isOpen
                                ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {course.isOpen ? <><Unlock className="w-3 h-3" /> Abierto</> : <><Lock className="w-3 h-3" /> Cerrado</>}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Users className="w-3.5 h-3.5" />
                              Ver reservas
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Vista detalle: alumnos inscritos en el curso seleccionado */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setSelectedCourse(null); setCourseEnrollments([]); }}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Volver a cursos
                    </button>
                    <button
                      onClick={() => verReservasCurso(selectedCourse)}
                      disabled={loadingEnrollments}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition-colors text-sm disabled:opacity-40"
                      title="Recargar reservas"
                    >
                      <Loader className={`w-4 h-4 ${loadingEnrollments ? 'animate-spin text-green-400' : ''}`} />
                      Recargar
                    </button>
                  </div>
                  <button
                    onClick={() => toggleAbrirCurso(selectedCourse)}
                    disabled={togglingCourse}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 ${
                      selectedCourse.isOpen
                        ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                        : 'bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-500/30'
                    }`}
                  >
                    {togglingCourse ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : selectedCourse.isOpen ? (
                      <><Lock className="w-4 h-4" /> Cerrar Curso</>
                    ) : (
                      <><Unlock className="w-4 h-4" /> Abrir Curso</>
                    )}
                  </button>
                </div>

                <div className="bg-surface-2/40 border border-line rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      {selectedCourse.image ? (
                        <img src={selectedCourse.image} alt={selectedCourse.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-green-700" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-ink">{selectedCourse.title}</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {courseEnrollments.length} {courseEnrollments.length === 1 ? 'persona ha reservado' : 'personas han reservado'} este curso
                      </p>
                    </div>
                  </div>
                </div>

                {loadingEnrollments ? (
                  <div className="flex justify-center py-16">
                    <Loader className="w-10 h-10 text-green-500 animate-spin" />
                  </div>
                ) : courseEnrollments.length === 0 ? (
                  <div className="bg-surface-2/40 border border-line rounded-xl p-12 text-center">
                    <Users className="w-14 h-14 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nadie ha reservado este curso todavía</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {courseEnrollments.map((enrollment, idx) => (
                      <motion.div
                        key={enrollment.userId || idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.04 }}
                        className="bg-surface-2/40 border border-line rounded-xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-green-900/40 border border-line flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-green-400" />
                          </div>
                          <div>
                            <p className="text-ink font-semibold">{enrollment.name}</p>
                            <p className="text-gray-400 text-sm">{enrollment.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(enrollment.enrolledAt).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
  );
}
