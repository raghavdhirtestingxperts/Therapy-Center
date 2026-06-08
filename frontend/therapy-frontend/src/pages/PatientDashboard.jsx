import { useEffect, useState } from 'react';
import { Calendar, FileText, CreditCard, ChevronRight, Clock, UserPlus, CheckCircle, AlertCircle, XCircle, Download } from 'lucide-react';
import { useAuth, getGreeting } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const PatientDashboard = () => {
  const { auth } = useAuth();
  const { addToast } = useToast();
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
  const [cancellingId, setCancellingId] = useState(null);

  const fmt = (ts) => ts ? ts.substring(0, 5) : '';

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFilteredSlots = () => {
    if (!slots) return [];
    if (booking.date !== getTodayString()) {
      return slots;
    }
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    return slots.filter(s => {
      if (!s.startTime) return false;
      const parts = s.startTime.split(':');
      const slotHours = parseInt(parts[0], 10);
      const slotMinutes = parseInt(parts[1], 10);
      if (slotHours > currentHours) return true;
      if (slotHours === currentHours && slotMinutes > currentMinutes) return true;
      return false;
    });
  };

  const fetchData = async () => {
    try {
      const [appRes, patientsRes, therapiesRes] = await Promise.all([
        api.get('/appointment'),
        api.get('/patient/my-patients'),
        api.get('/appointment/therapies')
      ]);
      setAppointments(appRes.data);
      setPatients(patientsRes.data);
      setTherapies(therapiesRes.data);

      if (patientsRes.data.length > 0) {
        const allFindings = [];
        for (const p of patientsRes.data) {
          try {
            const f = await api.get(`/patient/${p.patientId}/findings`);
            allFindings.push(...f.data);
          } catch {}
        }
        setFindings(allFindings);
      }

      try {
        const payRes = await api.get('/payment/history');
        setPayments(payRes.data);
      } catch {}
    } catch (err) {
      console.error(err);
      addToast('Failed to fetch dashboard data.', 'error');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (step === 2) {
      api.get('/appointment/doctors')
        .then(res => setDoctors(res.data))
        .catch(() => addToast('Failed to load doctors.', 'error'));
    }
  }, [step]);

  useEffect(() => {
    if (booking.doctorId && booking.date) {
      api.get(`/appointment/slots?doctorId=${booking.doctorId}&date=${booking.date}`)
        .then(res => setSlots(res.data))
        .catch(() => {
          setSlots([]);
          addToast('Failed to load time slots.', 'error');
        });
    }
  }, [booking.doctorId, booking.date]);

  const handleBook = async () => {
    try {
      await api.post('/appointment/book', {
        patientId: parseInt(booking.patientId) || 0,
        therapyId: parseInt(booking.therapyId),
        doctorId: parseInt(booking.doctorId),
        appointmentDate: booking.date,
        startTime: booking.slot.startTime,
        endTime: booking.slot.endTime
      });
      addToast('Appointment booked successfully!', 'success');
      setStep(1);
      setBooking({ therapyId: '', doctorId: '', date: '', slot: null, patientId: '' });
      setActiveTab('appointments');
      fetchData();
    } catch (err) {
      addToast(err.response?.data || 'Booking failed', 'error');
    }
  };

  const handleCancel = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(appointmentId);
    try {
      await api.put(`/appointment/${appointmentId}/cancel`);
      addToast('Appointment cancelled successfully.', 'success');
      fetchData();
    } catch (err) {
      addToast(err.response?.data || 'Failed to cancel appointment.', 'error');
    } finally {
      setCancellingId(null);
    }
  };

  const handlePayment = async (appointmentId) => {
    setPayingId(appointmentId);
    try {
      const res = await api.post('/payment/create-order', { appointmentId });
      const orderData = res.data;

      if (orderData.mockMode) {
        const proceedWithMock = window.confirm(
          `Demo mode: No Razorpay credentials configured.\n` +
          `Order ID: ${orderData.orderId}\n` +
          `Amount: ₹${(orderData.amount / 100).toFixed(2)}\n\n` +
          `Do you want to simulate a successful payment?`
        );
        
        if (proceedWithMock) {
          await api.post('/payment/verify', {
            appointmentId,
            razorpayOrderId: orderData.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: 'mock_signature_verification_skipped'
          });
          addToast('Payment Simulated Successfully!', 'success');
          fetchData();
        }
      } else {
        const isLoaded = await loadRazorpayScript();
        if (!isLoaded) {
          addToast('Failed to load Razorpay SDK. Please check your internet connection.', 'error');
          setPayingId(null);
          return;
        }

        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Therapy Center',
          description: 'Therapy Session Payment',
          order_id: orderData.orderId,
          handler: async function (response) {
            try {
              await api.post('/payment/verify', {
                appointmentId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
              });
              addToast('Payment Successful!', 'success');
              fetchData();
            } catch (err) {
              addToast(err.response?.data || 'Payment verification failed.', 'error');
            }
          },
          prefill: {
            name: orderData.patientName,
            email: orderData.patientEmail,
            contact: orderData.patientPhone
          },
          theme: {
            color: '#6366f1'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      addToast(err.response?.data || 'Payment failed to initialize.', 'error');
    } finally {
      setPayingId(null);
    }
  };

  const handleAddChild = async (e) => {
    e.preventDefault();
    try {
      await api.post('/patient', newChild);
      addToast('Child profile added successfully!', 'success');
      setShowAddChild(false);
      setNewChild({ firstName: '', lastName: '', dateOfBirth: '', gender: 'Male', medicalHistory: '' });
      fetchData();
    } catch (err) {
      addToast('Error adding child profile.', 'error');
    }
  };

  const handlePrintReport = (report) => {
    const printWindow = window.open('', '_blank');
    const dateStr = new Date(report.createdAt).toLocaleDateString();
    const nextDateStr = report.nextSessionDate ? new Date(report.nextSessionDate).toLocaleDateString() : '—';
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Therapy Session Report - ${report.appointment?.patient?.firstName} ${report.appointment?.patient?.lastName}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; color: #1e293b; padding: 40px; line-height: 1.5; }
            .header { text-align: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: #4f46e5; }
            .subtitle { font-size: 14px; color: #64748b; margin-top: 5px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
            .meta-item { font-size: 14px; }
            .meta-label { font-weight: bold; color: #4f46e5; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 10px; }
            .content-box { background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; font-size: 14px; white-space: pre-line; }
            .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #e2e8f0; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Special Kids Therapy Center</div>
            <div class="subtitle">Clinical Session Progress Report</div>
          </div>
          <div class="meta-grid">
            <div class="meta-item"><span class="meta-label">Patient Name:</span> ${report.appointment?.patient?.firstName} ${report.appointment?.patient?.lastName}</div>
            <div class="meta-item"><span class="meta-label">Date of Report:</span> ${dateStr}</div>
            <div class="meta-item"><span class="meta-label">Therapy Type:</span> ${report.appointment?.therapy?.name || 'Therapy'}</div>
            <div class="meta-item"><span class="meta-label">Practitioner:</span> Dr. ${report.appointment?.doctor?.user?.firstName} ${report.appointment?.doctor?.user?.lastName}</div>
            <div class="meta-item"><span class="meta-label">Next Scheduled Session:</span> ${nextDateStr}</div>
          </div>
          <div class="section">
            <div class="section-title">Clinical Observations</div>
            <div class="content-box">${report.observations}</div>
          </div>
          <div class="section">
            <div class="section-title">Recommendations & Next Steps</div>
            <div class="content-box" style="background-color: #f5f3ff; border-color: #ddd6fe;">${report.recommendations}</div>
          </div>
          <div class="footer">
            This is an official document generated by Special Kids Therapy Center. &copy; ${new Date().getFullYear()} All rights reserved.
          </div>
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() { window.close(); };
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const isPaid = (appointmentId) => payments.some(p => p.appointmentId === appointmentId && p.status === 'Paid');

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{getGreeting(auth.firstName, 'Guardian')}</h2>
          <p className="text-muted small mb-0">
            Guardian Portal — Managing: {patients.map(p => p.firstName).join(', ') || 'No children added yet'}
          </p>
        </div>
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <button className="btn btn-outline-primary rounded-pill px-3 btn-sm d-flex align-items-center gap-1" onClick={() => setShowAddChild(true)}>
            <UserPlus size={14} /> Add Child
          </button>
          <div className="nav nav-pills p-1 rounded-pill shadow-sm">
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
                  <div className="card-body p-4 d-flex flex-column justify-content-between">
                    <div>
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
                    </div>
                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-3">
                      <span className="fw-bold h5 mb-0" style={{ color: 'var(--bs-primary)' }}>₹{app.therapy?.cost}</span>
                      <div className="d-flex gap-2">
                        {app.status !== 'Cancelled' && app.status !== 'Completed' && (
                          <button
                            className="btn btn-outline-danger rounded-pill px-3 btn-sm d-flex align-items-center gap-1"
                            onClick={() => handleCancel(app.appointmentId)}
                            disabled={cancellingId === app.appointmentId}
                          >
                            <XCircle size={14} /> {cancellingId === app.appointmentId ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                        {isPaid(app.appointmentId) ? (
                          <span className="badge rounded-pill status-paid px-3 py-2 d-inline-flex align-items-center"><CheckCircle size={14} className="me-1" /> Paid</span>
                        ) : app.status !== 'Cancelled' ? (
                          <button className="btn btn-primary rounded-pill px-4 btn-sm d-flex align-items-center gap-2" onClick={() => handlePayment(app.appointmentId)} disabled={payingId === app.appointmentId}>
                            <CreditCard size={16} /> {payingId === app.appointmentId ? 'Processing...' : 'Pay Now'}
                          </button>
                        ) : null}
                      </div>
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
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">{new Date(f.createdAt).toLocaleDateString()}</small>
                          <button
                            className="btn btn-sm btn-outline-primary rounded-pill d-flex align-items-center gap-1 py-1 px-3"
                            onClick={() => handlePrintReport(f)}
                          >
                            <Download size={14} /> Download PDF
                          </button>
                        </div>
                      </div>
                      <p className="small text-muted mb-3">Dr. {f.appointment?.doctor?.user?.firstName} {f.appointment?.doctor?.user?.lastName}</p>
                      <div className="obs-box mb-3">
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
                      <input type="date" className="form-control" value={booking.date} min={getTodayString()} onChange={e => setBooking({...booking, date: e.target.value, slot: null})} />
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
                      {getFilteredSlots().length === 0 ? <p className="text-center py-4 small text-muted col-12">No available slots for this day. Try another date.</p> : getFilteredSlots().map(s => (
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
                      <td><span className="badge bg-secondary-subtle">{p.paymentMethod}</span></td>
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
