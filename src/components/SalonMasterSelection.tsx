import React, { useState } from 'react';
import { Master, Service, Language } from '../types';

interface SalonMasterSelectionProps {
  masters: Master[];
  selectedService: Service | null;
  language: Language;
  translations: any;
  onMasterSelect: (master: Master) => void;
  onBack: () => void;
}

const SalonMasterSelection: React.FC<SalonMasterSelectionProps> = ({
  masters,
  selectedService,
  language,
  translations,
  onMasterSelect,
  onBack,
}) => {
  const t = translations[language];

  // Фильтруем мастеров, которые предоставляют выбранную услугу
  const availableMasters = masters.filter(master => {
    if (!selectedService) return false;
    return master.availableServices?.some(service => service.id === selectedService.id);
  });

  return (
    <div className="booking-modal">
      <div className="booking-header">
        <h2>{t.selectMaster}</h2>
        <button className="close-btn" onClick={onBack}>×</button>
      </div>

      <div className="step-header">
        <button className="back-btn" onClick={onBack}>
          {t.back}
        </button>
        <h3>{t.selectMasterForService}</h3>
      </div>

      <div className="booking-content">
        {selectedService && (
          <div className="selected-service-info">
            <h4>{t.selectedService}: {selectedService.name}</h4>
            <p>{selectedService.description}</p>
            <p><strong>{t.duration}:</strong> {selectedService.duration} {t.minutes}</p>
            <p><strong>{t.price}:</strong> {selectedService.price} Kč</p>
          </div>
        )}

        <div className="masters-selection">
          <h4>{t.availableMasters}</h4>
          {availableMasters.length === 0 ? (
            <p className="no-masters">{t.noMastersAvailable}</p>
          ) : (
            <div className="masters-grid">
              {availableMasters.map((master) => (
                <div
                  key={master.id}
                  className="master-selection-card"
                  onClick={() => onMasterSelect(master)}
                >
                  <img src={master.photo} alt={master.name} className="master-photo" />
                  <div className="master-info">
                    <h5>{master.name}</h5>
                    <p className="specialty">{master.specialty}</p>
                    <p className="experience">{master.experience}</p>
                    <div className="master-rating">
                      ⭐ {master.rating} ({master.reviews})
                    </div>
                    <div className="master-services">
                      {master.services?.slice(0, 3).map(service => (
                        <span key={service} className="service-tag-small">{service}</span>
                      ))}
                      {master.services && master.services.length > 3 && (
                        <span className="more-services">+{master.services.length - 3}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SalonMasterSelection;
