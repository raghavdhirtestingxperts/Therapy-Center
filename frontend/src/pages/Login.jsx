import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login as LoginIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/Auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to login');
      }

      const userData = await response.json();
      
      // Setup active user token universally via Context
      login({
        userId: userData.userId,
        email: userData.email,
        role: userData.role,
        firstName: userData.firstName,
        lastName: userData.lastName,
        token: userData.token
      });
      
      // Navigate dynamically based on role!
      const userRole = userData.role?.toLowerCase() || 'patient';
      navigate(`/${userRole}`, { replace: true });
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="card glass auth-box">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to the Therapy Center Management System</p>
        
        {error && <div className="error-message" style={{ color: 'var(--error)', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        
        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required 
            />
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            <LoginIcon /> {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
