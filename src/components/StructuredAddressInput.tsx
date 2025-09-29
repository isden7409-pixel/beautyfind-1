import React, { useState, useEffect } from 'react';
import { StructuredAddress, Language } from '../types';
import { createFullAddress, validateStructuredAddress } from '../utils/addressUtils';

interface StructuredAddressInputProps {
  language: Language;
  translations: any;
  value?: StructuredAddress;
  city?: string;
  onChange: (address: StructuredAddress | undefined) => void;
  required?: boolean;
}

const StructuredAddressInput: React.FC<StructuredAddressInputProps> = ({
  language,
  translations,
  value,
  city,
  onChange,
  required = false
}) => {
  const [structuredAddress, setStructuredAddress] = useState<StructuredAddress>({
    street: '',
    houseNumber: '',
    orientationNumber: '',
    postalCode: '',
    city: '',
    fullAddress: ''
  });

  const [errors, setErrors] = useState<string[]>([]);

  const t = translations[language];

  useEffect(() => {
    if (value) {
      setStructuredAddress(value);
    }
  }, [value]);

  // Обновляем город при изменении пропса city
  useEffect(() => {
    if (city) {
      setStructuredAddress(prev => {
        const updated = { ...prev, city };
        // Валидируем после обновления города
        const validationErrors = validateStructuredAddress(updated);
        setErrors(validationErrors);
        
        // Создаем полный адрес если все поля заполнены
        if (updated.street && updated.houseNumber && updated.postalCode && updated.city) {
          updated.fullAddress = createFullAddress(updated);
        }
        
        return updated;
      });
    }
  }, [city]);

  // Отдельный useEffect для вызова onChange
  useEffect(() => {
    const validationErrors = validateStructuredAddress(structuredAddress);
    setErrors(validationErrors);
    onChange(validationErrors.length === 0 ? structuredAddress : undefined);
  }, [structuredAddress, onChange]);

  const handleFieldChange = (field: keyof StructuredAddress, newValue: string) => {
    const updated = { ...structuredAddress, [field]: newValue };
    // Используем переданный город или город из structuredAddress
    if (city) {
      updated.city = city;
    }
    setStructuredAddress(updated);
  };

  const handlePostalCodeChange = (value: string) => {
    // Форматируем PSČ (5 цифр с пробелом после 3-й)
    const cleaned = value.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length > 3) {
      formatted = cleaned.slice(0, 3) + ' ' + cleaned.slice(3, 5);
    }
    handleFieldChange('postalCode', formatted);
  };

  return (
    <div className="structured-address-input">
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="street">{language === 'cs' ? 'Ulice' : 'Street'} *</label>
          <input
            type="text"
            id="street"
            value={structuredAddress.street}
            onChange={(e) => handleFieldChange('street', e.target.value)}
            required={required}
            className="form-input"
            placeholder={language === 'cs' ? 'Např. Václavské náměstí' : 'e.g. Wenceslas Square'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="houseNumber">{language === 'cs' ? 'Číslo popisné' : 'House Number'} *</label>
          <input
            type="text"
            id="houseNumber"
            value={structuredAddress.houseNumber}
            onChange={(e) => handleFieldChange('houseNumber', e.target.value)}
            required={required}
            className="form-input"
            placeholder={language === 'cs' ? 'Např. 28' : 'e.g. 28'}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="orientationNumber">{language === 'cs' ? 'Číslo orientační (volitelné)' : 'Orientation Number (optional)'}</label>
          <input
            type="text"
            id="orientationNumber"
            value={structuredAddress.orientationNumber || ''}
            onChange={(e) => handleFieldChange('orientationNumber', e.target.value)}
            className="form-input"
            placeholder={language === 'cs' ? 'Např. 1234' : 'e.g. 1234'}
          />
        </div>

        <div className="form-group">
          <label htmlFor="postalCode">{language === 'cs' ? 'PSČ' : 'Postal Code'} *</label>
          <input
            type="text"
            id="postalCode"
            value={structuredAddress.postalCode}
            onChange={(e) => handlePostalCodeChange(e.target.value)}
            required={required}
            className="form-input"
            placeholder={language === 'cs' ? '110 00' : '110 00'}
            maxLength={6}
          />
        </div>
      </div>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      {structuredAddress.fullAddress && (
        <div className="address-preview">
          <strong>{language === 'cs' ? 'Plná adresa:' : 'Full address:'}</strong>
          <p>{structuredAddress.fullAddress}</p>
        </div>
      )}
    </div>
  );
};

export default StructuredAddressInput;

