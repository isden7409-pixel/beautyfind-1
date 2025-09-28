import React, { useState, useEffect } from 'react';
import { Salon, Master, Language, Review } from '../types';
import ReviewsSection from '../components/ReviewsSection';
import { translateServices, translateSpecialty } from '../utils/serviceTranslations';

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
  
  // Моковые отзывы для салона
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: "1",
      userId: "1",
      userName: "Anna Nováková",
      rating: 5,
      comment: "Výborný salon s profesionálním přístupem. Manikúra byla perfektní a personál velmi milý.",
      date: "2024-01-15T10:30:00Z",
      salonId: salon.id
    },
    {
      id: "2",
      userId: "2",
      userName: "Petra Svobodová",
      rating: 4,
      comment: "Krásný interiér a kvalitní služby. Jediné mínus je delší čekací doba.",
      date: "2024-01-10T14:20:00Z",
      salonId: salon.id
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
        const mapElement = document.getElementById('salon-detail-map');
        if (!mapElement) return;

        // Check if map is already initialized
        if (mapElement.hasChildNodes()) return;

        try {
          const coordinates = salon.coordinates || { lat: 50.0755, lng: 14.4378 }; // Default to Prague
          
          const mapInstance = window.L.map('salon-detail-map').setView([coordinates.lat, coordinates.lng], 15);
          
          window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(mapInstance);

          const markerInstance = window.L.marker([coordinates.lat, coordinates.lng]).addTo(mapInstance);
          
          // Add popup to marker
          markerInstance.bindPopup(`
            <div style="text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px;">${salon.name}</h3>
              <p style="margin: 0 0 4px 0; color: #666; font-size: 14px;">${salon.address}</p>
              <p style="margin: 0; color: #888; font-size: 12px;">${salon.city === 'Prague' ? 'Praha' : salon.city}</p>
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
      if (typeof window !== 'undefined' && window.L && document.getElementById('salon-detail-map')) {
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
              ⭐ {salon.rating} ({salon.reviews} {t.reviews})
            </span>
            <span className="address">
              📍 {salon.address}, {salon.city === 'Prague' ? 'Praha' : salon.city}
            </span>
          </div>
          <p className="description">{salon.description}</p>
          <div className="contact-info">
            <h3>{t.contact}</h3>
            <p>📞 {salon.phone}</p>
            <p>✉️ {salon.email}</p>
            {salon.website && <p>🌐 {salon.website}</p>}
            <p>🕒 {salon.openHours}</p>
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
          <button className="book-button">{t.book}</button>
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
    </div>
  );
};

export default SalonDetailPage;
