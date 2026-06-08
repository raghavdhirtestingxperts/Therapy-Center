import { useEffect, useState } from 'react';
import { FileText, Calendar, Clock, Send, Loader2 } from 'lucide-react';
import { useAuth, getGreeting } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../api';

const DoctorPortal = () => {
  const { auth } = useAuth();
  const { addToast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [patientHistory, setPatientHistory] = useState([]);
  const [observations, setObservations] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fmt = (ts) => ts ? ts.substring(0, 5) : '';

  const fetchApps = async () => {
    setLoadingSchedule(true);
    try {
      const response = await api.get('/appointment');
      setAppointments(response.data);
    } catch (err) {
      console.error(err);
      addToast('Failed to load patient schedule.', 'error');
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setLoadingHistory(true);
      api.get(`/patient/${selectedApp.patientId}/findings`)
        .then(res => setPatientHistory(res.data))
        .catch(() => {
          setPatientHistory([]);
          addToast('Failed to load patient history.', 'error');
        })
        .finally(() => setLoadingHistory(false));
    }
  }, [selectedApp]);

  useEffect(() => {
    if (selectedApp) {
      if (selectedApp.status === 'Completed') {
        const found = patientHistory.find(h => h.appointmentId === selectedApp.appointmentId);
        if (found) {
          setObservations(found.observations || '');
          setRecommendations(found.recommendations || '');
          setNextSessionDate(found.nextSessionDate ? found.nextSessionDate.split('T')[0] : '');
        } else {
          setObservations('');
          setRecommendations('');
          setNextSessionDate('');
        }
      } else {
        setObservations('');
        setRecommendations('');
        setNextSessionDate('');
      }
    }
  }, [selectedApp, patientHistory]);

  const handleSubmitFindings = async (e) => {
    e.preventDefault();
    if (selectedApp.status === 'Completed') return;
    setSubmitting(true);
    try {
      await api.post('/doctor/findings', {
        appointmentId: selectedApp.appointmentId,
        observations,
        recommendations,
        nextSessionDate: nextSessionDate || null
      });
      addToast('Findings submitted successfully!', 'success');
      setSelectedApp(null);
      setObservations('');
      setRecommendations('');
      setNextSessionDate('');
      fetchApps();
    } catch (err) {
      addToast(err.response?.data || 'Error submitting findings', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredApps = dateFilter
    ? appointments.filter(a => new Date(a.appointmentDate).toISOString().split('T')[0] === dateFilter)
    : appointments;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>{getGreeting(auth.firstName, 'Doctor')}</h2>
        <div className="d-flex align-items-center gap-2">
          <Calendar size={16} className="text-muted" />
          <input type="date" className="form-control form-control-sm" style={{ width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} />
          {dateFilter && <button className="btn btn-sm btn-light" onClick={() => setDateFilter('')}>Clear</button>}
        </div>
      </div>

      <div className="row g-4">
        {/* Schedule Panel */}
        <div className="col-md-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold">Patient Schedule</span>
              <span className="badge bg-primary-subtle text-primary rounded-pill">{filteredApps.length} sessions</span>
            </div>
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {loadingSchedule ? (
                <div className="text-center py-5">
                  <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                  <p className="small text-muted mt-2">Loading schedule...</p>
                </div>
              ) : filteredApps.length === 0 ? (
                <p className="text-center py-5 text-muted small">No appointments found.</p>
              ) : (
                filteredApps.map(app => (
                  <div key={app.appointmentId}
                    className={`p-3 border-bottom ${selectedApp?.appointmentId === app.appointmentId ? 'bg-primary-subtle' : ''}`}
                    style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => setSelectedApp(app)}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1 fw-bold">{app.patient?.firstName} {app.patient?.lastName}</h6>
                        <small className="text-muted d-block">{app.therapy?.name}</small>
                        <div className="d-flex align-items-center gap-2 mt-1">
                          <small className="text-muted"><Calendar size={12} className="me-1" />{new Date(app.appointmentDate).toLocaleDateString()}</small>
                          <small style={{ color: 'var(--bs-primary)' }} className="fw-medium"><Clock size={12} className="me-1" />{fmt(app.startTime)} - {fmt(app.endTime)}</small>
                        </div>
                      </div>
                      {app.status === 'Completed' ? (
                        <span className="badge rounded-pill status-completed">Done</span>
                      ) : app.status === 'Cancelled' ? (
                        <span className="badge rounded-pill status-cancelled">Cancelled</span>
                      ) : (
                        <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={(e) => { e.stopPropagation(); setSelectedApp(app); }}>Examine</button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Examination Panel */}
        <div className="col-md-7">
          {selectedApp ? (
            <div>
              {/* Patient Info Card */}
              <div className="card border-0 shadow-sm mb-4" style={{ background: 'linear-gradient(135deg, var(--bs-primary), var(--bs-secondary))' }}>
                <div className="card-body text-white p-4">
                  <h5 className="fw-bold mb-1">
                    {selectedApp.status === 'Completed' ? 'Session History: ' : 'Examining: '}{selectedApp.patient?.firstName} {selectedApp.patient?.lastName}
                  </h5>
                  <p className="mb-0 small opacity-75">
                    {selectedApp.therapy?.name} | {new Date(selectedApp.appointmentDate).toLocaleDateString()} | {fmt(selectedApp.startTime)} - {fmt(selectedApp.endTime)}
                  </p>
                </div>
              </div>

              {/* Patient History */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header py-3 d-flex align-items-center gap-2">
                  <FileText size={16} className="text-muted" />
                  <span className="fw-bold small text-muted">PREVIOUS FINDINGS</span>
                  <span className="badge bg-secondary-subtle ms-auto">{patientHistory.length}</span>
                </div>
                <div style={{ maxHeight: 220, overflowY: 'auto' }}>
                  {loadingHistory ? (
                    <div className="text-center py-4">
                      <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                    </div>
                  ) : patientHistory.length === 0 ? (
                    <p className="p-3 mb-0 small text-muted">No previous history found for this patient.</p>
                  ) : (
                    patientHistory.map(h => (
                      <div key={h.findingId} className="p-3 border-bottom small">
                        <div className="d-flex justify-content-between mb-1">
                          <span className="fw-bold">{new Date(h.createdAt).toLocaleDateString()} — {h.appointment?.therapy?.name || 'Therapy Session'}</span>
                          {h.appointmentId === selectedApp.appointmentId && (
                            <span className="badge bg-success-subtle text-success ms-2">This Session</span>
                          )}
                        </div>
                        <p className="mb-1 text-muted"><strong>Obs:</strong> {h.observations}</p>
                        {h.recommendations && <p className="mb-0" style={{ color: 'var(--bs-primary)' }}><strong>Rec:</strong> {h.recommendations}</p>}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* New Findings Form */}
              <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <Send size={16} /> {selectedApp.status === 'Completed' ? 'Session Findings (Read-Only)' : 'Session Findings'}
                  </h6>
                  <form onSubmit={handleSubmitFindings}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Observations</label>
                      <textarea className="form-control" rows="4" placeholder="Describe patient observations, progress, and areas of concern..."
                        value={observations} onChange={e => setObservations(e.target.value)} required disabled={selectedApp.status === 'Completed'}></textarea>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Recommendations</label>
                      <textarea className="form-control" rows="3" placeholder="Recommended next steps, exercises, or follow-up actions..."
                        value={recommendations} onChange={e => setRecommendations(e.target.value)} required disabled={selectedApp.status === 'Completed'}></textarea>
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold">Next Session Date (Optional)</label>
                      <input type="date" className="form-control" value={nextSessionDate} onChange={e => setNextSessionDate(e.target.value)} disabled={selectedApp.status === 'Completed'} />
                    </div>
                    <button type="submit" className="btn btn-primary w-100 fw-bold rounded-pill py-2 d-flex align-items-center justify-content-center gap-2" disabled={submitting || selectedApp.status === 'Completed'}>
                      <Send size={16} /> {selectedApp.status === 'Completed' ? 'Completed Session (View Only)' : submitting ? 'Submitting...' : 'Complete Session & Submit Findings'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ) : (
            <div className="card border-0 shadow-sm h-100 d-flex align-items-center justify-content-center p-5">
              <div className="text-center text-muted">
                <FileText size={56} className="mb-3 opacity-25" />
                <h5 className="fw-bold mb-2">No Patient Selected</h5>
                <p className="small">Select a patient from your schedule to begin the examination.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorPortal;
