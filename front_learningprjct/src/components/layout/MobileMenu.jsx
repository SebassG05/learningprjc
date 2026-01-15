import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Home, Globe, Wrench, BookOpen, Phone, ChevronDown,
  LogIn, User, X, Crown, ExternalLink, ArrowRight,
  Mail, Eye, EyeOff, LogOut
} from 'lucide-react';
// import { useAuth } from '../../context/AuthContext';
// import { usePWAInstall } from '../../hooks/usePWAInstall';

const MobileMenu = ({
  isOpen,
  menuItems,
  onClose,
  onNavigation
}) => {
  const location = useLocation();
  // const { login, logout, user, isAuthenticated } = useAuth();
  // const { shouldShowInstallButton, handleInstall, isIOS } = usePWAInstall();

  const [activeDropdown, setActiveDropdown] = useState(null);
  const [headerHeight, setHeaderHeight] = useState(80); // Default header height

  useEffect(() => {
    const updateHeaderHeight = () => {
      const header = document.querySelector('header');
      if (header) {
        setHeaderHeight(header.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, [location.pathname]);

  useEffect(() => {
    setActiveDropdown(null);
  }, [location]);

  const toggleDropdown = (name) => {
    setActiveDropdown(prev => prev === name ? null : name);
  };

  const handleNavigation = (path) => {
    setActiveDropdown(null);
    setTimeout(() => {
      onClose();
      onNavigation(path);
    }, 10);
  };

  const getMenuIcon = (name) => {
    switch (name) {
      case 'Inicio': return <Home className="w-5 h-5" />;
      case 'Proyectos': return <Globe className="w-5 h-5" />;
      case 'Herramientas': return <Wrench className="w-5 h-5" />;
      case 'Publicaciones': return <BookOpen className="w-5 h-5" />;
      case 'Contacto': return <Phone className="w-5 h-5" />;
      default: return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 lg:hidden"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{ top: `${headerHeight}px`, bottom: 0 }}
            className="absolute right-0 w-full max-w-[90%] sm:max-w-[360px] bg-gradient-to-br from-[#1e1e1e] to-[#262626] border-l border-green-400/30 flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="h-1 bg-gradient-to-r from-green-400/60 via-green-400 to-green-400/60" />
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 space-y-2">
              {menuItems.map((item) => (
                <div key={`mobile-${item.name}`} className="rounded-xl overflow-hidden">
                  {item.dropdown ? (
                    <div className="bg-[#2a2a2a] rounded-xl">
                      <button
                        onClick={() => toggleDropdown(item.name)}
                        className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3.5 text-sm sm:text-base font-medium transition-all duration-200 ${activeDropdown === item.name
                          ? 'bg-green-400 text-[#222222] shadow-xl'
                          : 'text-white hover:bg-[#333333]'
                          }`}
                      >
                        <div className="flex items-center min-w-0">
                          {getMenuIcon(item.name)}
                          <span className="ml-3 truncate">{item.name}</span>
                        </div>
                        <motion.div
                          animate={{ rotate: activeDropdown === item.name ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {activeDropdown === item.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden bg-[#222]/70"
                          >
                            <div className="p-2 sm:p-3 space-y-1">
                              {item.dropdown.map((subItem) => (
                                <motion.button
                                  key={subItem.path}
                                  onClick={() => handleNavigation(subItem.path)}
                                  className={`w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm transition-all duration-200 ${location.pathname === subItem.path
                                    ? 'bg-green-400 text-[#222222] font-semibold shadow-lg'
                                    : 'text-gray-300 hover:bg-[#333333] hover:text-white'
                                    }`}
                                  whileHover={{ x: 4 }}
                                  whileTap={{ scale: 0.98 }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="truncate">{subItem.name}</span>
                                    {location.pathname === subItem.path && (
                                      <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-1.5 h-1.5 rounded-full bg-[#222222] flex-shrink-0 ml-2"
                                      />
                                    )}
                                  </div>
                                </motion.button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <motion.button
                      onClick={() => handleNavigation(item.path)}
                      className={`w-full flex items-center px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium transition-all duration-200 ${location.pathname === item.path
                        ? 'bg-green-400 text-[#222222] shadow-xl'
                        : 'text-white bg-[#2a2a2a] hover:bg-[#333333]'
                        }`}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {getMenuIcon(item.name)}
                      <span className="ml-3">{item.name}</span>
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
