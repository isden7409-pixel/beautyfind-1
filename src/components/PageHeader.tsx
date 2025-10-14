import React from 'react';
import { Language } from '../types';
import LanguageSwitcher from './LanguageSwitcher';
import { useAuth } from './auth/AuthProvider';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backText?: string;
  onNavigateToDashboard?: () => void;
  leftButtons?: Array<{ label: string; onClick: () => void }>; // extra buttons next to back on the left
  rightButtons?: Array<{ label: string; onClick: () => void }>; // extra buttons next to back on the right
  userNameClickable?: boolean;
  showUserInfo?: boolean; // скрыть блок с именем пользователя и кнопкой выхода
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  currentLanguage,
  subtitle,
  onLanguageChange,
  showBackButton = false,
  onBack,
  backText = '← Zpět',
  onNavigateToDashboard,
  leftButtons = [],
  rightButtons = [],
  userNameClickable = true,
  showUserInfo = true
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
          {leftButtons && leftButtons.length > 0 && (
            <div className="header-left-buttons">
              {leftButtons.map((btn, idx) => (
                <button key={idx} onClick={btn.onClick} className="admin-btn">
                  {btn.label}
                </button>
              ))}
            </div>
          )}
          {rightButtons && rightButtons.length > 0 && (
            <div className="header-right-buttons">
              {rightButtons.map((btn, idx) => (
                <button key={idx} onClick={btn.onClick} className="back-button">
                  {btn.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="header-center">
          {!!title && <h1 className="page-title">{title}</h1>}
          {!!subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
        <div className="header-right">
          <div className="header-actions">
            {showUserInfo && currentUser && userProfile && (
              <div className="user-info">
                <span
                  className={`user-name${userNameClickable ? ' clickable' : ''}`}
                  onClick={() => {
                    if (!userNameClickable) return;
                    if (onNavigateToDashboard) {
                      onNavigateToDashboard();
                    }
                  }}
                  style={{ cursor: userNameClickable ? 'pointer' : 'default' }}
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

