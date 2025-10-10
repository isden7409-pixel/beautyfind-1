import React, { useState, useEffect } from 'react';
import { Master, Salon, Language, Review, Booking } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import ReviewsSection from '../components/ReviewsSection';
import { reviewService } from '../firebase/services';
import BookingModal from '../components/BookingModal';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import { formatExperienceYears } from '../utils/formatters';
import WorkingHoursDisplay from '../components/WorkingHoursDisplay';
import PageHeader from '../components/PageHeader';
import FavoriteButton from '../components/FavoriteButton';

interface MasterDetailPageProps {
  master: Master;
  language: Language;
  translations: any;
  onBack: () => void;
  onSalonSelect?: (salon: Salon) => void;
  salons?: Salon[];
  onLanguageChange: (language: Language) => void;
}

const MasterDetailPage: React.FC<MasterDetailPageProps> = ({
  master: initialMaster,
  language,
  translations,
  onBack,
  onSalonSelect,
  salons = [],
  onLanguageChange,
}) => {
  const t = translations[language];

  // Realtime master data
  const [currentMaster, setCurrentMaster] = useState<Master>(initialMaster);
  useEffect(() => { setCurrentMaster(initialMaster); }, [initialMaster]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'masters', initialMaster.id), (snap) => {
      if (snap.exists()) {
        setCurrentMaster({ id: initialMaster.id, ...(snap.data() as any) } as Master);
      }
    });
    return () => unsub();
  }, [initialMaster.id]);
  const master = currentMaster;

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const data = await reviewService.getByMaster(master.id);
      setReviews(data);
    })();
  }, [master.id]);

  const handleAddReview = async (newReview: Omit<Review, 'id'>) => {
    await reviewService.create(newReview);
    const updated = await reviewService.getByMaster(master.id);
    setReviews(updated);
  };

  const initMap = async () => {
    if (typeof window !== 'undefined' && window.L) {
      const mapElement = document.getElementById('master-detail-map');
      if (!mapElement) return;

      if (mapElement.hasChildNodes()) return;
      const el = mapElement as HTMLDivElement;
      if (!el.offsetWidth || !el.offsetHeight) {
        setTimeout(initMap, 100);
        return;
      }

      try {
        let coordinates = master.coordinates;

        if (!coordinates && (master.structuredAddress || (master.address && master.city))) {
          try {
            const { geocodeAddress, geocodeStructuredAddress } = await import('../utils/geocoding');
            const geocoded = master.structuredAddress
              ? await geocodeStructuredAddress(master.structuredAddress)
              : await geocodeAddress(`${master.address}, ${master.city}`);
            if (geocoded) {
              coordinates = { lat: geocoded.lat, lng: geocoded.lng };
            }
          } catch (geoError) {
            // Geocoding error
          }
        }

        if (coordinates) {
          const newMap = window.L.map('master-detail-map').setView([coordinates.lat, coordinates.lng], 13);
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(newMap);

          const markerInstance = window.L.marker([coordinates.lat, coordinates.lng]).addTo(newMap);
          markerInstance.bindPopup(`
            <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <div style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">${master.name}</div>
              <div style="font-size: 14px; color: #666;">${master.address || master.structuredAddress?.fullAddress || ''}</div>
            </div>
          `, {
            closeButton: true,
            autoClose: true,
            closeOnClick: true,
            autoOpen: false,
            className: 'custom-popup',
            maxWidth: 250,
            minWidth: 200
          });
          setMap(newMap);
        }
      } catch (error) {
        // Error initializing map
      }
    }
  };

  useEffect(() => {
    const checkAndInit = () => {
      const el = document.getElementById('master-detail-map') as HTMLDivElement | null;
      if (typeof window !== 'undefined' && window.L && el && el.offsetWidth && el.offsetHeight) {
        initMap();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();

    return () => {
      if (map) {
        try { map.remove(); } catch {}
      }
    };
  }, [master, language, map]);

  const handleBookingClick = () => {
    if (master.bookingEnabled) {
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    alert(t.bookingSuccess);
    setShowBookingModal(false);
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
  };

  const masterSalon = master.salonId ? salons.find(s => s.id === master.salonId) : null;

  return (
    <div className="master-detail-page">
      <PageHeader
        title=""
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
        showBackButton={true}
        onBack={onBack}
        backText={t.back}
      />

      <div className="master-detail-content">
        {(() => {
          const hasValidPhoto = master.photo && 
            master.photo.trim() !== '' && 
            master.photo !== 'undefined' && 
            master.photo !== 'null' &&
            master.photo.startsWith('http');
          
          if (hasValidPhoto) {
            return (
              <>
                <img 
                  src={master.photo} 
                  alt={master.name} 
                  className="master-photo-large"
                  onError={(e) => {
                    // При ошибке загрузки скрываем изображение и показываем заглушку
                    (e.target as HTMLImageElement).style.display = 'none';
                    const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.master-photo-large-placeholder') as HTMLElement;
                    if (placeholder) placeholder.style.display = 'flex';
                  }}
                />
                <div 
                  className="master-photo-large-placeholder" 
                  style={{ display: 'none' }}
                >
                  <div className="placeholder-content">
                    <div className="placeholder-icon">👤</div>
                    <div className="placeholder-text">{language === 'cs' ? 'MISTR' : 'MASTER'}</div>
                  </div>
                </div>
              </>
            );
          } else {
            return (
              <div className="master-photo-large-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">👤</div>
                  <div className="placeholder-text">{language === 'cs' ? 'MISTR' : 'MASTER'}</div>
                </div>
              </div>
            );
          }
        })()}

        <h1 className="master-name-centered">{master.name}</h1>
        
        <div className="favorite-button-container" style={{ textAlign: 'center', margin: '10px 0' }}>
          <FavoriteButton
            itemId={master.id}
            itemType="master"
            language={language}
          />
        </div>
        
        <div className="master-meta">
          {!master.isFreelancer && masterSalon && (
            <div className="salon-info-row">
              <div className="master-type">{t.inSalon}</div>
              <div className="salon-name clickable" onClick={() => onSalonSelect && onSalonSelect(masterSalon)}>
                {masterSalon.name}
              </div>
            </div>
          )}
          {master.isFreelancer && (
            <div className="master-type freelancer">{t.freelancer}</div>
          )}
          <div className="rating">⭐ {master.rating} ({master.reviews} {t.reviews})</div>
          {master.experience && (
            <div className="experience">{formatExperienceYears(master.experience, language)}</div>
          )}
        </div>

        {master.description && (
          <div className="description">
            <p className="pre-line">{master.description}</p>
          </div>
        )}

        {master.services && master.services.length > 0 && (
          <div className="services-section">
            <h3>{t.services}</h3>
            <div className="services-grid">
              {master.services.map((service: string, index: number) => (
                <div key={index} className="service-badge">
                  {translateServices([service], language)[0]}
                </div>
              ))}
            </div>
          </div>
        )}

        {master.languages && master.languages.length > 0 && (
          <div className="services-section">
            <h3>{t.languages}</h3>
            <div className="services-grid">
              {master.languages.map((lang: string, index: number) => (
                <div key={index} className="service-badge">
                  {translateLanguages([lang], language)[0]}
                </div>
              ))}
            </div>
          </div>
        )}

        {(() => {
          console.log('Master paymentMethods:', master.paymentMethods);
          console.log('Payment methods exists?', master.paymentMethods && master.paymentMethods.length > 0);
          console.log('Translation for paymentMethods:', t.paymentMethods);
          return null;
        })()}

        {master.paymentMethods && master.paymentMethods.length > 0 && (
          <div className="services-section">
            <h3>{t.paymentMethods || (language === 'cs' ? 'Způsoby platby' : 'Payment Methods')}</h3>
            <div className="services-grid">
              {master.paymentMethods.map(method => {
                const methodLabels: {[key: string]: string} = {
                  'cash': t.paymentCash || (language === 'cs' ? 'Platba v hotovosti' : 'Cash'),
                  'card': t.paymentCard || (language === 'cs' ? 'Platba kartou' : 'Card'),
                  'qr': t.paymentQR || (language === 'cs' ? 'QR kód' : 'QR Code'),
                  'account': t.paymentAccount || (language === 'cs' ? 'Platba na účet' : 'Bank Transfer'),
                  'voucher': t.paymentVoucher || (language === 'cs' ? 'Dárkový poukaz' : 'Gift Voucher'),
                  'benefit': t.paymentBenefit || (language === 'cs' ? 'Benefitní karty' : 'Benefit Cards')
                };
                const label = methodLabels[method] || method;
                return <div key={method} className="service-badge">{label}</div>;
              })}
            </div>
          </div>
        )}

        <div className="contact-info">
          <h3>{t.contact}</h3>
          <p><strong>{t.phone}:</strong> {master.phone}</p>
          <p><strong>{t.email}:</strong> {master.email}</p>
          {master.address && <p><strong>{t.address}:</strong> {master.address}</p>}
        </div>

        <div className="contact-info">
          <h3>{t.openHours}</h3>
          {master.workingHours && master.workingHours.length > 0 ? (
            <WorkingHoursDisplay workingHours={master.workingHours} language={language} />
          ) : (
            <p style={{ color: '#1a1a1a', fontStyle: 'normal' }}>
              {language === 'cs' ? 'Po domluvě' : 'By appointment'}
            </p>
          )}
        </div>

        <div className="master-book-button-container">
          <button 
            onClick={handleBookingClick} 
            className="book-button"
            disabled={!master.bookingEnabled}
          >
            {master.bookingEnabled ? t.book : (language === 'cs' ? 'Rezervace nedostupná' : 'Booking unavailable')}
          </button>
        </div>

        <div className="master-map-section">
          <h3>{t.location}</h3>
          <div id="master-detail-map" className="master-detail-map"></div>
        </div>

        <ReviewsSection
          masterId={master.id}
          reviews={reviews}
          onAddReview={handleAddReview}
          language={language}
          translations={translations}
        />
      </div>

      {showBookingModal && (
        <BookingModal
          master={master}
          isOpen={showBookingModal}
          language={language}
          translations={translations}
          onClose={handleBookingClose}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
};

export default MasterDetailPage;

