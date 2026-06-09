import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Heart, Sun, Moon, Key, History, ChevronDown, CheckCircle, XCircle, Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth, getGreeting } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import api from '../api';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Dropdown open state
  const [menuOpen, setMenuOpen] = useState(false);

  // Change Password modal state
  const [showChangePw, setShowChangePw] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNextPw, setShowNextPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Login History modal state
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    addToast('Logged out successfully.', 'info');
    navigate('/login');
  };

  // Change Password
  const openChangePw = () => {
    setMenuOpen(false);
    setPwForm({ current: '', next: '', confirm: '' });
    setPwError('');
    setPwSuccess('');
    setShowCurrentPw(false);
    setShowNextPw(false);
    setShowConfirmPw(false);
    setShowChangePw(true);
  };

  const closeChangePw = () => {
    setShowChangePw(false);
    setShowCurrentPw(false);
    setShowNextPw(false);
    setShowConfirmPw(false);
  };

  const handleChangePw = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (pwForm.next.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.next === pwForm.current) {
      setPwError('New password must be different from your current password.');
      return;
    }

    setPwLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next
      });
      setPwSuccess('Password changed successfully!');
      addToast('Password changed successfully!', 'success');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      const msg = err.response?.data || 'Failed to change password.';
      setPwError(msg);
      addToast(msg, 'error');
    } finally {
      setPwLoading(false);
    }
  };

  // Login History
  const openHistory = async () => {
    setMenuOpen(false);
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const res = await api.get('/auth/login-history');
      setHistory(res.data);
    } catch {
      setHistory([]);
      addToast('Failed to load login history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark mb-0 fixed-top" style={{ zIndex: 1040 }}>
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
              <div className="d-flex align-items-center gap-2 gap-md-3 position-relative">
                <span className="text-white small fw-medium d-none d-md-inline">
                  {getGreeting(auth.firstName, auth.role)}
                </span>
                <span
                  className="badge rounded-pill px-3 py-2"
                  style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                >
                  {auth.role}
                </span>

                <NotificationBell />

                {/* User dropdown trigger */}
                <div className="position-relative" ref={userMenuRef}>
                  <button
                    id="user-menu-btn"
                    className="btn btn-sm d-flex align-items-center gap-2 px-3 rounded-pill"
                    style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', fontWeight: 500, fontSize: '0.85rem', letterSpacing: '0.01em' }}
                    onClick={() => setMenuOpen(o => !o)}
                    aria-expanded={menuOpen}
                    aria-haspopup="true"
                  >
                    <span className="d-none d-sm-inline">Settings</span>
                    <ChevronDown size={13} style={{ transition: 'transform 0.2s', transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                  </button>

                  {menuOpen && (
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 10px)', right: 0,
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 14,
                        boxShadow: 'var(--shadow-premium)',
                        minWidth: 210, zIndex: 9999, overflow: 'hidden',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <button
                        id="change-password-btn"
                        className="d-flex align-items-center gap-2 px-4 py-3"
                        style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-glow)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        onClick={openChangePw}
                      >
                        <Key size={15} color="var(--primary)" /> Change Password
                      </button>
                      <button
                        id="login-history-btn"
                        className="d-flex align-items-center gap-2 px-4 py-3"
                        style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-glow)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        onClick={openHistory}
                      >
                        <History size={15} color="var(--accent-teal)" /> Login History
                      </button>
                      <hr style={{ margin: '4px 16px', borderColor: 'var(--border)' }} />
                      <button
                        id="logout-btn"
                        className="d-flex align-items-center gap-2 px-4 py-3"
                        style={{ color: 'var(--error)', background: 'none', border: 'none', width: '100%', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                        onClick={handleLogout}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-sm text-white border-white rounded-pill px-3">
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

      {/* ── Change Password Modal ──────────────────────────────────────────────── */}
      {showChangePw && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={e => { if (e.target === e.currentTarget) closeChangePw(); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 420 }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Key size={18} color="white" />
                  </div>
                  <h5 className="modal-title fw-bold mb-0">Change Password</h5>
                </div>
                <button type="button" className="btn-close" onClick={closeChangePw} />
              </div>

              <form onSubmit={handleChangePw}>
                <div className="modal-body px-4 pt-3">
                  {pwError && (
                    <div className="alert alert-danger rounded-3 small py-2 d-flex align-items-center gap-2">
                      <XCircle size={16} /> {pwError}
                    </div>
                  )}
                  {pwSuccess && (
                    <div className="alert alert-success rounded-3 small py-2 d-flex align-items-center gap-2">
                      <CheckCircle size={16} /> {pwSuccess}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Current Password</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <Lock size={18} color="var(--text-secondary)" />
                      </span>
                      <input
                        type={showCurrentPw ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 py-2"
                        placeholder="Enter current password"
                        value={pwForm.current}
                        onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text border-start-0 px-3 d-flex align-items-center"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        style={{ cursor: 'pointer', background: 'var(--input-group-bg)', borderColor: 'var(--input-border)' }}
                      >
                        {showCurrentPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">New Password</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <Lock size={18} color="var(--text-secondary)" />
                      </span>
                      <input
                        type={showNextPw ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 py-2"
                        placeholder="Min. 6 characters"
                        value={pwForm.next}
                        onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text border-start-0 px-3 d-flex align-items-center"
                        onClick={() => setShowNextPw(!showNextPw)}
                        style={{ cursor: 'pointer', background: 'var(--input-group-bg)', borderColor: 'var(--input-border)' }}
                      >
                        {showNextPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-1">
                    <label className="form-label small fw-semibold">Confirm New Password</label>
                    <div className="input-group">
                      <span className="input-group-text border-end-0">
                        <Lock size={18} color="var(--text-secondary)" />
                      </span>
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        className="form-control border-start-0 border-end-0 py-2"
                        placeholder="Repeat new password"
                        value={pwForm.confirm}
                        onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                        required
                      />
                      <button
                        type="button"
                        className="input-group-text border-start-0 px-3 d-flex align-items-center"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        style={{ cursor: 'pointer', background: 'var(--input-group-bg)', borderColor: 'var(--input-border)' }}
                      >
                        {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 px-4 pb-4 pt-2 gap-2">
                  <button type="button" className="btn btn-light rounded-3 px-4" onClick={closeChangePw}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-3 px-4 d-flex align-items-center gap-2"
                    disabled={pwLoading}
                  >
                    {pwLoading && <span className="spinner-border spinner-border-sm" />}
                    {pwLoading ? 'Saving…' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Login History Modal ────────────────────────────────────────────────── */}
      {showHistory && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}
          onClick={e => { if (e.target === e.currentTarget) setShowHistory(false); }}
        >
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 520 }}>
            <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#14b8a6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <History size={18} color="white" />
                  </div>
                  <h5 className="modal-title fw-bold mb-0">Login History</h5>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowHistory(false)} />
              </div>

              <div className="modal-body px-4 pt-3 pb-4">
                <p className="small text-muted mb-3">
                  {history.length === 0
                    ? 'No login records found.'
                    : `Showing your last ${history.length} login ${history.length === 1 ? 'attempt' : 'attempts'}`}
                </p>

                {historyLoading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status" />
                  </div>
                ) : history.length === 0 ? (
                  <p className="text-muted text-center py-3">No login history found.</p>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {history.map((h, i) => (
                      <div
                        key={h.id ?? i}
                        className="d-flex align-items-center justify-content-between px-3 py-2 rounded-3"
                        style={{
                          background: h.isSuccess ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                          border: `1px solid ${h.isSuccess ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          {h.isSuccess
                            ? <CheckCircle size={16} color="#22c55e" />
                            : <XCircle size={16} color="#ef4444" />
                          }
                          <div>
                            <div className="small fw-semibold" style={{ color: h.isSuccess ? '#22c55e' : '#ef4444' }}>
                              {h.isSuccess ? 'Successful Login' : 'Failed Attempt'}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {h.ipAddress || 'Unknown IP'}
                            </div>
                          </div>
                        </div>
                        <div className="text-muted text-end" style={{ fontSize: '0.72rem' }}>
                          {h.attemptedAt}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
