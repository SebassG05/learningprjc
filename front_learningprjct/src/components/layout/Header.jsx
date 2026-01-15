import { Link } from 'react-router-dom';
const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/sobre', label: 'Sobre Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

const Header = () => {
  return (
    <header className="bg-gradient-to-b from-[#16241d] via-[#1e2d23] to-[#1e2d23] shadow-lg sticky top-0 z-50 transition-colors backdrop-blur-md border-b border-[#1e2d23]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-green-300 tracking-tight group">
            <span className="bg-gradient-to-r from-green-300 via-green-500 to-green-700 bg-clip-text text-transparent group-hover:from-green-400 group-hover:to-green-300 transition-all duration-500">Evenor Tech - Campus</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-2 py-1 font-medium text-gray-200 transition-colors duration-300 group"
              >
                <span className="z-10 relative group-hover:text-green-300 group-hover:dark:text-green-400 transition-colors duration-300">
                  {link.label}
                </span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-green-700 rounded-full group-hover:w-full transition-all duration-500"></span>
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="relative px-5 py-2 rounded-md font-semibold border-2 border-green-400 text-green-300 bg-[#1e2d23]/80 overflow-hidden group transition-all duration-300 hover:bg-gradient-to-r hover:from-green-700 hover:to-green-900 hover:text-white hover:shadow-lg">
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Iniciar sesión</span>
              <span className="absolute left-0 top-0 w-0 h-full bg-gradient-to-r from-green-700 to-green-900 opacity-80 group-hover:w-full transition-all duration-500"></span>
            </Link>
            <Link to="/registro" className="relative px-5 py-2 rounded-md font-semibold bg-gradient-to-r from-green-400 to-green-700 text-white shadow-md overflow-hidden group transition-all duration-300 hover:from-green-700 hover:to-green-400 hover:shadow-xl">
              <span className="relative z-10">Regístrate</span>
              <span className="absolute left-0 top-0 w-0 h-full bg-white/10 group-hover:w-full transition-all duration-500"></span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button type="button" className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-brand-500 dark:hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500 transition-colors duration-300" aria-label="Open menu" onClick={() => {
              const menu = document.getElementById('mobile-menu');
              if (menu) menu.classList.toggle('hidden');
            }}>
              <svg className="h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
        {/* Mobile Nav */}
        <div id="mobile-menu" className="md:hidden hidden bg-gradient-to-b from-[#16241d]/95 via-[#1e2d23]/80 to-[#1e2d23]/60 shadow-lg rounded-b-lg mt-2 px-4 py-4 backdrop-blur-md">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="relative px-2 py-2 font-medium text-gray-200 transition-colors duration-300 group"
              >
                <span className="z-10 relative group-hover:text-green-300 group-hover:dark:text-green-400 transition-colors duration-300">
                  {link.label}
                </span>
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gradient-to-r from-green-400 to-green-700 rounded-full group-hover:w-full transition-all duration-500"></span>
              </Link>
            ))}
            <Link to="/login" className="relative px-5 py-2 rounded-md font-semibold border-2 border-green-400 text-green-300 bg-[#1e2d23]/80 overflow-hidden group transition-all duration-300 hover:bg-gradient-to-r hover:from-green-700 hover:to-green-900 hover:text-white hover:shadow-lg">
              <span className="relative z-10 group-hover:text-white transition-colors duration-300">Iniciar sesión</span>
              <span className="absolute left-0 top-0 w-0 h-full bg-gradient-to-r from-green-700 to-green-900 opacity-80 group-hover:w-full transition-all duration-500"></span>
            </Link>
            <Link to="/registro" className="relative px-5 py-2 rounded-md font-semibold bg-gradient-to-r from-green-400 to-green-700 text-white shadow-md overflow-hidden group transition-all duration-300 hover:from-green-700 hover:to-green-400 hover:shadow-xl">
              <span className="relative z-10">Regístrate</span>
              <span className="absolute left-0 top-0 w-0 h-full bg-white/10 group-hover:w-full transition-all duration-500"></span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;