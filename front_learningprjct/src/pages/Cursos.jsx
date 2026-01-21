
import React from "react";
import { BookOpen, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Cursos() {
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
    </div>
  );
}
