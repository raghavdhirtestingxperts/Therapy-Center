import { useEffect, useState } from 'react';
import { LocalHospital as LocalHospitalIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        if (!user) throw new Error('Not logged in');
        
        const response = await fetch(`/api/Doctor/appointments`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch doctor appointments');
        
        const data = await response.json();
        setAppointments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>
          <LocalHospitalIcon fontSize="large" style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
          Doctor Dashboard
        </h1>
        <p>View your patients, appointments, and medical records.</p>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <CalendarIcon color="primary" /> Upcoming Appointments
        </h3>
        
        {loading ? (
          <p>Loading appointments...</p>
        ) : error ? (
          <p style={{ color: 'var(--error)' }}>{error}</p>
        ) : appointments.length === 0 ? (
          <p>No upcoming appointments found.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {appointments.map(app => (
              <li key={app.appointmentId} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>{app.patient?.firstName} {app.patient?.lastName}</strong> <br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{app.therapy?.name || 'Therapy Session'}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: 500 }}>{new Date(app.appointmentDate).toLocaleDateString()}</span> <br/>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{app.startTime}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboard;
