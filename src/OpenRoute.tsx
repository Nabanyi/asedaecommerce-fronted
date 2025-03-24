import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { UserContext } from './UserContext';

export const OpenRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useContext(UserContext);
  return isAuthenticated ? <Navigate to="/home" /> : children;
};