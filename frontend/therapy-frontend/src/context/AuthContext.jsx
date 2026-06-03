import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const AuthContext = createContext(null);

// ─── Session timeout config ───────────────────────────────────────────────────
// How long (ms) a user can be completely idle before auto-logout.
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes of inactivity
// Activity events that reset the idle timer.
const ACTIVITY_EVENTS = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll', 'click'];

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
 * Includes idle-based session timeout with a styled expiry dialog.
 */
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
    firstName: localStorage.getItem('firstName'),
    lastName: localStorage.getItem('lastName'),
  }));

  // Whether the "Session Expired" modal is visible
  const [sessionExpired, setSessionExpired] = useState(false);

  // Internal ref to the idle timer so we can clear/reset it
  const idleTimerRef = useRef(null);

  // ── Logout (clear state + storage) ──────────────────────────────────────────
  const logout = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    setAuth({ token: null, role: null, userId: null, firstName: null, lastName: null });
    setSessionExpired(false);
  }, []);

  // ── Trigger the session-expired modal then clear state ───────────────────────
  const expireSession = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    localStorage.removeItem('lastName');
    setAuth({ token: null, role: null, userId: null, firstName: null, lastName: null });
    setSessionExpired(true);
  }, []);

  // ── Reset idle countdown on user activity ────────────────────────────────────
  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(expireSession, SESSION_TIMEOUT_MS);
  }, [expireSession]);

  // ── Start / stop the idle timer whenever login state changes ─────────────────
  useEffect(() => {
    if (!auth.token) {
      clearTimeout(idleTimerRef.current);
      return;
    }

    // Start watching for inactivity
    resetIdleTimer();

    ACTIVITY_EVENTS.forEach(evt =>
      window.addEventListener(evt, resetIdleTimer, { passive: true })
    );

    return () => {
      clearTimeout(idleTimerRef.current);
      ACTIVITY_EVENTS.forEach(evt =>
        window.removeEventListener(evt, resetIdleTimer)
      );
    };
  }, [auth.token, resetIdleTimer]);

  // ── Login ────────────────────────────────────────────────────────────────────
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
    setSessionExpired(false);
  };

  // ── Auto-fetch profile if token exists but name is missing ───────────────────
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
  }, [auth.token, auth.firstName, logout]);

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
      {sessionExpired && <SessionExpiredModal onDismiss={() => setSessionExpired(false)} />}
    </AuthContext.Provider>
  );
}

// ─── Session Expired Modal ────────────────────────────────────────────────────
function SessionExpiredModal({ onDismiss }) {
  return (
    <div className="session-expired-overlay" role="dialog" aria-modal="true" aria-labelledby="session-expired-title">
      <div className="session-expired-card">
        {/* Icon */}
        <div className="session-expired-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Text */}
        <h2 id="session-expired-title" className="session-expired-title">Session Expired</h2>
        <p className="session-expired-body">
          You were inactive for a while and have been automatically signed out for your security.
        </p>
        <p className="session-expired-sub">Please sign in again to continue.</p>

        {/* CTA */}
        <a href="/login" className="session-expired-btn" onClick={onDismiss}>
          Sign In Again
        </a>
      </div>
    </div>
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
