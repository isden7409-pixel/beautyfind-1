import React from 'react';
import { Salon, Language } from '../types';

interface SalonCardProps {
  salon: Salon;
  language: Language;
  translations: any;
  onViewDetails: (salon: Salon) => void;
}

const SalonCard: React.FC<SalonCardProps> = ({
  salon,
  language,
  translations,
  onViewDetails,
}) => {
  const t = translations[language];

  return (
    <div className="salon-card">
      {salon.isPremium && (
        <div className="premium-badge">⭐ PREMIUM</div>
      )}
      <img src={salon.image} alt={salon.name} className="salon-image" />
      <div className="salon-info">
        <h3>{salon.name}</h3>
        <p className="salon-address">
          {t.address} {salon.address}, {salon.city === 'Prague' ? 'Praha' : salon.city}
        </p>
        <div className="salon-rating">
          {t.rating} {salon.rating} ({salon.reviews} {t.reviews})
        </div>
        <div className="salon-services">
          {salon.services.map(service => (
            <span key={service} className="service-tag">{service}</span>
          ))}
        </div>
        <button
          onClick={() => onViewDetails(salon)}
          className="view-details-btn"
        >
          {t.viewDetails}
        </button>
      </div>
    </div>
  );
};

export default SalonCard;
