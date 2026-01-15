import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Container from '../components/ui/Container';
import { 
  TrendingUp, Building2, Clock, ArrowRight, Sparkles, 
  Award, FileText, Euro, Video, ListChecks
} from 'lucide-react';

const HeroSection = () => {
    const [showBoxes, setShowBoxes] = useState(true);
    const [hideAnim, setHideAnim] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getLicitacionesStats();
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        // Usar datos por defecto en caso de error
        setStats({
          total: 15000,
          breakdown: {
            bancoMundial: 2500,
            comisionEuropea: 8100,
            nacionesUnidas: 1800,
            contratacionEstadoEspana: 2600
          }
        });
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="relative pt-16 sm:pt-20 pb-8 sm:pb-12 overflow-hidden">
      <Container>
        {/* Título principal del sistema */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#a1db87] to-white bg-clip-text text-transparent mb-3">
            <span className="font-[Rondana]">CAMPUS</span>
          </h1>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative mb-6"
          >
            <div className="flex items-center justify-center space-x-4 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#a1db87]"></div>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-[#a1db87] to-emerald-400 rounded-lg blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-black/50 backdrop-blur-sm border border-[#a1db87]/40 rounded-lg px-6 py-2">
                  <span className="text-lg font-bold text-[#a1db87] tracking-[0.2em]">
                    E-LEARNING
                  </span>
                </div>
              </div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#a1db87]"></div>
            </div>
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="inline-block"
              >
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#a1db87]/50 to-transparent mt-1"></div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Badge superior centrado */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#2a2a2a] border border-[#a1db87]/30 rounded-full">
            <TrendingUp className="w-4 h-4 text-[#a1db87]" />
            <span className="text-xs sm:text-sm font-semibold text-[#a1db87]">
              Ventajas del Campus
            </span>
          </div>
        </motion.div>

        {/* Showcase de Fuentes Institucionales - Ancho completo */}
        <div className="w-full">
          
          {/* SHOWCASE DE FUENTES DE DATOS */}
          <div className="relative max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-[#2a2a2a] to-[#1a1a1a] rounded-xl sm:rounded-2xl p-6 sm:p-8 border border-[#333333] shadow-2xl"
            >
              {/* Header del showcase */}
              <div className="text-center mb-8">
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="font-[Rondana] text-2xl sm:text-3xl font-bold text-white mb-3"
                >
                  ¿Qué puedes esperar de los cursos?
                </motion.h2>
              </div>

          

              {/* Tarjetas de características del curso */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6"
              >
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <Clock className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Acceso 24/7 durante 7 semanas</h3>
                  <p className="text-gray-400 text-sm">(11 marzo - 29 abril 2026)</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <Video className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Vídeos, lecturas y material técnico</h3>
                  <p className="text-gray-400 text-sm">Todo descargable y disponible online</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <ListChecks className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Ejercicios prácticos + tests</h3>
                  <p className="text-gray-400 text-sm">Autoevaluación por módulo y guía paso a paso</p>
                </motion.div>
                <motion.div whileHover={{ scale: 1.04, y: -4 }} className="bg-[#23272f] rounded-xl shadow-lg p-6 flex flex-col items-center text-center border border-[#a1db87]/20 transition-all duration-300">
                  <Award className="w-8 h-8 text-[#a1db87] mb-2" />
                  <h3 className="font-bold text-lg text-white mb-1">Certificado profesional autorizado</h3>
                  <p className="text-gray-400 text-sm">Evaluación final y diploma Evenor-Tech</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Decoraciones externas - solo desktop */}
            {!isMobile && (
              <>
                <div className="absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 w-10 sm:w-14 md:w-16 h-10 sm:h-14 md:h-16 rounded-xl bg-[#a1db87]/20 rotate-12" />
                <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-5 sm:w-8 h-5 sm:h-8 rounded-lg border border-[#a1db87] -rotate-12" />
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
};

export default HeroSection;