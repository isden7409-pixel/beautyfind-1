/**
 * Генератор iCal файлов для экспорта резерваций в календарь
 */

import { Booking } from '../types/booking';

/**
 * Форматировать дату для iCal формата
 * YYYYMMDDTHHMMSS
 */
const formatICalDate = (dateString: string, timeString: string): string => {
  const [year, month, day] = dateString.split('-');
  const [hours, minutes] = timeString.split(':');
  
  return `${year}${month}${day}T${hours}${minutes}00`;
};

/**
 * Экранировать специальные символы для iCal
 */
const escapeICalText = (text: string): string => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Генерировать iCal файл для резервации
 */
export const generateICalFile = (
  booking: Booking,
  language: 'cs' | 'en' = 'cs'
): string => {
  const startDateTime = formatICalDate(booking.date, booking.time);
  const endDateTime = formatICalDate(booking.date, booking.endTime);
  
  const serviceName = language === 'cs' 
    ? booking.serviceName_cs 
    : (booking.serviceName_en || booking.serviceName_cs);
  
  const summary = language === 'cs'
    ? `${serviceName} - ${booking.providerName}`
    : `${serviceName} - ${booking.providerName}`;
  
  const description = language === 'cs'
    ? `Rezervace služby\\n\\nSlužba: ${serviceName}\\nCena: ${booking.price} Kč\\nTelefon: ${booking.providerPhone}\\nE-mail: ${booking.providerEmail}`
    : `Service booking\\n\\nService: ${serviceName}\\nPrice: ${booking.price} CZK\\nPhone: ${booking.providerPhone}\\nE-mail: ${booking.providerEmail}`;
  
  const location = escapeICalText(booking.providerAddress);
  
  const icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BeautyFind CZ//Booking System//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@beautyfind.cz`,
    `DTSTAMP:${formatICalDate(new Date().toISOString().split('T')[0], '00:00')}`,
    `DTSTART:${startDateTime}`,
    `DTEND:${endDateTime}`,
    `SUMMARY:${escapeICalText(summary)}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${language === 'cs' ? 'Připomínka rezervace' : 'Booking reminder'}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
  
  return icalContent;
};

/**
 * Скачать iCal файл
 */
export const downloadICalFile = (
  booking: Booking,
  language: 'cs' | 'en' = 'cs'
): void => {
  const icalContent = generateICalFile(booking, language);
  const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `booking_${booking.id}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  window.URL.revokeObjectURL(url);
};

/**
 * Создать ссылку на Google Calendar
 */
export const createGoogleCalendarLink = (
  booking: Booking,
  language: 'cs' | 'en' = 'cs'
): string => {
  const serviceName = language === 'cs' 
    ? booking.serviceName_cs 
    : (booking.serviceName_en || booking.serviceName_cs);
  
  const title = `${serviceName} - ${booking.providerName}`;
  
  const description = language === 'cs'
    ? `Rezervace služby\n\nSlužba: ${serviceName}\nCena: ${booking.price} Kč\nTelefon: ${booking.providerPhone}\nE-mail: ${booking.providerEmail}`
    : `Service booking\n\nService: ${serviceName}\nPrice: ${booking.price} CZK\nPhone: ${booking.providerPhone}\nE-mail: ${booking.providerEmail}`;
  
  const [year, month, day] = booking.date.split('-');
  const [startHours, startMinutes] = booking.time.split(':');
  const [endHours, endMinutes] = booking.endTime.split(':');
  
  const startDate = `${year}${month}${day}T${startHours}${startMinutes}00`;
  const endDate = `${year}${month}${day}T${endHours}${endMinutes}00`;
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: description,
    location: booking.providerAddress,
    dates: `${startDate}/${endDate}`,
  });
  
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};




