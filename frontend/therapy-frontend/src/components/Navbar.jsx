import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart, Sun, Moon } from 'lucide-react';
import { useAuth, getGreeting } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark mb-0">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <Heart size={22} fill="white" />
          <span>Special Kids Therapy Center</span>
        </Link>

        {/* Right side */}
        <div className="d-flex align-items-center gap-2 gap-md-3 ms-auto flex-wrap">

          {/* Theme Toggle */}
          <button
            id="theme-toggle-btn"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? (
              <Moon size={15} strokeWidth={2} />
            ) : (
              <Sun size={15} strokeWidth={2} />
            )}
            <span className="d-none d-sm-inline">
              {theme === 'light' ? 'Dark' : 'Light'}
            </span>
          </button>

          {/* Auth section */}
          {auth.token ? (
            <div className="d-flex align-items-center gap-2 gap-md-3">
              <span className="text-white small fw-medium d-none d-md-inline">
                {getGreeting(auth.firstName, auth.role)}
              </span>
              <span
                className="badge rounded-pill px-3 py-2"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                {auth.role}
              </span>
              <button
                id="logout-btn"
                className="btn btn-sm d-flex align-items-center gap-1 px-3 rounded-pill"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none' }}
                onClick={handleLogout}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <Link
                to="/login"
                className="btn btn-sm text-white border-white rounded-pill px-3"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-sm bg-white rounded-pill px-3 fw-bold"
                style={{ color: 'var(--bs-primary)' }}
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
