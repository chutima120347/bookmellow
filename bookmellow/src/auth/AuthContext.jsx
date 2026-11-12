import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const normalizeUser = (userData) => {
    if (!userData) return null;
    const isAdminFlag =
      userData.isAdmin === true ||
      userData.is_admin === true ||
      userData.is_admin === 1 ||
      String(userData.role || '').toLowerCase() === 'admin';

    return {
      ...userData,
      isAdmin: isAdminFlag,
    };
  };

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (savedUser && token) {
        setUser(normalizeUser(JSON.parse(savedUser)));
      }
    } catch (err) {
      console.error('Error reading user from localStorage:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    const normalized = normalizeUser(userData);
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
    if (token) {
      localStorage.setItem('token', token);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}