import { motion } from 'framer-motion';
import Container from '../components/ui/Container';

const Home = () => {
  return (
    <section className="relative pt-16 sm:pt-20 pb-8 sm:pb-12">
      <Container>
        {/* Título */}
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-white via-[#a1db87] to-white bg-clip-text text-transparent"
        >
          Bienvenido a Tu Proyecto
        </motion.h1>

        {/* Panel principal con el fondo oscuro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#333333] shadow-2xl"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Tu Contenido Aquí
            </h2>
            <p className="text-gray-400 text-sm sm:text-base">
              Descripción de tu sección
            </p>
          </div>

          {/* Grid de tarjetas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Tarjeta Azul */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20 rounded-xl p-4 sm:p-6 hover:border-blue-400/40 transition-all duration-300"
            >
              <h3 className="font-semibold text-white text-lg mb-2">Tarjeta 1</h3>
              <p className="text-gray-300 text-sm">Contenido de tu tarjeta</p>
            </motion.div>

            {/* Tarjeta Verde */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="group bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-xl p-4 sm:p-6 hover:border-emerald-400/40 transition-all duration-300"
            >
              <h3 className="font-semibold text-white text-lg mb-2">Tarjeta 2</h3>
              <p className="text-gray-300 text-sm">Contenido de tu tarjeta</p>
            </motion.div>

          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default Home;