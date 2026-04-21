import { useState } from 'react';
import { SupportAgent as SupportAgentIcon, Search as SearchIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const ReceptionistDashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      if (!user) throw new Error('Not logged in');

      const response = await fetch(`/api/Receptionist/patients/search?name=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('Failed to search patients');
      
      const data = await response.json();
      setPatients(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>
          <SupportAgentIcon fontSize="large" style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
          Receptionist Dashboard
        </h1>
        <p>Manage scheduling, patient check-ins, and daily operations.</p>
      </div>

      <div className="card">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <SearchIcon color="primary" /> Patient Directory
        </h3>
        
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            placeholder="Search by First or Last Name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
        
        {patients.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Guardian ID</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.patientId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>{p.patientId}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{p.firstName} {p.lastName}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{p.guardianId || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {patients.length === 0 && !loading && searchQuery && (
           <p>No patients found matching your search.</p>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
