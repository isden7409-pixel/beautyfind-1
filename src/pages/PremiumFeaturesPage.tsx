import React, { useState } from 'react';
import { Language, PremiumFeature } from '../types';
import PageHeader from '../components/PageHeader';

interface PremiumFeaturesPageProps {
  language: Language;
  translations: any;
  onBack: () => void;
  onLanguageChange: (language: Language) => void;
  onOpenAuth?: () => void;
  onOpenRegistration?: () => void;
  isLoggedIn?: boolean;
  userName?: string;
  onOpenDashboard?: () => void;
  onGoHome?: () => void;
}

const PremiumFeaturesPage: React.FC<PremiumFeaturesPageProps> = ({
  language,
  translations,
  onBack,
  onLanguageChange,
  onOpenAuth,
  onOpenRegistration,
  isLoggedIn,
  userName,
  onOpenDashboard,
  onGoHome,
}) => {

  const [selectedType, setSelectedType] = useState<'salon' | 'master'>('salon');

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 1,
      name: language === 'cs' ? 'Základní balíček' : 'Basic Package',
      description: language === 'cs' ? 'Zobrazení na vrcholu výsledků na 7 dní' : 'Top search results display for 7 days',
      price: 299,
      duration: 'week',
      type: 'salon'
    },
    {
      id: 2,
      name: language === 'cs' ? 'Prémiový balíček' : 'Premium Package',
      description: language === 'cs' ? 'Zobrazení na vrcholu výsledků na 30 dní + zvýrazněný profil' : 'Top search results display for 30 days + highlighted profile',
      price: 999,
      duration: 'month',
      type: 'salon'
    },
    {
      id: 3,
      name: language === 'cs' ? 'VIP balíček' : 'VIP Package',
      description: language === 'cs' ? 'Zobrazení na vrcholu výsledků na 90 dní + zvýrazněný profil + statistiky' : 'Top search results display for 90 days + highlighted profile + statistics',
      price: 2499,
      duration: 'month',
      type: 'salon'
    },
    {
      id: 4,
      name: language === 'cs' ? 'Základní balíček' : 'Basic Package',
      description: language === 'cs' ? 'Zobrazení na vrcholu výsledků na 7 dní' : 'Top search results display for 7 days',
      price: 199,
      duration: 'week',
      type: 'master'
    },
    {
      id: 5,
      name: language === 'cs' ? 'Prémiový balíček' : 'Premium Package',
      description: language === 'cs' ? 'Zobrazení na vrcholu výsledků na 30 dní + zvýrazněný profil' : 'Top search results display for 30 days + highlighted profile',
      price: 699,
      duration: 'month',
      type: 'master'
    },
    {
      id: 6,
      name: language === 'cs' ? 'VIP balíček' : 'VIP Package',
      description: language === 'cs' ? 'Zobrazení na vrcholu výsledků na 90 dní + zvýrazněný profil + statistiky' : 'Top search results display for 90 days + highlighted profile + statistics',
      price: 1799,
      duration: 'month',
      type: 'master'
    }
  ];

  const handlePurchase = (feature: PremiumFeature) => {
    // В реальном приложении здесь будет логика покупки
    alert(language === 'cs' ? 'Funkce byla úspěšně zakoupena!' : 'Feature successfully purchased!');
  };

  const filteredFeatures = premiumFeatures.filter(feature => feature.type === selectedType);

  return (
    <div className="premium-features-page">
      <PageHeader
        title={''}
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
        showBackButton={false}
        showUserInfo={false}
        leftButtons={[
          { label: language === 'cs' ? 'Hlavní stránka' : 'Main Page', onClick: onGoHome || (() => {}) },
          { 
            label: isLoggedIn ? (language === 'cs' ? `Můj účet (${userName || 'Uživatel'})` : `My Account (${userName || 'User'})`) : (language === 'cs' ? 'Přihlášení' : 'Login'), 
            onClick: () => {
              if (isLoggedIn) {
                onOpenDashboard && onOpenDashboard();
              } else {
                onOpenAuth && onOpenAuth();
              }
            }
          },
          { label: language === 'cs' ? 'Registrace' : 'Registration', onClick: () => onOpenRegistration && onOpenRegistration() }
        ]}
        userNameClickable={false}
      />
      {/* Hero block like on Registrace */}
      <div className="admin-hero-wrap">
        <div className="admin-hero-section">
          <h1 className="admin-hero-title">BeautyFind.cz</h1>
          <p className="admin-hero-subtitle">{language === 'cs' ? 'Váš průvodce světem krásy v Česku' : 'Your guide to beauty in Czechia'}</p>
        </div>
      </div>
      <div className="premium-inline-title">
        <span>
          {language === 'cs'
            ? '⭐ Prémiové funkce - zvyšte svou viditelnost a přilákejte více klientů'
            : '⭐ Premium Features - increase your visibility and attract more clients'}
        </span>
      </div>

      <div className="premium-type-selector">
        <button 
          className={`type-button ${selectedType === 'salon' ? 'active' : ''}`}
          onClick={() => setSelectedType('salon')}
        >
          🏢 {language === 'cs' ? 'Pro salony' : 'For Salons'}
        </button>
        <button 
          className={`type-button ${selectedType === 'master' ? 'active' : ''}`}
          onClick={() => setSelectedType('master')}
        >
          👤 {language === 'cs' ? 'Pro mistry' : 'For Masters'}
        </button>
      </div>

      <div className="premium-packages">
        {filteredFeatures.map(feature => (
          <div key={feature.id} className="premium-package">
            <div className="package-header">
              <h3>{feature.name}</h3>
              <div className="package-price">
                <span className="price">{feature.price} Kč</span>
                <span className="duration">
                  {feature.duration === 'week' 
                    ? (language === 'cs' ? '/týden' : '/week')
                    : (language === 'cs' ? '/měsíc' : '/month')
                  }
                </span>
              </div>
            </div>
            <p className="package-description">{feature.description}</p>
            <div className="package-benefits">
              <div className="benefit">
                ✅ {language === 'cs' ? 'Zobrazení na vrcholu výsledků' : 'Top search results display'}
              </div>
              {feature.id === 2 || feature.id === 3 || feature.id === 5 || feature.id === 6 ? (
                <div className="benefit">
                  ✅ {language === 'cs' ? 'Zvýrazněný profil' : 'Highlighted profile'}
                </div>
              ) : null}
              {feature.id === 3 || feature.id === 6 ? (
                <div className="benefit">
                  ✅ {language === 'cs' ? 'Statistiky a analýzy' : 'Statistics and analytics'}
                </div>
              ) : null}
            </div>
            <button 
              className="purchase-button"
              onClick={() => handlePurchase(feature)}
            >
              {language === 'cs' ? 'Koupit nyní' : 'Purchase Now'}
            </button>
          </div>
        ))}
      </div>

      <div className="premium-info">
        <h3>{language === 'cs' ? 'Jak to funguje?' : 'How it works?'}</h3>
        <div className="steps">
          <div className="step">
            <div className="step-header-row">
              <div className="step-number">1</div>
              <h4>{language === 'cs' ? 'Vyberte balíček' : 'Choose package'}</h4>
            </div>
            <p>{language === 'cs' ? 'Zvolte si délku prémiového zobrazení' : 'Select the duration of premium display'}</p>
          </div>
          <div className="step">
            <div className="step-header-row">
              <div className="step-number">2</div>
              <h4>{language === 'cs' ? 'Zaplaťte' : 'Pay'}</h4>
            </div>
            <p>{language === 'cs' ? 'Bezpečná platba kartou nebo převodem' : 'Secure payment by card or transfer'}</p>
          </div>
          <div className="step">
            <div className="step-header-row">
              <div className="step-number">3</div>
              <h4>{language === 'cs' ? 'Začněte získavat klienty' : 'Start getting clients'}</h4>
            </div>
            <p>{language === 'cs' ? 'Váš profil bude zobrazen na vrcholu' : 'Your profile will be displayed at the top'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeaturesPage;
