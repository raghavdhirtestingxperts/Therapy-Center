import { useEffect, useState } from 'react';
import api from '../api';
import { Plus, Trash2, Edit, Users, Stethoscope, Calendar, BarChart3, Clock, UserPlus, RefreshCw, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardCharts from '../components/DashboardCharts';

const AdminDashboard = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [therapies, setTherapies] = useState([]);
  const [users, setUsers] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({});
  const [slotFilter, setSlotFilter] = useState({ doctorId: '', date: '' });
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);
  }, [showModal]);

  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [t, u, d, s, a, p] = await Promise.all([
        api.get('/admin/therapies'),
        api.get('/admin/users'),
        api.get('/admin/doctors'),
        api.get('/admin/dashboard-stats'),
        api.get('/appointment').catch(() => ({ data: [] })),
        api.get('/payment/history').catch(() => ({ data: [] }))
      ]);
      setTherapies(t.data); setUsers(u.data); setDoctors(d.data); setStats(s.data);
      setAppointments(a.data); setPayments(p.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchSlots = async () => {
    try {
      let url = '/admin/slots?';
      if (slotFilter.doctorId) url += `doctorId=${slotFilter.doctorId}&`;
      if (slotFilter.date) url += `date=${slotFilter.date}`;
      const res = await api.get(url);
      setSlots(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { if (activeTab === 'slots') fetchSlots(); }, [activeTab, slotFilter]);

  const fmt = (ts) => ts ? ts.substring(0, 5) : '';

  // CRUD handlers
  const handleSaveTherapy = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/admin/therapies/${editItem.therapyId}`, { ...form, therapyId: editItem.therapyId });
      } else {
        await api.post('/admin/therapies', form);
      }
      setShowModal(null); setEditItem(null); setForm({}); fetchAll();
      showToast(editItem ? 'Therapy updated' : 'Therapy created');
    } catch (err) { showToast('Error saving therapy', 'error'); }
  };

  const handleDeleteTherapy = async (id) => {
    if (window.confirm('Delete this therapy?')) {
      await api.delete(`/admin/therapies/${id}`); fetchAll();
      showToast('Therapy deleted');
    }
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/admin/users/${editItem.userId}`, form);
      } else {
        await api.post('/admin/users', { ...form, role: 'Receptionist' });
      }
      setShowModal(null); setEditItem(null); setForm({}); fetchAll();
      showToast(editItem ? 'Staff updated' : 'Staff created');
    } catch (err) { showToast(err.response?.data || 'Error saving staff', 'error'); }
  };

  const handleToggleUser = async (id) => {
    await api.delete(`/admin/users/${id}`); fetchAll();
    showToast('User status updated');
  };

  const handleSaveDoctor = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await api.put(`/admin/doctors/${editItem.doctorId}`, form);
      } else {
        await api.post('/admin/doctors', form);
      }
      setShowModal(null); setEditItem(null); setForm({}); fetchAll();
      showToast(editItem ? 'Doctor updated' : 'Doctor created');
    } catch (err) { showToast(err.response?.data || 'Error saving doctor', 'error'); }
  };

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/admin/slots/generate', form);
      showToast(res.data.message); setShowModal(null); setForm({}); fetchSlots();
    } catch (err) { showToast('Error generating slots', 'error'); }
  };

  const handleDeleteSlot = async (id) => {
    try { await api.delete(`/admin/slots/${id}`); fetchSlots(); showToast('Slot deleted'); }
    catch (err) { showToast(err.response?.data || 'Cannot delete booked slot', 'error'); }
  };

  const openEdit = (type, item) => {
    setEditItem(item);
    if (type === 'therapy') {
      setForm({ name: item.name, description: item.description, durationMinutes: item.durationMinutes, cost: item.cost });
    } else if (type === 'staff') {
      setForm({ firstName: item.firstName, lastName: item.lastName, email: item.email, password: '', phoneNumber: item.phoneNumber || '' });
    } else if (type === 'doctor') {
      setForm({ firstName: item.user?.firstName, lastName: item.user?.lastName, email: item.user?.email, password: '', specialization: item.specialization, bio: item.bio, availableDays: item.availableDays, startTime: fmt(item.startTime), endTime: fmt(item.endTime) });
    }
    setShowModal(type);
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
    { key: 'therapies', label: 'Therapies', icon: <Stethoscope size={16} /> },
    { key: 'staff', label: 'Staff', icon: <Users size={16} /> },
    { key: 'doctors', label: 'Doctors', icon: <UserPlus size={16} /> },
    { key: 'slots', label: 'Slots', icon: <Calendar size={16} /> }
  ];

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <h2 className="fw-bold mb-0" style={{ color: 'var(--text-primary)' }}>Admin Control Center</h2>
        <div className="nav nav-pills p-1 rounded-pill shadow-sm">
          {tabs.map(t => (
            <button key={t.key} className={`nav-link rounded-pill px-3 py-2 d-flex align-items-center gap-2 ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="tab-content-area">
        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="row g-4">
              {[
                { label: 'Total Patients', value: stats.totalPatients, color: '#6366f1', bg: 'rgba(99,102,241,0.08)' },
                { label: 'Total Doctors', value: stats.totalDoctors, color: '#14b8a6', bg: 'rgba(20,184,166,0.08)' },
                { label: "Today's Sessions", value: stats.todaysAppointments, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                { label: 'Total Revenue', value: `₹${stats.totalRevenue || 0}`, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
                { label: 'Scheduled', value: stats.scheduledAppointments, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
                { label: 'Completed', value: stats.completedAppointments, color: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
                { label: 'Therapies', value: stats.totalTherapies, color: '#ec4899', bg: 'rgba(236,72,153,0.08)' },
                { label: 'All Appointments', value: stats.totalAppointments, color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' }
              ].map((s, i) => (
                <div className="col-md-3 col-6" key={i}>
                  <div className="stat-card" style={{ background: s.bg }}>
                    <div className="small fw-semibold mb-2" style={{ color: s.color }}>{s.label}</div>
                    <div className="fw-bold" style={{ fontSize: '1.75rem', color: s.color }}>{s.value ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
            {/* Charts */}
            <DashboardCharts appointments={appointments} payments={payments} therapies={therapies} />
          </>
        )}

        {/* Therapies */}
        {activeTab === 'therapies' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => { setEditItem(null); setForm({ name: '', description: '', durationMinutes: 30, cost: 0 }); setShowModal('therapy'); }}>
                <Plus size={18} /> Add Therapy
              </button>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead><tr><th>Therapy</th><th>Duration</th><th>Cost</th><th>Actions</th></tr></thead>
                  <tbody>
                    {therapies.map(t => (
                      <tr key={t.therapyId}>
                        <td><div className="fw-bold">{t.name}</div><small className="text-muted">{t.description}</small></td>
                        <td><span className="badge bg-primary-subtle text-primary">{t.durationMinutes} mins</span></td>
                        <td><span className="fw-bold" style={{ color: 'var(--bs-primary)' }}>₹{t.cost}</span></td>
                        <td>
                          <button className="btn btn-sm btn-light me-1" onClick={() => openEdit('therapy', t)}><Edit size={15} /></button>
                          <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeleteTherapy(t.therapyId)}><Trash2 size={15} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Staff */}
        {activeTab === 'staff' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => { setEditItem(null); setForm({ firstName: '', lastName: '', email: '', password: '', phoneNumber: '' }); setShowModal('staff'); }}>
                <Plus size={18} /> Add Receptionist
              </button>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {users.filter(u => u.role !== 'Guardian' && u.role !== 'Patient').map(u => (
                      <tr key={u.userId}>
                        <td className="fw-bold">{u.firstName} {u.lastName}</td>
                        <td className="text-muted small">{u.email}</td>
                        <td><span className={`badge rounded-pill ${u.role === 'Admin' ? 'bg-primary' : u.role === 'Doctor' ? 'bg-info-subtle text-info' : 'bg-secondary-subtle text-secondary'}`}>{u.role}</span></td>
                        <td><span className={`badge rounded-pill ${u.isActive ? 'status-completed' : 'status-cancelled'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
                        <td>
                          {u.role !== 'Admin' && (<>
                            <button className="btn btn-sm btn-light me-1" onClick={() => openEdit('staff', u)}><Edit size={15} /></button>
                            <button className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`} onClick={() => handleToggleUser(u.userId)}>{u.isActive ? 'Deactivate' : 'Activate'}</button>
                          </>)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Doctors */}
        {activeTab === 'doctors' && (
          <div>
            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => { setEditItem(null); setForm({ firstName: '', lastName: '', email: '', password: '', specialization: '', bio: '', availableDays: 'Mon,Tue,Wed,Thu,Fri', startTime: '09:00', endTime: '17:00' }); setShowModal('doctor'); }}>
                <Plus size={18} /> Add Doctor
              </button>
            </div>
            <div className="row g-4">
              {doctors.map(d => (
                <div className="col-md-6" key={d.doctorId}>
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <h5 className="fw-bold mb-1">Dr. {d.user?.firstName} {d.user?.lastName}</h5>
                          <span className="badge rounded-pill bg-primary-subtle text-primary mb-2">{d.specialization}</span>
                          <p className="text-muted small mb-2">{d.bio}</p>
                          <div className="d-flex align-items-center gap-3 text-muted small">
                            <span><Calendar size={13} className="me-1" />{d.availableDays}</span>
                            <span><Clock size={13} className="me-1" />{fmt(d.startTime)} - {fmt(d.endTime)}</span>
                          </div>
                        </div>
                        <button className="btn btn-sm btn-light" onClick={() => openEdit('doctor', d)}><Edit size={15} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Slots */}
        {activeTab === 'slots' && (
          <div>
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label small fw-bold">Doctor</label>
                    <select className="form-select" value={slotFilter.doctorId} onChange={e => setSlotFilter({...slotFilter, doctorId: e.target.value})}>
                      <option value="">All Doctors</option>
                      {doctors.map(d => <option key={d.doctorId} value={d.doctorId}>Dr. {d.user?.firstName} {d.user?.lastName}</option>)}
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small fw-bold">Date</label>
                    <input type="date" className="form-control" value={slotFilter.date} onChange={e => setSlotFilter({...slotFilter, date: e.target.value})} />
                  </div>
                  <div className="col-md-3">
                    <button className="btn btn-primary rounded-pill px-4 d-flex align-items-center gap-2" onClick={() => { setEditItem(null); setForm({ doctorId: '', date: '', slotDurationMinutes: 45 }); setShowModal('generateSlots'); }}>
                      <RefreshCw size={16} /> Generate Slots
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead><tr><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {slots.map(s => (
                      <tr key={s.slotId}>
                        <td className="fw-bold">Dr. {s.doctor?.user?.firstName} {s.doctor?.user?.lastName}</td>
                        <td>{new Date(s.date).toLocaleDateString()}</td>
                        <td><Clock size={13} className="me-1 text-muted" />{fmt(s.startTime)} - {fmt(s.endTime)}</td>
                        <td><span className={`badge rounded-pill ${s.isBooked ? 'status-cancelled' : 'status-completed'}`}>{s.isBooked ? 'Booked' : 'Available'}</span></td>
                        <td>{!s.isBooked && <button className="btn btn-sm btn-light text-danger" onClick={() => handleDeleteSlot(s.slotId)}><Trash2 size={15} /></button>}</td>
                      </tr>
                    ))}
                    {slots.length === 0 && <tr><td colSpan="5" className="text-center py-4 text-muted">No slots found. Use filters or generate new slots.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">
                  {showModal === 'therapy' && (editItem ? 'Edit Therapy' : 'Add Therapy')}
                  {showModal === 'staff' && (editItem ? 'Edit Staff' : 'Add Receptionist')}
                  {showModal === 'doctor' && (editItem ? 'Edit Doctor' : 'Add Doctor')}
                  {showModal === 'generateSlots' && 'Generate Time Slots'}
                </h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(null); setEditItem(null); }}></button>
              </div>

              {showModal === 'therapy' && (
                <form onSubmit={handleSaveTherapy}>
                  <div className="modal-body">
                    <div className="mb-3"><label className="form-label small fw-bold">Name</label><input type="text" className="form-control" value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} required /></div>
                    <div className="mb-3"><label className="form-label small fw-bold">Description</label><textarea className="form-control" rows="2" value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})}></textarea></div>
                    <div className="row">
                      <div className="col-6 mb-3"><label className="form-label small fw-bold">Duration (mins)</label><input type="number" className="form-control" value={form.durationMinutes || ''} onChange={e => setForm({...form, durationMinutes: parseInt(e.target.value)})} required /></div>
                      <div className="col-6 mb-3"><label className="form-label small fw-bold">Cost (₹)</label><input type="number" className="form-control" value={form.cost || ''} onChange={e => setForm({...form, cost: parseFloat(e.target.value)})} required /></div>
                    </div>
                  </div>
                  <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
                </form>
              )}

              {showModal === 'staff' && (
                <form onSubmit={handleSaveStaff}>
                  <div className="modal-body">
                    <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">First Name</label><input type="text" className="form-control" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">Last Name</label><input type="text" className="form-control" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} required /></div></div>
                    <div className="mb-3"><label className="form-label small fw-bold">Email</label><input type="email" className="form-control" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Password{editItem ? ' (leave blank to keep)' : ''}</label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <Lock size={18} color="var(--text-secondary)" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0"
                          value={form.password || ''}
                          onChange={e => setForm({...form, password: e.target.value})}
                          {...(!editItem && { required: true })}
                        />
                        <button
                          type="button"
                          className="input-group-text border-start-0 px-3 d-flex align-items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer', background: 'var(--input-group-bg)', borderColor: 'var(--input-border)' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="mb-3"><label className="form-label small fw-bold">Phone</label><input type="text" className="form-control" value={form.phoneNumber || ''} onChange={e => setForm({...form, phoneNumber: e.target.value})} /></div>
                  </div>
                  <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
                </form>
              )}

              {showModal === 'doctor' && (
                <form onSubmit={handleSaveDoctor}>
                  <div className="modal-body">
                    <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">First Name</label><input type="text" className="form-control" value={form.firstName || ''} onChange={e => setForm({...form, firstName: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">Last Name</label><input type="text" className="form-control" value={form.lastName || ''} onChange={e => setForm({...form, lastName: e.target.value})} required /></div></div>
                    <div className="mb-3"><label className="form-label small fw-bold">Email</label><input type="email" className="form-control" value={form.email || ''} onChange={e => setForm({...form, email: e.target.value})} required /></div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold">Password{editItem ? ' (leave blank to keep)' : ''}</label>
                      <div className="input-group">
                        <span className="input-group-text border-end-0">
                          <Lock size={18} color="var(--text-secondary)" />
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className="form-control border-start-0 border-end-0"
                          value={form.password || ''}
                          onChange={e => setForm({...form, password: e.target.value})}
                          {...(!editItem && { required: true })}
                        />
                        <button
                          type="button"
                          className="input-group-text border-start-0 px-3 d-flex align-items-center"
                          onClick={() => setShowPassword(!showPassword)}
                          style={{ cursor: 'pointer', background: 'var(--input-group-bg)', borderColor: 'var(--input-border)' }}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div className="mb-3"><label className="form-label small fw-bold">Specialization</label><input type="text" className="form-control" value={form.specialization || ''} onChange={e => setForm({...form, specialization: e.target.value})} required /></div>
                    <div className="mb-3"><label className="form-label small fw-bold">Available Days</label><input type="text" className="form-control" placeholder="Mon,Tue,Wed" value={form.availableDays || ''} onChange={e => setForm({...form, availableDays: e.target.value})} required /></div>
                    <div className="row"><div className="col-6 mb-3"><label className="form-label small fw-bold">Start Time</label><input type="time" className="form-control" value={form.startTime || '09:00'} onChange={e => setForm({...form, startTime: e.target.value})} required /></div><div className="col-6 mb-3"><label className="form-label small fw-bold">End Time</label><input type="time" className="form-control" value={form.endTime || '17:00'} onChange={e => setForm({...form, endTime: e.target.value})} required /></div></div>
                  </div>
                  <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
                </form>
              )}

              {showModal === 'generateSlots' && (
                <form onSubmit={handleGenerateSlots}>
                  <div className="modal-body">
                    <div className="mb-3"><label className="form-label small fw-bold">Doctor</label><select className="form-select" value={form.doctorId || ''} onChange={e => setForm({...form, doctorId: parseInt(e.target.value)})} required><option value="">Choose...</option>{doctors.map(d => <option key={d.doctorId} value={d.doctorId}>Dr. {d.user?.firstName} {d.user?.lastName}</option>)}</select></div>
                     <div className="mb-3"><label className="form-label small fw-bold">Date</label><input type="date" className="form-control" value={form.date || ''} min={getTodayString()} onChange={e => setForm({...form, date: e.target.value})} required /></div>
                    <div className="mb-3"><label className="form-label small fw-bold">Slot Duration (mins)</label><input type="number" className="form-control" value={form.slotDurationMinutes || 45} onChange={e => setForm({...form, slotDurationMinutes: parseInt(e.target.value)})} required /></div>
                  </div>
                  <div className="modal-footer"><button type="button" className="btn btn-light" onClick={() => setShowModal(null)}>Cancel</button><button type="submit" className="btn btn-primary">Generate</button></div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
