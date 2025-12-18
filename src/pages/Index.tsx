import { useState } from 'react';
import LoginPage from '@/components/LoginPage';
import DocumentPortal from '@/components/DocumentPortal';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <LoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <DocumentPortal onLogout={() => setIsAuthenticated(false)} />;
};

export default Index;