import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const AppRoutes = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  // Default route handler based on auth
  const getDefaultRoute = () => {
    if (isAuthenticated) {
      const activeRole = user.role ? user.role.toLowerCase() : 'patient';
      return <Navigate to={`/${activeRole}`} replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={['Admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/doctor" 
              element={
                <ProtectedRoute allowedRoles={['Doctor', 'Admin']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/patient" 
              element={
                <ProtectedRoute allowedRoles={['Patient', 'Admin']}>
                  <PatientDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/receptionist" 
              element={
                <ProtectedRoute allowedRoles={['Receptionist', 'Admin']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Default Route */}
            <Route path="/" element={getDefaultRoute()} />
          </Routes>
        </main>
      </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
