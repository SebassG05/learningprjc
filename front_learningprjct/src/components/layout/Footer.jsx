import { Linkedin, Instagram, Mail, Globe, X, MapPin, Phone, ArrowRight, GraduationCap, BookOpen, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return ( 
    <footer className="relative bg-gradient-to-b from-surface via-surface to-surface border-t border-brand/20 mt-auto text-gray-300 overflow-hidden">
      {/* Efectos de fondo decorativos */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-500 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative">

        {/* Contenido principal del footer */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
            
            {/* Logo y descripción - Más ancho */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-br from-brand to-brand-500 rounded-2xl shadow-lg shadow-brand/30">
                  <Globe className="w-8 h-8 text-on-brand" />
                </div>
                <span className="font-bold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-brand to-brand-500 tracking-wide">CAMPUS</span>
              </div>
              <p className="text-gray-400 text-base leading-relaxed mb-6 max-w-md">
                Plataforma de e-learning moderna y flexible. Formando profesionales con tecnología y pasión para el futuro digital.
              </p>
              
            </div> 
            
            {/* Enlaces */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-brand to-brand-500 rounded-full"></div>
                Enlaces
              </h4>
              <nav className="flex flex-col gap-3">
                <Link to="/" className="text-gray-400 hover:text-brand transition-all duration-300 hover:translate-x-2 flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Inicio
                </Link>
                <Link to="/sobre" className="text-gray-400 hover:text-brand transition-all duration-300 hover:translate-x-2 flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Sobre Nosotros
                </Link>
                <Link to="/cursos" className="text-gray-400 hover:text-brand transition-all duration-300 hover:translate-x-2 flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Cursos
                </Link>
              </nav>
            </div>

            {/* Soporte */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-brand-500 to-brand rounded-full"></div>
                Soporte
              </h4>
              <nav className="flex flex-col gap-3">
                <Link to="/contacto" className="text-gray-400 hover:text-brand-500 transition-all duration-300 hover:translate-x-2 flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contacto
                </Link>
                <Link to="/reseñas" className="text-gray-400 hover:text-brand-500 transition-all duration-300 hover:translate-x-2 flex items-center gap-2 group">
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Reseñas
                </Link>
              </nav>
            </div>

            {/* Contacto */}
            <div>
              <h4 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-brand to-brand-500 rounded-full"></div>
                Contacto
              </h4>
              <div className="flex flex-col gap-3">
                <a href="mailto:info@evenor-tech.com" className="flex items-center gap-2 text-gray-400 hover:text-brand transition-colors group">
                  <div className="p-2 bg-brand/10 rounded-lg group-hover:bg-brand/20 transition-colors flex-shrink-0">
                    <Mail className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-sm">info@evenor-tech.com</span>
                </a>
                <a href="tel:+34954151096" className="flex items-center gap-2 text-gray-400 hover:text-brand transition-colors group">
                  <div className="p-2 bg-brand/10 rounded-lg group-hover:bg-brand/20 transition-colors flex-shrink-0">
                    <Phone className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-sm">+34 954 151 096</span>
                </a>
              </div>
            </div>
          </div>

          {/* Redes sociales - Rediseñadas */}
          <div className="mt-10 pt-6 border-t border-brand/10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left">
                <h4 className="text-white font-semibold text-lg mb-2">Síguenos en redes sociales</h4>
                <p className="text-gray-500 text-sm">Mantente actualizado con las últimas novedades</p>
              </div>
              <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/evenortech/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="Instagram" 
                  className="group p-4 bg-surface hover:bg-gradient-to-br hover:from-brand/20 hover:to-brand-500/20 border border-brand/20 hover:border-brand/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand/30"
                >
                  <Instagram className="w-6 h-6 text-gray-400 group-hover:text-brand transition-colors" />
                </a>
                <a 
                  href="#" 
                  aria-label="Linkedin" 
                  className="group p-4 bg-surface hover:bg-gradient-to-br hover:from-brand/20 hover:to-brand-500/20 border border-brand/20 hover:border-brand/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand/30"
                >
                  <Linkedin className="w-6 h-6 text-gray-400 group-hover:text-brand transition-colors" />
                </a>
                <a 
                  href="http://x.com/evenor_tech" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  aria-label="X" 
                  className="group p-4 bg-surface hover:bg-gradient-to-br hover:from-brand/20 hover:to-brand-500/20 border border-brand/20 hover:border-brand/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand/30"
                >
                  <X className="w-6 h-6 text-gray-400 group-hover:text-brand transition-colors" />
                </a>
                <a 
                  href="mailto:info@evenor-tech.com" 
                  aria-label="Email" 
                  className="group p-4 bg-surface hover:bg-gradient-to-br hover:from-brand/20 hover:to-brand-500/20 border border-brand/20 hover:border-brand/50 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-brand/30"
                >
                  <Mail className="w-6 h-6 text-gray-400 group-hover:text-brand transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright y políticas */}
        <div className="border-t border-brand/10 bg-surface/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
              <div className="flex flex-col items-center md:items-start gap-0.5">
                <span className="text-center md:text-left">
                  © 2026 <span className="text-brand font-semibold">CAMPUS</span>. Todos los derechos reservados.
                </span>
                <span className="text-xs text-gray-600">Desarrollado por <span className="text-brand">Evenor-Tech</span></span>
              </div>
              <div className="flex flex-wrap gap-6 justify-center">
                <Link to="/aviso-legal" className="hover:text-brand transition-colors">
                  Aviso Legal
                </Link>
                <Link to="/politica-cookies" className="hover:text-brand transition-colors">
                  Política de Cookies
                </Link>
                <Link to="/privacidad" className="hover:text-brand transition-colors">
                  Privacidad
                </Link>
                <Link to="/terminos" className="hover:text-brand transition-colors">
                  Términos de Uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;