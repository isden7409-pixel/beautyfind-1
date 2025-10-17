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
    if (master?.id) {
      loadBookings();
    }
  }, [master?.id]);

  useEffect(() => {
    applyFilters();
  }, [incomingBookings, outgoingBookings, filterStatus, viewMode]);

  // Если master не загружен, показываем сообщение
  if (!master) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-600 text-sm">
          Načítání dat mistra, prosím počkejte...
        </div>
      </div>
    );
  }

  const loadBookings = async () => {
    if (!master?.id) {
      setError('Master data not loaded');
      setLoading(false);
      return;
    }

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
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{translations.title}</h2>
        <p className="text-gray-600 mb-6">Spravujte své rezervace a nastavení</p>
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

      {/* View Mode Switcher */}
      <div className="btn-group" style={{ marginTop: '24px' }}>
        <button
          onClick={() => setViewMode('incoming')}
          className={`btn-primary ${viewMode === 'incoming' ? 'active' : ''}`}
        >
          {translations.incoming}
        </button>
        <button
          onClick={() => setViewMode('outgoing')}
          className={`btn-primary ${viewMode === 'outgoing' ? 'active' : ''}`}
        >
          {translations.outgoing}
        </button>
        <button
          onClick={() => setViewMode('settings')}
          className={`btn-primary ${viewMode === 'settings' ? 'active' : ''}`}
        >
          {translations.settings}
        </button>
        <button
          onClick={() => setViewMode('emails')}
          className={`btn-primary ${viewMode === 'emails' ? 'active' : ''}`}
        >
          {translations.emails}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {error}
        </div>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <BookingSettingsForm
            providerId={master.id}
            providerType="master"
            language={language}
          />
        </div>
      )}

      {/* Emails View */}
      {viewMode === 'emails' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <EmailTemplateEditor
            providerId={master.id}
            providerType="master"
            language={language}
          />
        </div>
      )}

      {/* List Views */}
      {(viewMode === 'incoming' || viewMode === 'outgoing') && !error && (
        <>
          {/* Description */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
            <h3 className="font-semibold text-blue-800">
              {viewMode === 'incoming' ? translations.incomingDesc : translations.outgoingDesc}
            </h3>
          </div>

      {/* Status Filters */}
      <div style={{ marginBottom: '32px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '400', color: '#111827', marginBottom: '16px' }}>Filtry podle stavu</h3>
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
                  {viewMode === 'incoming' ? translations.noIncomingDesc : translations.noOutgoingDesc}
                </p>
                {viewMode === 'incoming' && (
                  <div className="btn-group" style={{ justifyContent: 'center' }}>
                    <button className="btn-action">
                      Zveřejnit služby
                    </button>
                    <button className="btn-action">
                      Upravit profil
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : !loading && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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




