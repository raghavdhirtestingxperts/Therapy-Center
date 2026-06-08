import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, CreditCard, Clock } from 'lucide-react';
import api from '../api';

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for notifications every 10 seconds to keep badge/list updated
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open) {
      fetchNotifications();
    }
    setOpen(o => !o);
  };

  const fetchNotifications = async () => {
    try {
      const [appRes, payRes] = await Promise.all([
        api.get('/appointment').catch(() => ({ data: [] })),
        api.get('/payment/history').catch(() => ({ data: [] }))
      ]);

      const items = [];
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Upcoming appointments (today or tomorrow)
      (appRes.data || []).forEach(a => {
        if (a.status !== 'Scheduled') return;
        const appDate = new Date(a.appointmentDate);
        const isToday = appDate.toDateString() === today.toDateString();
        const isTomorrow = appDate.toDateString() === tomorrow.toDateString();
        if (isToday || isTomorrow) {
          items.push({
            id: `app-${a.appointmentId}`,
            icon: 'calendar',
            text: `${isToday ? 'Today' : 'Tomorrow'}: ${a.therapy?.name || 'Session'} at ${a.startTime?.substring(0, 5) || ''}`,
            time: isToday ? 'Today' : 'Tomorrow'
          });
        }
      });

      // Unpaid appointments
      const paidIds = new Set((payRes.data || []).filter(p => p.status === 'Paid').map(p => p.appointmentId));
      (appRes.data || []).forEach(a => {
        if (a.status === 'Cancelled') return;
        if (!paidIds.has(a.appointmentId)) {
          items.push({
            id: `pay-${a.appointmentId}`,
            icon: 'payment',
            text: `Payment pending: ${a.therapy?.name || 'Session'} — ₹${a.therapy?.cost || 0}`,
            time: 'Pending'
          });
        }
      });

      setNotifications(items.slice(0, 8));
    } catch {
      setNotifications([]);
    }
  };

  const count = notifications.length;

  return (
    <div className="position-relative" ref={bellRef}>
      <button
        className="btn btn-sm d-flex align-items-center justify-content-center"
        style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: 10, width: 36, height: 36, color: 'white', position: 'relative'
        }}
        onClick={handleToggle}
        title="Notifications"
      >
        <Bell size={16} />
        {count > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4, background: '#ef4444',
            color: 'white', fontSize: '0.65rem', fontWeight: 700,
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          background: '#ffffff', border: '1px solid rgba(0,0,0,0.10)', borderRadius: 14,
          boxShadow: '0 16px 48px rgba(0,0,0,0.22)', minWidth: 300, maxWidth: 360,
          zIndex: 9999, overflow: 'hidden', color: '#111'
        }}>
          <div className="px-4 py-3 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
            <span className="fw-bold small">Notifications</span>
            {count > 0 && <span className="badge bg-primary-subtle text-primary rounded-pill ms-2">{count}</span>}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">No notifications</div>
            ) : notifications.map(n => (
              <div key={n.id} className="d-flex align-items-start gap-2 px-4 py-3 border-bottom" style={{ borderColor: 'rgba(0,0,0,0.04)', fontSize: '0.82rem' }}>
                {n.icon === 'calendar' ? <Calendar size={14} className="mt-1" style={{ color: '#6366f1', flexShrink: 0 }} /> : <CreditCard size={14} className="mt-1" style={{ color: '#f59e0b', flexShrink: 0 }} />}
                <div>
                  <div style={{ color: '#1a1a2e' }}>{n.text}</div>
                  <div className="text-muted" style={{ fontSize: '0.72rem' }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
