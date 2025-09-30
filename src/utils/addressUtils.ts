import { StructuredAddress } from '../types';
import { translateCityToCzech } from './cities';

// Функция для создания полного адреса из структурированных данных
export function createFullAddress(structuredAddress: StructuredAddress): string {
  const { street, houseNumber, orientationNumber, postalCode, city } = structuredAddress;
  
  let address = `${street} ${houseNumber}`;
  if (orientationNumber) {
    address += `/${orientationNumber}`;
  }
  address += `, ${postalCode} ${translateCityToCzech(city)}`;
  
  return address;
}

// Функция для создания адреса для геокодирования (оптимизированный для Nominatim)
export function createGeocodingAddress(structuredAddress: StructuredAddress): string {
  const { street, houseNumber, orientationNumber, postalCode, city } = structuredAddress;
  
  // Пробуем разные варианты для лучшего геокодирования
  const variants = [
    `${street} ${houseNumber}${orientationNumber ? `/${orientationNumber}` : ''}, ${postalCode} ${city}, Czech Republic`,
    `${street} ${houseNumber}${orientationNumber ? `/${orientationNumber}` : ''}, ${city}, Czech Republic`,
    `${street} ${houseNumber}, ${city}, Czech Republic`,
    `${street}, ${city}, Czech Republic`
  ];
  
  return variants[0]; // Возвращаем самый полный вариант
}

// Функция для парсинга существующего адреса в структурированный формат
export function parseExistingAddress(address: string, city: string): Partial<StructuredAddress> {
  // Простая попытка парсинга существующих адресов
  const parts = address.split(',');
  if (parts.length >= 2) {
    const streetPart = parts[0].trim();
    const postalCodePart = parts[1].trim();
    
    // Извлекаем улицу и номер дома
    const streetMatch = streetPart.match(/^(.+?)\s+(\d+[a-zA-Z]?)(?:\/(\d+[a-zA-Z]?))?$/);
    if (streetMatch) {
      const [, street, houseNumber, orientationNumber] = streetMatch;
      
      // Извлекаем почтовый индекс
      const postalCodeMatch = postalCodePart.match(/^(\d{3}\s?\d{2})/);
      const postalCode = postalCodeMatch ? postalCodeMatch[1].replace(/\s/g, '') : '';
      
      return {
        street: street.trim(),
        houseNumber,
        orientationNumber: orientationNumber || undefined,
        postalCode,
        city,
        fullAddress: address
      };
    }
  }
  
  // Если не удалось распарсить, возвращаем базовую структуру
  return {
    street: address,
    houseNumber: '',
    postalCode: '',
    city,
    fullAddress: address
  };
}

// Функция для валидации структурированного адреса
export function validateStructuredAddress(address: StructuredAddress): string[] {
  const errors: string[] = [];
  
  if (!address.street.trim()) {
    errors.push('Ulice je povinná');
  }
  
  if (!address.houseNumber.trim()) {
    errors.push('Číslo popisné je povinné');
  }
  
  if (!address.postalCode.trim()) {
    errors.push('PSČ je povinné');
  } else if (!/^\d{5}$/.test(address.postalCode.replace(/\s/g, ''))) {
    errors.push('PSČ musí mít 5 čísel');
  }
  
  if (!address.city.trim()) {
    errors.push('Město je povinné');
  }
  
  return errors;
}

