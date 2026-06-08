import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => removeToast(id), 4000);
    return id;
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast, addToast: showToast }}>
      {children}
      {/* Toast container */}
      <div style={{
        position: 'fixed', top: 80, right: 20, zIndex: 9999,
        display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 380
      }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="toast-notification"
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12,
              background: t.type === 'error' ? '#fef2f2' : t.type === 'info' ? '#eff6ff' : '#f0fdf4',
              border: `1px solid ${t.type === 'error' ? '#fecaca' : t.type === 'info' ? '#bfdbfe' : '#bbf7d0'}`,
              color: t.type === 'error' ? '#991b1b' : t.type === 'info' ? '#1e40af' : '#166534',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
              animation: 'slideInRight 0.3s ease-out',
              fontSize: '0.875rem', fontWeight: 500
            }}
          >
            {t.type === 'error' ? <XCircle size={18} /> : t.type === 'info' ? <Info size={18} /> : <CheckCircle size={18} />}
            <span style={{ flex: 1 }}>{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, opacity: 0.5, color: 'inherit' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
