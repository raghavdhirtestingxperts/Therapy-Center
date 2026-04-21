import { useEffect, useState } from 'react';
import { AdminPanelSettings as AdminPanelSettingsIcon, People as PeopleIcon } from '@mui/icons-material';

// Basic User Interface to type our fetched data
interface User {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error('Not logged in');
        
        const userData = JSON.parse(userStr);
        const token = userData.token;

        const response = await fetch('/api/Admin/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users. Ensure you have Admin privileges.');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err: any) {
        console.error('Admin API error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <h1>
          <AdminPanelSettingsIcon fontSize="large" style={{ verticalAlign: 'middle', marginRight: '8px', color: 'var(--primary)' }} />
          Admin Dashboard
        </h1>
        <p>Manage users, roles, and system settings.</p>
      </div>

      <div className="card" style={{ flex: 1 }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <PeopleIcon color="primary" /> System Users
        </h3>
        
        {loading ? (
          <p>Loading user directory...</p>
        ) : error ? (
          <p style={{ color: 'var(--error)' }}>{error}</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '0.75rem' }}>ID</th>
                  <th style={{ padding: '0.75rem' }}>Name</th>
                  <th style={{ padding: '0.75rem' }}>Email</th>
                  <th style={{ padding: '0.75rem' }}>Role</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.userId} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.75rem' }}>{user.userId}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 500 }}>{user.firstName} {user.lastName}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ 
                        padding: '4px 8px', 
                        borderRadius: '12px', 
                        backgroundColor: 'var(--surface-hover)',
                        fontSize: '0.85rem'
                      }}>
                        {user.role}
                      </span>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>No users found in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
