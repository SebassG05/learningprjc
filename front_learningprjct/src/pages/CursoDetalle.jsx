import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import ObjetivosSuelos from '../components/cursoSuelos/ObjetivosSuelos';
import ObjetivosCurso from '../components/curso/ObjetivosCurso';
import MaterialEstudio from '../components/curso/MaterialEstudio';
import EjercicioOptativo from '../components/curso/EjercicioOptativo';
import { BookOpen, Lock, Loader, AlertCircle } from 'lucide-react';

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

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3007';

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
    fetch(`${apiUrl}/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCurso(data);
        setLoading(false);
      });
  }, [id, apiUrl]);

  // Cargar ejercicios optativos
  useEffect(() => {
    fetch(`${apiUrl}/api/ejercicios/curso/${id}?temaId=final`)
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

  // Verificar si el curso está completado (test final completado)
  const isCursoCompletado = () => {
    if (!curso || !curso.temas || curso.temas.length === 0) return false;
    
    // Encontrar el último tema (test final)
    const maxNumeroTema = Math.max(...curso.temas.map(t => t.numeroTema || 0));
    const ultimoTema = curso.temas.find(t => t.numeroTema === maxNumeroTema);
    
    // Verificar si el último tema está en tests completados
    return ultimoTema && completedTests.includes(ultimoTema._id);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-12 h-12 text-[#a1db87] animate-spin" />
          <p className="text-gray-400">Cargando curso...</p>
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
            className="text-[#a1db87] hover:underline"
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
          <Lock className="w-16 h-16 text-[#a1db87] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Acceso Restringido</h2>
          <p className="text-gray-400 mb-6">
            Debes inscribirte en este curso para acceder al contenido.
          </p>
          <button
            onClick={() => navigate(`/curso/${id}/inscripcion`)}
            className="bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#a1db87]/30 transition-all"
          >
            Ir a la página de inscripción
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto py-16 px-4">
        <div className="flex flex-row items-center justify-between w-full mb-6 gap-8">
          {/* Título a la izquierda */}
          <h1 className="text-2xl md:text-4xl font-extrabold text-white text-left flex-1">
            {curso.title}
          </h1>
          {/* Círculo de progreso a la derecha */}
          <div className="relative w-24 h-24 flex items-center justify-center">
            <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
              {/* Círculo de fondo */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#23272f"
                strokeWidth="8"
              />
              {/* Círculo de progreso */}
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#a1db87"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                className="transition-all duration-1000 ease-out"
                style={{
                  filter: 'drop-shadow(0 0 6px rgba(161, 219, 135, 0.4))'
                }}
              />
            </svg>
            {/* Porcentaje en el centro */}
            <span className="absolute text-2xl font-extrabold text-[#a1db87]">
              {progress}%
            </span>
          </div>
        </div>

        {/* Descripción del curso */}
        {curso.description && (
          <p className="text-gray-300 text-base leading-relaxed mb-10 text-justify">
            {curso.description}
          </p>
        )}

        {/* Objetivos genéricos del curso */}
        <ObjetivosCurso 
          objetivosGenerales={curso.objetivosGenerales}
          objetivosEspecificos={curso.objetivosEspecificos}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Botón para ver la estructura del curso */}
        <div className="flex justify-center mb-28">
          <button
            onClick={() => navigate(`/curso/${id}/estructura`)}
            className="cursor-pointer group flex items-center gap-3 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#a1db87]/30 transform hover:scale-105 transition-all duration-300"
          >
            <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-lg">Ver Estructura del Curso</span>
          </button>
        </div>
      </div>

      {/* Material de Estudio - Temas y PDFs */}
      <div className="max-w-7xl mx-auto px-4">
        <MaterialEstudio 
          cursoId={id}
          temas={curso.temas} 
          completedMaterials={completedMaterials}
          setCompletedMaterials={setCompletedMaterials}
          completedTests={completedTests}
        />
        
        {/* Mensaje de Curso Completado */}
        {isCursoCompletado() && (
          <div className="mt-16 mb-16">
            <div className="bg-gradient-to-r from-[#a1db87]/10 to-[#5ec6a6]/10 border-2 border-[#a1db87] rounded-3xl p-10 shadow-2xl shadow-[#a1db87]/20">
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#a1db87] to-[#5ec6a6] rounded-full flex items-center justify-center mb-6 shadow-lg shadow-[#a1db87]/50 animate-pulse">
                  <span className="text-5xl">🎓</span>
                </div>
                <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] mb-4">
                  ¡Curso Completado!
                </h2>
                <p className="text-gray-300 text-lg mb-6 max-w-2xl">
                  Felicidades, has completado exitosamente todos los temas y tests del curso. 
                  Tu certificado será enviado a tu correo electrónico en los próximos días.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <div className="bg-[#23272f] px-6 py-3 rounded-xl border border-[#a1db87]/30">
                    <p className="text-gray-400 text-sm">Progreso</p>
                    <p className="text-2xl font-bold text-[#a1db87]">{progress}%</p>
                  </div>
                  <div className="bg-[#23272f] px-6 py-3 rounded-xl border border-[#a1db87]/30">
                    <p className="text-gray-400 text-sm">Tests completados</p>
                    <p className="text-2xl font-bold text-[#a1db87]">{completedTests.length}/{curso.temas?.length || 0}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/')}
                  className="mt-8 px-8 py-3 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold rounded-xl hover:shadow-2xl hover:shadow-[#a1db87]/50 transition-all transform hover:scale-105"
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
              <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#5ec6a6] to-[#4da992] mb-3">
                🎯 Ejercicios Prácticos Optativos
              </h2>
              <p className="text-gray-400 text-lg">
                Complementa tu aprendizaje con estos ejercicios prácticos diseñados para aplicar los conocimientos del curso en escenarios reales.
              </p>
            </div>
            <div className="space-y-6">
              {ejerciciosOptativos.map((ejercicio) => (
                <EjercicioOptativo key={ejercicio._id} ejercicio={ejercicio} cursoId={id} />
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
