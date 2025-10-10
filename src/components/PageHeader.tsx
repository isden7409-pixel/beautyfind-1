import React from 'react';
import { Language } from '../types';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from './auth/AuthProvider';

interface PageHeaderProps {
  title: string;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backText?: string;
  onNavigateToDashboard?: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  currentLanguage,
  onLanguageChange,
  showBackButton = false,
  onBack,
  backText = '← Zpět',
  onNavigateToDashboard
}) => {
  const { currentUser, userProfile, logout } = useAuth();

  return (
    <div className="page-header">
      <div className="page-header-content">
        <div className="header-left">
          {showBackButton && onBack && (
            <button onClick={onBack} className="back-button">
              {backText}
            </button>
          )}
          <h1 className="page-title">{title}</h1>
        </div>
        <div className="header-center">
          {/* Заголовок перемещен в header-left */}
        </div>
        <div className="header-right">
          <div className="header-actions">
            {currentUser && userProfile && (
              <div className="user-info">
                <span 
                  className="user-name clickable"
                  onClick={() => {
                    if (onNavigateToDashboard) {
                      onNavigateToDashboard();
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {userProfile.name} ({userProfile.type === 'salon' ? 'Salon' : userProfile.type === 'master' ? 'Mistr' : 'Klient'})
                </span>
                <button onClick={logout} className="logout-button">
                  Odhlásit se
                </button>
              </div>
            )}
            <LanguageSwitcher
              currentLanguage={currentLanguage}
              onLanguageChange={onLanguageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;

