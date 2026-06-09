import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, ShieldOff, Eye, EyeOff } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Per-email localStorage key so lockout only affects the specific account
const getLockoutKey = (email) => `lockoutUntil::${email.toLowerCase().trim()}`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Countdown state — seconds remaining
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  const navigate = useNavigate();
  const { login } = useAuth();
  const { addToast } = useToast();

  // Re-evaluate lockout whenever the email changes
  useEffect(() => {
    clearInterval(timerRef.current);
    setCountdown(0);
    setError('');

    if (!email) return;

    const stored = localStorage.getItem(getLockoutKey(email));
    if (stored) {
      const remaining = Math.ceil((new Date(stored) - Date.now()) / 1000);
      if (remaining > 0) startCountdown(email, remaining);
      else localStorage.removeItem(getLockoutKey(email));
    }

    return () => clearInterval(timerRef.current);
  }, [email]);

  // Cleanup on unmount
  useEffect(() => () => clearInterval(timerRef.current), []);

  // Countdown ticker
  const startCountdown = (lockedEmail, seconds) => {
    clearInterval(timerRef.current);
    setCountdown(seconds);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          localStorage.removeItem(getLockoutKey(lockedEmail));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Format seconds as MM:SS
  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const isLocked = countdown > 0;

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      addToast('Welcome back! Successfully logged in.', 'success');
      navigate(`/${response.data.role.toLowerCase()}`);
    } catch (err) {
      if (err.response?.status === 423) {
        const data = err.response.data;
        const lockoutUntil = data?.lockoutUntil || data;
        if (lockoutUntil) {
          localStorage.setItem(getLockoutKey(email), lockoutUntil);
          const remaining = Math.ceil((new Date(lockoutUntil) - Date.now()) / 1000);
          if (remaining > 0) startCountdown(email, remaining);
        }
        setPassword('');
        addToast('Account temporarily locked due to too many failed attempts.', 'error');
      } else {
        const msg = err.response?.data || 'Invalid email or password. Please try again.';
        setError(msg);
        addToast(msg, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row justify-content-center" style={{ marginTop: '8vh' }}>
      <div className="col-md-5 col-lg-4">
        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: isLocked
              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
              : 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            transition: 'background 0.4s'
          }}>
            {isLocked ? <ShieldOff size={28} color="white" /> : <LogIn size={28} color="white" />}
          </div>
          <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in to Special Kids Therapy Center</p>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div className="card-body p-4 p-md-5">

            {/* Lockout banner with countdown */}
            {isLocked && (
              <div
                className="rounded-3 mb-3 p-3 text-center"
                style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.35)' }}
              >
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#b45309', letterSpacing: 2, fontVariantNumeric: 'tabular-nums' }}>
                  {formatCountdown(countdown)}
                </div>
                <div className="small mt-1" style={{ color: '#92400e' }}>
                  🔒 Account locked. Fields will unlock when timer reaches 00:00.
                </div>
              </div>
            )}

            {/* General error */}
            {error && !isLocked && (
              <div className="alert alert-danger rounded-3 small">{error}</div>
            )}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label small fw-semibold">Email Address</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <User size={18} color="var(--text-secondary)" />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 py-2"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <label className="form-label small fw-semibold mb-0">Password</label>
                </div>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <Lock size={18} color="var(--text-secondary)" />
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control border-start-0 border-end-0 py-2"
                    placeholder={isLocked ? 'Locked — wait for timer' : '••••••••'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLocked}
                    required
                  />
                  <button
                    type="button"
                    className="input-group-text border-start-0 px-3 d-flex align-items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                    style={{ cursor: 'pointer', background: 'var(--input-group-bg)', borderColor: 'var(--input-border)' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={`btn w-100 py-3 rounded-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2${isLocked ? '' : ' btn-primary'}`}
                style={isLocked ? { background: 'rgba(245,158,11,0.10)', color: '#b45309', border: '1px solid rgba(245,158,11,0.3)' } : {}}
                disabled={loading || isLocked}
              >
                {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {isLocked ? '🔒 Account Locked' : loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                <p className="small" style={{ color: 'var(--text-secondary)' }}>
                  Don&apos;t have an account?{' '}
                  <Link to="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--primary)' }}>
                    Register here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
