/**
 * Вкладка резерваций для салона
 */

import React, { useState, useEffect } from 'react';
import { Booking } from '../../types/booking';
import { Salon, Master } from '../../types';
import { getBookings, cancelBooking } from '../../firebase/bookingServices';
import { canCancelBooking } from '../../utils/bookingLogic';
import { BookingCard } from './BookingCard';
import { BookingDetailsModal } from './BookingDetailsModal';
import { BookingSettingsForm } from '../BookingSettingsForm';
import { EmailTemplateEditor } from './EmailTemplateEditor';

interface SalonBookingsTabProps {
  salon: Salon;
  masters: Master[];
  language: 'cs' | 'en';
}

type ViewMode = 'list' | 'calendar' | 'settings' | 'emails';
type FilterStatus = 'all' | 'confirmed' | 'completed' | 'cancelled';

export const SalonBookingsTab: React.FC<SalonBookingsTabProps> = ({
  salon,
  masters,
  language,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterMaster, setFilterMaster] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const t = {
    cs: {
      title: 'Rezervace',
      viewList: 'Seznam',
      viewCalendar: 'Kalendář',
      viewSettings: 'Nastavení',
      viewEmails: 'E-maily',
      filters: 'Filtry',
      status: 'Stav',
      master: 'Mistr',
      all: 'Vše',
      allMasters: 'Všichni mistři',
      confirmed: 'Potvrzeno',
      completed: 'Dokončeno',
      cancelled: 'Zrušeno',
      noBookings: 'Zatím žádné rezervace',
      noBookingsDesc: 'Až budou klienti rezervovat služby, zobrazí se zde.',
      loading: 'Načítání...',
      cancelConfirm: 'Opravdu chcete zrušit tuto rezervaci?',
      cancelReason: 'Důvod zrušení (nepovinné)',
      cancel: 'Zrušit',
      cancelBooking: 'Zrušit rezervaci',
      total: 'Celkem',
    },
    en: {
      title: 'Bookings',
      viewList: 'List',
      viewCalendar: 'Calendar',
      viewSettings: 'Settings',
      viewEmails: 'Emails',
      filters: 'Filters',
      status: 'Status',
      master: 'Master',
      all: 'All',
      allMasters: 'All masters',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
      noBookings: 'No bookings yet',
      noBookingsDesc: 'When clients book services, they will appear here.',
      loading: 'Loading...',
      cancelConfirm: 'Are you sure you want to cancel this booking?',
      cancelReason: 'Cancel reason (optional)',
      cancel: 'Cancel',
      cancelBooking: 'Cancel booking',
      total: 'Total',
    },
  };

  const translations = t[language];

  useEffect(() => {
    if (salon?.id) {
      loadBookings();
    }
  }, [salon?.id]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filterStatus, filterMaster]);

  // Если salon не загружен, показываем сообщение
  if (!salon) {
    return (
      <div className="text-center py-8">
        <div className="max-w-md mx-auto p-6 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="text-yellow-600 text-sm">
            <strong>Načítání dat salonu...</strong>
            <br />
            Prosím počkejte, dokud se data načtou.
          </div>
        </div>
      </div>
    );
  }

  const loadBookings = async () => {
    if (!salon?.id) {
      setError('Salon data not loaded');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await getBookings(salon.id);
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

    // Фильтр по мастеру
    if (filterMaster !== 'all') {
      filtered = filtered.filter((b) => b.masterId === filterMaster);
    }

    setFilteredBookings(filtered);
  };

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCancelBooking = async (booking: Booking) => {
    const reason = prompt(translations.cancelReason);
    if (reason === null) return; // отмена

    if (!window.confirm(translations.cancelConfirm)) {
      return;
    }

    try {
      await cancelBooking(
        booking.id,
        'provider',
        reason || '',
        salon.id,
        salon.name
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

  return (
    <div className="salon-bookings-tab">
      {/* Header Section */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{translations.title}</h2>
        <p className="text-gray-600 mb-6">Spravujte rezervace vašeho salonu</p>
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
      <div className="btn-group">
        <button
          onClick={() => setViewMode('list')}
          className={`btn-primary ${viewMode === 'list' ? 'active' : ''}`}
        >
          {translations.viewList}
        </button>
        <button
          onClick={() => setViewMode('settings')}
          className={`btn-primary ${viewMode === 'settings' ? 'active' : ''}`}
        >
          {translations.viewSettings}
        </button>
        <button
          onClick={() => setViewMode('emails')}
          className={`btn-primary ${viewMode === 'emails' ? 'active' : ''}`}
        >
          {translations.viewEmails}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-semibold text-red-800 mb-1">Chyba při načítání</h3>
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Settings View */}
      {viewMode === 'settings' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <BookingSettingsForm
            providerId={salon.id}
            providerType="salon"
            language={language}
          />
        </div>
      )}

      {/* Emails View */}
      {viewMode === 'emails' && (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
          <EmailTemplateEditor
            providerId={salon.id}
            providerType="salon"
            language={language}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
          {/* Status Filters */}
          <div style={{ marginBottom: '32px' }}>
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

          {/* Master Filter */}
          {masters.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtr podle mistra</h3>
              <div className="max-w-md">
                <select
                  value={filterMaster}
                  onChange={(e) => setFilterMaster(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                >
                  <option value="all">{translations.allMasters}</option>
                  {masters.map((master) => (
                    <option key={master.id} value={master.id}>
                      {master.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
                <div className="btn-group" style={{ justifyContent: 'center' }}>
                  <button className="btn-action">
                    Přidat služby
                  </button>
                  <button className="btn-action">
                    Upravit profil
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
                    userRole="provider"
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
        userRole="provider"
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




