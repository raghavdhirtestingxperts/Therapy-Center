import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import PatientDashboard from './pages/PatientDashboard';
import ReceptionistView from './pages/ReceptionistView';
import DoctorPortal from './pages/DoctorPortal';
import LandingPage from './pages/LandingPage';

function App() {
  const { auth } = useAuth();

  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', background: 'var(--surface)' }}>
        <Navbar />
        <div className="container mt-4 pb-5">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={auth.token ? <Navigate to={`/${auth.role?.toLowerCase()}`} /> : <Login />}
            />
            <Route
              path="/register"
              element={auth.token ? <Navigate to={`/${auth.role?.toLowerCase()}`} /> : <Register />}
            />
            <Route
              path="/admin"
              element={auth.role === 'Admin' ? <AdminDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/guardian"
              element={auth.role === 'Patient' || auth.role === 'Guardian' ? <PatientDashboard /> : <Navigate to="/login" />}
            />
            <Route
              path="/receptionist"
              element={auth.role === 'Receptionist' ? <ReceptionistView /> : <Navigate to="/login" />}
            />
            <Route
              path="/doctor"
              element={auth.role === 'Doctor' ? <DoctorPortal /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
