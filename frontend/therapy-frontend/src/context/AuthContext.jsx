import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

/**
 * Provides a reactive auth state shared across the entire app.
 * Replaces the pattern of reading localStorage directly in each component,
 * which caused the UI to not react to login/logout events.
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
  }));

  /**
   * Called after a successful login.
   * Stores the credentials in both React state and localStorage.
   * @param {{ token: string, role: string, userId: string|number }} data
   */
  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', String(data.userId));
    setAuth({ token: data.token, role: data.role, userId: String(data.userId) });
  };

  /**
   * Called on logout. Clears both React state and localStorage.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setAuth({ token: null, role: null, userId: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access auth state and actions from any component.
 * Must be used inside <AuthProvider>.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
