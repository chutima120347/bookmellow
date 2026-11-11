import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [member, setMember] = useState(null);

  const login = (userData) => {
    setIsLoggedIn(true);
    // ตรวจสอบสิทธิ์ Admin จาก role หรือ email
    const isAdminUser = userData?.role === 'Admin' || userData?.email?.includes('admin');
    setIsAdmin(isAdminUser);
    setMember(userData || { displayName: 'คุณนักอ่าน' });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setIsAdmin(false);
    setMember(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAdmin, member, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}