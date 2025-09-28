// Утилиты для геокодирования адресов в координаты

export interface Coordinates {
  lat: number;
  lng: number;
}

// Кэш для хранения уже геокодированных адресов
const geocodingCache = new Map<string, Coordinates>();

// Функция для геокодирования адреса
export async function geocodeAddress(address: string): Promise<Coordinates | null> {
  console.log(`geocodeAddress вызвана с адресом: ${address}`);
  
  // Проверяем кэш
  if (geocodingCache.has(address)) {
    console.log(`Адрес ${address} найден в кэше`);
    return geocodingCache.get(address)!;
  }

  // Временная заглушка для тестирования - возвращаем случайные координаты в Праге
  console.log(`Геокодирование адреса: ${address}`);
  
  // Генерируем случайные координаты в пределах Праги
  const pragueBounds = {
    lat: { min: 50.0, max: 50.1 },
    lng: { min: 14.3, max: 14.6 }
  };
  
  const coordinates: Coordinates = {
    lat: pragueBounds.lat.min + Math.random() * (pragueBounds.lat.max - pragueBounds.lat.min),
    lng: pragueBounds.lng.min + Math.random() * (pragueBounds.lng.max - pragueBounds.lng.min)
  };
  
  // Сохраняем в кэш
  geocodingCache.set(address, coordinates);
  
  console.log(`Геокодирование (заглушка): ${address} -> ${coordinates.lat}, ${coordinates.lng}`);
  return coordinates;

  /* Реальный код геокодирования (закомментирован из-за CORS проблем)
  try {
    // Используем Nominatim API (бесплатный сервис OpenStreetMap)
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&countrycodes=cz`;
    console.log(`Запрос геокодирования: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BeautyFind-CZ/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      const result = data[0];
      const coordinates: Coordinates = {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
      
      // Сохраняем в кэш
      geocodingCache.set(address, coordinates);
      
      console.log(`Геокодирование успешно: ${address} -> ${coordinates.lat}, ${coordinates.lng}`);
      return coordinates;
    } else {
      console.warn(`Не удалось найти координаты для адреса: ${address}`);
      return null;
    }
  } catch (error) {
    console.error(`Ошибка геокодирования для адреса ${address}:`, error);
    return null;
  }
  */
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
