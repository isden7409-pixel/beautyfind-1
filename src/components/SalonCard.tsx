import React, { useState } from 'react';
import { Salon, Language } from '../types';
import { translateServices } from '../utils/serviceTranslations';
import { translateAddressToCzech, formatStructuredAddressCzech } from '../utils/cities';
import { useReviewSummary } from '../hooks/useReviewSummary';
import { useAuth } from './auth/AuthProvider';
import PhotoCarousel from './PhotoCarousel';
import { PopularityBadge } from './PopularityBadge';
import { SalonBookingModalSimple } from './booking/SalonBookingModalSimple';
import { SalonBookingModalWithMasters } from './booking/SalonBookingModalWithMasters';

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
  const { userProfile } = useAuth();
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const displayAddress = salon.structuredAddress
    ? formatStructuredAddressCzech(salon.structuredAddress)
    : translateAddressToCzech(salon.address || '', salon.city);
  
  const hasMasters = salon.masters && salon.masters.length > 0;

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
        {/* Бейдж популярности */}
        {salon.analytics?.favoritesCount && salon.analytics.favoritesCount >= 20 && (
          <div className="mb-2">
            <PopularityBadge 
              favoritesCount={salon.analytics.favoritesCount}
              language={language}
            />
          </div>
        )}
        
        <h3>{salon.name}</h3>
        {displayAddress && (
          <p className="salon-address">
            📍 {t.address}: {displayAddress}
          </p>
        )}
        <div className="salon-rating">
          ⭐ {average} ({count} {t.reviews})
        </div>
        {/* Счетчик избранного */}
        {salon.analytics?.favoritesCount && salon.analytics.favoritesCount > 0 && (
          <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
            <span>❤️</span>
            <span>{salon.analytics.favoritesCount} {language === 'cs' ? 'lidí má v oblíbených' : 'people favorited'}</span>
          </div>
        )}
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
        
        {/* Кнопка Rezervace */}
        {userProfile && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowBookingModal(true);
            }}
            className="view-details-btn"
            style={{ backgroundColor: '#ec4899', color: 'white', marginTop: '8px' }}
          >
            📅 {language === 'cs' ? 'Rezervace' : 'Booking'}
          </button>
        )}
      </div>

      {/* Модальное окно резервации */}
      {userProfile && (
        hasMasters ? (
          <SalonBookingModalWithMasters
            salon={salon}
            masters={salon.masters || []}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBookingComplete={() => {
              setShowBookingModal(false);
              alert(language === 'cs' ? 'Rezervace vytvořena!' : 'Booking created!');
            }}
            currentUserId={userProfile.uid}
            currentUserName={userProfile.name}
            currentUserEmail={userProfile.email}
            currentUserPhone={userProfile.phone}
            language={language}
          />
        ) : (
          <SalonBookingModalSimple
            salon={salon}
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            onBookingComplete={() => {
              setShowBookingModal(false);
              alert(language === 'cs' ? 'Rezervace vytvořena!' : 'Booking created!');
            }}
            currentUserId={userProfile.uid}
            currentUserName={userProfile.name}
            currentUserEmail={userProfile.email}
            currentUserPhone={userProfile.phone}
            language={language}
          />
        )
      )}
    </div>
  );
};

export default SalonCard;
