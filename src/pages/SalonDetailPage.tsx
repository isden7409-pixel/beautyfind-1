import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Salon, Master, Language, Review, Booking } from '../types';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import ReviewsSection from '../components/ReviewsSection';
import { reviewService, masterService } from '../firebase/services';
import SalonBookingModal from '../components/SalonBookingModal';
import { SalonBookingModalSimple } from '../components/booking/SalonBookingModalSimple';
import { SalonBookingModalWithMasters } from '../components/booking/SalonBookingModalWithMasters';
import { PopularityBadge } from '../components/PopularityBadge';
import { useAuth } from '../components/auth/AuthProvider';
import { translateServices, translateSpecialty, translateLanguages } from '../utils/serviceTranslations';
import { formatExperienceYears } from '../utils/formatters';
import WorkingHoursDisplay from '../components/WorkingHoursDisplay';
import PhotoCarousel from '../components/PhotoCarousel';
import PageHeader from '../components/PageHeader';
import FavoriteButton from '../components/FavoriteButton';
import { useSetCurrentViewMode } from '../store/useStore';
// import { FaWhatsapp, FaTelegram, FaInstagram, FaFacebook } from 'react-icons/fa';

interface SalonDetailPageProps {
  salon: Salon;
  language: Language;
  translations: any;
  onBack: () => void;
  onMasterSelect: (master: Master) => void;
  onLanguageChange: (language: Language) => void;
  onNavigateToDashboard?: () => void;
}

const SalonDetailPage: React.FC<SalonDetailPageProps> = ({
  salon: initialSalon,
  language,
  translations,
  onBack,
  onMasterSelect,
  onLanguageChange,
  onNavigateToDashboard,
}) => {
  const t = translations[language];
  const setCurrentViewMode = useSetCurrentViewMode();
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  
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
  const [mastersFromDb, setMastersFromDb] = useState<Master[]>([]);
  useEffect(() => {
    (async () => {
      const data = await reviewService.getBySalon(salon.id);
      setReviews(data);
    })();
  }, [salon.id]);

  // Load masters by salonId to ensure fresh and complete data
  useEffect(() => {
    (async () => {
      try {
        const list = await masterService.getBySalon(salon.id);
        setMastersFromDb(list || []);
      } catch (e) {
        setMastersFromDb([]);
      }
    })();
  }, [salon.id]);

  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0 ? Number((reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviewsCount).toFixed(1)) : 0;

  const hasMasters = mastersFromDb.length > 0;

  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedPriceListImage, setSelectedPriceListImage] = useState<string | null>(null);
  const [selectedPriceListIndex, setSelectedPriceListIndex] = useState<number | null>(null);
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState<number | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  

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

  const handleGoToSalonsList = () => {
    setCurrentViewMode('salons');
    navigate('/');
  };

  // Price list navigation functions
  const handlePrevPriceImage = useCallback(() => {
    if (selectedPriceListIndex === null || !salon.priceList) return;
    const newIndex = selectedPriceListIndex === 0 
      ? salon.priceList.length - 1 
      : selectedPriceListIndex - 1;
    setSelectedPriceListIndex(newIndex);
  }, [selectedPriceListIndex, salon.priceList]);

  const handleNextPriceImage = useCallback(() => {
    if (selectedPriceListIndex === null || !salon.priceList) return;
    const newIndex = selectedPriceListIndex === salon.priceList.length - 1 
      ? 0 
      : selectedPriceListIndex + 1;
    setSelectedPriceListIndex(newIndex);
  }, [selectedPriceListIndex, salon.priceList]);

  // Gallery navigation functions
  const handlePrevGalleryImage = useCallback(() => {
    if (selectedGalleryIndex === null || !salon.galleryPhotos) return;
    const newIndex = selectedGalleryIndex === 0 
      ? salon.galleryPhotos.length - 1 
      : selectedGalleryIndex - 1;
    setSelectedGalleryIndex(newIndex);
  }, [selectedGalleryIndex, salon.galleryPhotos]);

  const handleNextGalleryImage = useCallback(() => {
    if (selectedGalleryIndex === null || !salon.galleryPhotos) return;
    const newIndex = selectedGalleryIndex === salon.galleryPhotos.length - 1 
      ? 0 
      : selectedGalleryIndex + 1;
    setSelectedGalleryIndex(newIndex);
  }, [selectedGalleryIndex, salon.galleryPhotos]);

  // Keyboard navigation for gallery and price list
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedGalleryIndex !== null) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevGalleryImage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextGalleryImage();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedGalleryIndex(null);
        }
      } else if (selectedPriceListIndex !== null) {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrevPriceImage();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNextPriceImage();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setSelectedPriceListImage(null);
          setSelectedPriceListIndex(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedGalleryIndex, selectedPriceListIndex, handlePrevGalleryImage, handleNextGalleryImage, handlePrevPriceImage, handleNextPriceImage]);

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
        backText="Zpět"
        onNavigateToDashboard={onNavigateToDashboard}
        rightButtons={[
          {
            label: language === 'cs' ? 'Seznam salonů' : 'Salon List',
            onClick: handleGoToSalonsList
          }
        ]}
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
          <div className="about-section">
            <h3 className="about-title">{language === 'cs' ? 'O nás' : 'About us'}</h3>
            <p className="description pre-line">{salon.description}</p>
          </div>
          <div className="contact-info">
            <h3 className="contact-title">{t.contact}</h3>
            {salon.website && (
              <p className="social-link">
                <svg className="social-icon website" width="18" height="18" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <a
                  href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  {salon.website}
                </a>
              </p>
            )}
            <p className="social-link">
              <svg className="social-icon email" width="18" height="18" viewBox="0 0 24 24" fill="#EA4335">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              {salon.email}
            </p>
            <p className="social-link">
              <svg className="social-icon phone" width="18" height="18" viewBox="0 0 24 24" fill="#34A853">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              {salon.phone}
            </p>
            {salon.whatsapp && (
              <p className="social-link">
                <svg className="social-icon whatsapp" width="18" height="18" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                <a href={`https://wa.me/${salon.whatsapp.replace(/[^\d]/g, '')}`} target="_blank" rel="noopener noreferrer">
                  WhatsApp
                </a>
              </p>
            )}
            {salon.telegram && (
              <p className="social-link">
                <svg className="social-icon telegram" width="18" height="18" viewBox="0 0 24 24" fill="#0088cc">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
                  <a href={`https://t.me/${salon.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  Telegram
                </a>
              </p>
            )}
            {salon.instagram && (
              <p className="social-link">
                <svg className="social-icon instagram" width="18" height="18" viewBox="0 0 24 24" fill="#E4405F">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <a href={`https://instagram.com/${salon.instagram}`} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </p>
            )}
            {salon.facebook && (
              <p className="social-link">
                <svg className="social-icon facebook" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                  <a href={`https://www.facebook.com/${salon.facebook}`} target="_blank" rel="noopener noreferrer">
                  Facebook
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
            <div className="services-list">
              {translateServices(salon.services, language).map(service => (
                <span key={service} className="service-item">{service}</span>
              ))}
            </div>
          </div>

        {salon.languages && salon.languages.length > 0 && (
          <div className="languages-section">
            <h3>{language === 'cs' ? 'Jazyky' : 'Languages'}</h3>
            <div className="languages-list">
              {translateLanguages(salon.languages, language).map(lang => (
                <span key={lang} className="language-item">{lang}</span>
              ))}
            </div>
          </div>
        )}

          {salon.paymentMethods && salon.paymentMethods.length > 0 && (
            <div className="payment-methods-section">
              <h3>{t.paymentMethods || (language === 'cs' ? 'Způsoby platby' : 'Payment Methods')}</h3>
              <div className="payment-methods-list">
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
                  return <span key={method} className="payment-item">{label}</span>;
                })}
              </div>
            </div>
          )}

          {/* Секция галереи */}
          {salon.galleryPhotos && salon.galleryPhotos.length > 0 && (
            <div className="price-list-section">
              <h3>{language === 'cs' ? 'Galerie' : 'Gallery'}</h3>
              <div className="price-list-photos">
                {salon.galleryPhotos.map((photo, index) => (
                  <div key={index} className="price-list-photo">
                    <img 
                      src={photo} 
                      alt={`${language === 'cs' ? 'Galerie' : 'Gallery'} ${index + 1}`}
                      className="price-list-image"
                      onClick={() => setSelectedGalleryIndex(index)}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Секция ценника */}
          {salon.priceList && salon.priceList.length > 0 && (
            <div className="price-list-section">
              <h3>{language === 'cs' ? 'Ceník' : 'Price List'}</h3>
              <div className="price-list-photos">
                {salon.priceList.map((photo, index) => (
                  <div key={index} className="price-list-photo">
                    <img 
                      src={photo} 
                      alt={`${language === 'cs' ? 'Ceník' : 'Price List'} ${index + 1}`}
                      className="price-list-image"
                      onClick={() => {
                        setSelectedPriceListImage(photo);
                        setSelectedPriceListIndex(index);
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Секция "Naši mistři" отображается только если есть мастера */}
          {((mastersFromDb.length > 0 ? mastersFromDb : salon.masters).length > 0) && (
            <div className="masters-section">
              <h3>Naši mistři</h3>
              <div className="masters-grid">
                {(mastersFromDb.length > 0 ? mastersFromDb : salon.masters).map((master: Master) => (
                  <div
                    key={master.id}
                    className="master-card"
                    onClick={() => onMasterSelect(master)}
                  >
                    <div className="master-photo-container">
                      {master.photo && String(master.photo).trim() !== '' && master.photo !== 'undefined' && master.photo !== 'null' ? (
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
                      <h4>{master.name || ''}</h4>
                      <p className="specialty">{translateSpecialty(master.specialty, language)}</p>
                      <p className="experience">{formatExperienceYears(master.experience, language, true)}</p>
                      <span className="master-rating">
                        ⭐ {Number(master.rating || 0).toFixed(1)} ({Number(master.reviews || 0)} {t.reviews})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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

      {/* Salon Booking Modal - NEW */}
      {userProfile && (
        hasMasters ? (
          <SalonBookingModalWithMasters
            salon={salon}
            masters={mastersFromDb}
            isOpen={showBookingModal}
            onClose={handleBookingClose}
            onBookingComplete={() => {
              handleBookingClose();
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
            onClose={handleBookingClose}
            onBookingComplete={() => {
              handleBookingClose();
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

      {/* Модальное окно для увеличенного изображения ценника */}
        {selectedPriceListImage && (
          <div className="price-list-modal-overlay" onClick={() => {
            setSelectedPriceListImage(null);
            setSelectedPriceListIndex(null);
          }}>
            <div className="price-list-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="price-list-modal-image-container">
                <img 
                  src={selectedPriceListIndex !== null && salon.priceList ? salon.priceList[selectedPriceListIndex] : selectedPriceListImage} 
                  alt={language === 'cs' ? 'Ceník' : 'Price List'}
                  className="price-list-modal-image"
                />
                
                {/* Navigation arrows */}
                {salon.priceList && salon.priceList.length > 1 && (
                  <>
                    <button 
                      className="gallery-modal-arrow gallery-modal-arrow-left"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevPriceImage();
                      }}
                    >
                      ‹
                    </button>
                    <button 
                      className="gallery-modal-arrow gallery-modal-arrow-right"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextPriceImage();
                      }}
                    >
                      ›
                    </button>
                    <div className="gallery-modal-counter">
                      {selectedPriceListIndex !== null ? selectedPriceListIndex + 1 : 1} / {salon.priceList.length}
                    </div>
                  </>
                )}
                
                <button 
                  className="price-list-modal-close"
                  onClick={() => {
                    setSelectedPriceListImage(null);
                    setSelectedPriceListIndex(null);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Модальное окно для галереи с навигацией */}
      {selectedGalleryIndex !== null && salon.galleryPhotos && (
        <div className="price-list-modal-overlay" onClick={() => setSelectedGalleryIndex(null)}>
          <div className="price-list-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="price-list-modal-image-container">
              <img 
                src={salon.galleryPhotos[selectedGalleryIndex]} 
                alt={`${language === 'cs' ? 'Galerie' : 'Gallery'} ${selectedGalleryIndex + 1}`}
                className="price-list-modal-image"
              />
              
              {/* Navigation arrows */}
              <button 
                className="gallery-modal-arrow gallery-modal-arrow-left"
                onClick={handlePrevGalleryImage}
                aria-label={language === 'cs' ? 'Předchozí foto' : 'Previous photo'}
              >
                ‹
              </button>
              <button 
                className="gallery-modal-arrow gallery-modal-arrow-right"
                onClick={handleNextGalleryImage}
                aria-label={language === 'cs' ? 'Další foto' : 'Next photo'}
              >
                ›
              </button>

              {/* Counter */}
              <div className="gallery-modal-counter">
                {selectedGalleryIndex + 1} / {salon.galleryPhotos.length}
              </div>

              {/* Close button */}
              <button 
                className="price-list-modal-close"
                onClick={() => setSelectedGalleryIndex(null)}
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

export default SalonDetailPage;
