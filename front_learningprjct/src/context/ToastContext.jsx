import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'info', duration = 2500) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), duration);
  }, []);

  // Colores: info=azul, success=verde, error=rojo
  const getColor = (type) => {
    if (type === 'success') return 'bg-brand';
    if (type === 'error') return 'bg-red-400';
    return 'bg-sky-400';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            aria-live="polite"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="fixed inset-x-4 bottom-6 z-[9999] mx-auto flex w-fit max-w-[calc(100vw-2rem)] items-center gap-3 rounded-full border border-line material-thick px-5 py-3 text-sm font-medium text-ink shadow-overlay sm:inset-x-auto sm:right-6 sm:mx-0"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${getColor(toast.type)}`} aria-hidden="true" />
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
