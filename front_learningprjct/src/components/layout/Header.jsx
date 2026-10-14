/* eslint-disable react/prop-types -- el proyecto no usa PropTypes */
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, LogOut, Menu, Settings } from 'lucide-react';
import AuthModal from '../auth/AuthModal';
import { useUser } from '../../context/UserContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import MobileMenu from './MobileMenu';
import Logo from './Logo';
import Button from '../ui/Button';
import useMediaQuery from '../../hooks/useMediaQuery';
import { spring } from '../../lib/motion';
import { getNavLinks, isActivePath } from './navigation';

// Compactación de la barra en escritorio: de 88 a 68 px (solo transform y opacity)
const COMPACT_AT = 120;
const COMPACT_SCALE = 68 / 88;

/* Enlace de navegación: píldora de cristal y el punto verde de "Campus." se deslizan al activo */
const NavItem = ({ to, label, active }) => (
  <li>
    <Link
      to={to}
      aria-current={active ? 'page' : undefined}
      className={`relative flex h-11 items-center whitespace-nowrap rounded-full px-2 text-nav font-medium transition-colors duration-200 min-[1400px]:px-3.5 ${active ? 'text-ink' : 'text-ink-2 hover:text-ink'}`}
    >
      {active && (
        <>
          <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-glass-strong ring-1 ring-inset ring-line" transition={spring.glide} />
          <motion.span layoutId="nav-dot" className="absolute inset-x-0 bottom-1 mx-auto h-1 w-1 rounded-full bg-brand" transition={spring.glide} aria-hidden="true" />
        </>
      )}
      {label}
    </Link>
  </li>
);

const Avatar = ({ user, className }) => (
  <span className={`flex shrink-0 items-center justify-center rounded-full bg-brand font-bold text-on-brand ${className}`} aria-hidden="true">
    {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
  </span>
);

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const { pathname } = useLocation();
  const desktop = useMediaQuery('(min-width: 1024px)');
  const reduce = useReducedMotion();

  // Cabecera progresiva: arriba no hay barra (el fondo sigue sin cortes bajo un velo que se desvanece);
  // con el scroll el cristal se asienta y la barra se compacta (motion values, sin re-render)
  const { scrollY } = useScroll();
  const surfaceOpacity = useTransform(scrollY, [0, 80], [0, 1]);
  const scrimOpacity = useTransform(surfaceOpacity, [0, 1], [1, 0]);
  const barScale = useTransform(scrollY, [0, COMPACT_AT], [1, COMPACT_SCALE], { clamp: true });
  const contentY = useTransform(scrollY, [0, COMPACT_AT], [0, -10], { clamp: true });
  const logoScale = useTransform(scrollY, [0, COMPACT_AT], [1, 0.9], { clamp: true });
  const compact = desktop && !reduce;

  const navLinks = useMemo(() => getNavLinks(user), [user]);
  const userButtonRef = useRef(null);

  useEffect(() => {
    if (!userMenuOpen) return;
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    }
    // Escape cierra el menú y devuelve el foco al botón que lo abrió
    function handleKey(e) {
      if (e.key !== 'Escape') return;
      setUserMenuOpen(false);
      userButtonRef.current?.focus();
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [userMenuOpen]);

  const goToSettings = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/ajustes');
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    await new Promise(res => setTimeout(res, 350));
    logout();
    navigate('/');
    showToast('Sesión cerrada correctamente', 'success');
  };

  return (
    <>
      <header className="sticky top-0 z-50 h-header lg:h-header-lg">
        <motion.div
          aria-hidden="true"
          style={{ opacity: scrimOpacity }}
          className="pointer-events-none absolute inset-x-0 top-0 -bottom-8 bg-linear-to-b from-canvas/75 via-canvas/35 to-transparent"
        />
        <motion.div
          aria-hidden="true"
          style={compact ? { opacity: surfaceOpacity, scaleY: barScale } : { opacity: surfaceOpacity }}
          className="pointer-events-none absolute inset-0 origin-top glass-nav"
        />
        <motion.div style={compact ? { y: contentY } : undefined} className="relative mx-auto h-full max-w-site px-gutter">
          <nav className="flex h-full items-center justify-between gap-4 min-[1400px]:gap-6" aria-label="Principal">

            <Logo style={compact ? { scale: logoScale } : undefined} />

            {/* Enlaces en línea: desde xl caben en una sola línea, también con "Corrección" */}
            <ul className="isolate hidden items-center gap-0.5 xl:flex">
              {navLinks.map((link) => (
                <NavItem key={link.to} to={link.to} label={link.label} active={isActivePath(pathname, link.to)} />
              ))}
            </ul>

            {/* Acciones */}
            <div className="hidden items-center gap-3 xl:flex">
              {!user ? (
                <Button size="md" className="text-nav shadow-glow" onClick={() => setAuthOpen(true)} aria-label="Acceder al campus">
                  <span className="min-[1400px]:hidden">Acceder</span>
                  <span className="hidden min-[1400px]:inline">Acceder al campus</span>
                </Button>
              ) : (
                <div className="relative" ref={userMenuRef}>
                  <button
                    ref={userButtonRef}
                    type="button"
                    className={`flex h-11 items-center gap-2.5 rounded-full border py-1 pl-1.5 pr-4 text-nav font-medium transition-colors duration-200 ${userMenuOpen ? 'border-line-strong bg-glass-strong' : 'border-line bg-glass hover:bg-glass-strong'}`}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-haspopup="true"
                    aria-expanded={userMenuOpen}
                  >
                    <Avatar user={user} className="h-8 w-8 text-sm" />
                    <span className="max-w-[8rem] truncate text-ink 2xl:max-w-[14rem]">
                      {user.name || user.email}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-ink-3 transition-transform duration-300 ${userMenuOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
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
                        <div className="mb-1 flex items-center gap-3 border-b border-line px-3 py-3">
                          <Avatar user={user} className="h-10 w-10 text-base" />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-sm font-semibold text-ink">{user.name || 'Usuario'}</span>
                            <span className="truncate text-xs text-ink-3">{user.email}</span>
                          </div>
                        </div>
                        <button
                          className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-ink-2 transition-colors duration-150 hover:bg-glass-strong hover:text-ink"
                          onClick={goToSettings}
                        >
                          <Settings className="h-4 w-4 opacity-60" aria-hidden="true" />
                          Ajustes
                        </button>
                        <button
                          className="flex min-h-11 w-full items-center gap-2.5 rounded-xl px-3 text-left text-sm font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/10 hover:text-red-300"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 opacity-70" aria-hidden="true" />
                          Cerrar sesión
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Botón del menú (por debajo de xl) */}
            <button
              type="button"
              className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-2 transition-colors duration-200 hover:bg-glass-strong hover:text-ink xl:hidden"
              aria-label="Abrir menú"
              aria-haspopup="dialog"
              aria-expanded={mobileMenuOpen}
              aria-controls="menu-movil"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>

          </nav>
        </motion.div>
      </header>

      <MobileMenu
        id="menu-movil"
        isOpen={mobileMenuOpen}
        links={navLinks}
        onClose={() => setMobileMenuOpen(false)}
        account={
          user ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 px-1 pb-3">
                <Avatar user={user} className="h-11 w-11 text-base" />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-base font-semibold text-ink">{user.name || 'Usuario'}</span>
                  <span className="truncate text-sm text-ink-3">{user.email}</span>
                </div>
              </div>
              <button className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left text-lg font-medium text-ink-2 transition-colors hover:bg-glass-strong hover:text-ink" onClick={goToSettings}>
                <Settings className="h-5 w-5 opacity-60" aria-hidden="true" /> Ajustes
              </button>
              <button className="flex min-h-12 items-center gap-3 rounded-2xl px-3 text-left text-lg font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-300" onClick={handleLogout}>
                <LogOut className="h-5 w-5 opacity-70" aria-hidden="true" /> Cerrar sesión
              </button>
            </div>
          ) : null
        }
      />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Header;
