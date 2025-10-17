/**
 * Утилиты для бейджей популярности
 */

import { PopularityBadge } from '../types/booking';

/**
 * Получить бейдж популярности по количеству избранных
 */
export const getPopularityBadge = (favoritesCount: number): PopularityBadge => {
  if (favoritesCount >= 100) {
    return {
      level: 'nejoblíbenější',
      label_cs: 'NEJOBLÍBENĚJŠÍ',
      label_en: 'MOST POPULAR',
      icon: '🔥',
    };
  } else if (favoritesCount >= 50) {
    return {
      level: 'velmi-populární',
      label_cs: 'VELMI POPULÁRNÍ',
      label_en: 'VERY POPULAR',
      icon: '⭐',
    };
  } else if (favoritesCount >= 20) {
    return {
      level: 'populární',
      label_cs: 'POPULÁRNÍ',
      label_en: 'POPULAR',
      icon: '💫',
    };
  }

  return {
    level: null,
    label_cs: '',
    label_en: '',
    icon: '',
  };
};

/**
 * Проверить есть ли бейдж
 */
export const hasBadge = (favoritesCount: number): boolean => {
  return favoritesCount >= 20;
};

/**
 * Получить CSS класс для бейджа
 */
export const getBadgeClassName = (level: PopularityBadge['level']): string => {
  switch (level) {
    case 'nejoblíbenější':
      return 'badge-most-popular';
    case 'velmi-populární':
      return 'badge-very-popular';
    case 'populární':
      return 'badge-popular';
    default:
      return '';
  }
};

/**
 * Получить цвет для бейджа
 */
export const getBadgeColor = (level: PopularityBadge['level']): string => {
  switch (level) {
    case 'nejoblíbenější':
      return '#FF4500'; // красно-оранжевый
    case 'velmi-populární':
      return '#FFD700'; // золотой
    case 'populární':
      return '#9370DB'; // фиолетовый
    default:
      return '#ccc';
  }
};






