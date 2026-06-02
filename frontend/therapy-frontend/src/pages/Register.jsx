import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, UserPlus } from 'lucide-react';
import API_BASE_URL from '../apiConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', passwordHash: '', role: 'Guardian', phoneNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await axios.post(`${API_BASE_URL}/auth/register`, formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center" style={{ marginTop: '6vh' }}>
      <div className="col-md-6 col-lg-5">
        <div className="text-center mb-4">
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
          }}>
            <UserPlus size={28} color="white" />
          </div>
          <h2 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Join the Special Kids Therapy Center</p>
        </div>

        <div className="card shadow-sm border-0" style={{ borderRadius: 'var(--radius-lg)' }}>
          <div className="card-body p-4 p-md-5">
            {error && <div className="alert alert-danger rounded-3 small">{error}</div>}
            {success && (
              <div className="alert alert-success rounded-3 small">
                Registration successful! Redirecting to login...
              </div>
            )}

            <form onSubmit={handleRegister}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">First Name</label>
                  <input
                    type="text"
                    className="form-control py-2"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label small fw-semibold">Last Name</label>
                  <input
                    type="text"
                    className="form-control py-2"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <Mail size={18} color="var(--text-secondary)" />
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 py-2"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Password</label>
                <div className="input-group">
                  <span className="input-group-text border-end-0">
                    <Lock size={18} color="var(--text-secondary)" />
                  </span>
                  <input
                    type="password"
                    className="form-control border-start-0 py-2"
                    value={formData.passwordHash}
                    onChange={e => setFormData({ ...formData, passwordHash: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Phone Number</label>
                <input
                  type="text"
                  className="form-control py-2"
                  value={formData.phoneNumber}
                  onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-semibold">Register As</label>
                <select
                  className="form-select py-2"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Guardian">Guardian / Parent</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 rounded-3 fw-bold mb-3"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Register Now'}
              </button>

              <div className="text-center">
                <p className="small" style={{ color: 'var(--text-secondary)' }}>
                  Already have an account?{' '}
                  <Link to="/login" className="fw-bold text-decoration-none" style={{ color: 'var(--primary)' }}>
                    Sign in
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

export default Register;
