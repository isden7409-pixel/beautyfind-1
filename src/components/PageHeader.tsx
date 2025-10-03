import React from 'react';
import { Language } from '../types';
import LanguageSwitcher from './LanguageSwitcher';

interface PageHeaderProps {
  title: string;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  showBackButton?: boolean;
  onBack?: () => void;
  backText?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  currentLanguage,
  onLanguageChange,
  showBackButton = false,
  onBack,
  backText = '← Zpět'
}) => {
  return (
    <div className="page-header">
      <div className="page-header-content">
        {showBackButton && onBack && (
          <button onClick={onBack} className="back-button">
            {backText}
          </button>
        )}
        <h1 className="page-title">{title}</h1>
        <LanguageSwitcher
          currentLanguage={currentLanguage}
          onLanguageChange={onLanguageChange}
        />
      </div>
    </div>
  );
};

export default PageHeader;

