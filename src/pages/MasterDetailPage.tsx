import React, { useState, useEffect } from 'react';
import { Master, Salon, Language, Review, Booking } from '../types';
import ReviewsSection from '../components/ReviewsSection';
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
  
  // Mock recenze pro mistra
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      userId: "1",
      userName: "Marie Krásná",
      rating: 5,
      comment: "Výborná práce! Kateřina je velmi zkušená a pečlivá. Určitě se vrátím.",
      date: "2024-01-12T16:45:00Z",
      masterId: master.id
    },
    {
      id: "2",
      userId: "2",
      userName: "Jana Svobodová",
      rating: 4,
      comment: "Kvalitní služby za rozumnou cenu. Doporučuji!",
      date: "2024-01-08T11:20:00Z",
      masterId: master.id
    }
  ]);

  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  const handleAddReview = (newReview: Omit<Review, 'id'>) => {
    const review: Review = {
      ...newReview,
      id: (Math.max(...reviews.map(r => parseInt(r.id))) + 1).toString(),
    };
    setReviews([...reviews, review]);
  };

  // Initialize map
  useEffect(() => {
    const initMap = () => {
      if (typeof window !== 'undefined' && window.L) {
        const mapElement = document.getElementById('master-detail-map');
        if (!mapElement) return;

        // Check if map is already initialized
        if (mapElement.hasChildNodes()) return;

        try {
          const coordinates = master.coordinates || { lat: 50.0755, lng: 14.4378 }; // Default to Prague
          
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
              <p style="margin: 0; color: #888; font-size: 12px;">${master.address}</p>
            </div>
          `);

          setMap(mapInstance);
          setMarker(markerInstance);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
    };

    // Wait for both Leaflet and DOM element to be ready
    const checkAndInit = () => {
      if (typeof window !== 'undefined' && window.L && document.getElementById('master-detail-map')) {
        initMap();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };

    checkAndInit();

    // Cleanup function
    return () => {
      if (map) {
        map.remove();
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
          <p>📍 {master.address}, {master.city === 'Prague' ? 'Praha' : master.city}</p>
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
