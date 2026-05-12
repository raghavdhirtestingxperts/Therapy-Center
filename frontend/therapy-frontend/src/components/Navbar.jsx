import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart } from 'lucide-react';

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    if (onLogout) onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark mb-0" style={{ background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))' }}>
      <div className="container">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <Heart size={22} fill="white" /> Special Kids Therapy Center
        </Link>
        {token ? (
          <div className="d-flex align-items-center gap-3">
            <span className="badge rounded-pill px-3 py-2" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{role}</span>
            <button className="btn btn-sm d-flex align-items-center gap-1 px-3 rounded-pill" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }} onClick={handleLogout}>
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
