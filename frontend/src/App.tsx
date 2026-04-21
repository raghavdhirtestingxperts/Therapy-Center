import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientDashboard from './pages/PatientDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import './App.css';

function App() {
  const userStr = localStorage.getItem('user');
  const isAuthenticated = !!userStr;
  
  // Default route handler based on auth
  const getDefaultRoute = () => {
    if (isAuthenticated) {
      // In a real app, parse user.role to decide where to go
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  };

  return (
    <Router>
      <div className="app-container">
        <Navigation />
        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes (Placeholders) */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/receptionist" element={<ReceptionistDashboard />} />

            {/* Default Route */}
            <Route path="/" element={getDefaultRoute()} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
