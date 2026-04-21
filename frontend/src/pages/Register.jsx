import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'Patient' // default role
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/Auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to register');
      }

      // Successfully registered
      navigate('/login');
    } catch (err) {
      console.error('Register error:', err);
      setError(err.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="auth-page animate-fade-in">
      <div className="card glass auth-box">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-subtitle">Join the Therapy Center System</p>
        
        {error && <div className="error-message" style={{ color: 'var(--error)', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 'var(--radius)', textAlign: 'center', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password" 
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required 
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input 
              type="tel" 
              id="phoneNumber" 
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="123-456-7890"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" value={formData.role} onChange={handleChange}>
              <option value="Patient">Patient</option>
              <option value="Doctor">Doctor</option>
              <option value="Receptionist">Receptionist</option>
            </select>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            <PersonAddIcon /> {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
