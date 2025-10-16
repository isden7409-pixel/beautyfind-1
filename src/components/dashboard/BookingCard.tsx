/**
 * Карточка резервации для дашбордов
 */

import React from 'react';
import { Booking } from '../../types/booking';
import { PopularityBadge } from '../PopularityBadge';

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
      status: {
        confirmed: 'Potvrzeno',
        cancelled: 'Zrušeno',
        completed: 'Dokončeno',
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
      status: {
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed',
      },
    },
  };

  const translations = t[language];

  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
  };

  const statusEmojis = {
    confirmed: '🟢',
    cancelled: '🔴',
    completed: '🔵',
  };

  const serviceName = language === 'cs' ? booking.serviceName_cs : (booking.serviceName_en || booking.serviceName_cs);
  const dateFormatted = new Date(booking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`border rounded-lg p-4 hover:shadow-md transition-shadow ${statusColors[booking.status]}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{statusEmojis[booking.status]}</span>
            <span className="font-semibold text-sm">
              {translations.status[booking.status]}
            </span>
          </div>
          <div className="text-xs text-gray-600">
            {dateFormatted}, {booking.time}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-2 mb-4">
        {/* Если клиент смотрит - показываем провайдера */}
        {userRole === 'client' && (
          <div>
            <div className="text-xs text-gray-600">{translations.provider}:</div>
            <div className="font-medium">{booking.providerName}</div>
            {booking.masterName && (
              <div className="text-sm text-gray-600">{translations.master}: {booking.masterName}</div>
            )}
          </div>
        )}

        {/* Если провайдер смотрит - показываем клиента */}
        {userRole === 'provider' && (
          <div>
            <div className="text-xs text-gray-600">{translations.client}:</div>
            <div className="font-medium">{booking.clientName}</div>
            <div className="text-sm text-gray-600">{booking.clientPhone}</div>
          </div>
        )}

        {/* Услуга */}
        <div>
          <div className="text-xs text-gray-600">{translations.service}:</div>
          <div className="font-medium">{serviceName}</div>
        </div>

        {/* Цена и длительность */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{booking.duration} min</span>
          <span className="font-semibold text-pink-600">
            {booking.price} {language === 'cs' ? 'Kč' : 'CZK'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails(booking)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          {translations.viewDetails}
        </button>
        {canCancel && onCancel && booking.status === 'confirmed' && (
          <button
            onClick={() => onCancel(booking)}
            className="px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          >
            {translations.cancel}
          </button>
        )}
      </div>
    </div>
  );
};




