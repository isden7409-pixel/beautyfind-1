// Утилиты для геокодирования адресов в координаты

import { StructuredAddress } from '../types';
import { createGeocodingAddress } from './addressUtils';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Кэш для хранения уже геокодированных адресов
const geocodingCache = new Map<string, Coordinates>();

// Функция для геокодирования структурированного адреса
export async function geocodeStructuredAddress(structuredAddress: StructuredAddress): Promise<Coordinates | null> {
  const geocodingAddress = createGeocodingAddress(structuredAddress);
  console.log(`geocodeStructuredAddress вызвана с адресом: ${geocodingAddress}`);
  
  return await geocodeAddress(geocodingAddress);
}

// Функция для геокодирования адреса
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  console.log(`geocodeAddress вызвана с адресом: ${address}`);

  // Проверяем кэш
  if (geocodingCache.has(address)) {
    console.log(`Адрес ${address} найден в кэше`);
    return geocodingCache.get(address)!;
  }

  try {
    // Используем публичный Nominatim (OpenStreetMap)
    // Примечание: браузер не позволяет задавать кастомный User-Agent, поэтому без него
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=cz&addressdetails=0`;
    console.log(`Запрос геокодирования: ${url}`);

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
      console.log(`Геокодирование успешно: ${address} -> ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;
    }

    console.warn(`Не удалось найти координаты для адреса: ${address}`);
    return null;
  } catch (error) {
    console.error(`Ошибка геокодирования для адреса ${address}:`, error);
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
