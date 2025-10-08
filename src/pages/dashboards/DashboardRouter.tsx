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
  const { userProfile, currentUser, loading, isLoggingOut } = useAuth();

  console.log('DashboardRouter - Auth state:', { userProfile, currentUser, loading });

  if (loading || isLoggingOut) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>{isLoggingOut ? (language === 'cs' ? 'Odhlašování...' : 'Logging out...') : (language === 'cs' ? 'Načítání...' : 'Loading...')}</div>
        </div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован и мы не в процессе logout, показываем ошибку
  if (!currentUser && !isLoggingOut) {
    return (
      <div className="dashboard">
        <div className="error">{language === 'cs' ? 'Uživatel není ověřen - žádný aktuální uživatel' : 'User not authenticated - no current user'}</div>
      </div>
    );
  }

  // Если пользователь не аутентифицирован, но мы в процессе logout, показываем загрузку
  if (!currentUser && isLoggingOut) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>{language === 'cs' ? 'Odhlašování...' : 'Logging out...'}</div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>{language === 'cs' ? 'Načítání profilu...' : 'Loading profile...'}</div>
        </div>
      </div>
    );
  }

  console.log('DashboardRouter - User profile type:', userProfile.type);

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
          <div className="error">{language === 'cs' ? 'Neznámý typ uživatele' : 'Unknown user type'}</div>
        </div>
      );
  }
};

export default DashboardRouter;
