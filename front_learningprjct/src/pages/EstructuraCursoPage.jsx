import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import EstructuraCurso from '../components/curso/EstructuraCurso';
import { ArrowLeft } from 'lucide-react';

export default function EstructuraCursoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      {/* Botón de volver */}
      <button
        onClick={() => navigate(`/curso/${id}`)}
        className="cursor-pointer flex items-center gap-2 text-[#a1db87] hover:text-white transition-colors duration-200 mb-8 group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
        <span className="font-semibold">Volver al curso</span>
      </button>

      {/* Componente de estructura */}
      <EstructuraCurso />
    </div>
  );
}
