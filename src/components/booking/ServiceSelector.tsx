/**
 * Компонент выбора услуги
 */

import React from 'react';
import { Service } from '../../types/booking';

interface ServiceSelectorProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelectService: (service: Service) => void;
  language: 'cs' | 'en';
}

export const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  services,
  selectedServiceId,
  onSelectService,
  language,
}) => {
  const t = {
    cs: {
      selectService: 'Vyberte službu',
      noServices: 'Nejsou k dispozici žádné služby',
      minutes: 'min',
    },
    en: {
      selectService: 'Select service',
      noServices: 'No services available',
      minutes: 'min',
    },
  };

  const translations = t[language];

  if (services.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {translations.noServices}
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{translations.selectService}</h4>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {services.map((service) => {
          const isSelected = service.id === selectedServiceId;
          const serviceName = language === 'cs' ? service.name_cs : (service.name_en || service.name_cs);
          const serviceDescription = language === 'cs'
            ? service.description_cs
            : (service.description_en || service.description_cs);

          return (
            <button
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300 bg-white'
                }
              `}
            >
              <div className="flex items-start gap-3">
                {service.photoUrl && (
                  <img
                    src={service.photoUrl}
                    alt={serviceName}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">{serviceName}</h5>
                  
                  {serviceDescription && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {serviceDescription}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-pink-600 font-semibold">
                      {service.price} {language === 'cs' ? 'Kč' : 'CZK'}
                    </span>
                    <span className="text-gray-500">
                      {service.duration} {translations.minutes}
                    </span>
                  </div>
                </div>

                {isSelected && (
                  <div className="text-pink-500 text-xl">
                    ✓
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};






