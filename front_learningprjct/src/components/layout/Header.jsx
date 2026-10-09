import { AnimatePresence, motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import AuthModal from '../auth/AuthModal';
import { useUser } from '../../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import MobileMenu from './MobileMenu';
import Button from '../ui/Button';
import { spring } from '../../lib/motion';

/* Enlace de navegación: la píldora activa se desliza entre enlaces (layoutId) */
// eslint-disable-next-line react/prop-types
const NavItem = ({ to, label, active }) => (
  <Link
    to={to}
    aria-current={active ? 'page' : undefined}
    className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${active ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
  >
    {active && (
      <motion.span
        layoutId="nav-pill"
        className="absolute inset-0 -z-10 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/10"
        transition={spring.glide}
      />
    )}
    {label}
  </Link>
);

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
  const { pathname } = useLocation();

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
      <header className="sticky top-0 z-50 material border-b border-line">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
          <nav className="flex h-16 items-center justify-between gap-6" aria-label="Principal">

            {/* Logo */}
            <Link to="/" className="group flex shrink-0 items-center gap-2.5" aria-label="Evenor Tech Campus, inicio">
              <span className="font-display text-xl font-bold tracking-tight text-brand transition-opacity duration-200 group-hover:opacity-80">
                Evenor Tech
              </span>
              <span className="h-4 w-px bg-line-strong" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-ink-3">Campus</span>
            </Link>

            {/* Desktop Nav */}
            <div className="isolate hidden items-center gap-1 lg:flex">
              {navLinks.map((link) => (
                <NavItem
                  key={link.to}
                  to={link.to}
                  label={link.label}
                  active={link.to === '/' ? pathname === '/' : pathname.startsWith(link.to)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="hidden items-center gap-3 lg:flex">
              {!user ? (
                <Button size="sm" onClick={() => setAuthOpen(true)}>
                  Acceder
                </Button>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    className={`flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm font-medium transition-colors duration-200 ${userMenuOpen ? 'border-line-strong bg-white/[0.08]' : 'border-line bg-white/[0.04] hover:bg-white/[0.08]'}`}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-on-brand">
                      {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[140px] truncate text-ink">
                      {user.name || user.email}
                    </span>
                    <svg
                      className={`h-3.5 w-3.5 text-ink-3 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        key="user-menu"
                        initial={{ opacity: 0, y: -6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1, transition: spring.gentle }}
                        exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.12 } }}
                        className="absolute right-0 z-50 mt-2 w-72 origin-top-right overflow-hidden rounded-2xl material-thick border border-line shadow-overlay p-1.5"
                      >
                        <div className="flex items-center gap-3 px-3 py-3 mb-1 border-b border-line">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-base font-bold text-on-brand">
                            {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                          </span>
                          <div className="flex flex-col min-w-0">
                            <span className="truncate text-sm font-semibold text-ink">{user.name || 'Usuario'}</span>
                            <span className="truncate text-xs text-ink-3">{user.email}</span>
                          </div>
                        </div>
                        <button
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-white/[0.06] hover:text-ink"
                          onClick={() => { setUserMenuOpen(false); navigate('/ajustes'); }}
                        >
                          <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Ajustes
                        </button>
                        <button
                          className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300"
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
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-white/[0.08] hover:text-ink lg:hidden"
              aria-label="Abrir menú"
              aria-expanded={mobileMenuOpen}
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