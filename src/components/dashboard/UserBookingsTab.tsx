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
    loadBookings();
  }, [user.id]);

  useEffect(() => {
    applyFilters();
    checkCancelPermissions();
  }, [bookings, filterStatus]);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getClientBookings(user.id);
      setBookings(data);
    } catch (err: any) {
      setError(err.message);
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
      <h2 className="text-2xl font-bold mb-6">{translations.title}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Statistics */}
      {bookings.length > 0 && (
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{bookings.length}</div>
            <div className="text-sm text-gray-600">{translations.totalBookings}</div>
          </div>
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <div className="text-xl font-bold text-green-600">
              {totalSpent.toLocaleString()} {language === 'cs' ? 'Kč' : 'CZK'}
            </div>
            <div className="text-sm text-gray-600">{translations.totalSpent}</div>
          </div>
          <div className="p-4 bg-purple-50 rounded border border-purple-200">
            <div className="text-sm font-bold text-purple-600">
              {firstBooking ? new Date(firstBooking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US') : '—'}
            </div>
            <div className="text-sm text-gray-600">{translations.firstBooking}</div>
          </div>
          <div className="p-4 bg-pink-50 rounded border border-pink-200">
            <div className="text-sm font-bold text-pink-600">
              {lastBooking ? new Date(lastBooking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US') : '—'}
            </div>
            <div className="text-sm text-gray-600">{translations.lastBooking}</div>
          </div>
        </div>
      )}

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            filterStatus === 'all'
              ? 'bg-pink-500 text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          {translations.all} ({statusCounts.all})
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            filterStatus === 'confirmed'
              ? 'bg-green-500 text-white'
              : 'bg-green-50 hover:bg-green-100 text-green-700'
          }`}
        >
          🟢 {translations.confirmed} ({statusCounts.confirmed})
        </button>
        <button
          onClick={() => setFilterStatus('completed')}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            filterStatus === 'completed'
              ? 'bg-blue-500 text-white'
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700'
          }`}
        >
          🔵 {translations.completed} ({statusCounts.completed})
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded whitespace-nowrap ${
            filterStatus === 'cancelled'
              ? 'bg-red-500 text-white'
              : 'bg-red-50 hover:bg-red-100 text-red-700'
          }`}
        >
          🔴 {translations.cancelled} ({statusCounts.cancelled})
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">{translations.loading}</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {translations.noBookings}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {translations.noBookingsDesc}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      )}

      {/* Total Count */}
      {filteredBookings.length > 0 && (
        <div className="mt-6 text-sm text-gray-600 text-center">
          {translations.total}: {filteredBookings.length}
        </div>
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




