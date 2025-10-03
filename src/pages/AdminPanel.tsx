import React, { useState } from 'react';
import { SalonRegistration, MasterRegistration, Language } from '../types';
import SalonRegistrationForm from '../components/SalonRegistrationForm';
import MasterRegistrationForm from '../components/MasterRegistrationForm';
import { useSalons } from '../hooks/useData';

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
  const [activeTab, setActiveTab] = useState<'salon' | 'master'>('salon');
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
        <div className="admin-header">
          <button onClick={handleCancel} className="back-button">
            {t.back}
          </button>
          <h1>{t.adminPanel}</h1>
        </div>
        
        {activeTab === 'salon' ? (
          <SalonRegistrationForm
            language={language}
            translations={translations}
            onSubmit={handleSalonSubmit}
            onCancel={handleCancel}
          />
        ) : (
          <MasterRegistrationForm
            language={language}
            translations={translations}
            onSubmit={handleMasterSubmit}
            onCancel={handleCancel}
            salons={salons}
          />
        )}
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <button onClick={onBack} className="back-button">
          {t.backToHome}
        </button>
        <h1>{t.adminPanel}</h1>
      </div>

      <div className="admin-content">
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'salon' ? 'active' : ''}`}
            onClick={() => setActiveTab('salon')}
          >
            {t.registerSalon}
          </button>
          <button
            className={`tab-button ${activeTab === 'master' ? 'active' : ''}`}
            onClick={() => setActiveTab('master')}
          >
            {t.registerMaster}
          </button>
        </div>

        <div className="admin-info">
          <h2>
            {activeTab === 'salon' ? t.salonRegistrationInfo : t.masterRegistrationInfo}
          </h2>
          <p>
            {activeTab === 'salon' 
              ? t.salonRegistrationDescription 
              : t.masterRegistrationDescription
            }
          </p>
          
          <div className="info-cards">
            <div className="info-card">
              <h3>{t.benefits}</h3>
              <ul>
                <li>{t.benefit1}</li>
                <li>{t.benefit2}</li>
                <li>{t.benefit3}</li>
                <li>{t.benefit4}</li>
              </ul>
            </div>
            
            <div className="info-card">
              <h3>{t.requirements}</h3>
              <ul>
                <li>{t.requirement1}</li>
                <li>{t.requirement2}</li>
                <li>{t.requirement3}</li>
                <li>{t.requirement4}</li>
              </ul>
            </div>
          </div>

          <button
            className="btn btn-primary btn-large"
            onClick={() => setShowForm(true)}
          >
            {activeTab === 'salon' ? t.startSalonRegistration : t.startMasterRegistration}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

