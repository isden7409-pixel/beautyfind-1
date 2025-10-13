import React, { useState } from 'react';
import { SalonRegistration, MasterRegistration, Language } from '../types';
import SalonRegistrationForm from '../components/SalonRegistrationForm';
import MasterRegistrationForm from '../components/MasterRegistrationForm';
import ClientRegistrationForm from '../components/ClientRegistrationForm';
import { useSalons } from '../hooks/useData';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../components/auth/AuthProvider';

interface AdminPanelProps {
  language: Language;
  translations: any;
  onBack: () => void;
  onLanguageChange: (language: Language) => void;
  onGoToHome: () => void; // Новая функция для перехода на главную страницу
  onOpenAuth?: () => void;
  onOpenPremium?: () => void;
  onOpenDashboard?: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  language,
  translations,
  onBack,
  onLanguageChange,
  onGoToHome,
  onOpenAuth,
  onOpenPremium,
  onOpenDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'salon' | 'master' | 'client'>('salon');
  const [showForm, setShowForm] = useState(false);
  const { salons } = useSalons();
  const { currentUser, userProfile, logout } = useAuth();

  const t = translations[language];

  // Проверка, залогинен ли пользователь
  const isLoggedIn = currentUser && userProfile;


  // Функция для автоматического выхода и регистрации
  const handleLogoutAndRegister = async () => {
    if (isLoggedIn) {
      try {
        await logout();
        // Небольшая задержка для обновления состояния
        await new Promise(resolve => setTimeout(resolve, 500));
        setShowForm(true);
      } catch (error) {
        console.error('Error during logout:', error);
        alert(language === 'cs' ? 'Chyba při odhlašování' : 'Error during logout');
      }
    } else {
      setShowForm(true);
    }
  };

  const handleSalonSubmit = (data: SalonRegistration) => {
    // После успешной регистрации салона пользователь уже залогинен
    // Перенаправляем в кабинет салона
    setShowForm(false);
    // Закрываем админ панель и переходим в кабинет
    onBack();
  };

  const handleMasterSubmit = (data: MasterRegistration) => {
    // После успешной регистрации мастера пользователь уже залогинен
    // Перенаправляем в кабинет мастера
    setShowForm(false);
    // Закрываем админ панель и переходим в кабинет
    onBack();
  };

  const handleCancel = () => {
    setShowForm(false);
  };


  if (showForm) {
    return (
      <div className="admin-panel">
        <div className="admin-hero-wrap">
          <PageHeader
            title={""}
            currentLanguage={language}
            onLanguageChange={onLanguageChange}
            showBackButton={false}
            showUserInfo={false}
            leftButtons={[
              { label: language === 'cs' ? 'Hlavní stránka' : 'Main Page', onClick: onGoToHome },
              {
                label: isLoggedIn
                  ? (language === 'cs' ? `Můj účet (${userProfile?.name || 'Uživatel'})` : `My Account (${userProfile?.name || 'User'})`)
                  : (language === 'cs' ? 'Přihlášení' : 'Login'),
                onClick: () => {
                  if (isLoggedIn) {
                    onOpenDashboard && onOpenDashboard();
                  } else {
                    onOpenAuth && onOpenAuth();
                  }
                }
              },
              { label: language === 'cs' ? 'Prémiové funkce' : 'Premium Features', onClick: () => onOpenPremium && onOpenPremium() }
            ]}
            userNameClickable={false}
          />
          <div className="admin-hero-section">
            <h1 className="admin-hero-title">BeautyFind.cz</h1>
            <p className="admin-hero-subtitle">{language === 'cs' ? 'Váš průvodce světem krásy v Česku' : 'Your guide to beauty in Czechia'}</p>
          </div>
        </div>
        
        {activeTab === 'salon' ? (
          <SalonRegistrationForm
            language={language}
            translations={translations}
            onSubmit={handleSalonSubmit}
            onCancel={handleCancel}
          />
        ) : activeTab === 'master' ? (
          <MasterRegistrationForm
            language={language}
            translations={translations}
            onSubmit={handleMasterSubmit}
            onCancel={handleCancel}
            salons={salons}
          />
        ) : (
          <ClientRegistrationForm
            language={language}
            translations={translations}
            onSubmit={() => { setShowForm(false); onBack(); }}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-hero-wrap">
        <PageHeader
          title={""}
          currentLanguage={language}
          onLanguageChange={onLanguageChange}
          showBackButton={false}
          showUserInfo={false}
          leftButtons={[
            { label: language === 'cs' ? 'Hlavní stránka' : 'Main Page', onClick: onGoToHome },
            {
              label: isLoggedIn
                ? (language === 'cs' ? `Můj účet (${userProfile?.name || 'Uživatel'})` : `My Account (${userProfile?.name || 'User'})`)
                : (language === 'cs' ? 'Přihlášení' : 'Login'),
              onClick: () => {
                if (isLoggedIn) {
                  onOpenDashboard && onOpenDashboard();
                } else {
                  onOpenAuth && onOpenAuth();
                }
              }
            },
            { label: language === 'cs' ? 'Prémiové funkce' : 'Premium Features', onClick: () => onOpenPremium && onOpenPremium() }
          ]}
          userNameClickable={false}
        />
        <div className="admin-hero-section">
          <h1 className="admin-hero-title">BeautyFind.cz</h1>
          <p className="admin-hero-subtitle">{language === 'cs' ? 'Váš průvodce světem krásy v Česku' : 'Your guide to beauty in Czechia'}</p>
        </div>
      </div>

      <div className="admin-content">

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'client' ? 'active' : ''}`}
            onClick={() => setActiveTab('client')}
          >
            {language === 'cs' ? 'Zaregistrovat se jako klient' : 'Register as Client'}
          </button>
          <button
            className={`tab-button ${activeTab === 'master' ? 'active' : ''}`}
            onClick={() => setActiveTab('master')}
          >
            {language === 'cs' ? 'Zaregistrovat se jako mistr' : 'Register as Master'}
          </button>
          <button
            className={`tab-button ${activeTab === 'salon' ? 'active' : ''}`}
            onClick={() => setActiveTab('salon')}
          >
            {language === 'cs' ? 'Zaregistrovat salon' : 'Register Salon'}
          </button>
        </div>

        <div className="admin-info">
          <h2>
            {activeTab === 'salon' ? t.salonRegistrationInfo : (activeTab === 'master' ? t.masterRegistrationInfo : (language === 'cs' ? 'Registrace klienta' : 'Client Registration'))}
          </h2>
          <p>
            {activeTab === 'salon' 
              ? t.salonRegistrationDescription 
              : activeTab === 'master'
              ? t.masterRegistrationDescription
              : t.clientRegistrationDescription
            }
          </p>
          
          <div className={`info-cards ${activeTab === 'client' ? 'info-cards-center' : ''}`}>
            <div className="info-card">
              <h3>{t.benefits}</h3>
              <ul>
                {activeTab === 'client' ? (
                  <>
                    <li>{t.benefit1}</li>
                    <li>{t.benefit2}</li>
                    <li>{t.benefit3}</li>
                    <li>{t.benefit4}</li>
                    <li>{t.benefit5}</li>
                  </>
                ) : activeTab === 'master' ? (
                  <>
                    <li>{t.masterBenefit1}</li>
                    <li>{t.masterBenefit2}</li>
                    <li>{t.masterBenefit3}</li>
                    <li>{t.masterBenefit4}</li>
                  </>
                ) : (
                  <>
                    <li>{t.salonBenefit1}</li>
                    <li>{t.salonBenefit2}</li>
                    <li>{t.salonBenefit3}</li>
                    <li>{t.salonBenefit4}</li>
                  </>
                )}
              </ul>
            </div>
            
            {activeTab !== 'client' && (
              <div className="info-card">
                <h3>{t.requirements}</h3>
                <ul>
                  <li>{t.requirement1}</li>
                  <li>{t.requirement2}</li>
                  <li>{activeTab === 'master' ? t.masterRequirement3 : t.requirement3}</li>
                  <li>{t.requirement4}</li>
                </ul>
              </div>
            )}
          </div>

          {isLoggedIn && (
            <div className="registration-warning" style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '20px',
              color: '#856404'
            }}>
              <strong>{language === 'cs' ? '⚠️ Upozornění:' : '⚠️ Warning:'}</strong>
              <br />
              {language === 'cs' 
                ? `Jste přihlášeni jako ${userProfile?.name} (${userProfile?.type === 'salon' ? 'Salon' : userProfile?.type === 'master' ? 'Mistr' : 'Klient'}). Pro registraci nového účtu budete automaticky odhlášeni.`
                : `You are logged in as ${userProfile?.name} (${userProfile?.type === 'salon' ? 'Salon' : userProfile?.type === 'master' ? 'Master' : 'Client'}). You will be automatically logged out to register a new account.`
              }
            </div>
          )}

          <button
            className="btn btn-primary btn-large"
            onClick={handleLogoutAndRegister}
          >
            {activeTab === 'salon' 
              ? t.startSalonRegistration 
              : activeTab === 'master' 
                ? t.startMasterRegistration 
                : (language === 'cs' ? 'Začít registraci klienta' : 'Start Client Registration')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

