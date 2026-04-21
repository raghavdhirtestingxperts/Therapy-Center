import { useEffect, useState } from 'react';
import { Face as FaceIcon, EventNote as EventNoteIcon } from '@mui/icons-material';

interface Appointment {
  appointmentId: number;
  doctorId: number;
  appointmentDate: string;
  startTime: string;
  status: string;
  doctor: { user: { firstName: string; lastName: string } };
  therapy: { name: string };
}

const PatientDashboard = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('Not logged in');
        
        const userData = JSON.parse(userStr);

        const response = await fetch('/api/Patient/appointments', {
          headers: { 'Authorization': `Bearer ${userData.token}` }
        });

        if (!response.ok) throw new Error('Failed to fetch patient appointments');
        
        const data = await response.json();
        setAppointments(data);
      } catch (err: any) {
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
          <FaceIcon fontSize="large" style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
          Patient Dashboard
        </h1>
        <p>View your upcoming sessions and medical history.</p>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <EventNoteIcon color="primary" /> My Appointments
        </h3>
        
        {loading ? (
          <p>Loading appointments...</p>
        ) : error ? (
          <p style={{ color: 'var(--error)' }}>{error}</p>
        ) : appointments.length === 0 ? (
          <p>You have no upcoming appointments.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {appointments.map(app => (
              <li key={app.appointmentId} style={{ padding: '1rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <strong>Dr. {app.doctor?.user?.lastName || 'Unknown'}</strong> <br/>
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

export default PatientDashboard;
