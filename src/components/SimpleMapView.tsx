import React, { useEffect, useRef, useState } from 'react';
import { Salon, Master, Language, SearchFilters } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import { geocodeAddress, geocodeStructuredAddress } from '../utils/geocoding';
import { translateCityToCzech } from '../utils/cities';

interface SimpleMapViewProps {
  salons: Salon[];
  masters: Master[];
  language: Language;
  translations: any;
  onSalonSelect: (salon: Salon) => void;
  onMasterSelect: (master: Master) => void;
  selectedType: 'salons' | 'masters';
  filters: SearchFilters;
}

const SimpleMapView: React.FC<SimpleMapViewProps> = ({
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
  const [geoSalons, setGeoSalons] = useState<Salon[]>([]);
  const [geoMasters, setGeoMasters] = useState<Master[]>([]);

  const t = translations[language];
  // Оптимизированное геокодирование с batch обработкой
  useEffect(() => {
    (async () => {
      // Собираем всех мастеров: фрилансеры + мастера из салонов
      const allMasters = [
        ...masters.filter(m => m.isFreelancer), // Только фрилансеры из отдельной коллекции
        ...salons.flatMap(salon => 
          salon.masters.map(master => ({
            ...master,
            salonName: salon.name,
            salonId: salon.id,
            city: salon.city,
            address: salon.address,
            coordinates: salon.coordinates,
            structuredAddress: salon.structuredAddress
          }))
        ) // Мастера из салонов
      ];
      
      // Сначала показываем элементы с существующими координатами
      setGeoSalons(salons);
      setGeoMasters(allMasters);
      
      // Собираем все адреса для геокодирования
      const addressesToGeocode: Array<{
        type: 'salon' | 'master';
        index: number;
        address: string;
        structuredAddress?: any;
      }> = [];
      
      // Собираем адреса салонов
      salons.forEach((salon, index) => {
        if (!salon.coordinates && (salon.structuredAddress || salon.address)) {
          addressesToGeocode.push({
            type: 'salon',
            index,
            address: salon.address,
            structuredAddress: salon.structuredAddress
          });
        }
      });
      
      // Собираем адреса мастеров
      allMasters.forEach((master, index) => {
        if (!master.coordinates && (master.structuredAddress || master.address)) {
          addressesToGeocode.push({
            type: 'master',
            index,
            address: master.address || '',
            structuredAddress: master.structuredAddress
          });
        }
      });
      
      // Batch геокодирование с ограничением на количество одновременных запросов
      const BATCH_SIZE = 5; // Максимум 5 одновременных запросов
      const enrichSalons = [...salons];
      const enrichMasters = [...allMasters];
      
      for (let i = 0; i < addressesToGeocode.length; i += BATCH_SIZE) {
        const batch = addressesToGeocode.slice(i, i + BATCH_SIZE);
        
        // Обрабатываем batch параллельно
        const promises = batch.map(async (item) => {
          let coords = undefined;
          if (item.structuredAddress) {
            coords = await geocodeStructuredAddress(item.structuredAddress);
          } else if (item.address) {
            coords = await geocodeAddress(item.address);
          }
          return { item, coords };
        });
        
        const results = await Promise.all(promises);
        
        // Обновляем результаты
        results.forEach(({ item, coords }) => {
          if (coords) {
            if (item.type === 'salon') {
              enrichSalons[item.index] = { ...enrichSalons[item.index], coordinates: coords } as Salon;
            } else {
              enrichMasters[item.index] = { ...enrichMasters[item.index], coordinates: coords } as Master;
            }
          }
        });
        
        // Обновляем состояние после каждого batch
        setGeoSalons([...enrichSalons]);
        setGeoMasters([...enrichMasters]);
        
        // Небольшая задержка между batch'ами
        if (i + BATCH_SIZE < addressesToGeocode.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    })();
  }, [salons, masters]);

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
    return result;
  };

  // Обновляем центр карты при изменении города
  useEffect(() => {
    if (map && isLoaded) {
      const newCenter = getCityCoordinates(filters.city);
      map.setView([newCenter.lat, newCenter.lng], newCenter.zoom);
    }
  }, [map, isLoaded, filters.city]);

  useEffect(() => {
    // Загружаем Leaflet CSS и JS
    const loadLeaflet = () => {
      return new Promise((resolve) => {
        // Проверяем, загружен ли уже Leaflet
        if ((window as any).L) {
          resolve(true);
          return;
        }

        // Загружаем CSS
        const cssLink = document.createElement('link');
        cssLink.rel = 'stylesheet';
        cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(cssLink);

        // Загружаем JS
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => resolve(true);
        document.head.appendChild(script);
      });
    };

    let createdMap: any = null;
    loadLeaflet().then(() => {
      if (mapRef.current && (window as any).L && !createdMap) {
        const L = (window as any).L;
        const initialCenter = getCityCoordinates(filters.city);

        // Защита от повторной инициализации при HMR/повторном монтировании
        const container: any = mapRef.current;
        // Убедимся, что контейнер уже имеет размеры
        if (!container.offsetWidth || !container.offsetHeight) {
          setTimeout(() => {
            // повторная попытка, если компонент всё ещё в DOM
            if (mapRef.current) {
              const evt = new Event('resize');
              window.dispatchEvent(evt);
            }
          }, 100);
          return;
        }
        // Если карта уже инициализирована Leaflet-ом, не пересоздаём её
        if (container._leaflet_id) {
          setIsLoaded(true);
          return;
        }

        createdMap = L.map(container, { tap: false }).setView([initialCenter.lat, initialCenter.lng], initialCenter.zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(createdMap);

        // Явно включаем интерактивность на случай, если Leaflet её отключил
        try {
          createdMap.dragging.enable();
          createdMap.scrollWheelZoom.enable();
          createdMap.doubleClickZoom.enable();
          createdMap.boxZoom.enable();
          createdMap.keyboard.enable();
        } catch {}

        setMap(createdMap);
        // На всякий случай скорректировать размер после рендера
        setTimeout(() => {
          try { createdMap.invalidateSize(); } catch {}
        }, 0);
        setIsLoaded(true);
      }
    });

    return () => {
      if (createdMap) {
        try {
          createdMap.off();
          createdMap.remove();
        } catch {}
        createdMap = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map || !isLoaded) return;

    // Очищаем существующие маркеры
    markers.forEach(marker => map.removeLayer(marker));
    const newMarkers: any[] = [];

    const translateCity = (city?: string) => translateCityToCzech(city);

    if (selectedType === 'salons') {
      geoSalons.forEach((salon) => {
        // Вычисляем координаты: сначала точные, затем центр города как фолбэк
        let lat: number | null = null;
        let lng: number | null = null;
        if (salon.coordinates) {
          lat = salon.coordinates.lat;
          lng = salon.coordinates.lng;
        } else if (salon.city) {
          const c = getCityCoordinates(salon.city);
          lat = c.lat;
          lng = c.lng;
        }
        if (lat !== null && lng !== null) {
          const L = (window as any).L;
          
          // Создаем кастомную иконку для салона
          const salonIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 18px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                🏢
              </div>
            `,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
          });
          
          const marker = L.marker([lat, lng], { icon: salonIcon })
            .addTo(map);
          
          // Добавляем обработчик клика
          marker.on('click', function() {
            // Обработка клика по маркеру салона
          });
          
          const addressText = salon.structuredAddress
            ? require('../utils/cities').formatStructuredAddressCzech(salon.structuredAddress)
            : (require('../utils/cities').translateAddressToCzech(salon.address || '', salon.city) || translateCity(salon.city));

          const popupContent = `
              <div style="padding: 0; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
                <div style="position: relative; height: 140px; overflow: hidden; border-radius: 12px 12px 0 0;">
                  <img src="${salon.image}" alt="${salon.name}" style="width: 100%; height: 100%; object-fit: cover;">
                  <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ⭐ ${salon.rating} (${salon.reviews})
                  </div>
                </div>
                <div style="padding: 16px; background: white;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a; font-weight: 600; line-height: 1.3;">${salon.name}</h3>
                  <div style="margin: 0 0 12px 0; color: #666; font-size: 14px; display: flex; align-items: center;">
                    <span style="margin-right: 6px;">📍</span>
                    <span>${addressText || ''}</span>
                  </div>
                  <div style="margin: 0 0 12px 0; display: flex; flex-wrap: wrap; gap: 4px;">
                    ${translateServices(salon.services, language).slice(0, 3).map(service => 
                      `<span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 16px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${service}</span>`
                    ).join('')}
                    ${salon.services.length > 3 ? `<span style="display: inline-block; background: #f0f0f0; color: #666; padding: 4px 8px; border-radius: 16px; font-size: 11px;">+${salon.services.length - 3} ${language === 'cs' ? 'další' : 'more'}</span>` : ''}
                  </div>
                  <div style="margin: 0 0 16px 0; display: flex; align-items: center; color: #666; font-size: 13px;">
                    <span style="margin-right: 6px;">👥</span>
                    <span>${salon.masters.length} ${salon.masters.length === 1 ? (language === 'cs' ? 'mistr' : 'master') : (language === 'cs' ? 'mistrů' : 'masters')}</span>
                  </div>
                  <button onclick="window.selectSalon('${salon.id}')" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    border: none; 
                    padding: 12px 20px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 14px;
                    font-weight: 600;
                    width: 100%;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                  " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'">${t.viewDetails}</button>
                </div>
              </div>
            `;
          
          marker.bindPopup(popupContent, {
            closeButton: true,
            autoClose: true,
            closeOnClick: true,
            autoOpen: false,
            className: 'custom-popup',
            maxWidth: 300,
            minWidth: 250
          });

          newMarkers.push(marker);
        }
      });
    } else if (selectedType === 'masters') {
      geoMasters.forEach((master) => {
        // Вычислим координаты: сначала точные, затем центр города как фолбэк
        let lat: number | null = null;
        let lng: number | null = null;
        if (master.coordinates) {
          lat = master.coordinates.lat;
          lng = master.coordinates.lng;
        } else if (master.city) {
          const c = getCityCoordinates(master.city);
          lat = c.lat;
          lng = c.lng;
        }
        if (lat !== null && lng !== null) {
          const L = (window as any).L;
          
          // Создаем кастомную иконку для мастера
          const masterIcon = L.divIcon({
            className: 'custom-marker',
            html: `
              <div style="
                background: ${master.isFreelancer ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' : 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'};
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 16px;
                font-weight: bold;
                border: 3px solid white;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                cursor: pointer;
              ">
                ${master.isFreelancer ? '🏠' : '🏢'}
              </div>
            `,
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5],
            popupAnchor: [0, -17.5]
          });
          
          const marker = L.marker([lat, lng], { icon: masterIcon })
            .addTo(map);
          
          // Добавляем обработчик клика
          marker.on('click', function() {
            // Обработка клика по маркеру мастера
          });
          
          const masterAddressText = master.structuredAddress
            ? require('../utils/cities').formatStructuredAddressCzech(master.structuredAddress)
            : (require('../utils/cities').translateAddressToCzech(master.address || '', master.city) || translateCity(master.city) || master.address || master.city || '');

          // Debug info removed for production

          // Создаем HTML для фото или заглушки заранее
          const placeholderHtml = '<div style="width: 80px; height: 80px; border-radius: 50%; background-color: rgba(255,255,255,0.9); border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center; flex-direction: column;"><div style="font-size: 24px; margin-bottom: 2px;">👤</div><div style="font-size: 8px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d;">' + (language === 'cs' ? 'MISTR' : 'MASTER') + '</div></div>';
          
          const photoHtml = master.photo && master.photo.trim() !== '' 
            ? '<img src="' + master.photo + '" alt="' + master.name + '" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2);" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'flex\';">' + '<div style="width: 80px; height: 80px; border-radius: 50%; background-color: rgba(255,255,255,0.9); border: 4px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.2); display: none; align-items: center; justify-content: center; flex-direction: column;"><div style="font-size: 24px; margin-bottom: 2px;">👤</div><div style="font-size: 8px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; color: #6c757d;">' + (language === 'cs' ? 'MISTR' : 'MASTER') + '</div></div>'
            : placeholderHtml;

          const popupContent = `
              <div style="padding: 0; max-width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(0,0,0,0.15);">
                <div style="position: relative; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; border-radius: 12px 12px 0 0;">
                  ${photoHtml}
                  <div style="position: absolute; top: 8px; left: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                    ⭐ ${master.rating} (${master.reviews})
                  </div>
                </div>
                <div style="padding: 16px; background: white; text-align: center;">
                  <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #1a1a1a; font-weight: 600; line-height: 1.3;">${master.name}</h3>
                  <div style="margin: 0 0 12px 0; color: #666; font-size: 14px;">
                    <span style="margin-right: 6px;">📍</span>
                    <span>${masterAddressText || ''}</span>
                  </div>
                  <div style="margin: 0 0 12px 0; display: flex; align-items: center; justify-content: center; color: #666; font-size: 13px;">
                    <span style="margin-right: 6px;">⏱️</span>
                    <span>${master.experience} ${language === 'cs' ? 'let zkušeností' : 'experience'}</span>
                  </div>
                  <div style="margin: 0 0 12px 0; text-align: center;">
                    <span style="display: inline-block; background: ${master.isFreelancer ? 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)' : 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)'}; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                      ${master.isFreelancer ? t.freelancer : t.inSalon}
                    </span>
                  </div>
                  ${master.salonName ? `
                    <div style="margin: 0 0 16px 0; text-align: center;">
                      <span style="display: inline-block; background: #e8f4fd; color: #1976d2; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #bbdefb;" onclick="window.selectSalon('${master.salonId}')">
${master.salonName}
                      </span>
                    </div>
                    <div style="margin: 0 0 12px 0; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                      ${master.services ? translateServices(master.services, language).slice(0, 3).map(service => 
                        `<span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 16px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${service}</span>`
                      ).join('') : ''}
                      ${master.services && master.services.length > 3 ? `<span style="display: inline-block; background: #f0f0f0; color: #666; padding: 4px 8px; border-radius: 16px; font-size: 11px;">+${master.services.length - 3} ${language === 'cs' ? 'další' : 'more'}</span>` : ''}
                    </div>
                    ${master.languages && master.languages.length > 0 ? `
                      <div style="margin: 0 0 12px 0; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                        <span style="font-size: 11px; color: #666; margin-right: 4px;">🌐 ${language === 'cs' ? 'Jazyky:' : 'Languages:'}</span>
                        ${translateLanguages(master.languages, language).slice(0, 3).map(lang => 
                          `<span style="display: inline-block; background: #e8f5e8; color: #2e7d32; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: 500;">${lang}</span>`
                        ).join('')}
                        ${master.languages.length > 3 ? `<span style="display: inline-block; background: #f0f0f0; color: #666; padding: 2px 6px; border-radius: 12px; font-size: 10px;">+${master.languages.length - 3}</span>` : ''}
                      </div>
                    ` : ''}
                  ` : `
                    <div style="margin: 0 0 12px 0; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                      ${master.services ? translateServices(master.services, language).slice(0, 3).map(service => 
                        `<span style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4px 8px; border-radius: 16px; font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px;">${service}</span>`
                      ).join('') : ''}
                      ${master.services && master.services.length > 3 ? `<span style="display: inline-block; background: #f0f0f0; color: #666; padding: 4px 8px; border-radius: 16px; font-size: 11px;">+${master.services.length - 3} ${language === 'cs' ? 'další' : 'more'}</span>` : ''}
                    </div>
                    ${master.languages && master.languages.length > 0 ? `
                      <div style="margin: 0 0 12px 0; display: flex; flex-wrap: wrap; gap: 4px; justify-content: center;">
                        <span style="font-size: 11px; color: #666; margin-right: 4px;">🌐 ${language === 'cs' ? 'Jazyky:' : 'Languages:'}</span>
                        ${translateLanguages(master.languages, language).slice(0, 3).map(lang => 
                          `<span style="display: inline-block; background: #e8f5e8; color: #2e7d32; padding: 2px 6px; border-radius: 12px; font-size: 10px; font-weight: 500;">${lang}</span>`
                        ).join('')}
                        ${master.languages.length > 3 ? `<span style="display: inline-block; background: #f0f0f0; color: #666; padding: 2px 6px; border-radius: 12px; font-size: 10px;">+${master.languages.length - 3}</span>` : ''}
                      </div>
                    ` : ''}
                  `}
                  <button onclick="window.selectMaster('${master.id}')" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    border: none; 
                    padding: 12px 20px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 14px;
                    font-weight: 600;
                    width: 100%;
                    transition: all 0.2s ease;
                    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
                  " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 4px 12px rgba(102, 126, 234, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 8px rgba(102, 126, 234, 0.3)'">${t.viewDetails}</button>
                </div>
              </div>
            `;
          
          marker.bindPopup(popupContent, {
            closeButton: true,
            autoClose: true,
            closeOnClick: true,
            autoOpen: false,
            className: 'custom-popup',
            maxWidth: 300,
            minWidth: 250
          });

          newMarkers.push(marker);
        }
      });
    }

    setMarkers(newMarkers);

    // Добавляем функции в глобальную область видимости для кнопок в popup
    (window as any).selectSalon = (salonId: string) => {
      const salon = salons.find(s => s.id === salonId);
      if (salon) onSalonSelect(salon);
    };

    (window as any).selectMaster = (masterId: string) => {
      const master = masters.find(m => m.id === masterId);
      if (master) onMasterSelect(master);
    };

  }, [map, isLoaded, geoSalons, geoMasters, selectedType, t, onSalonSelect, onMasterSelect, language]);

  return (
    <div className="map-container">
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
};

export default SimpleMapView;
