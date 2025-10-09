import React, { useState, useEffect } from 'react';
import { Salon, Master, Language, Review, Booking } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import ReviewsSection from '../components/ReviewsSection';
import { reviewService } from '../firebase/services';
import SalonBookingModal from '../components/SalonBookingModal';
import { translateServices, translateSpecialty, translateLanguages } from '../utils/serviceTranslations';
import { formatExperienceYears } from '../utils/formatters';
import WorkingHoursDisplay from '../components/WorkingHoursDisplay';
import PhotoCarousel from '../components/PhotoCarousel';
import PageHeader from '../components/PageHeader';
import FavoriteButton from '../components/FavoriteButton';

interface SalonDetailPageProps {
  salon: Salon;
  language: Language;
  translations: any;
  onBack: () => void;
  onMasterSelect: (master: Master) => void;
  onLanguageChange: (language: Language) => void;
}

const SalonDetailPage: React.FC<SalonDetailPageProps> = ({
  salon: initialSalon,
  language,
  translations,
  onBack,
  onMasterSelect,
  onLanguageChange,
}) => {
  const t = translations[language];
  
  // Realtime salon data (auto-updates card after profile save)
  const [currentSalon, setCurrentSalon] = useState<Salon>(initialSalon);
  useEffect(() => {
    setCurrentSalon(initialSalon);
  }, [initialSalon]);
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'salons', initialSalon.id), (snap) => {
      if (snap.exists()) {
        setCurrentSalon({ id: initialSalon.id, ...(snap.data() as any) } as Salon);
      }
    });
    return () => unsub();
  }, [initialSalon.id]);
  // Alias for rendering code below
  const salon = currentSalon;

  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    (async () => {
      const data = await reviewService.getBySalon(salon.id);
      setReviews(data);
    })();
  }, [salon.id]);

  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0 ? Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewsCount).toFixed(1)) : 0;

  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  

  const handleAddReview = async (newReview: Omit<Review, 'id'>) => {
    const id = await reviewService.create(newReview);
    const updated = await reviewService.getBySalon(salon.id);
    setReviews(updated);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (salon.bookingEnabled) {
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    alert(t.bookingSuccess);
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined' && window.L) {
        const mapElement = document.getElementById('salon-detail-map');
        if (!mapElement) return;

        // Check if map is already initialized
        if (mapElement.hasChildNodes() || (mapElement as any)._leaflet_id) return;
        // Avoid initializing on hidden/zero-size container
        const el = mapElement as HTMLDivElement;
        if (!el.offsetWidth || !el.offsetHeight) {
          setTimeout(initMap, 100);
          return;
        }

        try {
          // Попробуем получить координаты: 1) сохраненные 2) геокодирование адреса 3) центр города
          let coordinates = salon.coordinates as any;
          
          if (!coordinates && (salon.structuredAddress || salon.address)) {
            try {
              const { geocodeAddress, geocodeStructuredAddress } = await import('../utils/geocoding');
              const geocoded = salon.structuredAddress
                ? await geocodeStructuredAddress(salon.structuredAddress)
                : (salon.address ? await geocodeAddress(salon.address) : undefined);
              if (geocoded) {
                coordinates = geocoded;
              }
            } catch (error) {
            }
          }
          if (!coordinates) {
            const cityCoords: { [key: string]: { lat: number; lng: number } } = {
              'Prague': { lat: 50.0755, lng: 14.4378 },
              'Brno': { lat: 49.1951, lng: 16.6068 },
              'Ostrava': { lat: 49.8206, lng: 18.2625 },
              'Plzen': { lat: 49.7475, lng: 13.3776 },
              'Liberec': { lat: 50.7671, lng: 15.0562 },
              'Olomouc': { lat: 49.5938, lng: 17.2509 }
            };
            coordinates = cityCoords[salon.city || 'Prague'] || { lat: 50.0755, lng: 14.4378 };
          }
          
          const mapInstance = window.L.map('salon-detail-map').setView([coordinates.lat, coordinates.lng], 15);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance);

          const markerInstance = window.L.marker([coordinates.lat, coordinates.lng]).addTo(mapInstance);
          
          // Add popup to marker
          markerInstance.bindPopup(`
            <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${salon.name}</h3>
              <p style="margin: 0; color: #666; font-size: 14px;">${salon.structuredAddress ? require('../utils/cities').formatStructuredAddressCzech(salon.structuredAddress) : (require('../utils/cities').translateAddressToCzech(salon.address || '', salon.city))}</p>
            </div>
          `);

          setMap(mapInstance);
          // ensure proper sizing after render
          setTimeout(() => {
            try { mapInstance.invalidateSize(); } catch {}
          }, 0);
          setMarker(markerInstance);
        } catch (error) {
        }
      }
    };

    // Wait for both Leaflet and DOM element to be ready
    const checkAndInit = () => {
      const el = document.getElementById('salon-detail-map') as HTMLDivElement | null;
      if (typeof window !== 'undefined' && window.L && el && el.offsetWidth && el.offsetHeight) {
        initMap();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();

    // Cleanup function
    return () => {
      if (map) {
        try { map.remove(); } catch {}
      }
    };
  }, [salon, map]);


  return (
    <div className="salon-detail-page">
      <PageHeader
        title=""
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
        showBackButton={true}
        onBack={onBack}
        backText={t.back}
      />
      <div className="salon-detail-content">
        <div className="salon-gallery">
          <PhotoCarousel
            images={salon.photos || []}
            mainImage={salon.image || ''}
            altText={salon.name}
            className="salon-detail-carousel"
            language={language}
          />
        </div>
        <div className="salon-info">
          <div className="salon-title-row">
            <h1>{salon.name}</h1>
            <FavoriteButton
              itemId={salon.id}
              itemType="salon"
              language={language}
            />
          </div>
          
          <div className="salon-meta">
            <span className="rating">
              ⭐ {averageRating} ({reviewsCount} {t.reviews})
            </span>
            {(salon.structuredAddress || salon.address) && (
              <span className="address">
                📍 {salon.structuredAddress
                  ? require('../utils/cities').formatStructuredAddressCzech(salon.structuredAddress)
                  : require('../utils/cities').translateAddressToCzech(salon.address, salon.city)}
              </span>
            )}
          </div>
          <p className="description pre-line">{salon.description}</p>
          <div className="contact-info">
            <h3 className="contact-title">{t.contact}</h3>
            <p>📞 {salon.phone}</p>
            <p>✉️ {salon.email}</p>
            {salon.website && (
              <p>
                🌐 <a 
                  href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  {salon.website}
                </a>
              </p>
            )}
          </div>
          {/* Working hours before services, in same gray box style */}
          <div className="contact-info">
            <h3 className="contact-title">{language === 'cs' ? 'Otevírací doba' : 'Opening hours'}</h3>
            {salon.byAppointment
              ? (<p>{language === 'cs' ? 'Po domluvě' : 'By appointment'}</p>)
              : (
                <WorkingHoursDisplay
                  workingHours={salon.workingHours}
                  language={language}
                />
              )}
          </div>

          <div className="services-section">
            <h3>{t.services}</h3>
            <div className="services-grid">
              {translateServices(salon.services, language).map(service => (
                <div key={service} className="service-badge">{service}</div>
              ))}
            </div>
          </div>

        {salon.languages && salon.languages.length > 0 && (
          <div className="services-section">
            <h3>{language === 'cs' ? 'Jazyky' : 'Languages'}</h3>
            <div className="services-grid">
              {translateLanguages(salon.languages, language).map(lang => (
                <div key={lang} className="service-badge">{lang}</div>
              ))}
            </div>
          </div>
        )}

          {salon.paymentMethods && salon.paymentMethods.length > 0 && (
            <div className="services-section">
              <h3>{t.paymentMethods || (language === 'cs' ? 'Způsoby platby' : 'Payment Methods')}</h3>
              <div className="services-grid">
                {salon.paymentMethods.map(method => {
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

          <div className="masters-section">
            <h3>Naši mistři</h3>
            <div className="masters-grid">
              {salon.masters.map((master: Master) => (
                <div
                  key={master.id}
                  className="master-card"
                  onClick={() => onMasterSelect(master)}
                >
                  <div className="master-photo-container">
                    {master.photo && master.photo.trim() !== '' && master.photo !== 'undefined' && master.photo !== 'null' ? (
                      <img 
                        src={master.photo} 
                        alt={master.name} 
                        className="master-photo"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          const placeholder = (e.target as HTMLImageElement).parentElement?.querySelector('.master-photo-placeholder') as HTMLElement;
                          if (placeholder) placeholder.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div 
                      className="master-photo-placeholder" 
                      style={{ display: (!master.photo || master.photo.trim() === '' || master.photo === 'undefined' || master.photo === 'null') ? 'flex' : 'none' }}
                    >
                      <div className="placeholder-content">
                        <div className="placeholder-icon">👤</div>
                        <div className="placeholder-text">{language === 'cs' ? 'MISTR' : 'MASTER'}</div>
                      </div>
                    </div>
                  </div>
                  <div className="master-info">
                    <h4>{master.name}</h4>
                    <p className="specialty">{translateSpecialty(master.specialty, language)}</p>
                    <p className="experience">{formatExperienceYears(master.experience, language)}</p>
                    <span className="master-rating">
                      ⭐ {master.rating} ({master.reviews} {t.reviews})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="salon-book-button-container">
            <button 
              className="book-button"
              onClick={handleBookingClick}
              disabled={!salon.bookingEnabled}
            >
              {salon.bookingEnabled ? t.book : (language === 'cs' ? 'Rezervace nedostupná' : 'Booking unavailable')}
            </button>
          </div>
        </div>
        
        <div className="salon-map-section">
          <h3>{language === 'cs' ? 'Umístění' : 'Location'}</h3>
          <div id="salon-detail-map" style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
        </div>

        <ReviewsSection
          reviews={reviews}
          language={language}
          translations={translations}
          onAddReview={handleAddReview}
          salonId={salon.id}
        />
      </div>

      {/* Salon Booking Modal */}
      <SalonBookingModal
        salon={salon}
        isOpen={showBookingModal}
        onClose={handleBookingClose}
        onBookingSuccess={handleBookingSuccess}
        language={language}
        translations={translations}
      />
    </div>
  );
};

export default SalonDetailPage;
