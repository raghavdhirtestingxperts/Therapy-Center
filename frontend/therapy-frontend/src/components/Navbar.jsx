import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart } from 'lucide-react';
import { useAuth, getGreeting } from '../context/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark mb-0" style={{ background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <Heart size={22} fill="white" /> Special Kids Therapy Center
        </Link>
        {auth.token ? (
          <div className="d-flex align-items-center gap-3">
            <span className="text-white small fw-medium">{getGreeting(auth.firstName, auth.role)}</span>
            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{auth.role}</span>
            <button
              className="btn btn-sm d-flex align-items-center gap-1 px-3 rounded-pill"
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}
              onClick={handleLogout}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-2">
            <Link to="/login" className="btn btn-sm text-white border-white rounded-pill px-3">Login</Link>
            <Link to="/register" className="btn btn-sm bg-white text-primary rounded-pill px-3 fw-bold">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
