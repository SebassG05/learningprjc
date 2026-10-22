import { createContext, useContext, useState, useEffect } from 'react';
import { sessionCheckResult } from '../lib/session';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and fetch fresh user data from backend
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Sesión rota de antes (token «undefined»): fuera sin preguntar al servidor
      if (sessionCheckResult(null, token) === 'expired') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setLoading(false);
        return;
      }

      // Primero cargar datos del localStorage (para evitar flash)
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }

      // Luego confirmar con el backend: si el token ya no vale (401), se cierra la sesión; si es un
      // error de red, se conserva
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
      fetch(`${apiUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(async (res) => {
          const result = sessionCheckResult(res, token);
          if (result === 'expired') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          } else if (result === 'valid') {
            const data = await res.json();
            setUser(data.user);
            localStorage.setItem('user', JSON.stringify(data.user));
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('❌ Error al obtener datos del usuario:', err);
          // Error de red: se mantiene la sesión guardada
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
