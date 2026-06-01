import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const AuthContext = createContext(null);

export const getGreeting = (firstName, role) => {
  const hour = new Date().getHours();
  let timeGreeting = "Hello";
  if (hour < 12) timeGreeting = "Good Morning";
  else if (hour < 17) timeGreeting = "Good Afternoon";
  else timeGreeting = "Good Evening";

  const name = firstName || role || '';
  return name ? `${timeGreeting}, ${name}` : timeGreeting;
};

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
    firstName: localStorage.getItem('firstName'),
    lastName: localStorage.getItem('lastName'),
  }));

  /**
   * Called after a successful login.
   * Stores the credentials in both React state and localStorage.
   * @param {{ token: string, role: string, userId: string|number, firstName: string, lastName: string }} data
   */
  const login = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('userId', String(data.userId));
    localStorage.setItem('firstName', data.firstName || '');
    localStorage.setItem('lastName', data.lastName || '');
    setAuth({
      token: data.token,
      role: data.role,
      userId: String(data.userId),
      firstName: data.firstName || '',
      lastName: data.lastName || '',
    });
  };

  /**
   * Called on logout. Clears both React state and localStorage.
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    setAuth({ token: null, role: null, userId: null, firstName: null, lastName: null });
  };

  useEffect(() => {
    if (auth.token && !auth.firstName) {
      axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${auth.token}` }
      })
      .then(res => {
        const { firstName, lastName } = res.data;
        localStorage.setItem('firstName', firstName || '');
        localStorage.setItem('lastName', lastName || '');
        setAuth(prev => ({
          ...prev,
          firstName: firstName || '',
          lastName: lastName || '',
        }));
      })
      .catch(err => {
        console.error('Failed to fetch user profile:', err);
        if (err.response && err.response.status === 401) {
          logout();
        }
      });
    }
  }, [auth.token, auth.firstName]);

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
