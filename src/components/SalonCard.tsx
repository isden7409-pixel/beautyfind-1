import React from 'react';
import { Salon, Language } from '../types';
import { translateServices } from '../utils/serviceTranslations';
import { translateAddressToCzech, formatStructuredAddressCzech } from '../utils/cities';
import { useReviewSummary } from '../hooks/useReviewSummary';
import PhotoCarousel from './PhotoCarousel';

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
      <PhotoCarousel
        images={salon.photos || []}
        mainImage={salon.image || ''}
        altText={salon.name}
        className="salon-image-container"
        language={language}
      />
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
          {(() => {
            const allServices = translateServices(salon.services, language);
            const maxVisibleServices = 6; // Максимум услуг для отображения (примерно 2 строки по 3 услуги)
            
            if (allServices.length <= maxVisibleServices) {
              // Если услуг мало, показываем все
              return allServices.map(service => (
                <span key={service} className="service-tag">{service}</span>
              ));
            } else {
              // Если услуг много, показываем первые maxVisibleServices и "+X"
              const visibleServices = allServices.slice(0, maxVisibleServices);
              const hiddenCount = allServices.length - maxVisibleServices;
              
              return [
                ...visibleServices.map(service => (
                  <span key={service} className="service-tag">{service}</span>
                )),
                <span key="more" className="service-tag">+{hiddenCount}</span>
              ];
            }
          })()}
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
