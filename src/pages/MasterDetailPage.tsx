import React, { useState, useEffect } from 'react';
import { Master, Salon, Language, Review, Booking } from '../types';
import ReviewsSection from '../components/ReviewsSection';
import { reviewService } from '../firebase/services';
import BookingModal from '../components/BookingModal';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';

interface MasterDetailPageProps {
  master: Master;
  language: Language;
  translations: any;
  onBack: () => void;
  onSalonSelect?: (salon: Salon) => void;
  salons?: Salon[];
}

const MasterDetailPage: React.FC<MasterDetailPageProps> = ({
  master,
  language,
  translations,
  onBack,
  onSalonSelect,
  salons = [],
}) => {
  const t = translations[language];
  
  // Состояние для бронирования
  const [showBookingModal, setShowBookingModal] = useState(false);
  
  const [reviews, setReviews] = useState<Review[]>([]);
  useEffect(() => {
    (async () => {
      const data = await reviewService.getByMaster(master.id);
      setReviews(data);
    })();
  }, [master.id]);

  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  const handleAddReview = async (newReview: Omit<Review, 'id'>) => {
    const id = await reviewService.create(newReview);
    const updated = await reviewService.getByMaster(master.id);
    setReviews(updated);
  };

  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      if (typeof window !== 'undefined' && window.L) {
        const mapElement = document.getElementById('master-detail-map');
        if (!mapElement) return;

        // Check if map is already initialized
        if (mapElement.hasChildNodes()) return;
        const el = mapElement as HTMLDivElement;
        if (!el.offsetWidth || !el.offsetHeight) {
          setTimeout(initMap, 100);
          return;
        }

        try {
          // Отладочная информация
          console.log('Master data for map:', {
            name: master.name,
            address: master.address,
            city: master.city,
            coordinates: master.coordinates,
            isFreelancer: master.isFreelancer
          });
          
          let coordinates = master.coordinates;
          
          // Если координат нет, но есть адрес - попробуем геокодировать
          if (!coordinates && master.address && master.city) {
            try {
              const { geocodeAddress } = await import('../utils/geocoding');
              // Пробуем только полный адрес для скорости
              const geocoded = await geocodeAddress(`${master.address}, ${master.city}`);
              if (geocoded) {
                coordinates = geocoded;
                console.log('Successfully geocoded master:', geocoded);
              }
            } catch (error) {
              console.log('Geocoding failed for master:', error);
            }
          }
          
          // Если всё ещё нет координат, используем центр города
          if (!coordinates) {
            const cityCoords: { [key: string]: { lat: number; lng: number } } = {
              'Prague': { lat: 50.0755, lng: 14.4378 },
              'Brno': { lat: 49.1951, lng: 16.6068 },
              'Ostrava': { lat: 49.8206, lng: 18.2625 },
              'Plzen': { lat: 49.7475, lng: 13.3776 },
              'Liberec': { lat: 50.7671, lng: 15.0562 },
              'Olomouc': { lat: 49.5938, lng: 17.2509 }
            };
            coordinates = cityCoords[master.city || 'Prague'] || { lat: 50.0755, lng: 14.4378 };
            console.log('Using city center coordinates:', coordinates);
          }
          
          const mapInstance = window.L.map('master-detail-map').setView([coordinates.lat, coordinates.lng], 15);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance);

          const markerInstance = window.L.marker([coordinates.lat, coordinates.lng]).addTo(mapInstance);
          
          // Add popup to marker
          const salonInfo = master.isFreelancer 
            ? (language === 'cs' ? 'Samostatný pracovník' : 'Freelancer')
            : master.salonName || (language === 'cs' ? 'Salon' : 'Salon');
            
          markerInstance.bindPopup(`
            <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${master.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${salonInfo}</p>
              <p style="margin: 0; color: #888; font-size: 12px;">${master.address}${master.address ? ', ' : ''}${master.city === 'Prague' ? 'Praha' : master.city}</p>
            </div>
          `);

          setMap(mapInstance);
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
      const el = document.getElementById('master-detail-map') as HTMLDivElement | null;
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
  }, [master, language, map]);

  // Обработчики для бронирования
  const handleBookingClick = () => {
    if (master.bookingEnabled) {
      setShowBookingModal(true);
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    console.log('Booking successful:', booking);
    // Здесь можно добавить уведомление об успешном бронировании
    alert(t.bookingSuccess);
  };

  const handleBookingClose = () => {
    setShowBookingModal(false);
  };

  return (
    <div className="master-detail-page">
      <button onClick={onBack} className="back-button">
        {t.back}
      </button>
      <div className="master-detail">
        <img src={master.photo} alt={master.name} className="master-photo-large" />
        <h1>{master.name}</h1>
        <div className="master-meta">
          <span className="master-type">
            {master.isFreelancer ? t.freelancer : t.inSalon}
          </span>
          {master.salonName && (
            <span 
              className="salon-name clickable" 
              onClick={() => {
                if (onSalonSelect && master.salonId) {
                  const salon = salons.find(s => s.id === master.salonId);
                  if (salon) {
                    onSalonSelect(salon);
                  }
                }
              }}
            >
              📍 {master.salonName}
            </span>
          )}
          <span className="rating">
            ⭐ {master.rating} ({master.reviews} {t.reviews})
          </span>
          <span className="experience">{master.experience} {t.experience}</span>
        </div>
        <div className="contact-info">
          <h3>{t.contact}</h3>
          <p>📞 {master.phone}</p>
          <p>✉️ {master.email}</p>
          <p>📍 {master.address}{master.address ? ', ' : ''}{master.city === 'Prague' ? 'Praha' : master.city}</p>
          {master.languages && master.languages.length > 0 && (
            <div className="languages-in-contact">
              <p>🌐 <strong>{language === 'cs' ? 'Jazyky:' : 'Languages:'}</strong> {translateLanguages(master.languages, language).join(', ')}</p>
            </div>
          )}
        </div>
        <div className="services-section">
          <h3>{t.services}</h3>
          <div className="services-grid">
            {translateServices(master.services || [master.specialty], language).map(service => (
              <span key={service} className="service-badge">{service}</span>
            ))}
          </div>
        </div>
        
        {master.description && <p className="description">{master.description}</p>}
        
        <button 
          className="book-button" 
          onClick={handleBookingClick}
          disabled={!master.bookingEnabled}
        >
          {master.bookingEnabled ? t.book : (language === 'cs' ? 'Rezervace nedostupná' : 'Booking unavailable')}
        </button>
        
        <div className="master-map-section">
          <h3>{language === 'cs' ? 'Umístění' : 'Location'}</h3>
          <div id="master-detail-map" style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}></div>
        </div>

        <ReviewsSection
          reviews={reviews}
          language={language}
          translations={translations}
          onAddReview={handleAddReview}
          masterId={master.id}
        />
      </div>

      {/* Модальное окно бронирования */}
      <BookingModal
        master={master}
        isOpen={showBookingModal}
        onClose={handleBookingClose}
        onBookingSuccess={handleBookingSuccess}
        language={language}
        translations={translations}
      />
    </div>
  );
};

export default MasterDetailPage;
