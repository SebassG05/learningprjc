import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import React, { useState, useRef, useEffect } from 'react';
import AuthModal from '../auth/AuthModal';
import { useUser } from '../../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import MobileMenu from './MobileMenu';
const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/cursos', label: 'Cursos' },
  { to: '/sobre', label: 'Sobre Nosotros' },
  { to: '/contacto', label: 'Contacto' },
  { to: '/reseñas', label: 'Reseñas' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Cerrar menú usuario al hacer click fuera
  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen]);
  const menuItems = [
    { name: 'Inicio', path: '/' },
    { name: 'Cursos', path: '/cursos' },
    { name: 'Sobre Nosotros', path: '/sobre' },
    { name: 'Contacto', path: '/contacto' },
    { name: 'Iniciar sesión', path: '/login' },
    { name: 'Regístrate', path: '/registro' },
  ];
  return (
    <>
      <header className="bg-gradient-to-b from-[#16241d] via-[#1e2d23] to-[#1e2d23] shadow-lg sticky top-0 z-50 transition-colors backdrop-blur-md border-b border-[#1e2d23]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-extrabold text-green-300 tracking-tight group">
            <span className="font-[Rondana] bg-gradient-to-r from-green-300 via-green-500 to-green-700 bg-clip-text text-transparent group-hover:from-green-400 group-hover:to-green-300 transition-all duration-500">Evenor Tech - Campus</span>
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
            {!user ? (
              <button
                className="cursor-pointer relative px-5 py-2 rounded-md font-semibold bg-gradient-to-r from-green-400 to-green-700 text-white shadow-md overflow-hidden group transition-all duration-300 hover:from-green-700 hover:to-green-400 hover:shadow-xl"
                onClick={() => setAuthOpen(true)}
              >
                <span className="relative z-10">Acceder</span>
                <span className="absolute left-0 top-0 w-0 h-full bg-white/10 group-hover:w-full transition-all duration-500"></span>
              </button>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-green-700 text-white font-semibold shadow-md hover:from-green-700 hover:to-green-400 transition-all duration-300 focus:outline-none border-2 border-green-400 cursor-pointer ${userMenuOpen ? 'ring-2 ring-green-300' : ''}`}
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen}
                >
                  <span className="w-9 h-9 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold text-lg border-2 border-green-400">
                    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden md:inline font-bold text-green-100 text-base">{user.name || user.email}</span>
                  <svg className={`w-4 h-4 ml-1 text-green-100 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      key="user-menu"
                      initial={{ opacity: 0, y: -16, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -16, scale: 0.98 }}
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="absolute right-[-40px] mt-3 w-80 bg-[#181f1b] border border-green-700 rounded-2xl shadow-2xl py-3 z-50 flex flex-col gap-0"
                      style={{ minWidth: 320 }}
                    >
                      <div className="flex items-center gap-3 px-5 py-3 border-b border-green-900">
                        <span className="w-11 h-11 rounded-full bg-green-200 flex items-center justify-center text-green-900 font-bold text-xl border-2 border-green-400">
                          {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </span>
                        <div className="flex flex-col">
                          <span className="font-bold text-green-200 text-lg">{user.name || 'Usuario'}</span>
                          <span className="text-green-300 text-xs">{user.email}</span>
                        </div>
                      </div>
                      <button
                        className="cursor-pointer w-full text-left px-5 py-3 text-green-300 hover:bg-green-900/30 font-semibold transition flex items-center gap-2 border-b border-green-900"
                        onClick={() => { setUserMenuOpen(false); navigate('/ajustes'); }}
                      >
                        Ajustes
                      </button>
                      <button
                        className="cursor-pointer w-full text-left px-5 py-3 text-red-400 hover:bg-green-900/30 font-bold transition rounded-b-2xl"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await new Promise(res => setTimeout(res, 350));
                          logout();
                          navigate('/');
                          showToast('Sesión cerrada correctamente', 'success');
                        }}
                      >
                        Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-200 hover:text-green-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-green-400 transition-colors duration-300 group"
              aria-label="Open menu"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <span className="transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                <svg className="h-7 w-7" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </span>
            </button>
          </div>
        </nav>
        </div>
      </header>
      {/* Mobile Nav - fuera del header para evitar stacking context y clipping */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        menuItems={menuItems}
        onClose={() => setMobileMenuOpen(false)}
        onNavigation={(path) => {
          setMobileMenuOpen(false);
          // Puedes usar navigate(path) si usas useNavigate
        }}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;