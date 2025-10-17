/**
 * Вкладка резерваций для клиента
 */

import React, { useState, useEffect } from 'react';
import { Booking } from '../../types/booking';
import { UserProfile } from '../../types';
import { getClientBookings, cancelBooking, getBookingSettings } from '../../firebase/bookingServices';
import { canCancelBooking } from '../../utils/bookingLogic';
import { BookingCard } from './BookingCard';
import { BookingDetailsModal } from './BookingDetailsModal';

interface UserBookingsTabProps {
  user: UserProfile;
  language: 'cs' | 'en';
}

type FilterStatus = 'all' | 'confirmed' | 'completed' | 'cancelled';

export const UserBookingsTab: React.FC<UserBookingsTabProps> = ({
  user,
  language,
}) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelPermissions, setCancelPermissions] = useState<Map<string, boolean>>(new Map());

  const t = {
    cs: {
      title: 'Moje rezervace',
      filters: 'Filtry',
      status: 'Stav',
      all: 'Vše',
      confirmed: 'Potvrzeno',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno',
      upcoming: 'Nadcházející',
      past: 'Minulé',
      noBookings: 'Zatím žádné rezervace',
      noBookingsDesc: 'Jakmile si rezervujete službu, zobrazí se zde.',
      loading: 'Načítání...',
      cancelConfirm: 'Opravdu chcete zrušit tuto rezervaci?',
      cancelReason: 'Důvod zrušení (nepovinné)',
      cancel: 'Zrušit',
      cancelBooking: 'Zrušit rezervaci',
      cannotCancel: 'Nelze zrušit (příliš pozdě)',
      total: 'Celkem',
      statistics: 'Statistiky',
      totalBookings: 'Celkem návštěv',
      totalSpent: 'Celková částka',
      favoriteProvider: 'Oblíbený poskytovatel',
      firstBooking: 'První návštěva',
      lastBooking: 'Poslední návštěva',
    },
    en: {
      title: 'My Bookings',
      filters: 'Filters',
      status: 'Status',
      all: 'All',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      upcoming: 'Upcoming',
      past: 'Past',
      noBookings: 'No bookings yet',
      noBookingsDesc: 'When you book a service, it will appear here.',
      loading: 'Loading...',
      cancelConfirm: 'Are you sure you want to cancel this booking?',
      cancelReason: 'Cancel reason (optional)',
      cancel: 'Cancel',
      cancelBooking: 'Cancel booking',
      cannotCancel: 'Cannot cancel (too late)',
      total: 'Total',
      statistics: 'Statistics',
      totalBookings: 'Total visits',
      totalSpent: 'Total spent',
      favoriteProvider: 'Favorite provider',
      firstBooking: 'First visit',
      lastBooking: 'Last visit',
    },
  };

  const translations = t[language];

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user?.id]);

  useEffect(() => {
    applyFilters();
    checkCancelPermissions();
  }, [bookings, filterStatus]);

  // Если user не загружен, показываем сообщение
  if (!user) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-yellow-600 text-sm">
            <strong>Načítání dat uživatele...</strong>
            <br />
            Prosím počkejte, dokud se data načtou.
          </div>
        </div>
      </div>
    );
  }

  const loadBookings = async () => {
    if (!user?.id) {
      setError('User data not loaded');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getClientBookings(user.id);
      setBookings(data);
    } catch (err: any) {
      console.error('Error loading bookings:', err);
      // Проверяем, если это ошибка индекса
      if (err.message && err.message.includes('index')) {
        setError('Systém se připravuje, prosím počkejte 2-3 minuty...');
      } else {
        setError('Načítání rezervací, prosím počkejte...');
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Фильтр по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);
  };

  const checkCancelPermissions = async () => {
    const permissions = new Map<string, boolean>();

    for (const booking of bookings) {
      if (booking.status !== 'confirmed') {
        permissions.set(booking.id, false);
        continue;
      }

      try {
        const settings = await getBookingSettings(booking.providerId);
        const result = canCancelBooking({
          booking,
          userId: user.id,
          userRole: 'client',
          cancellationDeadline: settings?.cancellationDeadline || 180,
        });
        permissions.set(booking.id, result.canCancel);
      } catch {
        permissions.set(booking.id, false);
      }
    }

    setCancelPermissions(permissions);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCancelBooking = async (booking: Booking) => {
    const reason = prompt(translations.cancelReason);
    if (reason === null) return;

    if (!window.confirm(translations.cancelConfirm)) {
      return;
    }

    try {
      await cancelBooking(
        booking.id,
        'client',
        reason || '',
        user.id,
        user.name
      );

      await loadBookings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const statusCounts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    completed: bookings.filter((b) => b.status === 'completed').length,
    cancelled: bookings.filter((b) => b.status === 'cancelled').length,
  };

  // Статистика
  const totalSpent = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + b.price, 0);

  const firstBooking = bookings.length > 0
    ? bookings.reduce((earliest, b) => (b.createdAt < earliest.createdAt ? b : earliest))
    : null;

  const lastBooking = bookings.length > 0
    ? bookings.reduce((latest, b) => (b.createdAt > latest.createdAt ? b : latest))
    : null;

  return (
    <div className="user-bookings-tab">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{translations.title}</h2>
        <p className="text-gray-600 mb-6">Spravujte své rezervace</p>
      </div>

      {/* Loading State - показываем сразу под заголовком */}
      {loading && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-lg border border-pink-200">
            <div className="animate-spin w-4 h-4 border-2 border-pink-500 border-t-transparent rounded-full"></div>
            <span className="text-pink-700 text-sm font-medium">{translations.loading}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-1">Chyba při načítání</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Statistics */}
      {bookings.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiky</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
              <div className="text-3xl font-bold text-blue-600 mb-1">{bookings.length}</div>
              <div className="text-sm text-blue-700 font-medium">{translations.totalBookings}</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {totalSpent.toLocaleString()} {language === 'cs' ? 'Kč' : 'CZK'}
              </div>
              <div className="text-sm text-green-700 font-medium">{translations.totalSpent}</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
              <div className="text-sm font-bold text-purple-600 mb-1">
                {firstBooking ? new Date(firstBooking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US') : '—'}
              </div>
              <div className="text-sm text-purple-700 font-medium">{translations.firstBooking}</div>
            </div>
            <div className="p-6 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl border-2 border-pink-200">
              <div className="text-sm font-bold text-pink-600 mb-1">
                {lastBooking ? new Date(lastBooking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US') : '—'}
              </div>
              <div className="text-sm text-pink-700 font-medium">{translations.lastBooking}</div>
            </div>
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div style={{ marginBottom: '32px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#111827', marginBottom: '16px' }}>Filtry podle stavu</h3>
        <div className="btn-group">
          <button
            onClick={() => setFilterStatus('all')}
            className={`btn-status status-all ${filterStatus === 'all' ? 'active' : ''}`}
          >
            <span className="status-dot status-dot-gray"></span>
            {translations.all} ({statusCounts.all})
          </button>
          <button
            onClick={() => setFilterStatus('confirmed')}
            className={`btn-status status-confirmed ${filterStatus === 'confirmed' ? 'active' : ''}`}
          >
            <span className="status-dot status-dot-green"></span>
            {translations.confirmed} ({statusCounts.confirmed})
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`btn-status status-completed ${filterStatus === 'completed' ? 'active' : ''}`}
          >
            <span className="status-dot status-dot-blue"></span>
            {translations.completed} ({statusCounts.completed})
          </button>
          <button
            onClick={() => setFilterStatus('cancelled')}
            className={`btn-status status-cancelled ${filterStatus === 'cancelled' ? 'active' : ''}`}
          >
            <span className="status-dot status-dot-red"></span>
            {translations.cancelled} ({statusCounts.cancelled})
          </button>
        </div>
      </div>

      {/* Bookings List */}
      {!loading && filteredBookings.length === 0 ? (
        <div className="text-center py-8">
          <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {translations.noBookings}
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              {translations.noBookingsDesc}
            </p>
        <div className="btn-group" style={{ justifyContent: 'flex-start', marginTop: '32px' }}>
          <button className="btn-action">
            Najít služby
          </button>
          <button className="btn-action">
            Zobrazit salony
          </button>
          <button className="btn-action">
            Zobrazit mistry
          </button>
        </div>
          </div>
        </div>
      ) : !loading && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                userRole="client"
                onViewDetails={handleViewDetails}
                onCancel={handleCancelBooking}
                canCancel={cancelPermissions.get(booking.id) || false}
                language={language}
              />
            ))}
          </div>

          {/* Total Count */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-50 text-pink-700 rounded-full border border-pink-200">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="font-semibold">{translations.total}: {filteredBookings.length}</span>
            </div>
          </div>
        </>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        userRole="client"
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
        onCancel={handleCancelBooking}
        canCancel={selectedBooking ? cancelPermissions.get(selectedBooking.id) || false : false}
        language={language}
      />
    </div>
  );
};




