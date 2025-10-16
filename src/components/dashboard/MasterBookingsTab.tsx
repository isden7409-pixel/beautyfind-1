/**
 * Вкладка резерваций для мастера-фрилансера
 * Две секции: "Ke mně" и "Moje rezervace"
 */

import React, { useState, useEffect } from 'react';
import { Booking } from '../../types/booking';
import { Master } from '../../types';
import { getBookings, getClientBookings, cancelBooking, getBookingSettings } from '../../firebase/bookingServices';
import { canCancelBooking } from '../../utils/bookingLogic';
import { BookingCard } from './BookingCard';
import { BookingDetailsModal } from './BookingDetailsModal';
import { BookingSettingsForm } from '../BookingSettingsForm';
import { EmailTemplateEditor } from './EmailTemplateEditor';

interface MasterBookingsTabProps {
  master: Master;
  language: 'cs' | 'en';
}

type ViewMode = 'incoming' | 'outgoing' | 'settings' | 'emails';
type FilterStatus = 'all' | 'confirmed' | 'completed' | 'cancelled';

export const MasterBookingsTab: React.FC<MasterBookingsTabProps> = ({
  master,
  language,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('incoming');
  const [incomingBookings, setIncomingBookings] = useState<Booking[]>([]);
  const [outgoingBookings, setOutgoingBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = {
    cs: {
      title: 'Rezervace',
      incoming: 'Ke mně',
      outgoing: 'Moje rezervace',
      settings: 'Nastavení',
      emails: 'E-maily',
      incomingDesc: 'Rezervace, které přijímáte',
      outgoingDesc: 'Rezervace, které jste si udělali',
      filters: 'Filtry',
      status: 'Stav',
      all: 'Vše',
      confirmed: 'Potvrzeno',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno',
      noBookings: 'Zatím žádné rezervace',
      noIncomingDesc: 'Až budou klienti rezervovat vaše služby, zobrazí se zde.',
      noOutgoingDesc: 'Zatím jste si nevytvořili žádné rezervace u ostatních.',
      loading: 'Načítání...',
      cancelConfirm: 'Opravdu chcete zrušit tuto rezervaci?',
      cancelReason: 'Důvod zrušení (nepovinné)',
      cancel: 'Zrušit',
      cancelBooking: 'Zrušit rezervaci',
      cannotCancel: 'Nelze zrušit',
      total: 'Celkem',
    },
    en: {
      title: 'Bookings',
      incoming: 'To me',
      outgoing: 'My bookings',
      settings: 'Settings',
      emails: 'Emails',
      incomingDesc: 'Bookings you receive',
      outgoingDesc: 'Bookings you made',
      filters: 'Filters',
      status: 'Status',
      all: 'All',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      noBookings: 'No bookings yet',
      noIncomingDesc: 'When clients book your services, they will appear here.',
      noOutgoingDesc: 'You haven\'t made any bookings yet.',
      loading: 'Loading...',
      cancelConfirm: 'Are you sure you want to cancel this booking?',
      cancelReason: 'Cancel reason (optional)',
      cancel: 'Cancel',
      cancelBooking: 'Cancel booking',
      cannotCancel: 'Cannot cancel',
      total: 'Total',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadBookings();
  }, [master.id]);

  useEffect(() => {
    applyFilters();
  }, [incomingBookings, outgoingBookings, filterStatus, viewMode]);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      // Резервации КО МНЕ (я провайдер)
      const incoming = await getBookings(master.id);
      setIncomingBookings(incoming);

      // Резервации которые я сделал (я клиент)
      const outgoing = await getClientBookings(master.id);
      setOutgoingBookings(outgoing);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const sourceBookings = viewMode === 'incoming' ? incomingBookings : outgoingBookings;
    let filtered = [...sourceBookings];

    // Фильтр по статусу
    if (filterStatus !== 'all') {
      filtered = filtered.filter((b) => b.status === filterStatus);
    }

    setFilteredBookings(filtered);
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
      const cancelledBy = viewMode === 'incoming' ? 'provider' : 'client';
      await cancelBooking(
        booking.id,
        cancelledBy,
        reason || '',
        master.id,
        master.name
      );

      await loadBookings();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const checkCanCancel = async (booking: Booking): Promise<boolean> => {
    if (viewMode === 'incoming') {
      // Провайдер всегда может отменить
      return true;
    } else {
      // Клиент - проверить дедлайн
      const settings = await getBookingSettings(booking.providerId);
      const result = canCancelBooking({
        booking,
        userId: master.id,
        userRole: 'client',
        cancellationDeadline: settings?.cancellationDeadline || 180,
      });
      return result.canCancel;
    }
  };

  const currentBookings = viewMode === 'incoming' ? incomingBookings : outgoingBookings;
  const statusCounts = {
    all: currentBookings.length,
    confirmed: currentBookings.filter((b) => b.status === 'confirmed').length,
    completed: currentBookings.filter((b) => b.status === 'completed').length,
    cancelled: currentBookings.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <div className="master-bookings-tab">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>

        {/* View Mode Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('incoming')}
            className={`px-4 py-2 rounded ${
              viewMode === 'incoming'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📥 {translations.incoming}
          </button>
          <button
            onClick={() => setViewMode('outgoing')}
            className={`px-4 py-2 rounded ${
              viewMode === 'outgoing'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📤 {translations.outgoing}
          </button>
          <button
            onClick={() => setViewMode('settings')}
            className={`px-4 py-2 rounded ${
              viewMode === 'settings'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            ⚙️ {translations.settings}
          </button>
          <button
            onClick={() => setViewMode('emails')}
            className={`px-4 py-2 rounded ${
              viewMode === 'emails'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📧 {translations.emails}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <BookingSettingsForm
          providerId={master.id}
          providerType="master"
          language={language}
        />
      )}

      {/* Emails View */}
      {viewMode === 'emails' && (
        <EmailTemplateEditor
          providerId={master.id}
          providerType="master"
          language={language}
        />
      )}

      {/* List Views */}
      {(viewMode === 'incoming' || viewMode === 'outgoing') && (
        <>
          {/* Description */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            {viewMode === 'incoming' ? translations.incomingDesc : translations.outgoingDesc}
          </div>

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
                className="mx-auto icon-constrained text-gray-400"
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
                {viewMode === 'incoming' ? translations.noIncomingDesc : translations.noOutgoingDesc}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  userRole={viewMode === 'incoming' ? 'provider' : 'client'}
                  onViewDetails={handleViewDetails}
                  onCancel={handleCancelBooking}
                  canCancel={true}
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
        </>
      )}

      {/* Booking Details Modal */}
      <BookingDetailsModal
        booking={selectedBooking}
        userRole={viewMode === 'incoming' ? 'provider' : 'client'}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }}
        onCancel={handleCancelBooking}
        canCancel={true}
        language={language}
      />
    </div>
  );
};




