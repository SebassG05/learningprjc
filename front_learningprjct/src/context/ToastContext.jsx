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
    if (type === 'success') return 'bg-green-600 text-white';
    if (type === 'error') return 'bg-red-600 text-white';
    return 'bg-blue-600 text-white';
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.35 }}
            className={`fixed bottom-8 right-8 z-[9999] px-6 py-3 rounded-xl shadow-lg font-semibold text-base ${getColor(toast.type)}`}
            style={{ minWidth: 220 }}
          >
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
