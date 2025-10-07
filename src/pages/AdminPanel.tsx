import React, { useState } from 'react';
import { SalonRegistration, MasterRegistration, Language } from '../types';
import SalonRegistrationForm from '../components/SalonRegistrationForm';
import MasterRegistrationForm from '../components/MasterRegistrationForm';
import ClientRegistrationForm from '../components/ClientRegistrationForm';
import { useSalons } from '../hooks/useData';
import PageHeader from '../components/PageHeader';

interface AdminPanelProps {
  language: Language;
  translations: any;
  onBack: () => void;
  onLanguageChange: (language: Language) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  language,
  translations,
  onBack,
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<'salon' | 'master' | 'client'>('salon');
  const [showForm, setShowForm] = useState(false);
  const { salons } = useSalons();

  const t = translations[language];


  const handleSalonSubmit = (data: SalonRegistration) => {
    // Здесь будет отправка данных на сервер
    alert(t.registrationSuccess);
    setShowForm(false);
  };

  const handleMasterSubmit = (data: MasterRegistration) => {
    // Здесь будет отправка данных на сервер
    alert(t.registrationSuccess);
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
  };

  if (showForm) {
    return (
      <div className="admin-panel">
        <PageHeader
          title=""
          currentLanguage={language}
          onLanguageChange={onLanguageChange}
          showBackButton={true}
          onBack={handleCancel}
          backText={language === 'cs' ? '← Zpět' : '← Back'}
        />
        
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
            onSubmit={() => { alert(t.registrationSuccess); setShowForm(false); }}
            onCancel={handleCancel}
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <PageHeader
        title=""
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
        showBackButton={true}
        onBack={onBack}
        backText={language === 'cs' ? '← Zpět' : '← Back'}
      />

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

          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowForm(true)}
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

