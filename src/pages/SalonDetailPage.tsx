import React, { useState } from 'react';
import { Salon, Master, Language, Review, PremiumFeature } from '../types';
import ReviewsSection from '../components/ReviewsSection';
import PremiumFeatures from '../components/PremiumFeatures';

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

  const handleAddReview = (newReview: Omit<Review, 'id'>) => {
    const review: Review = {
      ...newReview,
      id: (Math.max(...reviews.map(r => parseInt(r.id))) + 1).toString(),
    };
    setReviews([...reviews, review]);
  };

  const handlePurchasePremium = (feature: PremiumFeature) => {
    console.log('Premium feature purchased:', feature);
    // В реальном приложении здесь будет логика покупки
  };

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
              {salon.services.map((service: string) => (
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
                    <p className="specialty">{master.specialty}</p>
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
        
        <ReviewsSection
          reviews={reviews}
          language={language}
          translations={translations}
          onAddReview={handleAddReview}
          salonId={salon.id}
        />
        
        <PremiumFeatures
          language={language}
          translations={translations}
          onPurchase={handlePurchasePremium}
          type="salon"
          itemId={parseInt(salon.id)}
        />
      </div>
    </div>
  );
};

export default SalonDetailPage;
