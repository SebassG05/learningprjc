import { motion } from 'framer-motion';

const PageBackground = ({ children }) => {
  return (
    <div className="relative min-h-screen bg-[#333333] overflow-x-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">

        {/* Círculo superior derecho */}
        <motion.div
          className="absolute top-0 right-0 w-1/3 h-1/3 bg-[#a1db87]/10 rounded-full blur-3xl"
          initial={{ y: -400, opacity: 0, scale: 0.3 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            y: { duration: 1.8, ease: "easeOut" },
            opacity: { duration: 1.5, ease: "easeOut" },
            scale: { duration: 1.7, ease: "easeOut" }
          }}
        />

        {/* Círculo medio derecho */}
        <motion.div
          className="absolute top-1/2 -right-20 w-1/4 h-1/4 bg-[#a1db87]/8 rounded-full blur-3xl"
          initial={{ x: 300, y: -300, opacity: 0, scale: 0.4 }}
          animate={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          transition={{
            x: { duration: 2.0, ease: "easeOut", delay: 0.2 },
            y: { duration: 2.0, ease: "easeOut", delay: 0.2 },
            opacity: { duration: 1.5, ease: "easeOut", delay: 0.1 },
            scale: { duration: 1.8, ease: "easeOut", delay: 0.1 }
          }}
        />

        {/* Círculo inferior izquierdo */}
        <motion.div
          className="absolute -bottom-20 -left-20 w-1/3 h-1/3 bg-[#a1db87]/10 rounded-full blur-3xl"
          initial={{ y: 400, opacity: 0, scale: 0.3 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{
            y: { duration: 2.0, ease: "easeOut" },
            opacity: { duration: 1.7, ease: "easeOut" },
            scale: { duration: 1.9, ease: "easeOut" }
          }}
        />

        {/* Cuadrado rotado centro */}
        <motion.div
          className="absolute top-1/3 left-1/2 w-16 h-16 border-2 border-[#a1db87]/20 rotate-45"
          initial={{ scale: 0, opacity: 0, rotate: -315 }}
          animate={{ scale: 1, opacity: 1, rotate: 45 }}
          transition={{
            scale: { duration: 1.2, ease: "easeOut", delay: 0.1 },
            opacity: { duration: 0.8, ease: "easeOut", delay: 0.1 },
            rotate: { duration: 1.4, ease: "easeOut", delay: 0.1 }
          }}
        />

        {/* Cuadrado rotado izquierda */}
        <motion.div
          className="absolute bottom-1/3 left-1/4 w-12 h-12 border border-[#a1db87]/15 rotate-12"
          initial={{ x: -200, opacity: 0, rotate: -348 }}
          animate={{ x: 0, opacity: 1, rotate: 12 }}
          transition={{
            x: { duration: 1.5, ease: "easeOut", delay: 0.3 },
            opacity: { duration: 1.2, ease: "easeOut", delay: 0.2 },
            rotate: { duration: 1.7, ease: "easeOut", delay: 0.2 }
          }}
        />

        {/* Rombo decorativo derecha */}
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-10 h-10 bg-[#a1db87]/20 rotate-45"
          initial={{ x: 150, opacity: 0, rotate: -315, scale: 0.2 }}
          animate={{ x: 0, opacity: 1, rotate: 45, scale: 1 }}
          transition={{
            x: { duration: 1.6, ease: "easeOut", delay: 0.15 },
            opacity: { duration: 1.3, ease: "easeOut", delay: 0.15 },
            rotate: { duration: 1.8, ease: "easeOut", delay: 0.15 },
            scale: { duration: 1.4, ease: "easeOut", delay: 0.15 }
          }}
        />

        {/* Círculo pequeño decorativo */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full border border-[#a1db87]/30"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            scale: { duration: 1.0, ease: "easeOut", delay: 0.25 },
            opacity: { duration: 0.8, ease: "easeOut", delay: 0.25 }
          }}
        />

      </div>

      {/* Contenido de la página */}
      {children}
    </div>
  );
};

export default PageBackground;