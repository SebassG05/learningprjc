import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ObjetivosSuelos from '../components/cursoSuelos/ObjetivosSuelos';
import ObjetivosCurso from '../components/curso/ObjetivosCurso';
import { BookOpen } from 'lucide-react';

export default function CursoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3007/api/courses/${id}`)
      .then(res => res.json())
      .then(data => {
        setCurso(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <div className="text-center text-gray-400 py-20">Cargando curso...</div>;
  }
  if (!curso) {
    return <div className="text-center text-red-400 py-20">Curso no encontrado</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="flex flex-row items-center justify-between w-full mb-6 gap-8">
        {/* Título a la izquierda */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-white text-left flex-1">
          {curso.title}
        </h1>
        {/* Círculo de progreso a la derecha */}
        <div className="w-24 h-24 rounded-full border-4 border-[#a1db87] bg-[#23272f] shadow-lg flex items-center justify-center">
          <span className="text-2xl font-extrabold text-[#a1db87]">0%</span>
        </div>
      </div>

      {/* Descripción del curso */}
      {curso.description && (
        <p className="text-gray-300 text-base leading-relaxed mb-10 text-justify">
          {curso.description}
        </p>
      )}

      {/* Objetivos genéricos del curso (desde la BD) */}
      <ObjetivosCurso 
        objetivosGenerales={curso.objetivosGenerales}
        objetivosEspecificos={curso.objetivosEspecificos}
      />

      {/* Botón para ver la estructura del curso */}
      <div className="flex justify-center mb-12">
        <button
          onClick={() => navigate(`/curso/${id}/estructura`)}
          className="cursor-pointer group flex items-center gap-3 bg-gradient-to-r from-[#a1db87] to-[#5ec6a6] text-[#1a1a1a] font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-2xl hover:shadow-[#a1db87]/30 transform hover:scale-105 transition-all duration-300"
        >
          <BookOpen className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" />
          <span className="text-lg">Ver Estructura del Curso</span>
        </button>
      </div>

      {/* Componente específico para el curso de Suelos (mantener compatibilidad) */}
      {curso.title === 'Curso Profesional en Gestión de Suelos, Carbono y Cambio Climático' && (
        <ObjetivosSuelos />
      )}
      {/* Aquí puedes añadir más detalles del curso */}
    </div>
  );
}
