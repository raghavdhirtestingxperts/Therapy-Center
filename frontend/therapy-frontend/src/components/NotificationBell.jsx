import { useState, useEffect, useRef } from 'react';
import { Bell, Calendar, CreditCard, Clock, ShieldAlert, AlertTriangle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const NotificationBell = () => {
  const { auth } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const bellRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Poll for notifications every 10 seconds to keep badge/list updated
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [auth.role]); // Refetch if role changes (e.g. login/logout transition)

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
      if (auth.role === 'Admin') {
        const [appRes, payRes, usersRes] = await Promise.all([
          api.get('/appointment').catch(() => ({ data: [] })),
          api.get('/payment/history').catch(() => ({ data: [] })),
          api.get('/admin/users').catch(() => ({ data: [] }))
        ]);

        const items = [];
        const todayStr = new Date().toDateString();

        // 1. Locked Accounts Alert
        (usersRes.data || []).forEach(u => {
          if (u.lockoutUntil && new Date(u.lockoutUntil) > new Date()) {
            items.push({
              id: `lockout-${u.userId}`,
              icon: 'lockout',
              text: `Security Alert: ${u.firstName} ${u.lastName} (${u.role}) is locked out.`,
              time: 'Locked Out'
            });
          }
        });

        // 2. Unpaid Clinic-wide count and recent items
        const paidIds = new Set((payRes.data || []).filter(p => p.status === 'Paid').map(p => p.appointmentId));
        const unpaidApps = (appRes.data || []).filter(a => a.status !== 'Cancelled' && a.status !== 'Completed' && !paidIds.has(a.appointmentId));

        if (unpaidApps.length > 5) {
          items.push({
            id: 'unpaid-count-alert',
            icon: 'payment-alert',
            text: `Outstanding: ${unpaidApps.length} unpaid appointments in the clinic.`,
            time: 'Urgent'
          });
        }

        // List 3 most recent unpaid appointments
        unpaidApps.slice(-3).forEach(a => {
          items.push({
            id: `pay-${a.appointmentId}`,
            icon: 'payment',
            text: `Unpaid: ${a.patient?.firstName || ''} ${a.patient?.lastName || 'Patient'} — ₹${a.therapy?.cost || 0}`,
            time: new Date(a.appointmentDate).toLocaleDateString()
          });
        });

        // 3. Today's Scheduled Count
        const todaysScheduled = (appRes.data || []).filter(a => new Date(a.appointmentDate).toDateString() === todayStr && a.status === 'Scheduled');
        if (todaysScheduled.length > 0) {
          items.push({
            id: 'today-scheduled-alert',
            icon: 'calendar-count',
            text: `Today: ${todaysScheduled.length} appointments scheduled.`,
            time: 'Today'
          });
        }

        setNotifications(items.slice(0, 8));
      } else {
        // Patients, Doctors, and Receptionists notifications
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
      }
    } catch {
      setNotifications([]);
    }
  };

  const count = notifications.length;

  const renderIcon = (icon) => {
    switch (icon) {
      case 'lockout':
        return <ShieldAlert size={14} className="mt-1" style={{ color: '#ef4444', flexShrink: 0 }} />;
      case 'payment-alert':
        return <AlertTriangle size={14} className="mt-1" style={{ color: '#f59e0b', flexShrink: 0 }} />;
      case 'calendar':
      case 'calendar-count':
        return <Calendar size={14} className="mt-1" style={{ color: '#6366f1', flexShrink: 0 }} />;
      case 'payment':
      default:
        return <CreditCard size={14} className="mt-1" style={{ color: '#f59e0b', flexShrink: 0 }} />;
    }
  };

  return (
    <div className="position-relative" ref={bellRef}>
      <button
        className="btn btn-sm d-flex align-items-center justify-content-center navbar-btn"
        style={{
          borderRadius: 10, width: 36, height: 36, position: 'relative',
          padding: 0
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
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14,
          boxShadow: 'var(--shadow-premium)', minWidth: 300, maxWidth: 360,
          zIndex: 9999, overflow: 'hidden', color: 'var(--text-primary)'
        }}>
          <div className="px-4 py-3 border-bottom" style={{ borderColor: 'var(--border)' }}>
            <span className="fw-bold small">Notifications</span>
            {count > 0 && <span className="badge bg-primary-subtle text-primary rounded-pill ms-2">{count}</span>}
          </div>
          <div style={{ maxHeight: 320, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div className="text-center py-4 text-muted small">No notifications</div>
            ) : notifications.map(n => (
              <div key={n.id} className="d-flex align-items-start gap-2 px-4 py-3 border-bottom" style={{ borderColor: 'var(--border-light)', fontSize: '0.82rem' }}>
                {renderIcon(n.icon)}
                <div>
                  <div style={{ color: 'var(--text-secondary)' }}>{n.text}</div>
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
