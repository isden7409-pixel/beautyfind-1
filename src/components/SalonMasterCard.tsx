import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Master, Salon, Language } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import { formatExperienceYears } from '../utils/formatters';

interface SalonMasterCardProps {
  master: Master;
  salon: Salon | null;
  language: Language;
  translations: any;
  onEdit: (master: Master) => void;
  onRemove: (masterId: string) => void;
  onNavigate?: (path: string) => void;
}

const SalonMasterCard: React.FC<SalonMasterCardProps> = ({
  master,
  salon,
  language,
  translations,
  onEdit,
  onRemove,
  onNavigate,
}) => {
  const navigate = useNavigate();
  const t = translations;

  const handleNameClick = () => {
    if (onNavigate) {
      onNavigate(`/master/${master.id}`);
    } else {
      navigate(`/master/${master.id}`);
    }
  };

  return (
    <div className="salon-master-card">
      <div className="master-card-header">
        <div className="master-photo">
          {master.photo && master.photo.trim() !== '' && master.photo !== 'undefined' && master.photo !== 'null' ? (
            <img 
              src={master.photo} 
              alt={master.name} 
              className="master-photo-image"
              onError={(e) => {
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
        
        <div className="master-info-right">
          <h4 className="master-name" onClick={handleNameClick} style={{ cursor: 'pointer' }}>{master.name}</h4>
          <p className="master-specialty"><strong>{language === 'cs' ? 'Specializace' : 'Specialty'}:</strong> {master.specialty}</p>
          <p className="master-experience"><strong>{language === 'cs' ? 'Zkušenosti' : 'Experience'}:</strong> {formatExperienceYears(master.experience, language, false)}</p>
          <p className="master-rating">⭐ {master.rating.toFixed(1)} ({master.reviews} {language === 'cs' ? 'recenzí' : 'reviews'})</p>
        </div>
      </div>

      {master.description && (
        <div className="master-description-full">
          <p className="pre-line">{master.description}</p>
        </div>
      )}

      <div className="master-services-languages-vertical">
        {master.languages && master.languages.length > 0 && (
          <div className="languages-section">
            <h5>{language === 'cs' ? 'Jazyky' : 'Languages'}</h5>
            <div className="languages-list">
              {translateLanguages(master.languages, language).slice(0, 3).map((lang, index) => (
                <span 
                  key={index}
                  style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    height: '18px',
                    width: 'auto',
                    lineHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    margin: '2px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {lang}
                </span>
              ))}
              {master.languages.length > 3 && (
                <span 
                  style={{
                    padding: '2px 8px',
                    fontSize: '12px',
                    height: '18px',
                    width: 'auto',
                    lineHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '6px',
                    margin: '2px',
                    background: '#e3f2fd',
                    color: '#1976d2',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  +{master.languages.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {master.services && master.services.length > 0 && (
          <div className="services-section">
            <h5>{language === 'cs' ? 'Služby' : 'Services'}</h5>
            <div className="services-list-two-columns">
              {translateServices(master.services, language).slice(0, 3).map((service, index) => (
                <span key={index} className="service-badge">{service}</span>
              ))}
              {master.services.length > 3 && (
                <span className="service-badge service-count-badge">
                  +{master.services.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="master-actions-centered">
        <button
          onClick={() => onEdit(master)}
          className="edit-button"
        >
          {language === 'cs' ? 'Upravit' : 'Edit'}
        </button>
        <button
          onClick={() => onRemove(master.id)}
          className="remove-button"
        >
          {language === 'cs' ? 'Odebrat' : 'Remove'}
        </button>
      </div>
    </div>
  );
};

export default SalonMasterCard;
