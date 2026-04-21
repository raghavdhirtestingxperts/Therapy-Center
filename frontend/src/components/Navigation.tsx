import { Link, useLocation } from 'react-router-dom';
import { MedicalServices } from '@mui/icons-material';

const Navigation = () => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('user');

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
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
