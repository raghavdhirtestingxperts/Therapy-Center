import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    // User is not authenticated at all
    return <Navigate to="/login" replace />;
  }

  // Check if the user's role is in the array of allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect them to their designated home based on their actual role
    const actualRolePath = `/${user.role.toLowerCase()}`;
    return <Navigate to={actualRolePath} replace />;
  }

  // Role authorized! Render the protected component
  return children;
};

export default ProtectedRoute;
