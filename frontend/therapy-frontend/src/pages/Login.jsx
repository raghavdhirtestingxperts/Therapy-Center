import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('role', response.data.role);
      localStorage.setItem('userId', response.data.userId);
      if (onLogin) onLogin();
      navigate(`/${response.data.role.toLowerCase()}`);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
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
            {error && <div className="alert alert-danger rounded-3 border-0 small">{error}</div>}

            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><User size={18} color="var(--text-secondary)" /></span>
                  <input type="email" className="form-control bg-light border-start-0 py-2" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0"><Lock size={18} color="var(--text-secondary)" /></span>
                  <input type="password" className="form-control bg-light border-start-0 py-2" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
              </div>

              <button type="submit" className="btn btn-primary w-100 py-3 rounded-3 fw-bold mb-3" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="text-center">
                <p className="small" style={{ color: 'var(--text-secondary)' }}>
                  Don't have an account?{' '}
                  <Link to="/register" className="fw-bold text-decoration-none" style={{ color: 'var(--bs-primary)' }}>Register here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        <div className="text-center mt-4">
          <p className="small" style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
            Demo: admin@therapycenter.com / admin123
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
