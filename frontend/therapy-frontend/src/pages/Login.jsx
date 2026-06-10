import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, ShieldOff, Eye, EyeOff, ArrowLeft, Shield, Stethoscope, ClipboardList, Users } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

// Per-email localStorage key so lockout only affects the specific account
const getLockoutKey = (email) => `lockoutUntil::${email.toLowerCase().trim()}`;

const Login = () => {
  const [selectedRole, setSelectedRole] = useState(null);
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

      // Verify that the user's role matches the selected role
      const userRole = response.data.role;
      const expectedRole = selectedRole === 'Parent' ? 'Guardian' : selectedRole;
      if (userRole.toLowerCase() !== expectedRole.toLowerCase()) {
        const errorMsg = `This account does not have ${selectedRole} privileges.`;
        setError(errorMsg);
        addToast(errorMsg, 'error');
        setPassword('');
        setLoading(false);
        return;
      }

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

  const getRoleBranding = (role) => {
    switch (role) {
      case 'Parent':
        return {
          title: 'Parent / Guardian',
          gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
          icon: Users
        };
      case 'Doctor':
        return {
          title: 'Doctor / Therapist',
          gradient: 'linear-gradient(135deg, #10b981, #047857)',
          icon: Stethoscope
        };
      case 'Receptionist':
        return {
          title: 'Receptionist',
          gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
          icon: ClipboardList
        };
      case 'Admin':
        return {
          title: 'Administrator',
          gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          icon: Shield
        };
      default:
        return {
          title: 'Sign In',
          gradient: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))',
          icon: LogIn
        };
    }
  };

  if (!selectedRole) {
    const rolesConfig = [
      {
        id: 'Parent',
        title: 'Parent / Guardian',
        desc: 'Book appointments, view therapy findings & make payments.',
        gradient: 'linear-gradient(135deg, #ec4899, #be185d)',
        icon: Users
      },
      {
        id: 'Doctor',
        title: 'Doctor / Therapist',
        desc: 'View appointments, log findings & recommendations.',
        gradient: 'linear-gradient(135deg, #10b981, #047857)',
        icon: Stethoscope
      },
      {
        id: 'Receptionist',
        title: 'Receptionist',
        desc: 'Manage appointments, schedule slots & assign doctors.',
        gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
        icon: ClipboardList
      },
      {
        id: 'Admin',
        title: 'Administrator',
        desc: 'Manage users, therapies, payments & system settings.',
        gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
        icon: Shield
      }
    ];

    return (
      <div className="row justify-content-center animate-fade-in" style={{ marginTop: '4vh' }}>
        <div className="col-12 text-center mb-5">
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
          }}>
            <LogIn size={28} color="white" />
          </div>
          <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Sign In</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto' }}>
            Welcome to Special Kids Therapy Center. Please select your role to proceed to the login portal.
          </p>
        </div>

        <div className="col-lg-10">
          <div className="row g-4 justify-content-center">
            {rolesConfig.map((role) => {
              const IconComponent = role.icon;
              return (
                <div key={role.id} className="col-md-6 col-xl-3">
                  <div
                    className="card border-0 shadow-sm h-100 cursor-pointer text-center hover-lift animate-fade-in"
                    onClick={() => setSelectedRole(role.id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border)',
                      transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.3s ease, border-color 0.3s ease',
                    }}
                  >
                    <div className="card-body p-4 d-flex flex-column align-items-center justify-content-between">
                      <div className="mb-4" style={{
                        width: 60, height: 60, borderRadius: '50%',
                        background: role.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                      }}>
                        <IconComponent size={26} color="white" />
                      </div>
                      <div>
                        <h4 className="fw-bold mb-2" style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>
                          {role.title}
                        </h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.4' }}>
                          {role.desc}
                        </p>
                      </div>
                      <div className="mt-3 w-100">
                        <button className="btn btn-outline-theme btn-sm w-100 py-2 rounded-pill fw-semibold">
                          Login as {role.id === 'Parent' ? 'Parent' : role.id}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="col-12 text-center mt-5">
          <p className="small" style={{ color: 'var(--text-secondary)' }}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--primary)' }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const branding = getRoleBranding(selectedRole);
  const RoleIcon = branding.icon;

  return (
    <div className="row justify-content-center animate-fade-in" style={{ marginTop: '5vh' }}>
      <div className="col-md-5 col-lg-4">
        <button
          type="button"
          className="btn btn-link text-decoration-none text-secondary d-inline-flex align-items-center gap-1 mb-3 p-0"
          onClick={() => {
            setSelectedRole(null);
            setError('');
          }}
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowLeft size={16} /> Back to roles
        </button>

        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: isLocked
              ? 'linear-gradient(135deg, #f59e0b, #ef4444)'
              : branding.gradient,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
            transition: 'background 0.4s'
          }}>
            {isLocked ? <ShieldOff size={28} color="white" /> : <RoleIcon size={28} color="white" />}
          </div>
          <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Sign in as {branding.title}</p>
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
