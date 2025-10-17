/**
 * Модальное окно со списком пользователей, добавивших в избранное
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types';

interface FavoriteUserData {
  userId: string;
  userName: string;
  userEmail: string;
  addedAt: Date;
  totalBookings: number;
  lastBooking?: Date;
  totalSpent: number;
}

interface FavoritesListModalProps {
  providerId: string;
  providerType: 'salon' | 'master';
  isOpen: boolean;
  onClose: () => void;
  language: 'cs' | 'en';
}

type FilterType = 'all' | 'with_bookings' | 'without_bookings';

export const FavoritesListModal: React.FC<FavoritesListModalProps> = ({
  providerId,
  providerType,
  isOpen,
  onClose,
  language,
}) => {
  const [users, setUsers] = useState<FavoriteUserData[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [loading, setLoading] = useState(true);

  const t = {
    cs: {
      title: 'Kdo mě přidal do oblíbených',
      total: '{count} celkem',
      filters: {
        all: 'Všichni',
        with_bookings: 'S rezervacemi',
        without_bookings: 'Bez rezervací',
      },
      addedAt: 'Přidáno',
      bookings: 'Rezervace',
      lastVisit: 'Poslední návštěva',
      totalSpent: 'Celková částka',
      status: {
        regular: 'Stálý klient',
        new: 'Nový klient',
        potential: 'Potenciální klient',
      },
      noBookings: 'Ještě nerezeroval',
      neverVisited: 'Nikdy nenavštívil',
      daysAgo: 'před {days} dny',
      hoursAgo: 'před {hours} hodinami',
      justNow: 'právě teď',
      loading: 'Načítání...',
      noUsers: 'Zatím vás nikdo nepřidal do oblíbených',
      close: 'Zavřít',
      tip: '💡 Tip: Uživatelé bez rezervací jsou potenciální klienti!',
    },
    en: {
      title: 'Who added me to favorites',
      total: '{count} total',
      filters: {
        all: 'All',
        with_bookings: 'With bookings',
        without_bookings: 'Without bookings',
      },
      addedAt: 'Added',
      bookings: 'Bookings',
      lastVisit: 'Last visit',
      totalSpent: 'Total spent',
      status: {
        regular: 'Regular client',
        new: 'New client',
        potential: 'Potential client',
      },
      noBookings: 'Not booked yet',
      neverVisited: 'Never visited',
      daysAgo: '{days} days ago',
      hoursAgo: '{hours} hours ago',
      justNow: 'just now',
      loading: 'Loading...',
      noUsers: 'No one has added you to favorites yet',
      close: 'Close',
      tip: '💡 Tip: Users without bookings are potential clients!',
    },
  };

  const translations = t[language];

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, providerId]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Моковые данные для демонстрации
      const mockUsers: FavoriteUserData[] = [
        {
          userId: '1',
          userName: 'Anna Nováková',
          userEmail: 'anna@example.com',
          addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          totalBookings: 3,
          lastBooking: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          totalSpent: 1800,
        },
        {
          userId: '2',
          userName: 'Petr Dvořák',
          userEmail: 'petr@example.com',
          addedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
          totalBookings: 0,
          totalSpent: 0,
        },
        {
          userId: '3',
          userName: 'Marie Procházková',
          userEmail: 'marie@example.com',
          addedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
          totalBookings: 1,
          lastBooking: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          totalSpent: 650,
        },
        {
          userId: '4',
          userName: 'Jan Svoboda',
          userEmail: 'jan@example.com',
          addedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          totalBookings: 5,
          lastBooking: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          totalSpent: 3200,
        },
      ];

      setUsers(mockUsers);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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

  const getStatus = (user: FavoriteUserData): string => {
    if (user.totalBookings === 0) {
      return translations.status.potential;
    } else if (user.totalBookings >= 3) {
      return translations.status.regular;
    } else {
      return translations.status.new;
    }
  };

  const getStatusColor = (user: FavoriteUserData): string => {
    if (user.totalBookings === 0) {
      return 'bg-yellow-100 text-yellow-800';
    } else if (user.totalBookings >= 3) {
      return 'bg-green-100 text-green-800';
    } else {
      return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === 'with_bookings') return user.totalBookings > 0;
    if (filter === 'without_bookings') return user.totalBookings === 0;
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">👥 {translations.title}</h2>
              <p className="text-sm text-gray-600">
                {translations.total.replace('{count}', users.length.toString())}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded ${
                filter === 'all'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.filters.all} ({users.length})
            </button>
            <button
              onClick={() => setFilter('with_bookings')}
              className={`px-4 py-2 rounded ${
                filter === 'with_bookings'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.filters.with_bookings} ({users.filter((u) => u.totalBookings > 0).length})
            </button>
            <button
              onClick={() => setFilter('without_bookings')}
              className={`px-4 py-2 rounded ${
                filter === 'without_bookings'
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {translations.filters.without_bookings} ({users.filter((u) => u.totalBookings === 0).length})
            </button>
          </div>

          {/* Tip */}
          {filter === 'without_bookings' && filteredUsers.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
              {translations.tip}
            </div>
          )}

          {/* Users List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">{translations.loading}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{translations.noUsers}</div>
          ) : (
            <div className="space-y-3 mb-6">
              {filteredUsers.map((user) => (
                <div
                  key={user.userId}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-sm">
                        👤
                      </div>
                      <div>
                        <h3 className="font-semibold">{user.userName}</h3>
                        <p className="text-sm text-gray-600">{user.userEmail}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                      🏆 {getStatus(user)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600 text-xs">{translations.addedAt}:</div>
                      <div className="font-medium">{formatTimeAgo(user.addedAt)}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">{translations.bookings}:</div>
                      <div className="font-medium">
                        {user.totalBookings > 0 ? `${user.totalBookings}x` : translations.noBookings}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">{translations.lastVisit}:</div>
                      <div className="font-medium">
                        {user.lastBooking ? formatTimeAgo(user.lastBooking) : translations.neverVisited}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">{translations.totalSpent}:</div>
                      <div className="font-medium text-pink-600">
                        {user.totalSpent > 0
                          ? `${user.totalSpent} ${language === 'cs' ? 'Kč' : 'CZK'}`
                          : '—'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {translations.close}
          </button>
        </div>
      </div>
    </div>
  );
};






