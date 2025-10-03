import React from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import UserDashboard from './UserDashboard';
import MasterDashboard from './MasterDashboard';
import SalonDashboard from './SalonDashboard';

interface DashboardRouterProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ language, onBack, onLanguageChange }) => {
  const { userProfile } = useAuth();

  if (!userProfile) {
    return (
      <div className="dashboard">
        <div className="error">User not authenticated</div>
      </div>
    );
  }

  switch (userProfile.type) {
    case 'client':
      return <UserDashboard language={language} onBack={onBack} onLanguageChange={onLanguageChange} />;
    case 'master':
      return <MasterDashboard language={language} onBack={onBack} onLanguageChange={onLanguageChange} />;
    case 'salon':
      return <SalonDashboard language={language} onBack={onBack} onLanguageChange={onLanguageChange} />;
    default:
      return (
        <div className="dashboard">
          <div className="error">Unknown user type</div>
        </div>
      );
  }
};

export default DashboardRouter;
