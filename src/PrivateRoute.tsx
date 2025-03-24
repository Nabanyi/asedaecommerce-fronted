import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

export const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(UserContext);
  return isAuthenticated ? children : <Navigate to="/login" />;
};