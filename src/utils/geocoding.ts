// Утилиты для геокодирования адресов в координаты

import { StructuredAddress } from '../types';
import { createGeocodingAddress } from './addressUtils';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Кэш для хранения уже геокодированных адресов
const geocodingCache = new Map<string, Coordinates>();

// Загружаем кэш из localStorage при инициализации
const loadCacheFromStorage = () => {
  try {
    const cached = localStorage.getItem('geocoding_cache');
    if (cached) {
      const parsed = JSON.parse(cached);
      Object.entries(parsed).forEach(([address, coords]) => {
        geocodingCache.set(address, coords as Coordinates);
      });
    }
  } catch (error) {
    // Игнорируем ошибки парсинга
  }
};

// Сохраняем кэш в localStorage
const saveCacheToStorage = () => {
  try {
    const cacheObject = Object.fromEntries(geocodingCache);
    localStorage.setItem('geocoding_cache', JSON.stringify(cacheObject));
  } catch (error) {
    // Игнорируем ошибки сохранения
  }
};

// Инициализируем кэш
loadCacheFromStorage();

// Функция для геокодирования структурированного адреса
export async function geocodeStructuredAddress(structuredAddress: StructuredAddress): Promise<Coordinates | null> {
  const geocodingAddress = createGeocodingAddress(structuredAddress);
  
  return await geocodeAddress(geocodingAddress);
}

// Функция для геокодирования адреса
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  // Проверяем кэш
  if (geocodingCache.has(address)) {
    return geocodingCache.get(address)!;
  }

  try {
    // Используем публичный Nominatim (OpenStreetMap)
    // Примечание: браузер не позволяет задавать кастомный User-Agent, поэтому без него
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=cz&addressdetails=0`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Geocoding HTTP error ${response.status}`);
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const coordinates: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      geocodingCache.set(address, coordinates);
      saveCacheToStorage(); // Сохраняем в localStorage
      return coordinates;
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Функция для геокодирования массива адресов
export async function geocodeAddresses(addresses: string[]): Promise<Map<string, Coordinates>> {
  const results = new Map<string, Coordinates>();
  
  // Обрабатываем адреса последовательно, чтобы не перегружать API
  for (const address of addresses) {
    const coordinates = await geocodeAddress(address);
    if (coordinates) {
      results.set(address, coordinates);
    }
    
    // Небольшая задержка между запросами
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

// Функция для получения координат из кэша или геокодирования
export async function getCoordinatesForAddress(address: string): Promise<Coordinates | null> {
  if (geocodingCache.has(address)) {
    return geocodingCache.get(address)!;
  }
  
  return await geocodeAddress(address);
}

// Функция для очистки кэша
export function clearGeocodingCache(): void {
  geocodingCache.clear();
  localStorage.removeItem('geocoding_cache');
}

// Функция для получения статистики кэша
export function getGeocodingCacheStats(): { size: number; addresses: string[] } {
  return {
    size: geocodingCache.size,
    addresses: Array.from(geocodingCache.keys())
  };
}
