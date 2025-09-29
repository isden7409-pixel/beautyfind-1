import React from 'react';
import { Master, Language } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';

interface MasterCardProps {
  master: Master;
  language: Language;
  translations: any;
  onViewDetails: (master: Master) => void;
  onSalonSelect?: (salonId: string) => void;
}

const MasterCard: React.FC<MasterCardProps> = ({
  master,
  language,
  translations,
  onViewDetails,
  onSalonSelect,
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
            <span 
              className="salon-name clickable" 
              onClick={(e) => {
                e.stopPropagation();
                if (onSalonSelect && master.salonId) {
                  onSalonSelect(master.salonId);
                }
              }}
            >
              🏢 {master.salonName}
            </span>
          )}
        </div>
        <p className="experience-main">{master.experience} {t.experience}</p>
        {master.services && master.services.length > 0 && (
          <div className="master-services">
            {translateServices(master.services, language).slice(0, 3).map((service, index) => (
              <span key={service} className="service-tag-small">{service}</span>
            ))}
            {master.services.length > 3 && (
              <span className="service-tag-small">+{master.services.length - 3}</span>
            )}
          </div>
        )}
        {master.languages && master.languages.length > 0 && (
          <div className="master-languages">
            <span className="languages-label">
              🌐 {language === 'cs' ? 'Jazyky:' : 'Languages:'} {translateLanguages(master.languages, language).slice(0, 3).join(', ')}
              {master.languages.length > 3 && ` +${master.languages.length - 3}`}
            </span>
          </div>
        )}
        <div className="master-rating-main">
          ⭐ {master.rating} ({master.reviews} {t.reviews})
        </div>
        <button className="view-details-btn">{t.viewDetails}</button>
      </div>
    </div>
  );
};

export default MasterCard;
