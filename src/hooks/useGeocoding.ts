import { useState, useEffect } from 'react';
import { Master } from '../types';
import { geocodeAddress, Coordinates } from '../utils/geocoding';

export function useGeocoding(masters: Master[]) {
  const [geocodedMasters, setGeocodedMasters] = useState<Master[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  console.log('useGeocoding вызван с', masters.length, 'мастерами');

  useEffect(() => {
    const geocodeMasters = async () => {
      console.log('useGeocoding: Начало геокодирования', masters.length, 'мастеров');
      setIsLoading(true);

      try {
        const mastersWithCoordinates: Master[] = [];

        for (const master of masters) {
          let coordinates: Coordinates | null = null;

          // Если у мастера уже есть координаты, используем их
          if (master.coordinates) {
            coordinates = master.coordinates;
            console.log(`Мастер ${master.name} уже имеет координаты:`, coordinates);
          } 
          // Если у мастера есть адрес, пытаемся геокодировать его
          else if (master.address) {
            console.log(`Геокодирование мастера: ${master.name}, адрес: ${master.address}`);
            coordinates = await geocodeAddress(master.address);
          }

          // Добавляем мастера с координатами (если они есть)
          if (coordinates) {
            mastersWithCoordinates.push({
              ...master,
              coordinates
            });
            console.log(`Мастер ${master.name} добавлен с координатами:`, coordinates);
          } else {
            console.warn(`Не удалось получить координаты для мастера: ${master.name}`);
            // Добавляем мастера без координат (он не будет отображаться на карте)
            mastersWithCoordinates.push(master);
          }

          // Небольшая задержка между запросами
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        setGeocodedMasters(mastersWithCoordinates);
        console.log(`Геокодирование завершено. Обработано: ${mastersWithCoordinates.length} мастеров`);
        console.log('Мастера с координатами:', mastersWithCoordinates.filter(m => m.coordinates).length);
      } catch (err) {
        console.error('Ошибка при геокодировании мастеров:', err);
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

  console.log('useGeocoding возвращает:', { 
    geocodedMastersLength: geocodedMasters.length, 
    isLoading
  });

  return { geocodedMasters, isLoading };
}
