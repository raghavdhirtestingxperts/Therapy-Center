import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MedicalServices } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <MedicalServices />
        Therapy Center
      </Link>
      
      <div className="navbar-links">
        {/* We can dynamically render these based on Auth state later */}
      </div>

      <div className="auth-buttons">
        {isAuthenticated ? (
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        ) : (
          <>
            {location.pathname !== '/login' && (
              <Link to="/login" className="btn-secondary">
                Login
              </Link>
            )}
            {location.pathname !== '/register' && (
              <Link to="/register" className="btn-primary">
                Register
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
