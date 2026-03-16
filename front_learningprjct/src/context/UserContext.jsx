import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for token and fetch fresh user data from backend
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      // Primero cargar datos del localStorage (para evitar flash)
      try {
        setUser(JSON.parse(userData));
      } catch {
        setUser(null);
      }
      
      // Luego actualizar con datos frescos del backend
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8547';
      console.log('🔄 Obteniendo datos del usuario desde:', `${apiUrl}/api/users/me`);
      
      fetch(`${apiUrl}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('📡 Respuesta del servidor:', res.status);
          if (!res.ok) {
            throw new Error('Token inválido');
          }
          return res.json();
        })
        .then(data => {
          console.log('✅ Datos recibidos del backend:', data);
          console.log('👤 Usuario actualizado:', data.user);
          console.log('🎭 Role del usuario:', data.user?.role);
          
          // Actualizar con datos frescos que incluyen el role
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
          setLoading(false);
        })
        .catch(err => {
          console.error('❌ Error al obtener datos del usuario:', err);
          // No limpiar si es solo un error de red - mantener sesión offline
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
