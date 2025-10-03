import { useState, useEffect } from 'react';
import { Master } from '../types';
import { geocodeAddress, Coordinates } from '../utils/geocoding';

export function useGeocoding(masters: Master[]) {
  const [geocodedMasters, setGeocodedMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // useGeocoding hook called

  useEffect(() => {
    const geocodeMasters = async () => {
      setIsLoading(true);

      try {
        const mastersWithCoordinates: Master[] = [];

        for (const master of masters) {
          let coordinates: Coordinates | null = null;

          // Если у мастера уже есть координаты, используем их
          if (master.coordinates) {
            coordinates = master.coordinates;
          } 
          // Если у мастера есть адрес, пытаемся геокодировать его
          else if (master.address) {
            coordinates = await geocodeAddress(master.address);
          }

          // Добавляем мастера с координатами (если они есть)
          if (coordinates) {
            mastersWithCoordinates.push({
              ...master,
              coordinates
            });
          } else {
            // Добавляем мастера без координат (он не будет отображаться на карте)
            mastersWithCoordinates.push(master);
          }

          // Небольшая задержка между запросами
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setGeocodedMasters(mastersWithCoordinates);
      } catch (err) {
        setGeocodedMasters(masters);
      } finally {
        setIsLoading(false);
      }
    };

    if (masters.length > 0) {
      geocodeMasters();
    } else {
      setGeocodedMasters([]);
    }
  }, [masters]);

  // useGeocoding returns processed data

  return { geocodedMasters, isLoading };
}
