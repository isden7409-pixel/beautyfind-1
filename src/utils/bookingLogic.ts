/**
 * Логика бронирования - расчет доступных слотов, валидация
 */

import {
  Schedule,
  ScheduleBreak,
  Booking,
  BookingSettings,
  BlockedTime,
  TimeSlot,
  AvailabilityCheck,
} from '../types/booking';
import {
  getScheduleByDate,
  getBookingsByDate,
  getBlockedTimes,
  getBookingSettings,
} from '../firebase/bookingServices';

// ============================================================================
// ВРЕМЯ И СЛОТЫ
// ============================================================================

/**
 * Генерация временных слотов с заданным шагом
 */
export const generateTimeSlots = (
  startTime: string,
  endTime: string,
  step: number = 15
): string[] => {
  const slots: string[] = [];
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);

  let currentHour = startHour;
  let currentMinute = startMinute;

  while (
    currentHour < endHour ||
    (currentHour === endHour && currentMinute < endMinute)
  ) {
    slots.push(
      `${currentHour.toString().padStart(2, '0')}:${currentMinute
        .toString()
        .padStart(2, '0')}`
    );

    currentMinute += step;
    if (currentMinute >= 60) {
      currentHour += Math.floor(currentMinute / 60);
      currentMinute = currentMinute % 60;
    }
  }

  return slots;
};

/**
 * Проверка попадает ли время в паузу
 */
export const isTimeInBreak = (
  time: string,
  breaks: ScheduleBreak[]
): boolean => {
  if (!breaks || breaks.length === 0) {
    return false;
  }

  for (const breakTime of breaks) {
    if (time >= breakTime.start && time < breakTime.end) {
      return true;
    }
  }

  return false;
};

/**
 * Проверка попадает ли время в блокировку
 */
export const isTimeBlocked = (
  time: string,
  blockedTimes: BlockedTime[]
): boolean => {
  if (!blockedTimes || blockedTimes.length === 0) {
    return false;
  }

  for (const blocked of blockedTimes) {
    if (time >= blocked.startTime && time < blocked.endTime) {
      return true;
    }
  }

  return false;
};

/**
 * Проверка занят ли слот резервацией
 */
export const isSlotOccupied = (
  time: string,
  duration: number,
  bookings: Booking[]
): boolean => {
  if (!bookings || bookings.length === 0) {
    return false;
  }

  const [hours, minutes] = time.split(':').map(Number);
  const slotStart = hours * 60 + minutes;
  const slotEnd = slotStart + duration;

  for (const booking of bookings) {
    const [bookingHours, bookingMinutes] = booking.time.split(':').map(Number);
    const bookingStart = bookingHours * 60 + bookingMinutes;
    const bookingEnd = bookingStart + booking.duration;

    // Проверка пересечения интервалов
    if (
      (slotStart >= bookingStart && slotStart < bookingEnd) ||
      (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
      (slotStart <= bookingStart && slotEnd >= bookingEnd)
    ) {
      return true;
    }
  }

  return false;
};

/**
 * Проверка что услуга поместится во время работы
 */
export const fitsInWorkingHours = (
  time: string,
  duration: number,
  endTime: string
): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const [endHours, endMinutes] = endTime.split(':').map(Number);

  const serviceEnd = hours * 60 + minutes + duration;
  const workEnd = endHours * 60 + endMinutes;

  return serviceEnd <= workEnd;
};

/**
 * Проверка минимального времени до услуги
 */
export const isAdvanceTimeValid = (
  date: string,
  time: string,
  minAdvanceMinutes: number
): boolean => {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);
  const serviceDateTime = new Date(date);
  serviceDateTime.setHours(hours, minutes, 0, 0);

  const diffMinutes = (serviceDateTime.getTime() - now.getTime()) / (1000 * 60);

  return diffMinutes >= minAdvanceMinutes;
};

// ============================================================================
// ДОСТУПНЫЕ СЛОТЫ
// ============================================================================

/**
 * Получить все доступные временные слоты на дату
 */
export const getAvailableTimeSlots = async (params: {
  providerId: string;
  providerType: 'salon' | 'master';
  masterId?: string;
  date: string;
  duration: number;
}): Promise<TimeSlot[]> => {
  try {
    // 1. Получить расписание на дату
    const schedule = await getScheduleByDate(
      params.providerId,
      params.providerType,
      params.date,
      params.masterId
    );

    if (!schedule || !schedule.isWorking || !schedule.workingHours) {
      return [];
    }

    // 2. Получить существующие резервации
    const bookings = await getBookingsByDate(
      params.providerId,
      params.date,
      params.masterId
    );

    // 3. Получить блокировки времени
    const blockedTimes = await getBlockedTimes(
      params.providerId,
      params.date,
      params.masterId
    );

    // 4. Получить настройки резервации
    const settings = await getBookingSettings(params.providerId);

    // 5. Генерировать все возможные слоты (шаг 15 минут)
    const allSlots = generateTimeSlots(
      schedule.workingHours.start,
      schedule.workingHours.end,
      15
    );

    // 6. Проверить каждый слот
    const timeSlots: TimeSlot[] = allSlots.map(time => {
      // Проверка: в паузе?
      if (isTimeInBreak(time, schedule.breaks || [])) {
        return {
          time,
          available: false,
          reason: 'break',
        };
      }

      // Проверка: заблокировано?
      if (isTimeBlocked(time, blockedTimes)) {
        return {
          time,
          available: false,
          reason: 'blocked',
        };
      }

      // Проверка: занято резервацией?
      if (isSlotOccupied(time, params.duration, bookings)) {
        return {
          time,
          available: false,
          reason: 'booked',
        };
      }

      // Проверка: услуга поместится до конца рабочего дня?
      if (!fitsInWorkingHours(time, params.duration, schedule.workingHours!.end)) {
        return {
          time,
          available: false,
          reason: 'outside_hours',
        };
      }

      // Проверка: минимальное время до услуги
      if (
        !isAdvanceTimeValid(
          params.date,
          time,
          settings?.minAdvanceBookingTime || 120
        )
      ) {
        return {
          time,
          available: false,
          reason: 'too_late',
        };
      }

      // Слот доступен!
      return {
        time,
        available: true,
      };
    });

    return timeSlots;
  } catch (error) {
    console.error('Error getting available time slots:', error);
    throw error;
  }
};

/**
 * Получить только доступные слоты (упрощенная версия)
 */
export const getAvailableTimes = async (params: {
  providerId: string;
  providerType: 'salon' | 'master';
  masterId?: string;
  date: string;
  duration: number;
}): Promise<string[]> => {
  const allSlots = await getAvailableTimeSlots(params);
  return allSlots.filter(slot => slot.available).map(slot => slot.time);
};

// ============================================================================
// ВАЛИДАЦИЯ
// ============================================================================

/**
 * Проверить можно ли создать резервацию
 */
export const validateBooking = async (params: {
  providerId: string;
  providerType: 'salon' | 'master';
  masterId?: string;
  serviceId: string;
  date: string;
  time: string;
  duration: number;
}): Promise<AvailabilityCheck> => {
  try {
    // 1. Проверить расписание
    const schedule = await getScheduleByDate(
      params.providerId,
      params.providerType,
      params.date,
      params.masterId
    );

    if (!schedule || !schedule.isWorking) {
      return {
        valid: false,
        error: 'Провайдер не работает в этот день',
      };
    }

    if (!schedule.workingHours) {
      return {
        valid: false,
        error: 'Не установлено рабочее время',
      };
    }

    // 2. Проверить что время в рамках рабочих часов
    if (
      params.time < schedule.workingHours.start ||
      params.time >= schedule.workingHours.end
    ) {
      return {
        valid: false,
        error: 'Время вне рабочих часов',
      };
    }

    // 3. Проверить что не в паузе
    if (isTimeInBreak(params.time, schedule.breaks || [])) {
      return {
        valid: false,
        error: 'Время попадает в паузу',
      };
    }

    // 4. Проверить блокировки
    const blockedTimes = await getBlockedTimes(
      params.providerId,
      params.date,
      params.masterId
    );

    if (isTimeBlocked(params.time, blockedTimes)) {
      return {
        valid: false,
        error: 'Время заблокировано',
      };
    }

    // 5. Проверить что время свободно
    const bookings = await getBookingsByDate(
      params.providerId,
      params.date,
      params.masterId
    );

    if (isSlotOccupied(params.time, params.duration, bookings)) {
      return {
        valid: false,
        error: 'Время уже занято',
      };
    }

    // 6. Проверить что услуга поместится
    if (!fitsInWorkingHours(params.time, params.duration, schedule.workingHours.end)) {
      return {
        valid: false,
        error: 'Услуга не поместится до конца рабочего дня',
      };
    }

    // 7. Проверить минимальное время до услуги
    const settings = await getBookingSettings(params.providerId);

    if (
      !isAdvanceTimeValid(
        params.date,
        params.time,
        settings?.minAdvanceBookingTime || 120
      )
    ) {
      return {
        valid: false,
        error: `Резервация должна быть сделана минимум за ${Math.floor(
          (settings?.minAdvanceBookingTime || 120) / 60
        )} часов`,
      };
    }

    // Все проверки пройдены!
    return {
      valid: true,
    };
  } catch (error) {
    console.error('Error validating booking:', error);
    return {
      valid: false,
      error: 'Ошибка при проверке доступности',
    };
  }
};

/**
 * Проверить можно ли отменить резервацию
 */
export const canCancelBooking = (params: {
  booking: Booking;
  userId: string;
  userRole: 'client' | 'provider';
  cancellationDeadline: number;
}): { canCancel: boolean; reason?: string } => {
  // Провайдер всегда может отменить
  if (params.userRole === 'provider') {
    return { canCancel: true };
  }

  // Клиент может отменить только свою резервацию
  if (params.booking.clientId !== params.userId) {
    return {
      canCancel: false,
      reason: 'Вы не можете отменить чужую резервацию',
    };
  }

  // Проверка статуса
  if (params.booking.status !== 'confirmed') {
    return {
      canCancel: false,
      reason: 'Резервация уже отменена или завершена',
    };
  }

  // Проверка времени до услуги
  const now = new Date();
  const [hours, minutes] = params.booking.time.split(':').map(Number);
  const serviceDateTime = new Date(params.booking.date);
  serviceDateTime.setHours(hours, minutes, 0, 0);

  const diffMinutes = (serviceDateTime.getTime() - now.getTime()) / (1000 * 60);

  if (diffMinutes < params.cancellationDeadline) {
    const hoursDeadline = Math.floor(params.cancellationDeadline / 60);
    return {
      canCancel: false,
      reason: `Отмена возможна не позднее чем за ${hoursDeadline} часов до услуги`,
    };
  }

  return { canCancel: true };
};

// ============================================================================
// УТИЛИТЫ ДАТА/ВРЕМЯ
// ============================================================================

/**
 * Получить даты на N дней вперед
 */
export const getNextDates = (days: number): string[] => {
  const dates: string[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return dates;
};

/**
 * Форматировать дату для отображения
 */
export const formatDate = (dateString: string, language: 'cs' | 'en' = 'cs'): string => {
  const date = new Date(dateString);
  
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const locale = language === 'cs' ? 'cs-CZ' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

/**
 * Форматировать время для отображения
 */
export const formatTime = (timeString: string): string => {
  return timeString; // HH:mm уже в нужном формате
};

/**
 * Рассчитать время окончания услуги
 */
export const calculateEndTime = (startTime: string, duration: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes + duration, 0, 0);
  
  return `${endDate.getHours().toString().padStart(2, '0')}:${endDate
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

/**
 * Проверка что дата в будущем
 */
export const isFutureDate = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date >= today;
};

/**
 * Получить название дня недели
 */
export const getDayName = (dateString: string, language: 'cs' | 'en' = 'cs'): string => {
  const date = new Date(dateString);
  const locale = language === 'cs' ? 'cs-CZ' : 'en-US';
  
  return date.toLocaleDateString(locale, { weekday: 'long' });
};






