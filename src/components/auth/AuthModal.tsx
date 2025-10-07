import React, { useState } from 'react';
import LoginForm from './LoginForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: 'cs' | 'en';
  onGoToRegistration?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess, language, onGoToRegistration }) => {
  const [isLogin, setIsLogin] = useState(true);

  if (!isOpen) return null;

  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  const translations = {
    cs: {
      close: 'Zavřít'
    },
    en: {
      close: 'Close'
    }
  };

  const t = translations[language];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content auth-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        
        <LoginForm
          onSuccess={handleSuccess}
          language={language}
          onGoToRegistration={() => {
            onClose();
            onGoToRegistration && onGoToRegistration();
          }}
        />
      </div>
    </div>
  );
};

export default AuthModal;

