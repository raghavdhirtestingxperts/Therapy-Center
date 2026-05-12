import { useEffect, useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { Calendar, FileText, CreditCard, ChevronRight, Clock, UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

const PatientDashboard = () => {
  const [activeTab, setActiveTab] = useState('appointments');
  const [appointments, setAppointments] = useState([]);
  const [findings, setFindings] = useState([]);
  const [patients, setPatients] = useState([]);
  const [therapies, setTherapies] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [payments, setPayments] = useState([]);
  const [booking, setBooking] = useState({ therapyId: '', doctorId: '', date: '', slot: null, patientId: '' });
  const [step, setStep] = useState(1);
  const [showAddChild, setShowAddChild] = useState(false);
  const [newChild, setNewChild] = useState({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', medicalHistory: '' });
  const [payingId, setPayingId] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const fmt = (ts) => ts ? ts.substring(0, 5) : '';

  const fetchData = async () => {
    try {
      const [appRes, patientsRes, therapiesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/appointment`, config),
        axios.get(`${API_BASE_URL}/patient/my-patients`, config),
        axios.get(`${API_BASE_URL}/appointment/therapies`, config)
      ]);
      setAppointments(appRes.data);
      setPatients(patientsRes.data);
      setTherapies(therapiesRes.data);

      if (patientsRes.data.length > 0) {
        const allFindings = [];
        for (const p of patientsRes.data) {
          try {
            const f = await axios.get(`${API_BASE_URL}/patient/${p.patientId}/findings`, config);
            allFindings.push(...f.data);
          } catch {}
        }
        setFindings(allFindings);
      }

      try {
        const payRes = await axios.get(`${API_BASE_URL}/payment/history`, config);
        setPayments(payRes.data);
      } catch {}
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (step === 2) {
      axios.get(`${API_BASE_URL}/appointment/doctors`, config).then(res => setDoctors(res.data));
    }
  }, [step]);

  useEffect(() => {
    if (booking.doctorId && booking.date) {
      axios.get(`${API_BASE_URL}/appointment/slots?doctorId=${booking.doctorId}&date=${booking.date}`, config)
        .then(res => setSlots(res.data)).catch(() => setSlots([]));
    }
  }, [booking.doctorId, booking.date]);

  const handleBook = async () => {
    try {
      await axios.post(`${API_BASE_URL}/appointment/book`, {
        patientId: parseInt(booking.patientId) || 0,
        therapyId: parseInt(booking.therapyId),
        doctorId: parseInt(booking.doctorId),
        appointmentDate: booking.date,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime
      }, config);
      alert('Appointment booked successfully!');
      setStep(1); setBooking({ therapyId: '', doctorId: '', date: '', slot: null, patientId: '' }); fetchData();
    } catch (err) { alert(err.response?.data || 'Booking failed'); }
  };

  const handlePayment = async (appointmentId) => {
    setPayingId(appointmentId);
    setTimeout(async () => {
      try {
        await axios.post(`${API_BASE_URL}/payment/pay`, { appointmentId, paymentMethod: 'Online' }, config);
        alert('Payment Successful!'); fetchData();
      } catch (err) { alert(err.response?.data || 'Payment failed'); }
      setPayingId(null);
    }, 1500);
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/patient`, newChild, config);
      alert('Child profile added!'); setShowAddChild(false);
      setNewChild({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', medicalHistory: '' }); fetchData();
    } catch (err) { alert('Error adding child'); }
  };

  const isPaid = (appointmentId) => payments.some(p => p.appointmentId === appointmentId && p.status === 'Paid');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Guardian Portal</h2>
          <p className="text-muted small mb-0">
            Managing: {patients.map(p => p.firstName).join(', ') || 'No children added yet'}
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button className="btn btn-outline-primary rounded-pill px-3 btn-sm d-flex align-items-center gap-1" onClick={() => setShowAddChild(true)}>
            <UserPlus size={14} /> Add Child
          </button>
          <div className="nav nav-pills p-1 rounded-pill shadow-sm" style={{ background: 'white' }}>
            {[
              { key: 'appointments', label: 'Sessions' },
              { key: 'reports', label: 'Reports' },
              { key: 'book', label: 'Book New' },
              { key: 'payments', label: 'Payments' }
            ].map(t => (
              <button key={t.key} className={`nav-link rounded-pill px-3 ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="tab-content-area">
        {/* Sessions */}
        {activeTab === 'appointments' && (
          <div className="row g-4">
            {appointments.length === 0 ? <p className="text-center py-5 text-muted">No sessions found. Book your first appointment!</p> : appointments.map(app => (
              <div className="col-md-6" key={app.appointmentId}>
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h5 className="fw-bold mb-1" style={{ color: 'var(--bs-primary)' }}>{app.therapy?.name}</h5>
                        <p className="text-muted small mb-0">Dr. {app.doctor?.user?.firstName} {app.doctor?.user?.lastName}</p>
                        <p className="text-muted small mb-0">Patient: {app.patient?.firstName} {app.patient?.lastName}</p>
                      </div>
                      <span className={`badge rounded-pill status-${app.status?.toLowerCase()}`}>{app.status}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted small mb-3">
                      <Calendar size={14} className="me-1" /> {new Date(app.appointmentDate).toLocaleDateString()}
                      <Clock size={14} className="ms-3 me-1" /> {fmt(app.startTime)} - {fmt(app.endTime)}
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                      <span className="fw-bold h5 mb-0" style={{ color: 'var(--bs-primary)' }}>₹{app.therapy?.cost}</span>
                      {isPaid(app.appointmentId) ? (
                        <span className="badge rounded-pill status-paid px-3 py-2"><CheckCircle size={14} className="me-1" /> Paid</span>
                      ) : app.status !== 'Cancelled' ? (
                        <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => handlePayment(app.appointmentId)} disabled={payingId === app.appointmentId}>
                          <CreditCard size={16} /> {payingId === app.appointmentId ? 'Processing...' : 'Pay Now'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Reports */}
        {activeTab === 'reports' && (
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              {findings.length === 0 ? <p className="text-center py-5 text-muted">No medical reports available yet.</p> : (
                <div className="list-group list-group-flush">
                  {findings.map(f => (
                    <div key={f.findingId} className="list-group-item p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h6 className="fw-bold mb-0" style={{ color: 'var(--bs-primary)' }}>{f.appointment?.therapy?.name || 'Therapy'} - Session Report</h6>
                        <small className="text-muted">{new Date(f.createdAt).toLocaleDateString()}</small>
                      </div>
                      <p className="small text-muted mb-3">Dr. {f.appointment?.doctor?.user?.firstName} {f.appointment?.doctor?.user?.lastName}</p>
                      <div className="bg-light p-3 rounded-3 mb-3">
                        <div className="fw-bold small mb-1">Observations:</div>
                        <p className="small mb-0">{f.observations}</p>
                      </div>
                      <div className="p-3 rounded-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                        <div className="fw-bold small mb-1" style={{ color: 'var(--bs-primary)' }}>Recommendations:</div>
                        <p className="small mb-0">{f.recommendations}</p>
                      </div>
                      {f.nextSessionDate && (
                        <div className="mt-2 small text-muted">
                          <Calendar size={13} className="me-1" /> Next session: {new Date(f.nextSessionDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Book */}
        {activeTab === 'book' && (
          <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: 600 }}>
            <div className="card-body p-4 p-md-5">
              <h4 className="fw-bold mb-4">Book a Session</h4>
              {patients.length === 0 ? (
                <div className="text-center py-4">
                  <AlertCircle size={48} className="text-muted mb-3" />
                  <p className="text-muted">Please add a child profile first before booking.</p>
                  <button className="btn btn-primary rounded-pill px-4" onClick={() => setShowAddChild(true)}>Add Child</button>
                </div>
              ) : (<>
                {step === 1 && (
                  <div>
                    <h6 className="fw-bold text-muted mb-3 small">STEP 1: SELECT THERAPY</h6>
                    {patients.length > 1 && (
                      <div className="mb-3">
                        <label className="form-label small fw-bold">Select Child</label>
                        <select className="form-select" value={booking.patientId} onChange={e => setBooking({...booking, patientId: e.target.value})}>
                          <option value="">Choose...</option>
                          {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.firstName} {p.lastName}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="row g-3">
                      {therapies.map(t => (
                        <div className="col-12" key={t.therapyId}>
                          <button className={`btn w-100 text-start p-3 rounded-3 d-flex justify-content-between align-items-center ${booking.therapyId == t.therapyId ? 'btn-primary shadow' : 'btn-light'}`}
                            onClick={() => { setBooking({...booking, therapyId: t.therapyId, patientId: booking.patientId || (patients[0]?.patientId || '')}); setStep(2); }}>
                            <div>
                              <div className="fw-bold">{t.name}</div>
                              <small className={booking.therapyId == t.therapyId ? 'opacity-75' : 'text-muted'}>{t.durationMinutes} mins — {t.description?.substring(0, 60)}</small>
                            </div>
                            <span className="fw-bold">₹{t.cost}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {step === 2 && (
                  <div>
                    <h6 className="fw-bold text-muted mb-3 small">STEP 2: SELECT DOCTOR & DATE</h6>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Doctor</label>
                      <select className="form-select" value={booking.doctorId} onChange={e => setBooking({...booking, doctorId: e.target.value})}>
                        <option value="">Choose...</option>
                        {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>Dr. {d.user?.firstName} {d.user?.lastName} — {d.specialization}</option>)}
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold">Preferred Date</label>
                      <input type="date" className="form-control" value={booking.date} onChange={e => setBooking({...booking, date: e.target.value, slot: null})} />
                    </div>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-light rounded-pill px-4" onClick={() => setStep(1)}>Back</button>
                      <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-1" disabled={!booking.doctorId || !booking.date} onClick={() => setStep(3)}>Next <ChevronRight size={16} /></button>
                    </div>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h6 className="fw-bold text-muted mb-3 small">STEP 3: SELECT TIME SLOT</h6>
                    <div className="row g-2 mb-4">
                      {slots.length === 0 ? <p className="text-center py-4 small text-muted col-12">No available slots for this day. Try another date.</p> : slots.map(s => (
                        <div className="col-4 col-md-3" key={s.slotId}>
                          <button className={`btn btn-sm w-100 rounded-3 py-2 ${booking.slot?.slotId === s.slotId ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setBooking({...booking, slot: s})}>
                            {fmt(s.startTime)}
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="d-flex justify-content-between">
                      <button className="btn btn-light rounded-pill px-4" onClick={() => setStep(2)}>Back</button>
                      <button className="btn btn-primary rounded-pill px-4" disabled={!booking.slot} onClick={handleBook}>Confirm Booking</button>
                    </div>
                  </div>
                )}
              </>)}
            </div>
          </div>
        )}

        {/* Payments */}
        {activeTab === 'payments' && (
          <div className="card border-0 shadow-sm">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead><tr><th>Date</th><th>Therapy</th><th>Patient</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead>
                <tbody>
                  {payments.map(p => (
                    <tr key={p.paymentId}>
                      <td className="small">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                      <td>{p.appointment?.therapy?.name}</td>
                      <td>{p.appointment?.patient?.firstName} {p.appointment?.patient?.lastName}</td>
                      <td className="fw-bold">₹{p.amount}</td>
                      <td><span className="badge bg-light text-dark">{p.paymentMethod}</span></td>
                      <td><span className={`badge rounded-pill status-${p.status?.toLowerCase()}`}>{p.status}</span></td>
                    </tr>
                  ))}
                  {payments.length === 0 && <tr><td colSpan="6" className="text-center py-4 text-muted">No payment history yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Child Modal */}
      {showAddChild && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header"><h5 className="modal-title fw-bold">Add Child Profile</h5><button type="button" className="btn-close" onClick={() => setShowAddChild(false)}></button></div>
              <form onSubmit={handleAddChild}>
                <div className="modal-body">
                  <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">First Name</label><input type="text" className="form-control" value={newChild.firstName} onChange={e => setNewChild({...newChild, firstName: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">Last Name</label><input type="text" className="form-control" value={newChild.lastName} onChange={e => setNewChild({...newChild, lastName: e.target.value})} required /></div></div>
                  <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">Date of Birth</label><input type="date" className="form-control" value={newChild.dateOfBirth} onChange={e => setNewChild({...newChild, dateOfBirth: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">Gender</label><select className="form-select" value={newChild.gender} onChange={e => setNewChild({...newChild, gender: e.target.value})}><option>Male</option><option>Female</option><option>Other</option></select></div></div>
                  <div className="mb-3"><label className="form-label small fw-bold">Medical History</label><textarea className="form-control" rows="2" value={newChild.medicalHistory} onChange={e => setNewChild({...newChild, medicalHistory: e.target.value})}></textarea></div>
                </div>
                <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowAddChild(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDashboard;
