/**
 * Firebase сервисы для системы резервации
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import {
  Service,
  ServiceFormData,
  Schedule,
  ScheduleFormData,
  Booking,
  BookingCreateParams,
  BookingSettings,
  BookingSettingsFormData,
  EmailTemplate,
  BookingConfirmation,
  WaitingListEntry,
  BlockedTime,
  FavoriteHistory,
  BookingHistoryEntry,
  RecurringSettings,
} from '../types/booking';

// ============================================================================
// SERVICES (Услуги)
// ============================================================================

/**
 * Получить все услуги провайдера
 */
export const getServices = async (
  providerId: string,
  providerType: 'salon' | 'master',
  masterId?: string
): Promise<Service[]> => {
  try {
    let q = query(
      collection(db, 'services'),
      where('providerId', '==', providerId),
      where('providerType', '==', providerType),
      where('isActive', '==', true)
    );

    if (masterId) {
      q = query(q, where('masterId', '==', masterId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Service[];
  } catch (error) {
    console.error('Error getting services:', error);
    throw error;
  }
};

/**
 * Получить услугу по ID
 */
export const getService = async (serviceId: string): Promise<Service | null> => {
  try {
    const docRef = doc(db, 'services', serviceId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as Service;
    }

    return null;
  } catch (error) {
    console.error('Error getting service:', error);
    throw error;
  }
};

/**
 * Создать услугу
 */
export const createService = async (
  providerId: string,
  providerType: 'salon' | 'master',
  data: ServiceFormData,
  masterId?: string
): Promise<string> => {
  try {
    const serviceData = {
      providerId,
      providerType,
      masterId: masterId || null,
      ...data,
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(collection(db, 'services'), serviceData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating service:', error);
    throw error;
  }
};

/**
 * Обновить услугу
 */
export const updateService = async (
  serviceId: string,
  data: Partial<ServiceFormData>
): Promise<void> => {
  try {
    const docRef = doc(db, 'services', serviceId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating service:', error);
    throw error;
  }
};

/**
 * Удалить услугу (мягкое удаление)
 */
export const deleteService = async (serviceId: string): Promise<void> => {
  try {
    const docRef = doc(db, 'services', serviceId);
    await updateDoc(docRef, {
      isActive: false,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    throw error;
  }
};

// ============================================================================
// SCHEDULE (Расписание)
// ============================================================================

/**
 * Получить расписание на период
 */
export const getSchedules = async (
  providerId: string,
  providerType: 'salon' | 'master',
  startDate: string,
  endDate: string,
  masterId?: string
): Promise<Schedule[]> => {
  try {
    let q = query(
      collection(db, 'schedules'),
      where('providerId', '==', providerId),
      where('providerType', '==', providerType),
      where('date', '>=', startDate),
      where('date', '<=', endDate)
    );

    if (masterId) {
      q = query(q, where('masterId', '==', masterId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    })) as Schedule[];
  } catch (error) {
    console.error('Error getting schedules:', error);
    throw error;
  }
};

/**
 * Получить расписание на конкретную дату
 */
export const getScheduleByDate = async (
  providerId: string,
  providerType: 'salon' | 'master',
  date: string,
  masterId?: string
): Promise<Schedule | null> => {
  try {
    let q = query(
      collection(db, 'schedules'),
      where('providerId', '==', providerId),
      where('providerType', '==', providerType),
      where('date', '==', date)
    );

    if (masterId) {
      q = query(q, where('masterId', '==', masterId));
    }

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      updatedAt: doc.data().updatedAt?.toDate(),
    } as Schedule;
  } catch (error) {
    console.error('Error getting schedule by date:', error);
    throw error;
  }
};

/**
 * Создать или обновить расписание на дату
 */
export const upsertSchedule = async (
  providerId: string,
  providerType: 'salon' | 'master',
  data: ScheduleFormData,
  masterId?: string
): Promise<void> => {
  try {
    // Проверяем существует ли расписание на эту дату
    const existing = await getScheduleByDate(providerId, providerType, data.date, masterId);

    const scheduleData = {
      providerId,
      providerType,
      masterId: masterId || null,
      ...data,
      updatedAt: Timestamp.now(),
    };

    if (existing) {
      // Обновляем существующее
      const docRef = doc(db, 'schedules', existing.id);
      await updateDoc(docRef, scheduleData);
    } else {
      // Создаем новое
      await addDoc(collection(db, 'schedules'), {
        ...scheduleData,
        createdAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error upserting schedule:', error);
    throw error;
  }
};

/**
 * Копировать расписание на следующую неделю
 */
export const copyScheduleToNextWeek = async (
  providerId: string,
  providerType: 'salon' | 'master',
  startDate: string,
  masterId?: string
): Promise<void> => {
  try {
    // Получаем расписание текущей недели
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const currentWeek = await getSchedules(
      providerId,
      providerType,
      startDate,
      endDate.toISOString().split('T')[0],
      masterId
    );

    // Копируем на следующую неделю
    const batch = writeBatch(db);
    
    for (const schedule of currentWeek) {
      const newDate = new Date(schedule.date);
      newDate.setDate(newDate.getDate() + 7);
      
      const newScheduleData = {
        providerId: schedule.providerId,
        providerType: schedule.providerType,
        masterId: schedule.masterId || null,
        date: newDate.toISOString().split('T')[0],
        isWorking: schedule.isWorking,
        workingHours: schedule.workingHours || null,
        breaks: schedule.breaks || null,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      const newDocRef = doc(collection(db, 'schedules'));
      batch.set(newDocRef, newScheduleData);
    }

    await batch.commit();
  } catch (error) {
    console.error('Error copying schedule:', error);
    throw error;
  }
};

// ============================================================================
// BOOKINGS (Резервации)
// ============================================================================

/**
 * Получить все резервации провайдера
 */
export const getBookings = async (
  providerId: string,
  status?: string
): Promise<Booking[]> => {
  try {
    let q = query(
      collection(db, 'bookings'),
      where('providerId', '==', providerId),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      confirmedAt: doc.data().confirmedAt?.toDate(),
      reminderSentAt: doc.data().reminderSentAt?.toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings:', error);
    throw error;
  }
};

/**
 * Получить резервации клиента
 */
export const getClientBookings = async (clientId: string): Promise<Booking[]> => {
  try {
    const q = query(
      collection(db, 'bookings'),
      where('clientId', '==', clientId),
      orderBy('date', 'desc'),
      orderBy('time', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      confirmedAt: doc.data().confirmedAt?.toDate(),
      reminderSentAt: doc.data().reminderSentAt?.toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting client bookings:', error);
    throw error;
  }
};

/**
 * Получить резервации на конкретную дату
 */
export const getBookingsByDate = async (
  providerId: string,
  date: string,
  masterId?: string
): Promise<Booking[]> => {
  try {
    let q = query(
      collection(db, 'bookings'),
      where('providerId', '==', providerId),
      where('date', '==', date),
      where('status', 'in', ['confirmed', 'completed'])
    );

    if (masterId) {
      q = query(q, where('masterId', '==', masterId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      completedAt: doc.data().completedAt?.toDate(),
      cancelledAt: doc.data().cancelledAt?.toDate(),
      confirmedAt: doc.data().confirmedAt?.toDate(),
      reminderSentAt: doc.data().reminderSentAt?.toDate(),
    })) as Booking[];
  } catch (error) {
    console.error('Error getting bookings by date:', error);
    throw error;
  }
};

/**
 * Создать резервацию
 */
export const createBooking = async (
  params: BookingCreateParams
): Promise<string> => {
  try {
    // Рассчитываем endTime
    const [hours, minutes] = params.time.split(':').map(Number);
    const endDate = new Date();
    endDate.setHours(hours, minutes + params.duration, 0, 0);
    const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

    const bookingData = {
      ...params,
      endTime,
      status: 'confirmed',
      reminderSent: false,
      confirmed: false,
      createdAt: Timestamp.now(),
    };

    // Если повторяющаяся резервация
    if (params.isRecurring && params.recurringSettings) {
      const recurringGroupId = `recurring_${Date.now()}`;
      
      const bookings = generateRecurringBookings(
        bookingData,
        params.recurringSettings,
        recurringGroupId
      );

      const batch = writeBatch(db);
      
      for (const booking of bookings) {
        const docRef = doc(collection(db, 'bookings'));
        batch.set(docRef, booking);
      }

      await batch.commit();
      return recurringGroupId;
    } else {
      // Обычная резервация
      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Создаем запись в истории
      await createBookingHistory({
        bookingId: docRef.id,
        action: 'created',
        performedBy: params.clientId,
        performedByName: params.clientName,
        performedByRole: 'client',
      });

      return docRef.id;
    }
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
};

/**
 * Генерация повторяющихся резерваций
 */
const generateRecurringBookings = (
  baseBooking: any,
  settings: RecurringSettings,
  groupId: string
): any[] => {
  const bookings = [];
  const startDate = new Date(baseBooking.date);

  for (let i = 0; i < settings.count; i++) {
    const bookingDate = new Date(startDate);

    if (settings.frequency === 'weekly') {
      bookingDate.setDate(startDate.getDate() + i * 7);
    } else if (settings.frequency === 'biweekly') {
      bookingDate.setDate(startDate.getDate() + i * 14);
    } else if (settings.frequency === 'monthly') {
      bookingDate.setMonth(startDate.getMonth() + i);
    }

    bookings.push({
      ...baseBooking,
      date: bookingDate.toISOString().split('T')[0],
      isRecurring: true,
      recurringGroupId: groupId,
    });
  }

  return bookings;
};

/**
 * Обновить резервацию
 */
export const updateBooking = async (
  bookingId: string,
  data: Partial<Booking>,
  performedBy: string,
  performedByName: string,
  performedByRole: 'client' | 'provider'
): Promise<void> => {
  try {
    const docRef = doc(db, 'bookings', bookingId);
    await updateDoc(docRef, data);

    // Создаем запись в истории
    if (data.status === 'cancelled') {
      await createBookingHistory({
        bookingId,
        action: 'cancelled',
        performedBy,
        performedByName,
        performedByRole,
        details: {
          cancelReason: data.cancelReason,
        },
      });
    } else if (data.status === 'completed') {
      await createBookingHistory({
        bookingId,
        action: 'completed',
        performedBy: 'system',
        performedByName: 'System',
        performedByRole: 'provider',
      });
    }
  } catch (error) {
    console.error('Error updating booking:', error);
    throw error;
  }
};

/**
 * Отменить резервацию
 */
export const cancelBooking = async (
  bookingId: string,
  cancelledBy: 'client' | 'provider',
  cancelReason: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    await updateBooking(
      bookingId,
      {
        status: 'cancelled',
        cancelledBy,
        cancelledAt: new Date(),
        cancelReason,
      },
      userId,
      userName,
      cancelledBy
    );
  } catch (error) {
    console.error('Error cancelling booking:', error);
    throw error;
  }
};

// ============================================================================
// BOOKING SETTINGS (Настройки резервации)
// ============================================================================

/**
 * Получить настройки резервации
 */
export const getBookingSettings = async (
  providerId: string
): Promise<BookingSettings | null> => {
  try {
    const docRef = doc(db, 'bookingSettings', providerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        createdAt: docSnap.data().createdAt?.toDate(),
        updatedAt: docSnap.data().updatedAt?.toDate(),
      } as BookingSettings;
    }

    // Вернуть настройки по умолчанию
    return {
      id: providerId,
      providerType: 'master',
      minAdvanceBookingTime: 120, // 2 часа
      cancellationDeadline: 180, // 3 часа
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error getting booking settings:', error);
    throw error;
  }
};

/**
 * Обновить настройки резервации
 */
export const updateBookingSettings = async (
  providerId: string,
  providerType: 'salon' | 'master',
  data: BookingSettingsFormData
): Promise<void> => {
  try {
    const docRef = doc(db, 'bookingSettings', providerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } else {
      await updateDoc(docRef, {
        providerType,
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    }
  } catch (error) {
    console.error('Error updating booking settings:', error);
    throw error;
  }
};

// ============================================================================
// BOOKING HISTORY (История резервации)
// ============================================================================

/**
 * Создать запись в истории резервации
 */
export const createBookingHistory = async (
  entry: Omit<BookingHistoryEntry, 'id' | 'timestamp'>
): Promise<void> => {
  try {
    await addDoc(collection(db, 'bookingHistory'), {
      ...entry,
      timestamp: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error creating booking history:', error);
    throw error;
  }
};

/**
 * Получить историю резервации
 */
export const getBookingHistory = async (
  bookingId: string
): Promise<BookingHistoryEntry[]> => {
  try {
    const q = query(
      collection(db, 'bookingHistory'),
      where('bookingId', '==', bookingId),
      orderBy('timestamp', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate(),
    })) as BookingHistoryEntry[];
  } catch (error) {
    console.error('Error getting booking history:', error);
    throw error;
  }
};

// ============================================================================
// BLOCKED TIME (Блокировка времени)
// ============================================================================

/**
 * Получить блокировки времени
 */
export const getBlockedTimes = async (
  providerId: string,
  date: string,
  masterId?: string
): Promise<BlockedTime[]> => {
  try {
    let q = query(
      collection(db, 'blockedTime'),
      where('providerId', '==', providerId),
      where('date', '==', date)
    );

    if (masterId) {
      q = query(q, where('masterId', '==', masterId));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
    })) as BlockedTime[];
  } catch (error) {
    console.error('Error getting blocked times:', error);
    throw error;
  }
};

/**
 * Создать блокировку времени
 */
export const createBlockedTime = async (
  data: Omit<BlockedTime, 'id' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'blockedTime'), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating blocked time:', error);
    throw error;
  }
};

/**
 * Удалить блокировку времени
 */
export const deleteBlockedTime = async (blockedTimeId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'blockedTime', blockedTimeId));
  } catch (error) {
    console.error('Error deleting blocked time:', error);
    throw error;
  }
};

// ============================================================================
// WAITING LIST (Лист ожидания)
// ============================================================================

/**
 * Добавить в лист ожидания
 */
export const addToWaitingList = async (
  data: Omit<WaitingListEntry, 'id' | 'notified' | 'createdAt'>
): Promise<string> => {
  try {
    const docRef = await addDoc(collection(db, 'waitingList'), {
      ...data,
      notified: false,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding to waiting list:', error);
    throw error;
  }
};

/**
 * Получить лист ожидания
 */
export const getWaitingList = async (
  providerId: string,
  date: string
): Promise<WaitingListEntry[]> => {
  try {
    const q = query(
      collection(db, 'waitingList'),
      where('providerId', '==', providerId),
      where('preferredDate', '==', date),
      where('notified', '==', false)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate(),
      notifiedAt: doc.data().notifiedAt?.toDate(),
    })) as WaitingListEntry[];
  } catch (error) {
    console.error('Error getting waiting list:', error);
    throw error;
  }
};






