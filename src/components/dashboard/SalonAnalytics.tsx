/**
 * Компонент аналитики для салона
 */

import React, { useState, useEffect } from 'react';
import { Salon, Master } from '../../types';
import { SalonAnalytics as AnalyticsType, SalonMasterAnalytics } from '../../types/booking';
import { PopularityBadge } from '../PopularityBadge';
import { getPopularityBadge } from '../../utils/popularityBadge';

interface SalonAnalyticsProps {
  salon: Salon;
  masters: Master[];
  language: 'cs' | 'en';
}

export const SalonAnalytics: React.FC<SalonAnalyticsProps> = ({
  salon,
  masters,
  language,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsType | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    cs: {
      title: 'Analytika',
      overallStats: 'CELKOVÉ STATISTIKY (Salon + Všichni mistři)',
      bookings: 'REZERVACE',
      finance: 'FINANCE',
      ratings: 'HODNOCENÍ',
      favorites: 'OBLÍBENÉ',
      conversion: 'KONVERZE',
      popularServices: 'NEJOBLÍBENĚJŠÍ SLUŽBY',
      masterStats: 'STATISTIKY PODLE MISTRŮ',
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
      favoritesCount: 'Salon v oblíbených',
      favoritesThisMonth: 'Tento měsíc',
      favoriteTrend: 'Trend',
      lastFavorited: 'Poslední přidání',
      favoritesToBookings: 'Oblíbených → Rezervovali',
      conversionRate: 'Míra konverze',
      people: 'lidí',
      daysAgo: 'před {days} dny',
      hoursAgo: 'před {hours} hodinami',
      justNow: 'právě teď',
      trendUp: '↗️ Roste',
      trendDown: '↘️ Klesá',
      trendStable: '→ Stabilní',
      noData: 'Zatím žádná data',
      yourStatus: 'VÁŠE POZICE',
      master: 'Mistr',
      revenue: 'Výdělek',
      rating: 'Hodnocení',
      inFavorites: 'V oblíbených',
      popularService: 'Nejoblíbenější služba',
      bookingsCount: 'rezervací',
    },
    en: {
      title: 'Analytics',
      overallStats: 'OVERALL STATISTICS (Salon + All Masters)',
      bookings: 'BOOKINGS',
      finance: 'FINANCE',
      ratings: 'RATINGS',
      favorites: 'FAVORITES',
      conversion: 'CONVERSION',
      popularServices: 'POPULAR SERVICES',
      masterStats: 'STATISTICS BY MASTERS',
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
      favoritesCount: 'Salon in favorites',
      favoritesThisMonth: 'This month',
      favoriteTrend: 'Trend',
      lastFavorited: 'Last added',
      favoritesToBookings: 'Favorites → Booked',
      conversionRate: 'Conversion rate',
      people: 'people',
      daysAgo: '{days} days ago',
      hoursAgo: '{hours} hours ago',
      justNow: 'just now',
      trendUp: '↗️ Growing',
      trendDown: '↘️ Declining',
      trendStable: '→ Stable',
      noData: 'No data yet',
      yourStatus: 'YOUR POSITION',
      master: 'Master',
      revenue: 'Revenue',
      rating: 'Rating',
      inFavorites: 'In favorites',
      popularService: 'Most popular service',
      bookingsCount: 'bookings',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadAnalytics();
  }, [salon.id]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Моковые данные для демонстрации
      const mockAnalytics: AnalyticsType = {
        totalBookings: 324,
        completedBookings: 298,
        cancelledBookings: 26,
        completionRate: 92,
        totalRevenue: 198600,
        averageServicePrice: 667,
        revenueThisMonth: 45200,
        averageRating: 4.6,
        totalReviews: 87,
        newReviewsThisMonth: 15,
        favoritesCount: salon.analytics?.favoritesCount || 68,
        favoritesThisMonth: salon.analytics?.favoritesThisMonth || 18,
        lastFavoritedAt: salon.analytics?.lastFavoritedAt,
        favoriteTrend: salon.analytics?.favoriteTrend || 'up',
        favoritesToBookings: 52,
        favoritesConversionRate: 76,
        popularServices: [
          { serviceId: '1', serviceName: 'Manikúra', bookingsCount: 89, percentage: 27 },
          { serviceId: '2', serviceName: 'Pedikúra', bookingsCount: 76, percentage: 23 },
          { serviceId: '3', serviceName: 'Gelové nehty', bookingsCount: 64, percentage: 20 },
        ],
        mastersAnalytics: {
          'master1': {
            masterId: 'master1',
            masterName: 'Jana Nováková',
            totalBookings: 156,
            revenue: 98400,
            averageRating: 4.8,
            totalReviews: 42,
            favoritesCount: 38,
            conversionRate: 74,
            popularService: { name: 'Manikúra', count: 58 },
          },
          'master2': {
            masterId: 'master2',
            masterName: 'Petr Svoboda',
            totalBookings: 168,
            revenue: 100200,
            averageRating: 4.5,
            totalReviews: 45,
            favoritesCount: 30,
            conversionRate: 80,
            popularService: { name: 'Pedikúra', count: 64 },
          },
        },
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
  const mastersData = analytics.mastersAnalytics ? Object.values(analytics.mastersAnalytics) : [];

  return (
    <div className="salon-analytics space-y-6">
      {/* Header */}
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

      {/* Overall Stats Header */}
      <h3 className="text-lg font-semibold text-gray-700">{translations.overallStats}</h3>

      {/* Bookings Stats */}
      <div>
        <h4 className="text-md font-semibold mb-3">📊 {translations.bookings}</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label={translations.total} value={analytics.totalBookings.toString()} icon="📊" />
          <StatCard label={translations.completed} value={analytics.completedBookings.toString()} subValue={`${analytics.completionRate}%`} icon="✅" color="green" />
          <StatCard label={translations.cancelled} value={analytics.cancelledBookings.toString()} icon="❌" color="red" />
          <StatCard label={translations.completionRate} value={`${analytics.completionRate}%`} icon="📈" />
        </div>
      </div>

      {/* Finance Stats */}
      <div>
        <h4 className="text-md font-semibold mb-3">💰 {translations.finance}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label={translations.totalRevenue} value={`${analytics.totalRevenue.toLocaleString()} ${language === 'cs' ? 'Kč' : 'CZK'}`} icon="💰" color="green" large />
          <StatCard label={translations.averagePrice} value={`${analytics.averageServicePrice} ${language === 'cs' ? 'Kč' : 'CZK'}`} icon="💵" />
          <StatCard label={translations.revenueThisMonth} value={`${analytics.revenueThisMonth.toLocaleString()} ${language === 'cs' ? 'Kč' : 'CZK'}`} icon="📅" />
        </div>
      </div>

      {/* Ratings Stats */}
      <div>
        <h4 className="text-md font-semibold mb-3">⭐ {translations.ratings}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard label={translations.averageRating} value={`${analytics.averageRating} ⭐`} icon="⭐" large color="yellow" />
          <StatCard label={translations.totalReviews} value={analytics.totalReviews.toString()} icon="💬" />
          <StatCard label={translations.newReviewsThisMonth} value={analytics.newReviewsThisMonth.toString()} icon="🆕" />
        </div>
      </div>

      {/* Favorites Stats */}
      <div>
        <h4 className="text-md font-semibold mb-3">❤️ {translations.favorites}</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard label={translations.favoritesCount} value={`${analytics.favoritesCount} ${translations.people}`} icon="❤️" color="pink" large />
          <StatCard label={translations.favoritesThisMonth} value={`+${analytics.favoritesThisMonth}`} icon="🆕" />
          <StatCard label={translations.favoriteTrend} value={getTrendLabel(analytics.favoriteTrend)} icon={analytics.favoriteTrend === 'up' ? '📈' : analytics.favoriteTrend === 'down' ? '📉' : '➡️'} color={analytics.favoriteTrend === 'up' ? 'green' : analytics.favoriteTrend === 'down' ? 'red' : 'gray'} />
          <StatCard label={translations.lastFavorited} value={formatTimeAgo(analytics.lastFavoritedAt)} icon="🕐" />
        </div>
      </div>

      {/* Conversion Stats */}
      <div>
        <h4 className="text-md font-semibold mb-3">🎯 {translations.conversion}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatCard label={translations.favoritesToBookings} value={`${analytics.favoritesToBookings}/${analytics.favoritesCount} ${translations.people}`} subValue={`${analytics.favoritesConversionRate}%`} icon="✅" color="green" />
          <StatCard label={language === 'cs' ? 'Ještě nerezerovali' : 'Not booked yet'} value={`${analytics.favoritesCount - analytics.favoritesToBookings} ${translations.people}`} subValue={`${100 - analytics.favoritesConversionRate}%`} icon="⏳" color="orange" />
        </div>
      </div>

      {/* Popular Services */}
      {analytics.popularServices.length > 0 && (
        <div>
          <h4 className="text-md font-semibold mb-3">🔥 {translations.popularServices}</h4>
          <div className="space-y-3">
            {analytics.popularServices.map((service, index) => (
              <div key={service.serviceId} className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-300">#{index + 1}</span>
                    <span className="font-semibold">{service.serviceName}</span>
                  </div>
                  <span className="text-pink-600 font-semibold">{service.bookingsCount} {translations.bookingsCount}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${service.percentage}%` }} />
                </div>
                <div className="text-sm text-gray-600 mt-1">{service.percentage}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Masters Statistics */}
      {mastersData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-gray-700">👥 {translations.masterStats}</h3>
          <div className="space-y-4">
            {mastersData.map((masterData) => (
              <div key={masterData.masterId} className="bg-white border-2 border-gray-200 rounded-lg p-5 hover:border-pink-300 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-2xl">
                    👤
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{masterData.masterName}</h4>
                    <div className="flex items-center gap-2 text-sm">
                      <span>⭐ {masterData.averageRating}</span>
                      <span className="text-gray-400">•</span>
                      <span>{masterData.totalReviews} {language === 'cs' ? 'recenzí' : 'reviews'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-2xl font-bold text-blue-600">{masterData.totalBookings}</div>
                    <div className="text-xs text-gray-600">{translations.bookingsCount}</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-xl font-bold text-green-600">{masterData.revenue.toLocaleString()} {language === 'cs' ? 'Kč' : 'CZK'}</div>
                    <div className="text-xs text-gray-600">{translations.revenue}</div>
                  </div>
                  <div className="text-center p-2 bg-pink-50 rounded">
                    <div className="text-2xl font-bold text-pink-600">{masterData.favoritesCount}</div>
                    <div className="text-xs text-gray-600">{translations.inFavorites}</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-2xl font-bold text-purple-600">{masterData.conversionRate}%</div>
                    <div className="text-xs text-gray-600">{translations.conversionRate}</div>
                  </div>
                </div>

                {masterData.popularService && (
                  <div className="mt-3 pt-3 border-t text-sm">
                    <span className="text-gray-600">{translations.popularService}:</span>{' '}
                    <span className="font-medium">{masterData.popularService.name}</span>{' '}
                    <span className="text-gray-500">({masterData.popularService.count})</span>
                  </div>
                )}
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

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, icon, color, large }) => {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    pink: 'border-pink-200 bg-pink-50',
    orange: 'border-orange-200 bg-orange-50',
    gray: 'border-gray-200 bg-gray-50',
  };

  return (
    <div className={`p-4 rounded-lg border-2 ${color ? colorClasses[color] : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-sm text-gray-600">{label}</span>
      </div>
      <div className={`font-bold ${large ? 'text-2xl' : 'text-xl'}`}>{value}</div>
      {subValue && <div className="text-sm text-gray-600 mt-1">{subValue}</div>}
    </div>
  );
};




