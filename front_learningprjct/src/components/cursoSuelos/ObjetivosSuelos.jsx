import React from "react";

export default function ObjetivosSuelos() {
  return (
    <div className="w-full mb-15 flex flex-col items-center gap-10">
      {/* Objetivos generales */}
      <div className="bg-[#23272f] border-2 border-[#a1db87] rounded-xl shadow-lg p-8 w-full max-w-[90vw] lg:max-w-[1100px] flex flex-col mb-4">
        <div className="flex items-center gap-3 mb-4">
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#a1db87" className="flex-shrink-0">
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" />
          </svg>
          <h2 className="text-xl font-bold text-[#a1db87] tracking-wide uppercase">Objetivos generales</h2>
        </div>
        <ul className="list-disc pl-6 text-base text-[#e0ffe0] space-y-2 font-medium">
          <li>Adquirir una visión integral sobre la gestión <span className="text-[#a1db87] font-bold">sostenible</span> de suelos y el cambio climático.</li>
          <li>Desarrollar competencias para analizar, interpretar y aplicar soluciones en el ámbito ambiental y agrícola.</li>
        </ul>
      </div>

      {/* Objetivos específicos */}
      <div className="bg-[#181c1f] border-2 border-[#5ec6a6] rounded-2xl shadow-xl p-10 w-full max-w-[90vw] lg:max-w-[1100px] flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#5ec6a6" >
            <rect x="4" y="4" width="16" height="16" rx="4" strokeWidth="2" />
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 12l2 2 4-4" />
          </svg>
          <h2 className="text-2xl font-extrabold text-[#5ec6a6] tracking-wide uppercase">Objetivos específicos</h2>
        </div>
        <ul className="list-none space-y-4">
          <li className="flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded bg-[#5ec6a6] flex-shrink-0"></span>
            <span className="text-base text-[#e0f7fa]">Dominar fundamentos del ciclo del carbono y emisiones agrícolas (CO2, N2O, CH4).</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded bg-[#5ec6a6] flex-shrink-0"></span>
            <span className="text-base text-[#e0f7fa]">Introducción práctica a GIS, teledetección y análisis territorial para apoyar decisiones.</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 w-2 h-2 rounded bg-[#5ec6a6] flex-shrink-0"></span>
            <span className="text-base text-[#e0f7fa]">Entender mercados de carbono agrícola y servicios ecosistémicos en Europa.</span>
          </li>
        </ul>
      </div>

        <h2 className="mt-12 text-3xl font-extrabold text-[#a1db87] text-center">Estructura del Curso</h2>
        
    </div>
  );
}
