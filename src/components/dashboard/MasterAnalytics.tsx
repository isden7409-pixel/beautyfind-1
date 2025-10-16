/**
 * Компонент аналитики для мастера-фрилансера
 */

import React, { useState, useEffect } from 'react';
import { Master } from '../../types';
import { MasterAnalytics as AnalyticsType } from '../../types/booking';
import { getBookings, getClientBookings } from '../../firebase/bookingServices';
import { PopularityBadge } from '../PopularityBadge';
import { getPopularityBadge } from '../../utils/popularityBadge';

interface MasterAnalyticsProps {
  master: Master;
  language: 'cs' | 'en';
}

export const MasterAnalytics: React.FC<MasterAnalyticsProps> = ({
  master,
  language,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    cs: {
      title: 'Analytika',
      bookings: 'REZERVACE',
      finance: 'FINANCE',
      ratings: 'HODNOCENÍ',
      favorites: 'OBLÍBENÉ',
      conversion: 'KONVERZE',
      popularServices: 'NEJOBLÍBENĚJŠÍ SLUŽBY',
      total: 'Celkem rezervací',
      completed: 'Dokončené',
      cancelled: 'Zrušené',
      completionRate: 'Míra dokončení',
      totalRevenue: 'Celkový výdělek',
      averagePrice: 'Průměrná cena služby',
      revenueThisMonth: 'Výdělek tento měsíc',
      averageRating: 'Průměrné hodnocení',
      totalReviews: 'Celkem recenzí',
      newReviewsThisMonth: 'Nové recenze (tento měsíc)',
      favoritesCount: 'Přidáno do oblíbených',
      favoritesThisMonth: 'Tento měsíc',
      favoriteTrend: 'Trend',
      lastFavorited: 'Poslední přidání',
      favoritesToBookings: 'Oblíbených → Rezervovali',
      conversionRate: 'Míra konverze',
      viewAll: 'Zobrazit všechny',
      people: 'lidí',
      daysAgo: 'před {days} dny',
      hoursAgo: 'před {hours} hodinami',
      justNow: 'právě teď',
      trendUp: '↗️ Roste',
      trendDown: '↘️ Klesá',
      trendStable: '→ Stabilní',
      noData: 'Zatím žádná data',
      yourStatus: 'VÁŠ STATUS',
    },
    en: {
      title: 'Analytics',
      bookings: 'BOOKINGS',
      finance: 'FINANCE',
      ratings: 'RATINGS',
      favorites: 'FAVORITES',
      conversion: 'CONVERSION',
      popularServices: 'POPULAR SERVICES',
      total: 'Total bookings',
      completed: 'Completed',
      cancelled: 'Cancelled',
      completionRate: 'Completion rate',
      totalRevenue: 'Total revenue',
      averagePrice: 'Average service price',
      revenueThisMonth: 'Revenue this month',
      averageRating: 'Average rating',
      totalReviews: 'Total reviews',
      newReviewsThisMonth: 'New reviews (this month)',
      favoritesCount: 'Added to favorites',
      favoritesThisMonth: 'This month',
      favoriteTrend: 'Trend',
      lastFavorited: 'Last added',
      favoritesToBookings: 'Favorites → Booked',
      conversionRate: 'Conversion rate',
      viewAll: 'View all',
      people: 'people',
      daysAgo: '{days} days ago',
      hoursAgo: '{hours} hours ago',
      justNow: 'just now',
      trendUp: '↗️ Growing',
      trendDown: '↘️ Declining',
      trendStable: '→ Stable',
      noData: 'No data yet',
      yourStatus: 'YOUR STATUS',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadAnalytics();
  }, [master.id]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // В реальности данные будут из master.analytics или пересчитаны
      // Здесь для демонстрации создаем моковые данные
      const mockAnalytics: AnalyticsType = {
        totalBookings: 156,
        completedBookings: 142,
        cancelledBookings: 14,
        completionRate: 91,
        totalRevenue: 85400,
        averageServicePrice: 601,
        revenueThisMonth: 12300,
        averageRating: 4.8,
        totalReviews: 45,
        newReviewsThisMonth: 8,
        favoritesCount: master.analytics?.favoritesCount || 42,
        favoritesThisMonth: master.analytics?.favoritesThisMonth || 12,
        lastFavoritedAt: master.analytics?.lastFavoritedAt,
        favoriteTrend: master.analytics?.favoriteTrend || 'up',
        favoritesToBookings: 28,
        favoritesConversionRate: 67,
        popularServices: [
          { serviceId: '1', serviceName: 'Dámský střih', bookingsCount: 58, percentage: 37 },
          { serviceId: '2', serviceName: 'Barvení', bookingsCount: 42, percentage: 27 },
          { serviceId: '3', serviceName: 'Melír', bookingsCount: 31, percentage: 20 },
        ],
        lastUpdated: new Date(),
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date?: Date): string => {
    if (!date) return translations.noData;

    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return translations.daysAgo.replace('{days}', days.toString());
    } else if (hours > 0) {
      return translations.hoursAgo.replace('{hours}', hours.toString());
    } else {
      return translations.justNow;
    }
  };

  const getTrendLabel = (trend: 'up' | 'down' | 'stable'): string => {
    return trend === 'up'
      ? translations.trendUp
      : trend === 'down'
      ? translations.trendDown
      : translations.trendStable;
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        {language === 'cs' ? 'Načítání...' : 'Loading...'}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-8 text-gray-500">
        {translations.noData}
      </div>
    );
  }

  const badge = getPopularityBadge(analytics.favoritesCount);

  return (
    <div className="master-analytics space-y-6">
      {/* Header with title */}
      <h2 className="text-2xl font-bold">{translations.title}</h2>

      {/* Popularity Status */}
      {badge.level && (
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-6 border-2 border-pink-200">
          <h3 className="text-lg font-semibold mb-3">{translations.yourStatus}</h3>
          <PopularityBadge
            favoritesCount={analytics.favoritesCount}
            language={language}
            className="text-lg"
          />
        </div>
      )}

      {/* Bookings Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">📊 {translations.bookings}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label={translations.total}
            value={analytics.totalBookings.toString()}
            icon="📊"
          />
          <StatCard
            label={translations.completed}
            value={analytics.completedBookings.toString()}
            subValue={`${analytics.completionRate}%`}
            icon="✅"
            color="green"
          />
          <StatCard
            label={translations.cancelled}
            value={analytics.cancelledBookings.toString()}
            icon="❌"
            color="red"
          />
          <StatCard
            label={translations.completionRate}
            value={`${analytics.completionRate}%`}
            icon="📈"
          />
        </div>
      </div>

      {/* Finance Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">💰 {translations.finance}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label={translations.totalRevenue}
            value={`${analytics.totalRevenue.toLocaleString()} ${language === 'cs' ? 'Kč' : 'CZK'}`}
            icon="💰"
            color="green"
            large
          />
          <StatCard
            label={translations.averagePrice}
            value={`${analytics.averageServicePrice} ${language === 'cs' ? 'Kč' : 'CZK'}`}
            icon="💵"
          />
          <StatCard
            label={translations.revenueThisMonth}
            value={`${analytics.revenueThisMonth.toLocaleString()} ${language === 'cs' ? 'Kč' : 'CZK'}`}
            icon="📅"
          />
        </div>
      </div>

      {/* Ratings Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">⭐ {translations.ratings}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label={translations.averageRating}
            value={`${analytics.averageRating} ⭐`}
            icon="⭐"
            large
            color="yellow"
          />
          <StatCard
            label={translations.totalReviews}
            value={analytics.totalReviews.toString()}
            icon="💬"
          />
          <StatCard
            label={translations.newReviewsThisMonth}
            value={analytics.newReviewsThisMonth.toString()}
            icon="🆕"
          />
        </div>
      </div>

      {/* Favorites Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">❤️ {translations.favorites}</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            label={translations.favoritesCount}
            value={`${analytics.favoritesCount} ${translations.people}`}
            icon="❤️"
            color="pink"
            large
          />
          <StatCard
            label={translations.favoritesThisMonth}
            value={`+${analytics.favoritesThisMonth}`}
            icon="🆕"
          />
          <StatCard
            label={translations.favoriteTrend}
            value={getTrendLabel(analytics.favoriteTrend)}
            icon={analytics.favoriteTrend === 'up' ? '📈' : analytics.favoriteTrend === 'down' ? '📉' : '➡️'}
            color={analytics.favoriteTrend === 'up' ? 'green' : analytics.favoriteTrend === 'down' ? 'red' : 'gray'}
          />
          <StatCard
            label={translations.lastFavorited}
            value={formatTimeAgo(analytics.lastFavoritedAt)}
            icon="🕐"
          />
        </div>
      </div>

      {/* Conversion Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-3">🎯 {translations.conversion}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard
            label={translations.favoritesToBookings}
            value={`${analytics.favoritesToBookings}/${analytics.favoritesCount} ${translations.people}`}
            subValue={`${analytics.favoritesConversionRate}%`}
            icon="✅"
            color="green"
          />
          <StatCard
            label={language === 'cs' ? 'Ještě nerezerovali' : 'Not booked yet'}
            value={`${analytics.favoritesCount - analytics.favoritesToBookings} ${translations.people}`}
            subValue={`${100 - analytics.favoritesConversionRate}%`}
            icon="⏳"
            color="orange"
          />
        </div>
      </div>

      {/* Popular Services */}
      {analytics.popularServices.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">🔥 {translations.popularServices}</h3>
          <div className="space-y-3">
            {analytics.popularServices.map((service, index) => (
              <div
                key={service.serviceId}
                className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                    <span className="font-semibold">{service.serviceName}</span>
                  </div>
                  <span className="text-pink-600 font-semibold">
                    {service.bookingsCount} {language === 'cs' ? 'rezervací' : 'bookings'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{ width: `${service.percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 mt-1">{service.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Helper component for stat cards
interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  icon: string;
  color?: 'green' | 'red' | 'yellow' | 'pink' | 'orange' | 'gray';
  large?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  color,
  large,
}) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    pink: 'border-pink-200 bg-pink-50',
    orange: 'border-orange-200 bg-orange-50',
    gray: 'border-gray-200 bg-gray-50',
  };

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        color ? colorClasses[color] : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className={`font-bold ${large ? 'text-2xl' : 'text-xl'}`}>{value}</div>
      {subValue && <div className="text-sm text-gray-600 mt-1">{subValue}</div>}
    </div>
  );
};




