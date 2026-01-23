import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ArrowUpIcon from '../ui/ArrowUpIcon';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Show button on scroll
  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 200);
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Botón flotante para subir arriba */}
      {show && (
        <button
          onClick={handleClick}
          aria-label="Subir arriba"
          className="cursor-pointer fixed bottom-6 right-6 z-50 bg-[#a1db87] hover:bg-[#b8e6a8] text-[#23272f] rounded-full shadow-lg focus:outline-none transition-all duration-200 border-2 border-[#23272f]/10"
          style={{ outline: 'none', boxShadow: '0 4px 24px 0 #23272f33' }}
        >
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="19" cy="19" r="19" fill="none" />
            <path d="M19 27V13M19 13l-6 6M19 13l6 6" stroke="#23272f" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}
