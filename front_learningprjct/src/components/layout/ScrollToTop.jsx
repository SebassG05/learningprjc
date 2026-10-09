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
          className="fixed bottom-6 right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-line-strong material text-ink shadow-raised transition-colors duration-200 hover:bg-white/[0.12] sm:right-6"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 19V5M12 5l-6 6M12 5l6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </>
  );
}
