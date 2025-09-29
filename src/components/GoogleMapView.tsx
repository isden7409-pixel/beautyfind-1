import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Salon, Master, Language, SearchFilters } from '../types';
import { translateSpecialty } from '../utils/serviceTranslations';

// Объявляем глобальные типы для Google Maps
declare global {
  interface Window {
    google: typeof google;
    selectSalon: (salonId: string) => void;
    selectMaster: (masterId: string) => void;
  }
}

interface GoogleMapViewProps {
  salons: Salon[];
  masters: Master[];
  language: Language;
  translations: any;
  onSalonSelect: (salon: Salon) => void;
  onMasterSelect: (master: Master) => void;
  selectedType: 'salons' | 'masters';
  filters: SearchFilters;
}

const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  salons,
  masters,
  language,
  translations,
  onSalonSelect,
  onMasterSelect,
  selectedType,
  filters,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const t = translations[language];

  // Функция для получения координат города
  const getCityCoordinates = (city: string) => {
    const cityCoords: Record<string, { lat: number; lng: number; zoom: number }> = {
      // Основные города
      'Prague': { lat: 50.0755, lng: 14.4378, zoom: 11 },
      'Praha': { lat: 50.0755, lng: 14.4378, zoom: 11 },
      'Brno': { lat: 49.1951, lng: 16.6068, zoom: 11 },
      'Ostrava': { lat: 49.8209, lng: 18.2625, zoom: 11 },
      'Plzen': { lat: 49.7384, lng: 13.3736, zoom: 11 },
      
      // Крупные города
      'Liberec': { lat: 50.7671, lng: 15.0562, zoom: 11 },
      'Olomouc': { lat: 49.5938, lng: 17.2509, zoom: 11 },
      'Budweis': { lat: 48.9745, lng: 14.4747, zoom: 11 },
      'Hradec': { lat: 50.2092, lng: 15.8328, zoom: 11 },
      'Pardubice': { lat: 50.0343, lng: 15.7812, zoom: 11 },
      'Zlín': { lat: 49.2264, lng: 17.6707, zoom: 11 },
      'Havirov': { lat: 49.7798, lng: 18.4368, zoom: 11 },
      'Kladno': { lat: 50.1477, lng: 14.1028, zoom: 11 },
      'Most': { lat: 50.5031, lng: 13.6362, zoom: 11 },
      'Opava': { lat: 49.9387, lng: 17.9026, zoom: 11 },
      'Frydek': { lat: 49.6853, lng: 18.3504, zoom: 11 },
      'Karvina': { lat: 49.8540, lng: 18.5416, zoom: 11 },
      'Jihlava': { lat: 49.3961, lng: 15.5912, zoom: 11 },
      'Teplice': { lat: 50.6404, lng: 13.8245, zoom: 11 },
      'Decin': { lat: 50.7821, lng: 14.2148, zoom: 11 },
      'Chomutov': { lat: 50.4605, lng: 13.4178, zoom: 11 },
      'Jablonec': { lat: 50.7221, lng: 15.1703, zoom: 11 },
      'Mlada': { lat: 50.4144, lng: 14.9058, zoom: 11 },
      'Prostejov': { lat: 49.4720, lng: 17.1115, zoom: 11 },
      'Prerov': { lat: 49.4554, lng: 17.4509, zoom: 11 },
      'Trebic': { lat: 49.2149, lng: 15.8817, zoom: 11 },
      'Ceska': { lat: 50.6855, lng: 14.5378, zoom: 11 },
      'Tabor': { lat: 49.4144, lng: 14.6578, zoom: 11 },
      'Znojmo': { lat: 48.8555, lng: 16.0488, zoom: 11 },
      'Pribram': { lat: 49.7406, lng: 14.0104, zoom: 11 },
      'Orlova': { lat: 49.8453, lng: 18.4301, zoom: 11 },
      'Cheb': { lat: 50.0796, lng: 12.3731, zoom: 11 },
      'Modrany': { lat: 50.0000, lng: 14.4000, zoom: 11 },
      'Litvinov': { lat: 50.6008, lng: 13.6184, zoom: 11 },
      'Trinec': { lat: 49.6776, lng: 18.6708, zoom: 11 },
      'Kolin': { lat: 50.0274, lng: 15.2000, zoom: 11 },
      'Kromeriz': { lat: 49.2979, lng: 17.3931, zoom: 11 },
      'Sumperk': { lat: 49.9653, lng: 16.9706, zoom: 11 },
      'Vsetin': { lat: 49.3386, lng: 17.9962, zoom: 11 },
      'Valasske': { lat: 49.4718, lng: 17.9711, zoom: 11 },
      'Litomysl': { lat: 49.8689, lng: 16.3128, zoom: 11 },
      'Novy': { lat: 49.5944, lng: 18.0103, zoom: 11 },
      'Uherske': { lat: 49.0697, lng: 17.4597, zoom: 11 },
      'Chrudim': { lat: 49.9511, lng: 15.7956, zoom: 11 },
      'Havlickuv': { lat: 49.6078, lng: 15.5806, zoom: 11 },
      'Koprivnice': { lat: 49.5994, lng: 18.1447, zoom: 11 },
      'Jindrichuv': { lat: 49.1444, lng: 15.0028, zoom: 11 },
      'Svitavy': { lat: 49.7558, lng: 16.4681, zoom: 11 },
      'Kralupy': { lat: 50.2417, lng: 14.3114, zoom: 11 },
      'Vyskov': { lat: 49.2775, lng: 16.9989, zoom: 11 },
      'Ceský': { lat: 49.7461, lng: 18.6261, zoom: 11 },
      'Kutna': { lat: 49.9494, lng: 15.2681, zoom: 11 },
      'Breclav': { lat: 48.7589, lng: 16.8820, zoom: 11 },
      'Hodonin': { lat: 48.8489, lng: 17.1325, zoom: 11 },
      'Strakonice': { lat: 49.2614, lng: 13.9025, zoom: 11 },
      
      'All': { lat: 49.8, lng: 15.5, zoom: 7 }, // Центр Чехии с большим зумом
    };
    
    const result = cityCoords[city] || cityCoords['All'];
    console.log('getCityCoordinates called with:', city, 'returning:', result);
    return result;
  };

  // Обновляем центр карты при изменении города
  useEffect(() => {
    console.log('City filter changed:', filters.city);
    if (map && isLoaded) {
      const newCenter = getCityCoordinates(filters.city);
      console.log('Changing map center to:', filters.city, newCenter);
      map.setCenter({ lat: newCenter.lat, lng: newCenter.lng });
      map.setZoom(newCenter.zoom);
    } else {
      console.log('Map not ready yet. Map:', !!map, 'isLoaded:', isLoaded);
    }
  }, [map, isLoaded, filters.city]);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    // Временно отключаем проверку API ключа для демонстрации
    // if (!apiKey || apiKey === 'YOUR_API_KEY_HERE') {
    //   console.warn('Google Maps API key not found. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file');
    //   // Показываем сообщение об ошибке вместо карты
    //   if (mapRef.current) {
    //     mapRef.current.innerHTML = `
    //       <div style="
    //         display: flex; 
    //         flex-direction: column; 
    //         align-items: center; 
    //         justify-content: center; 
    //         height: 100%; 
    //         background: #f5f5f5; 
    //         color: #666;
    //         text-align: center;
    //         padding: 20px;
    //       ">
    //         <h3>Google Maps не настроен</h3>
    //         <p>Для использования Google Maps необходимо:</p>
    //         <ol style="text-align: left; max-width: 400px;">
    //           <li>Получить API ключ Google Maps</li>
    //           <li>Создать файл .env в корне проекта</li>
    //           <li>Добавить: REACT_APP_GOOGLE_MAPS_API_KEY=ваш_ключ</li>
    //           <li>Перезапустить приложение</li>
    //         </ol>
    //         <p style="margin-top: 20px; font-size: 14px; color: #999;">
    //           Пока что используется OpenStreetMap
    //         </p>
    //       </div>
    //     `;
    //   }
    //   return;
    // }

    const loader = new Loader({
      apiKey: apiKey || 'demo-key',
      version: 'weekly',
      libraries: ['places']
    });

    loader.load().then(() => {
      if (mapRef.current && window.google) {
        const initialCenter = getCityCoordinates(filters.city);
        console.log('Initializing map with center:', filters.city, initialCenter);
        console.log('Current filters:', filters);
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: initialCenter.lat, lng: initialCenter.lng },
          zoom: initialCenter.zoom,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP,
          styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{ visibility: 'off' }]
            }
          ]
        });
        setMap(mapInstance);
        setIsLoaded(true);
      }
    }).catch((error) => {
      console.error('Error loading Google Maps:', error);
      if (mapRef.current) {
        mapRef.current.innerHTML = `
          <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            height: 100%; 
            background: #f5f5f5; 
            color: #666;
            text-align: center;
          ">
            <p>Ошибка загрузки Google Maps. Проверьте API ключ.</p>
          </div>
        `;
      }
    });
  }, [filters.city, getCityCoordinates]);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Очищаем существующие маркеры
    markers.forEach(marker => marker.setMap(null));
    const newMarkers: any[] = [];

    if (selectedType === 'salons') {
      salons.forEach((salon) => {
        if (salon.coordinates && window.google) {
          const marker = new window.google.maps.Marker({
            position: { lat: salon.coordinates.lat, lng: salon.coordinates.lng },
            map: map,
            title: salon.name,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                  <path fill="#667eea" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
                  <circle fill="white" cx="12.5" cy="12.5" r="8"/>
                  <text x="12.5" y="16" text-anchor="middle" fill="#667eea" font-size="10" font-weight="bold">S</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(25, 41),
              anchor: new window.google.maps.Point(12, 41)
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <img src="${salon.image}" alt="${salon.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333;">${salon.name}</h3>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                  📍 ${salon.address}
                </p>
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                  ⭐ ${salon.rating} (${salon.reviews} ${t.reviews})
                </p>
                <div style="margin-bottom: 10px;">
                  ${salon.services.slice(0, 3).map(service => 
                    `<span style="display: inline-block; background: #f0f0f0; padding: 2px 6px; margin: 2px; border-radius: 12px; font-size: 12px; color: #666;">${service}</span>`
                  ).join('')}
                </div>
                <button onclick="window.selectSalon('${salon.id}')" style="
                  background: #667eea; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 14px;
                  width: 100%;
                ">${t.viewDetails}</button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        }
      });
    } else if (selectedType === 'masters') {
      masters.forEach((master) => {
        if (master.coordinates && window.google) {
          const marker = new window.google.maps.Marker({
            position: { lat: master.coordinates.lat, lng: master.coordinates.lng },
            map: map,
            title: master.name,
            icon: {
              url: 'data:image/svg+xml;base64,' + btoa(`
                <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                  <path fill="${master.isFreelancer ? '#ff6b6b' : '#4ecdc4'}" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
                  <circle fill="white" cx="12.5" cy="12.5" r="8"/>
                  <text x="12.5" y="16" text-anchor="middle" fill="${master.isFreelancer ? '#ff6b6b' : '#4ecdc4'}" font-size="10" font-weight="bold">${master.isFreelancer ? 'F' : 'M'}</text>
                </svg>
              `),
              scaledSize: new window.google.maps.Size(25, 41),
              anchor: new window.google.maps.Point(12, 41)
            }
          });

          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; max-width: 250px;">
                <img src="${master.photo}" alt="${master.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 50%; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">
                <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #333; text-align: center;">${master.name}</h3>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px; text-align: center;">${translateSpecialty(master.specialty, language)}</p>
                <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">
                  📍 ${master.address}, ${master.city === 'Prague' ? 'Praha' : master.city}
                </p>
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                  ⭐ ${master.rating} (${master.reviews} ${t.reviews})
                </p>
                <div style="margin-bottom: 10px; text-align: center;">
                  <span style="display: inline-block; background: #f0f0f0; padding: 4px 8px; border-radius: 12px; font-size: 12px; color: #666;">
                    ${master.isFreelancer ? t.freelancer : t.inSalon}
                  </span>
                </div>
                <button onclick="window.selectMaster('${master.id}')" style="
                  background: #667eea; 
                  color: white; 
                  border: none; 
                  padding: 8px 16px; 
                  border-radius: 4px; 
                  cursor: pointer; 
                  font-size: 14px;
                  width: 100%;
                ">${t.viewDetails}</button>
              </div>
            `
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });

          newMarkers.push(marker);
        }
      });
    }

    setMarkers(newMarkers);

    // Добавляем функции в глобальную область видимости для кнопок в InfoWindow
    window.selectSalon = (salonId: string) => {
      const salon = salons.find(s => s.id === salonId);
      if (salon) onSalonSelect(salon);
    };

    window.selectMaster = (masterId: string) => {
      const master = masters.find(m => m.id === masterId);
      if (master) onMasterSelect(master);
    };

  }, [map, isLoaded, salons, masters, selectedType, t, onSalonSelect, onMasterSelect, markers]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default GoogleMapView;
