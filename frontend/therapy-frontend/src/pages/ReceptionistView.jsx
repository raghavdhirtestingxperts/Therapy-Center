import { useEffect, useState } from 'react';
import { Calendar, Search, Clock, XCircle, UserPlus, CreditCard, Filter } from 'lucide-react';
import { useAuth, getGreeting } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const ReceptionistView = () => {
  const { auth } = useAuth();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [slots, setSlots] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newBooking, setNewBooking] = useState({ patientId: '', doctorId: '', therapyId: '', appointmentDate: '', slotId: null, startTime: '', endTime: '' });
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', medicalHistory: '' });

  const fmt = (ts) => ts ? ts.substring(0, 5) : '';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, p, d, t] = await Promise.all([
        api.get('/appointment'),
        api.get('/appointment/patients'),
        api.get('/appointment/doctors'),
        api.get('/appointment/therapies')
      ]);
      setAppointments(a.data);
      setPatients(p.data);
      setDoctors(d.data);
      setTherapies(t.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch receptionist dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (newBooking.doctorId && newBooking.appointmentDate) {
      api.get(`/appointment/slots?doctorId=${newBooking.doctorId}&date=${newBooking.appointmentDate}`)
        .then(res => setSlots(res.data))
        .catch(() => {
          setSlots([]);
          addToast('Failed to load slots.', 'error');
        });
    } else {
      setSlots([]);
    }
  }, [newBooking.doctorId, newBooking.appointmentDate]);

  const handleBook = async (e) => {
    e.preventDefault();
    const selectedSlot = slots.find(s => s.slotId === newBooking.slotId);
    if (!selectedSlot) {
      addToast('Please select a time slot', 'error');
      return;
    }
    try {
      await api.post('/appointment/book', {
        patientId: parseInt(newBooking.patientId),
        doctorId: parseInt(newBooking.doctorId),
        therapyId: parseInt(newBooking.therapyId),
        appointmentDate: newBooking.appointmentDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime
      });
      addToast('Appointment booked successfully!', 'success');
      setShowModal(null);
      setNewBooking({ patientId: '', doctorId: '', therapyId: '', appointmentDate: '', slotId: null, startTime: '', endTime: '' });
      fetchData();
    } catch (err) {
      addToast(err.response?.data || 'Booking failed', 'error');
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await api.put(`/appointment/${id}/cancel`);
        addToast('Appointment cancelled successfully.', 'success');
        fetchData();
      } catch (err) {
        addToast('Error cancelling appointment.', 'error');
      }
    }
  };

  const handlePay = async (appointmentId) => {
    if (window.confirm('Mark this appointment as paid via Cash?')) {
      try {
        await api.post('/payment/pay', { appointmentId, paymentMethod: 'Cash' });
        addToast('Payment recorded successfully!', 'success');
        fetchData();
      } catch (err) {
        addToast(err.response?.data || 'Payment failed to record.', 'error');
      }
    }
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patient', newPatient);
      addToast('New patient added successfully!', 'success');
      setShowModal(null);
      setNewPatient({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', medicalHistory: '' });
      fetchData();
    } catch (err) {
      addToast('Error adding new patient.', 'error');
    }
  };

  const filtered = appointments.filter(a => {
    const matchSearch = !search || `${a.patient?.firstName} ${a.patient?.lastName}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{getGreeting(auth.firstName, 'Receptionist')}</h2>
        <div className="d-flex gap-2">
          <button className="btn btn-outline-primary rounded-pill px-3 d-flex align-items-center gap-2" onClick={() => setShowModal('patient')}>
            <UserPlus size={16} /> Add Patient
          </button>
          <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => setShowModal('book')}>
            <Calendar size={16} /> Book Session
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body py-3">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text border-end-0"><Search size={16} className="text-muted" /></span>
                <input type="text" className="form-control border-start-0" placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            </div>
            <div className="col-md-3">
              <div className="input-group">
                <span className="input-group-text border-end-0"><Filter size={16} className="text-muted" /></span>
                <select className="form-select border-start-0" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                  <option value="">All Status</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="card border-0 shadow-sm">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead><tr><th>Patient</th><th>Doctor</th><th>Therapy</th><th>Schedule</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-5">
                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    <p className="small text-muted mt-2">Loading appointments...</p>
                  </td>
                </tr>
              ) : filtered.map(a => (
                <tr key={a.appointmentId}>
                  <td className="fw-bold">{a.patient?.firstName} {a.patient?.lastName}</td>
                  <td>Dr. {a.doctor?.user?.firstName} {a.doctor?.user?.lastName}</td>
                  <td><span className="badge bg-primary-subtle text-primary">{a.therapy?.name}</span></td>
                  <td>
                    <div className="small fw-bold">{new Date(a.appointmentDate).toLocaleDateString()}</div>
                    <div className="small text-muted"><Clock size={12} className="me-1" />{fmt(a.startTime)} - {fmt(a.endTime)}</div>
                  </td>
                  <td><span className={`badge rounded-pill status-${a.status?.toLowerCase()}`}>{a.status}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      {a.status === 'Scheduled' && (
                        <>
                          <button className="btn btn-sm btn-outline-danger rounded-pill px-2" title="Cancel" onClick={() => handleCancel(a.appointmentId)}><XCircle size={14} /></button>
                          <button className="btn btn-sm btn-outline-success rounded-pill px-2" title="Cash Payment" onClick={() => handlePay(a.appointmentId)}><CreditCard size={14} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && filtered.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No appointments found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Modal */}
      {showModal === 'book' && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow">
              <div className="modal-header"><h5 className="modal-title fw-bold">Book Offline Appointment</h5><button type="button" className="btn-close" onClick={() => setShowModal(null)}></button></div>
              <form onSubmit={handleBook}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Patient</label>
                      <select className="form-select" value={newBooking.patientId} onChange={e => setNewBooking({...newBooking, patientId: e.target.value})} required>
                        <option value="">Choose...</option>
                        {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Therapy</label>
                      <select className="form-select" value={newBooking.therapyId} onChange={e => setNewBooking({...newBooking, therapyId: e.target.value})} required>
                        <option value="">Choose...</option>
                        {therapies.map(t => <option key={t.therapyId} value={t.therapyId}>{t.name} (₹{t.cost})</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Doctor</label>
                      <select className="form-select" value={newBooking.doctorId} onChange={e => setNewBooking({...newBooking, doctorId: e.target.value, slotId: null})} required>
                        <option value="">Choose...</option>
                        {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization}</option>)}
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label small fw-bold">Date</label>
                      <input type="date" className="form-control" value={newBooking.appointmentDate} onChange={e => setNewBooking({...newBooking, appointmentDate: e.target.value, slotId: null})} required />
                    </div>
                  </div>
                  {newBooking.doctorId && newBooking.appointmentDate && (
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Available Slots</label>
                      <div className="row g-2">
                        {slots.length === 0 ? <p className="text-muted small col-12">No slots available for this date.</p> : slots.map(s => (
                          <div className="col-3" key={s.slotId}>
                            <button type="button" className={`btn btn-sm w-100 rounded-3 py-2 ${newBooking.slotId === s.slotId ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setNewBooking({...newBooking, slotId: s.slotId})}>
                              {fmt(s.startTime)}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={!newBooking.slotId}>Book</button></div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Modal */}
      {showModal === 'patient' && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header"><h5 className="modal-title fw-bold">Add New Patient</h5><button type="button" className="btn-close" onClick={() => setShowModal(null)}></button></div>
              <form onSubmit={handleAddPatient}>
                <div className="modal-body">
                  <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">First Name</label><input type="text" className="form-control" value={newPatient.firstName} onChange={e => setNewPatient({...newPatient, firstName: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">Last Name</label><input type="text" className="form-control" value={newPatient.lastName} onChange={e => setNewPatient({...newPatient, lastName: e.target.value})} required /></div></div>
                  <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">Date of Birth</label><input type="date" className="form-control" value={newPatient.dateOfBirth} onChange={e => setNewPatient({...newPatient, dateOfBirth: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">Gender</label><select className="form-select" value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div></div>
                  <div className="mb-3"><label className="form-label small fw-bold">Medical History</label><textarea className="form-control" rows="2" value={newPatient.medicalHistory} onChange={e => setNewPatient({...newPatient, medicalHistory: e.target.value})}></textarea></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistView;
