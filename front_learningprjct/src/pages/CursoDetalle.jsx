import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from '../context/UserContext';
import ObjetivosSuelos from '../components/cursoSuelos/ObjetivosSuelos';
import ObjetivosCurso from '../components/curso/ObjetivosCurso';
import MaterialEstudio from '../components/curso/MaterialEstudio';
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
          <div className="w-24 h-24 rounded-full border-4 border-[#a1db87] bg-[#23272f] shadow-lg flex items-center justify-center transition-all duration-500">
            <span className="text-2xl font-extrabold text-[#a1db87] transition-all duration-500">{progress}%</span>
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
