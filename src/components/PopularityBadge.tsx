/**
 * Компонент бейджа популярности
 */

import React from 'react';
import { getPopularityBadge, getBadgeColor } from '../utils/popularityBadge';

interface PopularityBadgeProps {
  favoritesCount: number;
  language: 'cs' | 'en';
  className?: string;
}

export const PopularityBadge: React.FC<PopularityBadgeProps> = ({
  favoritesCount,
  language,
  className = '',
}) => {
  const badge = getPopularityBadge(favoritesCount);

  if (!badge.level) {
    return null;
  }

  const label = language === 'cs' ? badge.label_cs : badge.label_en;
  const color = getBadgeColor(badge.level);

  return (
    <div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-sm font-semibold ${className}`}
      style={{ backgroundColor: color }}
    >
      <span>{badge.icon}</span>
      <span>{label}</span>
    </div>
  );
};




