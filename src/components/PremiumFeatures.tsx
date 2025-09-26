import React, { useState } from 'react';
import { PremiumFeature, Language } from '../types';

interface PremiumFeaturesProps {
  language: Language;
  translations: any;
  onPurchase: (feature: PremiumFeature) => void;
  type: 'salon' | 'master';
  itemId: number;
}

const PremiumFeatures: React.FC<PremiumFeaturesProps> = ({
  language,
  translations,
  onPurchase,
  type,
  itemId,
}) => {
  const [selectedFeature, setSelectedFeature] = useState<PremiumFeature | null>(null);

  const t = translations[language];

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 1,
      name: type === 'salon' ? 'Top Salon - Den' : 'Top Master - Den',
      description: type === 'salon' 
        ? 'Zobrazte svůj salon na vrcholu výsledků vyhledávání na 24 hodin'
        : 'Zobrazte sebe na vrcholu výsledků vyhledávání na 24 hodin',
      price: type === 'salon' ? 500 : 200,
      duration: 'day',
      type: type
    },
    {
      id: 2,
      name: type === 'salon' ? 'Top Salon - Týden' : 'Top Master - Týden',
      description: type === 'salon'
        ? 'Zobrazte svůj salon na vrcholu výsledků vyhledávání na 7 dní'
        : 'Zobrazte sebe na vrcholu výsledků vyhledávání na 7 dní',
      price: type === 'salon' ? 2500 : 1000,
      duration: 'week',
      type: type
    },
    {
      id: 3,
      name: type === 'salon' ? 'Top Salon - Měsíc' : 'Top Master - Měsíc',
      description: type === 'salon'
        ? 'Zobrazte svůj salon na vrcholu výsledků vyhledávání na 30 dní'
        : 'Zobrazte sebe na vrcholu výsledků vyhledávání na 30 dní',
      price: type === 'salon' ? 8000 : 3000,
      duration: 'month',
      type: type
    }
  ];

  const handlePurchase = (feature: PremiumFeature) => {
    setSelectedFeature(feature);
    // В реальном приложении здесь будет интеграция с платежной системой
    alert(`${t.purchaseConfirm} ${feature.name} za ${feature.price} Kč`);
    onPurchase(feature);
    setSelectedFeature(null);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} Kč`;
  };

  const getDurationText = (duration: string) => {
    switch (duration) {
      case 'day': return t.day;
      case 'week': return t.week;
      case 'month': return t.month;
      default: return duration;
    }
  };

  return (
    <div className="premium-features">
      <div className="premium-header">
        <h3>⭐ {t.premiumFeatures}</h3>
        <p>{t.premiumDescription}</p>
      </div>

      <div className="features-grid">
        {premiumFeatures.map((feature) => (
          <div key={feature.id} className="feature-card">
            <div className="feature-header">
              <h4>{feature.name}</h4>
              <div className="feature-price">
                <span className="price">{formatPrice(feature.price)}</span>
                <span className="duration">/{getDurationText(feature.duration)}</span>
              </div>
            </div>
            
            <p className="feature-description">{feature.description}</p>
            
            <div className="feature-benefits">
              <ul>
                <li>✅ {t.benefit1}</li>
                <li>✅ {t.benefit2}</li>
                <li>✅ {t.benefit3}</li>
                <li>✅ {t.benefit4}</li>
              </ul>
            </div>
            
            <button
              className="purchase-btn"
              onClick={() => handlePurchase(feature)}
            >
              {t.purchaseNow}
            </button>
          </div>
        ))}
      </div>

      <div className="premium-info">
        <h4>{t.howItWorks}</h4>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h5>{t.step1Title}</h5>
              <p>{t.step1Description}</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h5>{t.step2Title}</h5>
              <p>{t.step2Description}</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h5>{t.step3Title}</h5>
              <p>{t.step3Description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumFeatures;
