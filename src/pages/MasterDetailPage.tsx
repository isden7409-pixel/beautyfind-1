import React, { useState } from 'react';
import { Master, Language, Review, PremiumFeature } from '../types';
import ReviewsSection from '../components/ReviewsSection';
import PremiumFeatures from '../components/PremiumFeatures';

interface MasterDetailPageProps {
  master: Master;
  language: Language;
  translations: any;
  onBack: () => void;
}

const MasterDetailPage: React.FC<MasterDetailPageProps> = ({
  master,
  language,
  translations,
  onBack,
}) => {
  const t = translations[language];
  
  // Моковые отзывы для мастера
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
            <span className="salon-name">📍 {master.salonName}</span>
          )}
          <span className="rating">
            ⭐ {master.rating} ({master.reviews} {t.reviews})
          </span>
          <span className="experience">{master.experience} {t.experience}</span>
        </div>
        <p className="description">{master.description}</p>
        <div className="contact-info">
          <h3>{t.contact}</h3>
          <p>📞 {master.phone}</p>
          <p>✉️ {master.email}</p>
          <p>📍 {master.address}, {master.city === 'Prague' ? 'Praha' : master.city}</p>
        </div>
        <div className="services-section">
          <h3>{t.services}</h3>
          <div className="services-grid">
            {(master.services || [master.specialty]).map((service: string) => (
              <span key={service} className="service-badge">{service}</span>
            ))}
          </div>
        </div>
        <button className="book-button">{t.book}</button>
        
        <ReviewsSection
          reviews={reviews}
          language={language}
          translations={translations}
          onAddReview={handleAddReview}
          masterId={master.id}
        />
        
        <PremiumFeatures
          language={language}
          translations={translations}
          onPurchase={handlePurchasePremium}
          type="master"
          itemId={parseInt(master.id)}
        />
      </div>
    </div>
  );
};

export default MasterDetailPage;
