import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy-loaded pages for code splitting
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const PatientDashboard = lazy(() => import('./pages/PatientDashboard'));
const ReceptionistView = lazy(() => import('./pages/ReceptionistView'));
const DoctorPortal = lazy(() => import('./pages/DoctorPortal'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

function AppRoutes() {
  const { auth } = useAuth();

  return (
    <Router>
      <div className="App" style={{ minHeight: '100vh', backgroundColor: 'var(--bg)' }}>
        <Navbar />
        <div className="container mt-4 pb-5" style={{ paddingTop: '70px' }}>
          <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
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
              {/* Catch-all 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
