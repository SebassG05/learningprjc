import React from 'react';
import { motion } from 'framer-motion';

export default function Contacto() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center min-h-[60vh] py-16"
    >
      <div className="bg-[#23272f] border border-[#a1db87]/30 rounded-2xl shadow-xl p-10 max-w-xl w-full text-center">
        <h1 className="text-3xl font-bold text-[#a1db87] mb-4">Contacto</h1>
        <p className="text-gray-200 mb-6">¿Tienes dudas, sugerencias o necesitas ayuda? Escríbenos y te responderemos lo antes posible.</p>
        <a href="mailto:soporte@evenor-tech.com" className="inline-block px-7 py-3 rounded-lg bg-[#a1db87] text-[#1a1a1a] font-bold text-lg shadow-md hover:bg-emerald-400 transition-colors duration-200">Enviar correo</a>
      </div>
    </motion.div>
  );
}
