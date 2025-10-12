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
// import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebook } from 'react-icons/fa';

interface MasterDetailPageProps {
  master: Master;
  language: Language;
  translations: any;
  onBack: () => void;
  onSalonSelect?: (salon: Salon) => void;
  salons?: Salon[];
  onLanguageChange: (language: Language) => void;
  onNavigateToDashboard?: () => void;
}

const MasterDetailPage: React.FC<MasterDetailPageProps> = ({
  master: initialMaster,
  language,
  translations,
  onBack,
  onSalonSelect,
  salons = [],
  onLanguageChange,
  onNavigateToDashboard,
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
  const [selectedPriceListImage, setSelectedPriceListImage] = useState<string | null>(null);

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
        backText="Zpět"
        onNavigateToDashboard={onNavigateToDashboard}
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
          <div className="rating-experience-row">
            <div className="rating">⭐ {master.rating} ({master.reviews} {t.reviews})</div>
            {master.experience && (
              <div className="experience">{formatExperienceYears(master.experience, language)}</div>
            )}
          </div>
        </div>

        {master.description && (
          <div className="about-section">
            <h3 className="about-title">{language === 'cs' ? 'O mně' : 'About me'}</h3>
            <p className="pre-line">{master.description}</p>
          </div>
        )}

        <div className="contact-info">
          <h3>{t.contact}</h3>
          {!master.isFreelancer && masterSalon ? (
            // Для мастеров, работающих в салонах - показываем контакты салона
            <>
              <p className="social-link">
                <svg className="social-icon location" width="18" height="18" viewBox="0 0 24 24" fill="#FF6B35">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                {masterSalon.address}
              </p>
              <p className="social-link">
                <svg className="social-icon email" width="18" height="18" viewBox="0 0 24 24" fill="#EA4335">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                {masterSalon.email}
              </p>
              <p className="social-link">
                <svg className="social-icon phone" width="18" height="18" viewBox="0 0 24 24" fill="#34A853">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {masterSalon.phone}
              </p>
              {masterSalon.website && (
                <p className="social-link">
                  <svg className="social-icon website" width="18" height="18" viewBox="0 0 24 24" fill="#4285F4">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                  <a
                    href={masterSalon.website.startsWith('http') ? masterSalon.website : `https://${masterSalon.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="website-link"
                  >
                    {masterSalon.website}
                  </a>
                </p>
              )}
              {masterSalon.whatsapp && (
                <p className="social-link">
                  <svg className="social-icon whatsapp" width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <a href={`https://wa.me/${masterSalon.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </p>
              )}
              {masterSalon.telegram && (
                <p className="social-link">
                  <svg className="social-icon telegram" width="18" height="18" viewBox="0 0 24 24" fill="#0088cc">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <a href={`https://t.me/${masterSalon.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    Telegram
                  </a>
                </p>
              )}
              {masterSalon.instagram && (
                <p className="social-link">
                  <svg className="social-icon instagram" width="18" height="18" viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <a href={`https://instagram.com/${masterSalon.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </p>
              )}
              {masterSalon.facebook && (
                <p className="social-link">
                  <svg className="social-icon facebook" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <a href={`https://www.facebook.com/${masterSalon.facebook}`} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </p>
              )}
            </>
          ) : (
            // Для фрилансеров - показываем их контакты
            <>
              {master.address && (
                <p className="social-link">
                  <svg className="social-icon location" width="18" height="18" viewBox="0 0 24 24" fill="#FF6B35">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  {master.address}
                </p>
              )}
              <p className="social-link">
                <svg className="social-icon email" width="18" height="18" viewBox="0 0 24 24" fill="#EA4335">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                {master.email}
              </p>
              <p className="social-link">
                <svg className="social-icon phone" width="18" height="18" viewBox="0 0 24 24" fill="#34A853">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                {master.phone}
              </p>
              {master.whatsapp && (
                <p className="social-link">
                  <svg className="social-icon whatsapp" width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  <a href={`https://wa.me/${master.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                </p>
              )}
              {master.telegram && (
                <p className="social-link">
                  <svg className="social-icon telegram" width="18" height="18" viewBox="0 0 24 24" fill="#0088cc">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                  <a href={`https://t.me/${master.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                    Telegram
                  </a>
                </p>
              )}
              {master.instagram && (
                <p className="social-link">
                  <svg className="social-icon instagram" width="18" height="18" viewBox="0 0 24 24" fill="#E4405F">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <a href={`https://instagram.com/${master.instagram}`} target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </p>
              )}
              {master.facebook && (
                <p className="social-link">
                  <svg className="social-icon facebook" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <a href={`https://www.facebook.com/${master.facebook}`} target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </p>
              )}
            </>
          )}
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

        {master.services && master.services.length > 0 && (
          <div className="services-section">
            <h3>{t.services}</h3>
            <div className="services-list">
              {master.services.map((service: string, index: number) => (
                <span key={index} className="service-item">
                  {translateServices([service], language)[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {master.languages && master.languages.length > 0 && (
          <div className="languages-section">
            <h3>{t.languages}</h3>
            <div className="languages-list">
              {master.languages.map((lang: string, index: number) => (
                <span key={index} className="language-item">
                  {translateLanguages([lang], language)[0]}
                </span>
              ))}
            </div>
          </div>
        )}

        {master.paymentMethods && master.paymentMethods.length > 0 && (
          <div className="payment-methods-section">
            <h3>{t.paymentMethods || (language === 'cs' ? 'Způsoby platby' : 'Payment Methods')}</h3>
            <div className="payment-methods-list">
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
                return <span key={method} className="payment-item">{label}</span>;
              })}
            </div>
          </div>
        )}

        {/* Секция ценника */}
        {/* Для мастеров в салонах показываем ценник салона, для фрилансеров - их ценник */}
        {((!master.isFreelancer && masterSalon && masterSalon.priceList && masterSalon.priceList.length > 0) || 
          (master.isFreelancer && master.priceList && master.priceList.length > 0)) && (
          <div className="price-list-section">
            <h3>{language === 'cs' ? 'Ceník' : 'Price List'}</h3>
            <div className="price-list-photos">
              {(!master.isFreelancer && masterSalon ? masterSalon.priceList : master.priceList)?.map((photo, index) => (
                <div key={index} className="price-list-photo">
                  <img 
                    src={photo} 
                    alt={`${language === 'cs' ? 'Ceník' : 'Price List'} ${index + 1}`}
                    className="price-list-image"
                    onClick={() => setSelectedPriceListImage(photo)}
                    style={{ cursor: 'pointer' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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

      {/* Модальное окно для увеличенного изображения ценника */}
      {selectedPriceListImage && (
        <div className="price-list-modal-overlay" onClick={() => setSelectedPriceListImage(null)}>
          <div className="price-list-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="price-list-modal-image-container">
              <img 
                src={selectedPriceListImage} 
                alt={language === 'cs' ? 'Ceník' : 'Price List'}
                className="price-list-modal-image"
              />
              <button 
                className="price-list-modal-close"
                onClick={() => setSelectedPriceListImage(null)}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterDetailPage;

