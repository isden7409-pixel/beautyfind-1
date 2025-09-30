import React, { useState, useEffect } from 'react';
import { Salon, Master, Language, Review, Booking } from '../types';
import ReviewsSection from '../components/ReviewsSection';
import { reviewService } from '../firebase/services';
import SalonBookingModal from '../components/SalonBookingModal';
import { translateServices, translateSpecialty } from '../utils/serviceTranslations';
import WorkingHoursDisplay from '../components/WorkingHoursDisplay';

interface SalonDetailPageProps {
  salon: Salon;
  language: Language;
  translations: any;
  onBack: () => void;
  onMasterSelect: (master: Master) => void;
}

const SalonDetailPage: React.FC<SalonDetailPageProps> = ({
  salon,
  language,
  translations,
  onBack,
  onMasterSelect,
}) => {
  const t = translations[language];
  
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
  
  console.log('SalonDetailPage render, showBookingModal:', showBookingModal);

  const handleAddReview = async (newReview: Omit<Review, 'id'>) => {
    const id = await reviewService.create(newReview);
    const updated = await reviewService.getBySalon(salon.id);
    setReviews(updated);
  };

  const handleBookingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Booking button clicked, salon.bookingEnabled:', salon.bookingEnabled);
    if (salon.bookingEnabled) {
      setShowBookingModal(true);
      console.log('Modal should open now');
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    console.log('Booking successful:', booking);
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
          console.log('Salon coordinates from DB:', coordinates);
          
          if (!coordinates && (salon.structuredAddress || salon.address)) {
            try {
              const { geocodeAddress, geocodeStructuredAddress } = await import('../utils/geocoding');
              const geocoded = salon.structuredAddress
                ? await geocodeStructuredAddress(salon.structuredAddress)
                : (salon.address ? await geocodeAddress(salon.address) : undefined);
              if (geocoded) {
                coordinates = geocoded;
                console.log('Successfully geocoded salon:', geocoded);
              }
            } catch (error) {
              console.log('Geocoding error:', error);
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
          console.error('Error initializing map:', error);
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
      <button onClick={onBack} className="back-button">
        {t.back}
      </button>
      <div className="salon-detail">
        <div className="salon-gallery">
          <img src={salon.image} alt={salon.name} className="main-image" />
          <div className="thumbnail-grid">
            {salon.photos.map((photo: string, index: number) => (
              <img
                key={index}
                src={photo}
                alt={`${salon.name} ${index + 1}`}
                className="thumbnail"
              />
            ))}
          </div>
        </div>
        <div className="salon-info">
          <h1>{salon.name}</h1>
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
          <p className="description">{salon.description}</p>
          <div className="contact-info">
            <h3 className="contact-title">{t.contact}</h3>
            <p>📞 {salon.phone}</p>
            <p>✉️ {salon.email}</p>
            {salon.website && <p>🌐 {salon.website}</p>}
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
                <span key={service} className="service-badge">{service}</span>
              ))}
            </div>
          </div>
          <div className="masters-section">
            <h3>Naši mistři</h3>
            <div className="masters-grid">
              {salon.masters.map((master: Master) => (
                <div
                  key={master.id}
                  className="master-card"
                  onClick={() => onMasterSelect(master)}
                >
                  <img src={master.photo} alt={master.name} className="master-photo" />
                  <div className="master-info">
                    <h4>{master.name}</h4>
                    <p className="specialty">{translateSpecialty(master.specialty, language)}</p>
                    <p className="experience">{master.experience} {t.experience}</p>
                    <span className="master-rating">
                      ⭐ {master.rating} ({master.reviews})
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
