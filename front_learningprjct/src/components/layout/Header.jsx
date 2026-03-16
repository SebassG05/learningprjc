import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import AuthModal from '../auth/AuthModal';
import { useUser } from '../../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import MobileMenu from './MobileMenu';

/* Hover: letter-spacing se expande + destello verde suave */
const GlowLink = ({ to, label }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        transition: 'color 0.35s ease, letter-spacing 0.35s ease, text-shadow 0.35s ease',
        color: hovered ? '#a1db87' : '#d1d5db',
        letterSpacing: hovered ? '0.07em' : '0.01em',
        textShadow: hovered
          ? '0 0 12px rgba(161,219,135,0.55), 0 0 32px rgba(161,219,135,0.2)'
          : 'none',
        fontWeight: 500,
        fontSize: '0.925rem',
      }}
    >
      {label}
    </Link>
  );
};

const menuItems = [
  { name: 'Inicio', path: '/' },
  { name: 'Cursos', path: '/cursos' },
  { name: 'Sobre Nosotros', path: '/sobre' },
  { name: 'Contacto', path: '/contacto' },
  { name: 'Iniciar sesión', path: '/login' },
  { name: 'Regístrate', path: '/registro' },
];

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Crear navLinks dinámicamente según el rol del usuario
  const navLinks = useMemo(() => {
    console.log('🔍 Usuario en Header:', user); // DEBUG
    console.log('🔍 Role del usuario:', user?.role); // DEBUG
    
    const links = [
      { to: '/', label: 'Inicio' },
      { to: '/cursos', label: 'Cursos' },
      { to: '/sobre', label: 'Sobre Nosotros' },
      { to: '/reseñas', label: 'Reseñas' },
      { to: '/contacto', label: 'Contacto' },
    ];

    // Agregar "Corrección" si el usuario es admin o superadmin
    if (user && (user.role === 'admin' || user.role === 'superadmin')) {
      console.log('✅ Agregando link de Corrección'); // DEBUG
      links.push({ to: '/admin/correcciones', label: 'Corrección' });
    } else {
      console.log('❌ No se agrega link de Corrección. User:', user, 'Role:', user?.role); // DEBUG
    }

    return links;
  }, [user]);

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

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#0f1a12]/96 backdrop-blur-xl border-b border-green-900/30 shadow-[0_2px_40px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <nav className="flex items-center justify-between h-[5.5rem]">

            {/* Logo */}
            <Link to="/" className="group flex items-center gap-1.5 shrink-0">
              <span className="font-[Rondana] text-[1.4rem] font-extrabold tracking-tight"
                style={{ color: '#a1db87', transition: 'filter 0.3s ease' }}
                onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
                onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
              >
                Evenor Tech
              </span>
              <span className="text-green-700 font-light text-xl select-none mx-1">|</span>
              <span className="text-gray-400 font-medium text-sm tracking-[0.2em] uppercase">Campus</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <GlowLink key={link.to} to={link.to} label={link.label} />
              ))}
            </div>

            {/* Actions */}
            <div className="hidden md:flex items-center gap-4">
              {!user ? (
                <button
                  className="cursor-pointer group relative overflow-hidden px-6 py-2.5 rounded-full font-semibold text-sm tracking-wide text-white bg-green-700/80 hover:bg-green-600/90 transition-colors duration-300 shadow-[0_0_18px_rgba(52,211,153,0.12)] hover:shadow-[0_0_26px_rgba(52,211,153,0.35)]"
                  onClick={() => setAuthOpen(true)}
                >
                  {/* shimmer sweep on hover */}
                  <span className="absolute inset-0 -translate-x-full skew-x-[-20deg] bg-white/10 group-hover:translate-x-[200%] transition-transform duration-700 ease-in-out pointer-events-none" />
                  <span className="relative z-10">Acceder</span>
                </button>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    className={`group flex items-center gap-2.5 pl-2 pr-4 py-2 rounded-full bg-[#1a2e1f]/80 border border-green-700/50 text-white font-semibold shadow-md hover:border-green-400/70 hover:shadow-[0_0_18px_rgba(74,222,128,0.22)] transition-all duration-300 focus:outline-none cursor-pointer ${userMenuOpen ? 'border-green-400/70 shadow-[0_0_18px_rgba(74,222,128,0.22)]' : ''}`}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="w-8 h-8 rounded-full flex items-center justify-center text-[#1a1a1a] font-bold text-sm shadow-inner" style={{backgroundColor:'#a1db87'}}>
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden md:inline font-medium text-green-100 text-sm max-w-[140px] truncate">
                      {user.name || user.email}
                    </span>
                    <svg
                      className={`w-3.5 h-3.5 text-green-500 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        key="user-menu"
                        initial={{ opacity: 0, y: -10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="absolute left-1/2 -translate-x-1/2 mt-3 w-96 bg-[#101a12] border border-green-900/60 rounded-2xl shadow-[0_20px_56px_rgba(0,0,0,0.55)] py-2 z-50 overflow-hidden"
                      >
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-green-900/40">
                          <span className="w-10 h-10 rounded-full flex items-center justify-center text-[#1a1a1a] font-bold text-base shadow-inner" style={{backgroundColor:'#a1db87'}}>
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="font-semibold text-green-100 text-sm truncate">{user.name || 'Usuario'}</span>
                            <span className="text-green-600 text-xs truncate">{user.email}</span>
                          </div>
                        </div>
                        <button
                          className="cursor-pointer w-full text-left px-5 py-3 text-sm text-gray-400 hover:text-green-300 hover:bg-green-900/15 font-medium transition-colors duration-200 flex items-center gap-2.5 border-b border-green-900/30"
                          onClick={() => { setUserMenuOpen(false); navigate('/ajustes'); }}
                        >
                          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Ajustes
                        </button>
                        <button
                          className="cursor-pointer w-full text-left px-5 py-3 text-sm text-red-400/80 hover:text-red-300 hover:bg-red-950/20 font-medium transition-colors duration-200 flex items-center gap-2.5"
                          onClick={async () => {
                            setUserMenuOpen(false);
                            await new Promise(res => setTimeout(res, 350));
                            logout();
                            navigate('/');
                            showToast('Sesión cerrada correctamente', 'success');
                          }}
                        >
                          <svg className="w-4 h-4 opacity-60" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                          Cerrar sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-gray-400 hover:text-green-300 hover:bg-green-900/25 focus:outline-none transition-colors duration-200"
              aria-label="Abrir menú"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

          </nav>
        </div>
      </header>

      <MobileMenu
        isOpen={mobileMenuOpen}
        menuItems={menuItems}
        onClose={() => setMobileMenuOpen(false)}
        onNavigation={() => setMobileMenuOpen(false)}
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;