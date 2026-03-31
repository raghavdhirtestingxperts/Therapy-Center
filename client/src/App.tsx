import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Lazy load pages for performance
const Login = lazy(() => import('./pages/Login'));
const AppLayout = lazy(() => import('./components/Layout'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const TherapyManagement = lazy(() => import('./pages/TherapyManagement'));
const PatientBooking = lazy(() => import('./pages/PatientBooking'));
const DoctorFindings = lazy(() => import('./pages/DoctorFindings'));
const PaymentGateway = lazy(() => import('./pages/PaymentGateway'));

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#f43f5e', // Rose
    },
    background: {
      default: '#f8fafc',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Suspense fallback={<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh"><CircularProgress /></Box>}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="therapies" element={<TherapyManagement />} />
                <Route path="book" element={<PatientBooking />} />
                <Route path="findings" element={<DoctorFindings />} />
                <Route path="payments" element={<PaymentGateway />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
