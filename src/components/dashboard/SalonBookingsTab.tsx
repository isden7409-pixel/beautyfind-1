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
    loadBookings();
  }, [salon.id]);

  useEffect(() => {
    applyFilters();
  }, [bookings, filterStatus, filterMaster]);

  const loadBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBookings(salon.id);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>

        {/* View Mode Switcher */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded ${
              viewMode === 'list'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📋 {translations.viewList}
          </button>
          <button
            onClick={() => setViewMode('settings')}
            className={`px-4 py-2 rounded ${
              viewMode === 'settings'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            ⚙️ {translations.viewSettings}
          </button>
          <button
            onClick={() => setViewMode('emails')}
            className={`px-4 py-2 rounded ${
              viewMode === 'emails'
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            📧 {translations.viewEmails}
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
          providerId={salon.id}
          providerType="salon"
          language={language}
        />
      )}

      {/* Emails View */}
      {viewMode === 'emails' && (
        <EmailTemplateEditor
          providerId={salon.id}
          providerType="salon"
          language={language}
        />
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <>
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

          {/* Master Filter */}
          {masters.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                {translations.master}:
              </label>
              <select
                value={filterMaster}
                onChange={(e) => setFilterMaster(e.target.value)}
                className="w-full md:w-64 p-2 border rounded focus:ring-2 focus:ring-pink-500"
              >
                <option value="all">{translations.allMasters}</option>
                {masters.map((master) => (
                  <option key={master.id} value={master.id}>
                    {master.name}
                  </option>
                ))}
              </select>
            </div>
          )}

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
                  userRole="provider"
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




