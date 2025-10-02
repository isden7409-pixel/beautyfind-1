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
  showErrors?: boolean; // показывать ошибки только по запросу (на submit)
}

const StructuredAddressInput: React.FC<StructuredAddressInputProps> = ({
  language,
  translations,
  value,
  city,
  onChange,
  required = false,
  showErrors = true
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
  const [geoValid, setGeoValid] = useState<'unknown'|'valid'|'invalid'>('unknown');

  const t = translations[language];

  // Helper: recompute fullAddress when mandatory parts are present
  const recomputeFullAddress = (addr: StructuredAddress): StructuredAddress => {
    const hasMandatory = Boolean(addr.street && addr.houseNumber && addr.postalCode && addr.city);
    if (hasMandatory) {
      addr.fullAddress = createFullAddress(addr);
    } else {
      addr.fullAddress = '';
    }
    return addr;
  };

  useEffect(() => {
    if (value) {
      setStructuredAddress(value);
    }
  }, [value]);

  // Обновляем город при изменении пропса city
  useEffect(() => {
    if (city) {
      setStructuredAddress(prev => {
        const updated = recomputeFullAddress({ ...prev, city });
        // Валидируем после обновления города
        const validationErrors = validateStructuredAddress(updated);
        setErrors(validationErrors);
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

  // Геопроверка адреса для подсветки (дебаунс)
  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const hasMandatory = Boolean(structuredAddress.street && structuredAddress.houseNumber && structuredAddress.postalCode && (city || structuredAddress.city));
      if (!hasMandatory) {
        if (!cancelled) setGeoValid('unknown');
        return;
      }
      try {
        const { geocodeStructuredAddress } = await import('../utils/geocoding');
        const coords = await geocodeStructuredAddress({
          ...structuredAddress,
          city: city || structuredAddress.city,
        } as StructuredAddress);
        if (!cancelled) setGeoValid(coords ? 'valid' : 'invalid');
      } catch {
        if (!cancelled) setGeoValid('invalid');
      }
    };
    const id = setTimeout(check, 250);
    return () => { cancelled = true; clearTimeout(id); };
  }, [structuredAddress, city]);

  const handleFieldChange = (field: keyof StructuredAddress, newValue: string) => {
    let updated = { ...structuredAddress, [field]: newValue } as StructuredAddress;
    // Используем переданный город или город из structuredAddress
    if (city) {
      updated.city = city;
    }
    updated = recomputeFullAddress(updated);
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
            placeholder={language === 'cs' ? 'Např. 791' : 'e.g. 791'}
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
            placeholder={language === 'cs' ? 'Např. 32' : 'e.g. 32'}
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

      {showErrors && errors.length > 0 && (
        <div className="form-errors">
          {errors.map((error, index) => (
            <div key={index} className="error-message">{error}</div>
          ))}
        </div>
      )}

      {(structuredAddress.fullAddress || geoValid !== 'unknown') && (
        <div className={`address-preview ${geoValid === 'valid' ? 'ok' : geoValid === 'invalid' ? 'error' : ''}`}>
          <strong>{language === 'cs' ? 'Plná adresa:' : 'Full address:'}</strong>
          <p>{structuredAddress.fullAddress}</p>
        </div>
      )}
    </div>
  );
};

export default StructuredAddressInput;

