import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, LogIn, ShieldCheck, ArrowLeft, RefreshCw } from 'lucide-react';
import API_BASE_URL from '../apiConfig';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [mfaSessionId, setMfaSessionId] = useState('');
  const [otp, setOtp] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Cooldown timer for resending OTP code
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      
      if (response.data.mfaRequired) {
        setShowMfa(true);
        setMfaSessionId(response.data.mfaSessionId);
        setResendCooldown(30); // 30 second cooldown
      } else {
        // Fallback if MFA is disabled/not required
        login(response.data);
        navigate(`/${response.data.role.toLowerCase()}`);
      }
    } catch (err) {
      setError(err.response?.data || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { mfaSessionId, otp });
      login(response.data);
      navigate(`/${response.data.role.toLowerCase()}`);
    } catch (err) {
      setError(err.response?.data || 'Invalid or expired verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;
    setResendLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, { mfaSessionId });
      setMfaSessionId(response.data.mfaSessionId);
      setResendCooldown(30);
      setOtp('');
      setError('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data || 'Failed to resend verification code. Please try logging in again.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setShowMfa(false);
    setMfaSessionId('');
    setOtp('');
    setError('');
  };

  return (
    <div className="row justify-content-center" style={{ marginTop: '8vh' }}>
      <div className="col-md-5 col-lg-4">
        {!showMfa ? (
          /* Credentials Form Screen */
          <>
            <div className="text-center mb-4">
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
              }}>
                <LogIn size={28} color="white" />
              </div>
              <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Sign in to Special Kids Therapy Center</p>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className={`alert ${error.includes('sent') ? 'alert-success' : 'alert-danger'} rounded-3 small`}>
                    {error}
                  </div>
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
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Password</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <Lock size={18} color="var(--text-secondary)" />
                      </span>
                      <input
                        type="password"
                        className="form-control border-start-0 py-2"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 rounded-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                    {loading ? 'Verifying...' : 'Sign In'}
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

            <div className="text-center mt-4">
              <p className="small" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                Demo: admin@therapycenter.com / admin123
              </p>
            </div>
          </>
        ) : (
          /* MFA Verification Code Screen */
          <>
            <div className="text-center mb-4">
              <div style={{
                width: 64, height: 64, borderRadius: 16,
                background: 'linear-gradient(135deg, var(--bs-success), var(--bs-info))',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
              }}>
                <ShieldCheck size={28} color="white" />
              </div>
              <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Enter Code</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Check your email inbox for a verification code</p>
            </div>

            <div className="card shadow-sm border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
              <div className="card-body p-4 p-md-5">
                {error && (
                  <div className={`alert ${error.includes('sent') ? 'alert-success' : 'alert-danger'} rounded-3 small`}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp}>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold text-center d-block">6-Digit Code</label>
                    <input
                      type="text"
                      className="form-control text-center fs-2 fw-bold tracking-widest py-2"
                      placeholder="000000"
                      maxLength={6}
                      pattern="[0-9]{6}"
                      inputMode="numeric"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-success w-100 py-3 rounded-3 fw-bold mb-3 d-flex align-items-center justify-content-center gap-2"
                    disabled={loading || otp.length !== 6}
                  >
                    {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                    {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <button
                      type="button"
                      onClick={handleBackToLogin}
                      className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 small"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <ArrowLeft size={16} /> Back to Sign In
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || resendLoading}
                      className="btn btn-link text-decoration-none p-0 d-flex align-items-center gap-1 small"
                      style={{ color: resendCooldown > 0 ? 'var(--text-muted)' : 'var(--primary)' }}
                    >
                      <RefreshCw size={14} className={resendLoading ? 'spin' : ''} />
                      {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
