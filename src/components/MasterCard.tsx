import React from 'react';
import { Master, Language } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import { translateAddressToCzech, formatStructuredAddressCzech } from '../utils/cities';
import { useReviewSummary } from '../hooks/useReviewSummary';
import { formatExperienceYears } from '../utils/formatters';
import LazyImage from './LazyImage';

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
  const { count, average } = useReviewSummary('master', master.id);
  const displayAddress = master.structuredAddress
    ? formatStructuredAddressCzech(master.structuredAddress)
    : translateAddressToCzech(master.address || '', master.city);


  return (
    <div className="master-card-main" onClick={() => onViewDetails(master)}>
      {master.isPremium && (
        <div className="premium-badge">⭐ PREMIUM</div>
      )}
      <div className="master-photo-container">
        {master.photo && master.photo.trim() !== '' && master.photo !== 'undefined' && master.photo !== 'null' ? (
          <img 
            src={master.photo} 
            alt={master.name} 
            className="master-photo-main"
            onError={(e) => {
              // При ошибке загрузки скрываем изображение и показываем заглушку
              (e.target as HTMLImageElement).style.display = 'none';
              const container = (e.target as HTMLImageElement).parentElement;
              if (container) {
                const placeholder = document.createElement('div');
                placeholder.className = 'master-photo-placeholder';
                placeholder.innerHTML = `
                  <div class="placeholder-content">
                    <div class="placeholder-icon">👤</div>
                    <div class="placeholder-text">${language === 'cs' ? 'MISTR' : 'MASTER'}</div>
                  </div>
                `;
                container.appendChild(placeholder);
              }
            }}
          />
        ) : (
          <div className="master-photo-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">👤</div>
              <div className="placeholder-text">{language === 'cs' ? 'MISTR' : 'MASTER'}</div>
            </div>
          </div>
        )}
      </div>
      <div className="master-info-main">
        <h3>{master.name}</h3>
        <div className="master-meta-main">
          <div className="master-type-container">
            <span className={`master-type ${master.isFreelancer ? 'freelancer' : ''}`}>
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
{master.salonName}
              </span>
            )}
          </div>
        </div>
        {displayAddress && (
          <p className="salon-address">📍 {t.address}: {displayAddress}</p>
        )}
        {master.languages && master.languages.length > 0 && (
          <div className="master-languages">
            <span className="languages-label">
              🌐 {language === 'cs' ? 'Jazyky:' : 'Languages:'} {translateLanguages(master.languages, language).slice(0, 3).join(', ')}
              {master.languages.length > 3 && ` +${master.languages.length - 3}`}
            </span>
          </div>
        )}
        {/* Experience directly under languages */}
        {typeof master.experience !== 'undefined' && (
          <p className="experience-main">💼 {formatExperienceYears(master.experience, language, true)}</p>
        )}
        {master.services && master.services.length > 0 && (
          <div className="master-services">
            {translateServices(master.services, language).slice(0, 3).map((service) => (
              <span key={service} className="service-tag-small">{service}</span>
            ))}
            {master.services.length > 3 && (
              <span className="service-tag-small">+{master.services.length - 3}</span>
            )}
          </div>
        )}
        <div className="master-rating-main">
          ⭐ {average} ({count} {t.reviews})
        </div>
        <button className="view-details-btn">{t.viewDetails}</button>
      </div>
    </div>
  );
};

export default MasterCard;
