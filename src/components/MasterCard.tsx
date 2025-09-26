import React from 'react';
import { Master, Language } from '../types';

interface MasterCardProps {
  master: Master;
  language: Language;
  translations: any;
  onViewDetails: (master: Master) => void;
}

const MasterCard: React.FC<MasterCardProps> = ({
  master,
  language,
  translations,
  onViewDetails,
}) => {
  const t = translations[language];

  return (
    <div className="master-card-main" onClick={() => onViewDetails(master)}>
      {master.isPremium && (
        <div className="premium-badge">⭐ PREMIUM</div>
      )}
      <img src={master.photo} alt={master.name} className="master-photo-main" />
      <div className="master-info-main">
        <h3>{master.name}</h3>
        <div className="master-meta-main">
          <span className="master-type">
            {master.isFreelancer ? t.freelancer : t.inSalon}
          </span>
          {master.salonName && (
            <span className="salon-name">🏢 {master.salonName}</span>
          )}
        </div>
        <p className="specialty-main">{master.specialty}</p>
        <p className="experience-main">{master.experience} {t.experience}</p>
        <div className="master-rating-main">
          ⭐ {master.rating} ({master.reviews} {t.reviews})
        </div>
        <button className="view-details-btn">{t.viewDetails}</button>
      </div>
    </div>
  );
};

export default MasterCard;
