/**
 * Карточка резервации для дашбордов - УЛУЧШЕННЫЙ ДИЗАЙН
 */

import React from 'react';
import { Booking } from '../../types/booking';

interface BookingCardProps {
  booking: Booking;
  userRole: 'client' | 'provider';
  onViewDetails: (booking: Booking) => void;
  onCancel?: (booking: Booking) => void;
  canCancel?: boolean;
  language: 'cs' | 'en';
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  userRole,
  onViewDetails,
  onCancel,
  canCancel,
  language,
}) => {
  const t = {
    cs: {
      viewDetails: 'Zobrazit',
      cancel: 'Zrušit',
      service: 'Služba',
      client: 'Klient',
      provider: 'Poskytovatel',
      master: 'Mistr',
      date: 'Datum',
      time: 'Čas',
      price: 'Cena',
      duration: 'Doba trvání',
      status: {
        confirmed: 'Potvrzeno',
        cancelled: 'Zrušeno',
        completed: 'Dokončeno',
        pending: 'Čekající',
      },
    },
    en: {
      viewDetails: 'View',
      cancel: 'Cancel',
      service: 'Service',
      client: 'Client',
      provider: 'Provider',
      master: 'Master',
      date: 'Date',
      time: 'Time',
      price: 'Price',
      duration: 'Duration',
      status: {
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed',
        pending: 'Pending',
      },
    },
  };

  const translations = t[language];

  const statusConfig = {
    confirmed: {
      color: 'bg-green-50 border-green-200',
      textColor: 'text-green-800',
      icon: '✅',
      badge: 'bg-green-100 text-green-800',
    },
    cancelled: {
      color: 'bg-red-50 border-red-200',
      textColor: 'text-red-800',
      icon: '❌',
      badge: 'bg-red-100 text-red-800',
    },
    completed: {
      color: 'bg-blue-50 border-blue-200',
      textColor: 'text-blue-800',
      icon: '🎉',
      badge: 'bg-blue-100 text-blue-800',
    },
    pending: {
      color: 'bg-yellow-50 border-yellow-200',
      textColor: 'text-yellow-800',
      icon: '⏳',
      badge: 'bg-yellow-100 text-yellow-800',
    },
  };

  const config = statusConfig[booking.status] || statusConfig.pending;

  const serviceName = language === 'cs' ? booking.serviceName_cs : (booking.serviceName_en || booking.serviceName_cs);
  const dateFormatted = new Date(booking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 ${config.color}`}>
      {/* Header with Status */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.badge}`}>
              {translations.status[booking.status]}
            </div>
            <div className={`text-sm font-medium mt-1 ${config.textColor}`}>
              {dateFormatted}
            </div>
            <div className={`text-sm ${config.textColor} opacity-75`}>
              {booking.time}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 mb-6">
        {/* Service Info */}
        <div className="bg-white/50 rounded-lg p-3">
          <div className="text-xs font-medium text-gray-600 mb-1">{translations.service}</div>
          <div className="font-semibold text-gray-900">{serviceName}</div>
        </div>

        {/* User Info */}
        <div className="bg-white/50 rounded-lg p-3">
          {userRole === 'client' ? (
            <>
              <div className="text-xs font-medium text-gray-600 mb-1">{translations.provider}</div>
              <div className="font-semibold text-gray-900">{booking.providerName}</div>
              {booking.masterName && (
                <div className="text-sm text-gray-600 mt-1">
                  {translations.master}: {booking.masterName}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xs font-medium text-gray-600 mb-1">{translations.client}</div>
              <div className="font-semibold text-gray-900">{booking.clientName}</div>
              <div className="text-sm text-gray-600 mt-1">{booking.clientPhone}</div>
            </>
          )}
        </div>

        {/* Price and Duration */}
        <div className="flex justify-between items-center bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-600">{translations.duration}:</span>
            <span className="font-semibold text-gray-900">{booking.duration} min</span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-600">
              {booking.price} {language === 'cs' ? 'Kč' : 'CZK'}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          {translations.viewDetails}
        </button>
        {canCancel && onCancel && booking.status === 'confirmed' && (
          <button
            onClick={() => onCancel(booking)}
            className="px-4 py-3 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            {translations.cancel}
          </button>
        )}
      </div>
    </div>
  );
};






