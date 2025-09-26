import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Salon, Master, Language } from '../types';
import 'leaflet/dist/leaflet.css';

// Фикс для иконок Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapViewProps {
  salons: Salon[];
  masters: Master[];
  language: Language;
  translations: any;
  onSalonSelect: (salon: Salon) => void;
  onMasterSelect: (master: Master) => void;
  selectedType: 'salons' | 'masters';
}

// Компонент для центрирования карты
const MapCenter: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, 11);
  }, [map, center]);
  
  return null;
};

const MapView: React.FC<MapViewProps> = ({
  salons,
  masters,
  language,
  translations,
  onSalonSelect,
  onMasterSelect,
  selectedType,
}) => {
  const mapRef = useRef<L.Map>(null);
  
  const t = translations[language];
  
  // Центр карты (Прага)
  const center: [number, number] = [50.0755, 14.4378];
  
  // Создаем иконки для разных типов
  const salonIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#667eea" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="8"/>
        <text x="12.5" y="16" text-anchor="middle" fill="#667eea" font-size="10" font-weight="bold">S</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const masterIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#4ecdc4" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="8"/>
        <text x="12.5" y="16" text-anchor="middle" fill="#4ecdc4" font-size="10" font-weight="bold">M</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const freelancerIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path fill="#ff6b6b" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 12.5 12.5 28.5 12.5 28.5s12.5-16 12.5-28.5C25 5.6 19.4 0 12.5 0z"/>
        <circle fill="white" cx="12.5" cy="12.5" r="8"/>
        <text x="12.5" y="16" text-anchor="middle" fill="#ff6b6b" font-size="10" font-weight="bold">F</text>
      </svg>
    `),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  // Фильтруем данные в зависимости от выбранного типа
  const displayData = selectedType === 'salons' ? salons : masters;

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <MapCenter center={center} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedType === 'salons' && salons.map((salon) => {
          if (!salon.coordinates) return null;
          
          return (
            <Marker
              key={`salon-${salon.id}`}
              position={[salon.coordinates.lat, salon.coordinates.lng]}
              icon={salonIcon}
            >
              <Popup>
                <div className="map-popup">
                  <img 
                    src={salon.image} 
                    alt={salon.name} 
                    className="popup-image"
                  />
                  <h3>{salon.name}</h3>
                  <p className="popup-address">
                    📍 {salon.address}, {salon.city === 'Prague' ? 'Praha' : salon.city}
                  </p>
                  <p className="popup-rating">
                    ⭐ {salon.rating} ({salon.reviews} {t.reviews})
                  </p>
                  <div className="popup-services">
                    {salon.services.slice(0, 3).map(service => (
                      <span key={service} className="popup-service-tag">
                        {service}
                      </span>
                    ))}
                  </div>
                  <button 
                    className="popup-button"
                    onClick={() => onSalonSelect(salon)}
                  >
                    {t.viewDetails}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {selectedType === 'masters' && masters.map((master) => {
          if (!master.coordinates) return null;
          
          const icon = master.isFreelancer ? freelancerIcon : masterIcon;
          
          return (
            <Marker
              key={`master-${master.id}`}
              position={[master.coordinates.lat, master.coordinates.lng]}
              icon={icon}
            >
              <Popup>
                <div className="map-popup">
                  <img 
                    src={master.photo} 
                    alt={master.name} 
                    className="popup-image popup-avatar"
                  />
                  <h3>{master.name}</h3>
                  <p className="popup-specialty">{master.specialty}</p>
                  <p className="popup-address">
                    📍 {master.address}, {master.city === 'Prague' ? 'Praha' : master.city}
                  </p>
                  <p className="popup-rating">
                    ⭐ {master.rating} ({master.reviews} {t.reviews})
                  </p>
                  <div className="popup-meta">
                    <span className="popup-type">
                      {master.isFreelancer ? t.freelancer : t.inSalon}
                    </span>
                    {master.salonName && (
                      <span className="popup-salon">🏢 {master.salonName}</span>
                    )}
                  </div>
                  <button 
                    className="popup-button"
                    onClick={() => onMasterSelect(master)}
                  >
                    {t.viewDetails}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapView;
