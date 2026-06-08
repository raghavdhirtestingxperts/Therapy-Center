import { useNavigate } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 20,
        background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24
      }}>
        <AlertTriangle size={36} color="white" />
      </div>
      <h1 className="fw-bold mb-2" style={{ fontSize: '4rem', color: 'var(--text-primary)' }}>404</h1>
      <h4 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Page Not Found</h4>
      <p className="text-muted mb-4" style={{ maxWidth: 400, textAlign: 'center' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        className="btn btn-primary rounded-pill px-4 py-2 d-flex align-items-center gap-2"
        onClick={() => navigate('/')}
      >
        <Home size={18} /> Go Home
      </button>
    </div>
  );
};

export default NotFound;
