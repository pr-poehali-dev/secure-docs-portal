import { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import DocumentPortal from '@/components/DocumentPortal';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'admin' | 'user' | 'viewer'>('user');

  if (!isAuthenticated) {
    return <LoginPage onLogin={(role) => {
      setUserRole(role);
      setIsAuthenticated(true);
    }} />;
  }

  return <DocumentPortal onLogout={() => setIsAuthenticated(false)} userRole={userRole} />;
};

export default Index;