import React from 'react';
import { Salon, Language } from '../types';
import { translateServices } from '../utils/serviceTranslations';
import { translateAddressToCzech, formatStructuredAddressCzech } from '../utils/cities';
import { useReviewSummary } from '../hooks/useReviewSummary';

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
  const { count, average } = useReviewSummary('salon', salon.id);
  const displayAddress = salon.structuredAddress
    ? formatStructuredAddressCzech(salon.structuredAddress)
    : translateAddressToCzech(salon.address || '', salon.city);

  return (
    <div 
      className="salon-card clickable-card" 
      onClick={() => onViewDetails(salon)}
    >
      {salon.isPremium && (
        <div className="premium-badge">⭐ PREMIUM</div>
      )}
      <img src={salon.image} alt={salon.name} className="salon-image" />
      <div className="salon-info">
        <h3>{salon.name}</h3>
        {displayAddress && (
          <p className="salon-address">
            📍 {t.address}: {displayAddress}
          </p>
        )}
        <div className="salon-rating">
          ⭐ {average} ({count} {t.reviews})
        </div>
        <div className="salon-services">
          {translateServices(salon.services, language).map(service => (
            <span key={service} className="service-tag">{service}</span>
          ))}
        </div>
      </div>
      <div className="salon-button-container">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(salon);
          }}
          className="view-details-btn"
        >
          {t.viewDetails}
        </button>
      </div>
    </div>
  );
};

export default SalonCard;
