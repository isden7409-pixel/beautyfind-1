/**
 * Модальное окно с деталями резервации
 */

import React, { useState, useEffect } from 'react';
import { Booking, BookingHistoryEntry } from '../../types/booking';
import { getBookingHistory } from '../../firebase/bookingServices';
import { downloadICalFile, createGoogleCalendarLink } from '../../utils/icalGenerator';

interface BookingDetailsModalProps {
  booking: Booking | null;
  userRole: 'client' | 'provider';
  isOpen: boolean;
  onClose: () => void;
  onCancel?: (booking: Booking) => void;
  canCancel?: boolean;
  language: 'cs' | 'en';
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  userRole,
  isOpen,
  onClose,
  onCancel,
  canCancel,
  language,
}) => {
  const [history, setHistory] = useState<BookingHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const t = {
    cs: {
      title: 'Detaily rezervace',
      bookingInfo: 'Informace o rezervaci',
      service: 'Služba',
      description: 'Popis',
      date: 'Datum',
      time: 'Čas',
      duration: 'Délka',
      price: 'Cena',
      status: 'Stav',
      client: 'Klient',
      provider: 'Poskytovatel',
      master: 'Mistr',
      salon: 'Salon',
      address: 'Adresa',
      phone: 'Telefon',
      email: 'E-mail',
      note: 'Poznámka',
      clientNote: 'Poznámka klienta',
      providerNote: 'Interní poznámka',
      history: 'Historie',
      cancelledBy: 'Zrušil',
      cancelReason: 'Důvod zrušení',
      createdAt: 'Vytvořeno',
      completedAt: 'Dokončeno',
      cancelledAt: 'Zrušeno',
      addToCalendar: 'Přidat do kalendáře',
      downloadIcal: 'Stáhnout ICS',
      googleCalendar: 'Google kalendář',
      cancel: 'Zrušit rezervaci',
      close: 'Zavřít',
      minutes: 'min',
      statusTypes: {
        confirmed: 'Potvrzeno',
        cancelled: 'Zrušeno',
        completed: 'Dokončeno',
      },
      actions: {
        created: 'Vytvořeno',
        cancelled: 'Zrušeno',
        completed: 'Dokončeno',
        time_changed: 'Čas změněn',
        confirmed: 'Potvrzeno',
      },
    },
    en: {
      title: 'Booking Details',
      bookingInfo: 'Booking Information',
      service: 'Service',
      description: 'Description',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      price: 'Price',
      status: 'Status',
      client: 'Client',
      provider: 'Provider',
      master: 'Master',
      salon: 'Salon',
      address: 'Address',
      phone: 'Phone',
      email: 'Email',
      note: 'Note',
      clientNote: 'Client note',
      providerNote: 'Internal note',
      history: 'History',
      cancelledBy: 'Cancelled by',
      cancelReason: 'Cancel reason',
      createdAt: 'Created',
      completedAt: 'Completed',
      cancelledAt: 'Cancelled',
      addToCalendar: 'Add to Calendar',
      downloadIcal: 'Download ICS',
      googleCalendar: 'Google Calendar',
      cancel: 'Cancel booking',
      close: 'Close',
      minutes: 'min',
      statusTypes: {
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed',
      },
      actions: {
        created: 'Created',
        cancelled: 'Cancelled',
        completed: 'Completed',
        time_changed: 'Time changed',
        confirmed: 'Confirmed',
      },
    },
  };

  const translations = t[language];

  useEffect(() => {
    if (isOpen && booking) {
      loadHistory();
    }
  }, [isOpen, booking]);

  const loadHistory = async () => {
    if (!booking) return;

    setLoadingHistory(true);
    try {
      const data = await getBookingHistory(booking.id);
      setHistory(data);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDownloadIcal = () => {
    if (booking) {
      downloadICalFile(booking, language);
    }
  };

  const handleGoogleCalendar = () => {
    if (booking) {
      const link = createGoogleCalendarLink(booking, language);
      window.open(link, '_blank');
    }
  };

  if (!isOpen || !booking) return null;

  const serviceName = language === 'cs' ? booking.serviceName_cs : (booking.serviceName_en || booking.serviceName_cs);
  const serviceDescription = language === 'cs'
    ? booking.serviceDescription_cs
    : (booking.serviceDescription_en || booking.serviceDescription_cs);

  const dateFormatted = new Date(booking.date).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{translations.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                booking.status === 'confirmed'
                  ? 'bg-green-100 text-green-800'
                  : booking.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {translations.statusTypes[booking.status]}
            </span>
          </div>

          {/* Booking Info */}
          <div className="bg-gray-50 rounded p-4 mb-4">
            <h3 className="font-semibold mb-3">{translations.bookingInfo}</h3>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600">{translations.service}:</span>
                <span className="col-span-2 font-medium">{serviceName}</span>
              </div>

              {serviceDescription && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-gray-600">{translations.description}:</span>
                  <span className="col-span-2 text-gray-700">{serviceDescription}</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600">{translations.date}:</span>
                <span className="col-span-2 font-medium">{dateFormatted}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600">{translations.time}:</span>
                <span className="col-span-2 font-medium">{booking.time} - {booking.endTime}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600">{translations.duration}:</span>
                <span className="col-span-2">{booking.duration} {translations.minutes}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <span className="text-gray-600">{translations.price}:</span>
                <span className="col-span-2 font-bold text-pink-600">
                  {booking.price} {language === 'cs' ? 'Kč' : 'CZK'}
                </span>
              </div>
            </div>
          </div>

          {/* Client/Provider Info */}
          {userRole === 'client' ? (
            <div className="bg-blue-50 rounded p-4 mb-4">
              <h3 className="font-semibold mb-3">{translations.provider}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{booking.providerName}</span>
                </div>
                {booking.masterName && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">{translations.master}:</span>
                    <span>{booking.masterName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span>📍</span>
                  <span>{booking.providerAddress}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{booking.providerPhone}</span>
                </div>
                {booking.providerEmail && (
                  <div className="flex items-center gap-2">
                    <span>📧</span>
                    <span>{booking.providerEmail}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 rounded p-4 mb-4">
              <h3 className="font-semibold mb-3">{translations.client}</h3>
              <div className="space-y-2 text-sm">
                <div className="font-medium">{booking.clientName}</div>
                <div className="flex items-center gap-2">
                  <span>📞</span>
                  <span>{booking.clientPhone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>📧</span>
                  <span>{booking.clientEmail}</span>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {(booking.clientNote || booking.providerNote) && (
            <div className="bg-yellow-50 rounded p-4 mb-4">
              {booking.clientNote && (
                <div className="mb-2">
                  <div className="text-sm font-medium text-gray-700">{translations.clientNote}:</div>
                  <div className="text-sm text-gray-600">{booking.clientNote}</div>
                </div>
              )}
              {booking.providerNote && userRole === 'provider' && (
                <div>
                  <div className="text-sm font-medium text-gray-700">{translations.providerNote}:</div>
                  <div className="text-sm text-gray-600">{booking.providerNote}</div>
                </div>
              )}
            </div>
          )}

          {/* Cancellation info */}
          {booking.status === 'cancelled' && (
            <div className="bg-red-50 rounded p-4 mb-4">
              <div className="space-y-2 text-sm">
                {booking.cancelledBy && (
                  <div>
                    <span className="font-medium">{translations.cancelledBy}:</span>{' '}
                    {booking.cancelledBy === 'client' ? translations.client : translations.provider}
                  </div>
                )}
                {booking.cancelReason && (
                  <div>
                    <span className="font-medium">{translations.cancelReason}:</span>{' '}
                    {booking.cancelReason}
                  </div>
                )}
                {booking.cancelledAt && (
                  <div>
                    <span className="font-medium">{translations.cancelledAt}:</span>{' '}
                    {new Date(booking.cancelledAt).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History */}
          {history.length > 0 && (
            <div className="bg-gray-50 rounded p-4 mb-4">
              <h3 className="font-semibold mb-3">{translations.history}</h3>
              <div className="space-y-2 text-sm">
                {history.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-gray-600">
                    <span>•</span>
                    <div>
                      <span className="font-medium">{translations.actions[entry.action]}</span>
                      {' '}{language === 'cs' ? 'uživatelem' : 'by'} {entry.performedByName}
                      {' '}{new Date(entry.timestamp).toLocaleString(language === 'cs' ? 'cs-CZ' : 'en-US')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Calendar */}
          {booking.status === 'confirmed' && (
            <div className="mb-4">
              <h3 className="font-semibold mb-3">{translations.addToCalendar}</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleDownloadIcal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  📥 {translations.downloadIcal}
                </button>
                <button
                  onClick={handleGoogleCalendar}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm"
                >
                  📅 {translations.googleCalendar}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded hover:bg-gray-50"
            >
              {translations.close}
            </button>
            {canCancel && onCancel && booking.status === 'confirmed' && (
              <button
                onClick={() => {
                  onCancel(booking);
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                {translations.cancel}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};




