import React from 'react';
import { Language } from '../types';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${currentLanguage === 'cs' ? 'active' : ''}`}
        onClick={() => onLanguageChange('cs')}
      >
        CS
      </button>
      <button
        className={`lang-btn ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => onLanguageChange('en')}
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;
