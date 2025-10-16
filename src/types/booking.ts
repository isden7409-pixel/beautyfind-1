/**
 * Типы для системы резервации
 */

// ============================================================================
// SERVICE TYPES (Услуги)
// ============================================================================

export interface Service {
  id: string;
  providerId: string; // salonId или masterId
  providerType: 'salon' | 'master';
  masterId?: string; // если услуга мастера в салоне
  
  // Название
  name_cs: string;
  name_en?: string;
  
  // Описание
  description_cs?: string;
  description_en?: string;
  
  // Детали
  price: number;
  duration: number; // в минутах
  photoUrl?: string;
  
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceFormData {
  name_cs: string;
  name_en?: string;
  description_cs?: string;
  description_en?: string;
  price: number;
  duration: number;
  photoUrl?: string;
}

// ============================================================================
// SCHEDULE TYPES (Расписание)
// ============================================================================

export interface ScheduleBreak {
  start: string; // HH:mm
  end: string; // HH:mm
  label?: string; // "Oběd", "Přestávka", "Osobní záležitost"
}

export interface Schedule {
  id: string;
  providerId: string; // salonId или masterId
  providerType: 'salon' | 'master';
  masterId?: string; // если расписание мастера в салоне
  date: string; // YYYY-MM-DD
  isWorking: boolean;
  workingHours?: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  breaks?: ScheduleBreak[]; // паузы в течение дня
  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleFormData {
  date: string;
  isWorking: boolean;
  workingHours?: {
    start: string;
    end: string;
  };
  breaks?: ScheduleBreak[];
}

// ============================================================================
// BOOKING TYPES (Резервации)
// ============================================================================

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  
  // Клиент
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  
  // Провайдер (салон или мастер-фрилансер)
  providerId: string;
  providerType: 'salon' | 'master';
  providerName: string;
  providerPhone: string;
  providerEmail: string;
  providerAddress: string;
  
  // Мастер (если резервация к мастеру в салоне)
  masterId?: string;
  masterName?: string;
  
  // Услуга
  serviceId: string;
  serviceName_cs: string;
  serviceName_en?: string;
  serviceDescription_cs?: string;
  serviceDescription_en?: string;
  
  // Время
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  duration: number; // в минутах
  endTime: string; // HH:mm (рассчитывается автоматически)
  
  // Цена
  price: number;
  
  // Статус
  status: BookingStatus;
  
  // Отмена
  cancelledBy?: 'client' | 'provider';
  cancelledAt?: Date;
  cancelReason?: string;
  
  // Заметки
  clientNote?: string; // заметка клиента при резервации
  providerNote?: string; // внутренняя заметка мастера/салона
  
  // Timestamps
  createdAt: Date;
  completedAt?: Date;
  
  // Уведомления
  reminderSent: boolean;
  reminderSentAt?: Date;
  
  // Подтверждение
  confirmed?: boolean;
  confirmedAt?: Date;
  
  // Повторяющиеся резервации
  isRecurring?: boolean;
  recurringGroupId?: string;
}

export interface BookingCreateParams {
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  
  providerId: string;
  providerType: 'salon' | 'master';
  providerName: string;
  providerPhone: string;
  providerEmail: string;
  providerAddress: string;
  
  masterId?: string;
  masterName?: string;
  
  serviceId: string;
  serviceName_cs: string;
  serviceName_en?: string;
  serviceDescription_cs?: string;
  serviceDescription_en?: string;
  
  date: string;
  time: string;
  duration: number;
  price: number;
  
  clientNote?: string;
  
  // Повторяющиеся резервации
  isRecurring?: boolean;
  recurringSettings?: RecurringSettings;
}

export interface RecurringSettings {
  frequency: 'weekly' | 'biweekly' | 'monthly';
  count: number; // количество повторений
}

// ============================================================================
// BOOKING SETTINGS (Настройки резервации)
// ============================================================================

export interface BookingSettings {
  id: string; // = providerId (salonId или masterId)
  providerType: 'salon' | 'master';
  
  // За сколько минут до услуги можно записаться
  minAdvanceBookingTime: number; // в минутах (default: 120 = 2 часа)
  
  // За сколько минут до услуги клиент может отменить
  cancellationDeadline: number; // в минутах (default: 180 = 3 часа)
  
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingSettingsFormData {
  minAdvanceBookingTime: number;
  cancellationDeadline: number;
}

// ============================================================================
// BOOKING HISTORY (История резервации)
// ============================================================================

export interface BookingHistoryEntry {
  id: string;
  bookingId: string;
  action: 'created' | 'cancelled' | 'completed' | 'time_changed' | 'confirmed';
  performedBy: string; // userId
  performedByName: string;
  performedByRole: 'client' | 'provider';
  timestamp: Date;
  details?: {
    oldTime?: string;
    newTime?: string;
    cancelReason?: string;
    [key: string]: any;
  };
}

// ============================================================================
// EMAIL TEMPLATES (Шаблоны email)
// ============================================================================

export interface EmailTemplateContent {
  useDefault: boolean;
  customText_cs?: string;
  customText_en?: string;
}

export interface EmailTemplate {
  id: string; // = providerId (salonId или masterId)
  providerType: 'salon' | 'master';
  
  templates: {
    bookingConfirmation?: EmailTemplateContent;
    bookingReminder?: EmailTemplateContent;
    bookingCancelled?: EmailTemplateContent;
    bookingChanged?: EmailTemplateContent;
    reviewRequest?: EmailTemplateContent;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// BOOKING CONFIRMATION (Подтверждение резервации)
// ============================================================================

export interface BookingConfirmation {
  id: string;
  bookingId: string;
  clientEmail: string;
  confirmed: boolean;
  confirmedAt?: Date;
  confirmationMethod: 'email_reply' | 'dashboard' | null;
  createdAt: Date;
}

// ============================================================================
// WAITING LIST (Лист ожидания)
// ============================================================================

export interface WaitingListEntry {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  
  providerId: string;
  providerType: 'salon' | 'master';
  masterId?: string;
  
  serviceId: string;
  serviceName_cs: string;
  
  preferredDate: string; // YYYY-MM-DD
  preferredTime?: string; // HH:mm (опционально)
  
  notified: boolean;
  notifiedAt?: Date;
  
  createdAt: Date;
}

// ============================================================================
// BLOCKED TIME (Блокировка времени)
// ============================================================================

export interface BlockedTime {
  id: string;
  providerId: string;
  providerType: 'salon' | 'master';
  masterId?: string;
  
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  
  reason?: string; // "Školení", "Dovolená", etc.
  
  createdAt: Date;
  createdBy: string; // userId
}

// ============================================================================
// FAVORITE HISTORY (История избранного)
// ============================================================================

export interface FavoriteHistory {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  targetId: string; // masterId или salonId
  targetType: 'master' | 'salon';
  action: 'added' | 'removed';
  createdAt: Date;
}

// ============================================================================
// ANALYTICS (Аналитика)
// ============================================================================

export interface PopularService {
  serviceId: string;
  serviceName: string;
  bookingsCount: number;
  percentage: number;
}

export interface Analytics {
  // Резервации
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number; // %
  
  // Финансы
  totalRevenue: number;
  averageServicePrice: number;
  revenueThisMonth: number;
  
  // Рейтинг
  averageRating: number;
  totalReviews: number;
  newReviewsThisMonth: number;
  
  // Избранное
  favoritesCount: number;
  favoritesThisMonth: number;
  lastFavoritedAt?: Date;
  favoriteTrend: 'up' | 'down' | 'stable';
  
  // Конверсия
  favoritesToBookings: number; // сколько из избранных записались
  favoritesConversionRate: number; // %
  
  // Популярные услуги
  popularServices: PopularService[];
  
  // Обновлено
  lastUpdated: Date;
}

export interface MasterAnalytics extends Analytics {
  // Специфичные данные мастера
}

export interface SalonMasterAnalytics {
  masterId: string;
  masterName: string;
  totalBookings: number;
  revenue: number;
  averageRating: number;
  totalReviews: number;
  favoritesCount: number;
  conversionRate: number;
  popularService?: {
    name: string;
    count: number;
  };
}

export interface SalonAnalytics extends Analytics {
  // Аналитика по мастерам
  mastersAnalytics?: {
    [masterId: string]: SalonMasterAnalytics;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface TimeSlot {
  time: string; // HH:mm
  available: boolean;
  reason?: 'booked' | 'break' | 'blocked' | 'outside_hours' | 'too_late';
}

export interface AvailabilityCheck {
  valid: boolean;
  error?: string;
}

export interface PopularityBadge {
  level: 'nejoblíbenější' | 'velmi-populární' | 'populární' | null;
  label_cs: string;
  label_en: string;
  icon: string;
}




