import { Linkedin, Instagram, Mail, Globe, X, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#23272f] border-t border-[#a1db87]/20 pt-10 pb-6 mt-auto text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col md:flex-row md:justify-between md:items-start gap-10">
        {/* Logo y descripción */}
        <div className="flex-1 flex flex-col items-center md:items-start mb-6 md:mb-0 text-center md:text-leftre">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-7 h-7 text-[#a1db87]" />
            <span className="font-bold text-xl text-white tracking-wide">CAMPUS</span>
          </div>
          <p className="text-gray-400 max-w-xs text-center md:text-left text-sm">Formando profesionales con tecnología y pasión. Plataforma e-learning moderna y flexible.</p>
        </div>
        {/* Enlaces */}
        <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <span className="uppercase text-xs text-[#a1db87] font-semibold mb-2">Enlaces</span>
          <nav className="flex flex-col gap-1 text-sm">
            <Link to="/" className="hover:text-[#a1db87] transition-colors">Inicio</Link>
            <Link to="/sobre" className="hover:text-[#a1db87] transition-colors">Sobre Nosotros</Link>
            <Link to="/cursos" className="hover:text-[#a1db87] transition-colors">Cursos</Link>
          </nav>
        </div>

        {/* Soporte */}
        <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <span className="uppercase text-xs text-[#a1db87] font-semibold mb-2">Soporte</span>
          <nav className="flex flex-col gap-1 text-sm">
            <Link to="/contacto" className="hover:text-[#a1db87] transition-colors">Contacto</Link>
            <Link to="/reseñas" className="hover:text-[#a1db87] transition-colors">Reseñas</Link>
          </nav>
        </div>

        {/* Contacto */}
        <div className="flex-1 flex flex-col items-center md:items-start gap-2 text-center md:text-left">
          <span className="uppercase text-xs text-[#a1db87] font-semibold mb-2">Contacto</span>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#a1db87] mt-0.5" />
              <span>
                Av. de la República Argentina,27 B<br />
                41011 Sevilla, España
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#a1db87]" />
              <a href="mailto:info@evenor-tech.com" className="hover:text-[#a1db87] transition-colors">info@evenor-tech.com</a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#a1db87]" />
              <a href="tel:+34954151096" className="hover:text-[#a1db87] transition-colors">+34 954 151 096</a>
            </div>
          </div>
        </div>

        {/* Redes sociales */}
        <div className="flex-1 flex flex-col items-center md:items-end gap-2 text-center md:text-right">
          <span className="uppercase text-xs text-[#a1db87] font-semibold mb-2">Síguenos</span>
          <div className="flex gap-4 mb-2">
            <a href="https://www.instagram.com/evenortech/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-[#a1db87] transition-colors"><Instagram className="w-5 h-5" /></a>
            <a href="#" aria-label="Linkedin" className="hover:text-[#a1db87] transition-colors"><Linkedin className="w-5 h-5" /></a>
            <a href="http://x.com/evenor_tech" target="_blank" rel="noopener noreferrer" aria-label="X" className="hover:text-[#a1db87] transition-colors"><X className="w-5 h-5" /></a>
            <a href="mailto:info@evenor-tech.com" aria-label="Email" className="hover:text-[#a1db87] transition-colors"><Mail className="w-5 h-5" /></a>
          </div>
          <span className="text-xs text-gray-400">info@evenor-tech.com</span>
        </div>
      </div>
      <div className="mt-8 border-t border-[#a1db87]/10 pt-4 text-xs text-gray-500 flex flex-col items-center">
        <span className="text-center">© 2026 CAMPUS. Todos los derechos reservados.</span>
        <div className="flex flex-row gap-4 justify-center mt-2">
          <Link to="/politica-cookies" className="hover:text-[#a1db87] transition-colors">Cookies</Link>
          <Link to="/politica-cookies" className="hover:text-[#a1db87] transition-colors">Política de Cookies</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;