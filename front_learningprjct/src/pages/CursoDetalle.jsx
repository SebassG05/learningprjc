import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ObjetivosSuelos from '../components/cursoSuelos/ObjetivosSuelos';

export default function CursoDetalle() {
  const { id } = useParams();
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
      <div className="flex flex-row items-center justify-between w-full mb-10 gap-8">
        {/* Título a la izquierda */}
        <h1 className="text-2xl md:text-4xl font-extrabold text-white text-left flex-1">
          {curso.title}
        </h1>
        {/* Círculo de progreso a la derecha */}
        <div className="w-24 h-24 rounded-full border-4 border-[#a1db87] bg-[#23272f] shadow-lg flex items-center justify-center">
          <span className="text-2xl font-extrabold text-[#a1db87]">0%</span>
        </div>
      </div>

      {/* Objetivos - Card moderno */}
      {curso.title === 'Curso Profesional en Gestión de Suelos, Carbono y Cambio Climático' && (
        <ObjetivosSuelos />
      )}
      {/* Aquí puedes añadir más detalles del curso */}
    </div>
  );
}
