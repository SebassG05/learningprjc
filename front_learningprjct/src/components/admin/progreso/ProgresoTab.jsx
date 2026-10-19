// PROVISIONAL (fase 0): contenido anterior de la pestaña, movido tal cual desde CorrecionesAdmin.jsx.
// Se rehace en la fase 3.
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader, User, BookOpen, Users, ChevronLeft, Award, BarChart2 } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

export default function ProgresoTab() {
  const { showToast } = useToast();
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedProgressCourse, setSelectedProgressCourse] = useState(null);
  const [progressEnrollments, setProgressEnrollments] = useState([]);
  const [loadingProgress, setLoadingProgress] = useState(false);

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

  const verProgresoCurso = async (course) => {
    setSelectedProgressCourse(course);
    setLoadingProgress(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/users/admin/courses/${course._id}/enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(`Error del servidor: ${data.error || response.status}`, 'error');
        setProgressEnrollments([]);
        return;
      }
      setProgressEnrollments(data.enrollments || []);
    } catch {
      showToast('Error de conexión al cargar el progreso', 'error');
      setProgressEnrollments([]);
    } finally {
      setLoadingProgress(false);
    }
  };

  useEffect(() => {
    cargarCursos();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- provisional (fase 0)
  }, []);

  return (
          <motion.div key="progreso" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {!selectedProgressCourse ? (
              <>
                <h2 className="text-2xl font-bold text-ink mb-6">Progreso por Curso</h2>
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
                        onClick={() => verProgresoCurso(course)}
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
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <BarChart2 className="w-3.5 h-3.5" />
                            Ver progreso de alumnos
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button
                    onClick={() => { setSelectedProgressCourse(null); setProgressEnrollments([]); }}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver a cursos
                  </button>
                  <button
                    onClick={() => verProgresoCurso(selectedProgressCourse)}
                    disabled={loadingProgress}
                    className="flex items-center gap-1.5 text-gray-400 hover:text-green-400 transition-colors text-sm disabled:opacity-40"
                    title="Recargar progreso"
                  >
                    <Loader className={`w-4 h-4 ${loadingProgress ? 'animate-spin text-green-400' : ''}`} />
                    Recargar
                  </button>
                </div>

                <div className="bg-surface-2/40 border border-line rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-green-900/20 flex items-center justify-center flex-shrink-0">
                      {selectedProgressCourse.image ? (
                        <img src={selectedProgressCourse.image} alt={selectedProgressCourse.title} className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen className="w-8 h-8 text-green-700" />
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-ink">{selectedProgressCourse.title}</h2>
                      <p className="text-gray-400 text-sm mt-1">
                        {progressEnrollments.length} {progressEnrollments.length === 1 ? 'alumno inscrito' : 'alumnos inscritos'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Leyenda de módulos */}
                {selectedProgressCourse.temas && selectedProgressCourse.temas.length > 0 && (
                  <div className="bg-surface-2/30 border border-line rounded-xl p-4 mb-4 flex flex-wrap gap-3 text-xs text-gray-400">
                    {selectedProgressCourse.temas
                      .slice()
                      .sort((a, b) => a.numeroTema - b.numeroTema)
                      .map(tema => (
                        <span key={tema._id} className="flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-green-700/40 border border-green-600/40 flex items-center justify-center font-bold text-green-300">{tema.numeroTema}</span>
                          T{tema.numeroTema}: {tema.titulo.length > 30 ? tema.titulo.substring(0, 30) + '…' : tema.titulo}
                        </span>
                      ))}
                    <span className="flex items-center gap-1">
                      <Award className="w-4 h-4 text-yellow-400" />
                      TF: Test Final
                    </span>
                  </div>
                )}

                {loadingProgress ? (
                  <div className="flex justify-center py-16">
                    <Loader className="w-10 h-10 text-green-500 animate-spin" />
                  </div>
                ) : progressEnrollments.length === 0 ? (
                  <div className="bg-surface-2/40 border border-line rounded-xl p-12 text-center">
                    <Users className="w-14 h-14 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-lg">Nadie está inscrito en este curso</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {progressEnrollments.map((enrollment, idx) => {
                      const temas = selectedProgressCourse.temas
                        ? [...selectedProgressCourse.temas].sort((a, b) => a.numeroTema - b.numeroTema)
                        : [];
                      const completedTests = enrollment.completedTests || [];
                      const testFinalDone = completedTests.includes('test-final-certificacion');
                      return (
                        <motion.div
                          key={enrollment.userId || idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          className="bg-surface-2/40 border border-line rounded-xl px-5 py-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-green-900/40 border border-line flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-green-400" />
                              </div>
                              <div>
                                <p className="text-ink font-semibold">{enrollment.name}</p>
                                <p className="text-gray-400 text-sm">{enrollment.email}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              {/* Barra de progreso */}
                              <div className="flex items-center gap-2">
                                <div className="w-32 h-2 bg-canvas rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-green-500 to-brand-300 rounded-full transition-all"
                                    style={{ width: `${enrollment.progress || 0}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 w-10 text-right">{Math.round(enrollment.progress || 0)}%</span>
                              </div>
                              {/* Badges de módulos */}
                              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                                {temas.map(tema => {
                                  const done = completedTests.includes(tema._id?.toString());
                                  return (
                                    <span
                                      key={tema._id}
                                      title={`Test ${tema.numeroTema}: ${tema.titulo}`}
                                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border ${
                                        done
                                          ? 'bg-green-500/20 border-green-500/50 text-green-300'
                                          : 'bg-gray-800/50 border-gray-700/50 text-gray-600'
                                      }`}
                                    >
                                      {tema.numeroTema}
                                    </span>
                                  );
                                })}
                                {/* Test Final badge */}
                                <span
                                  title="Test Final de Certificación"
                                  className={`px-2 h-7 rounded-full flex items-center justify-center text-xs font-bold border gap-1 ${
                                    testFinalDone
                                      ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                                      : 'bg-gray-800/50 border-gray-700/50 text-gray-600'
                                  }`}
                                >
                                  <Award className="w-3 h-3" />
                                  TF
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </motion.div>
  );
}
