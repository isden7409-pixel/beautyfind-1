// Структурированный адрес для Чехии
export interface StructuredAddress {
  street: string; // název ulice
  houseNumber: string; // číslo popisné (обязательное, основной номер здания)
  orientationNumber?: string; // číslo orientační (опциональное, для навигации на улице)
  postalCode: string; // PSČ
  city: string; // město
  fullAddress: string; // полный адрес для отображения
}

// Типы для салонов красоты
export interface Salon {
  id: string;
  name: string;
  city: string;
  address: string; // для обратной совместимости
  structuredAddress?: StructuredAddress; // новый структурированный адрес
  services: string[];
  rating: number;
  reviews: number;
  image: string;
  description: string;
  phone: string;
  email: string;
  website?: string;
  openHours: string;
  photos: string[];
  masters: Master[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  ownerId?: string; // ID владельца салона (uid пользователя)
  isPremium?: boolean;
  premiumUntil?: string;
  bookingEnabled?: boolean;
  workingHours?: WorkingHours[];
  availableServices?: Service[];
  unavailableDates?: string[];
  bookings?: Booking[];
  byAppointment?: boolean;
  paymentMethods?: string[];
  languages?: string[];
  // Социальные сети
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  // Ценник
  priceList?: string[];
  // Галерея
  galleryPhotos?: string[];
}

// Typy pro mistry
export interface Master {
  id: string;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  photo: string;
  worksInSalon: boolean;
  isFreelancer: boolean;
  city?: string;
  address?: string; // для обратной совместимости
  structuredAddress?: StructuredAddress; // новый структурированный адрес
  description?: string;
  phone?: string;
  email?: string;
  website?: string;
  services?: string[];
  languages?: string[];
  salonName?: string;
  salonId?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isPremium?: boolean;
  premiumUntil?: string;
  // Поля для бронирования
  workingHours?: WorkingHours[];
  availableServices?: Service[];
  bookingEnabled?: boolean;
  unavailableDates?: string[];
  bookings?: Booking[];
  byAppointment?: boolean;
  paymentMethods?: string[];
  // Социальные сети
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  // Ценник
  priceList?: string[];
  // Галерея
  galleryPhotos?: string[];
  ownerId?: string; // ID владельца мастера (uid пользователя)
}

// Типы для отзывов
export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  salonId?: string;
  masterId?: string;
  targetType?: 'salon' | 'master';
  targetId?: string;
  createdAt?: any;
}

// Типы для пользователей
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'client' | 'salon' | 'master';
  avatar?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Типы для аутентификации
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  phone: string;
  type: 'client' | 'salon' | 'master';
  avatar?: string;
  salonId?: string; // для мастеров, работающих в салоне
  // Избранное пользователя
  favoriteMasters?: string[]; // массив ID мастеров
  favoriteSalons?: string[];  // массив ID салонов
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Типы для кабинетов
export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string; // ID салона или мастера
  itemType: 'salon' | 'master';
  addedAt: Date;
}

export interface UserBooking {
  id: string;
  userId: string;
  masterId: string;
  salonId?: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  price: number;
  notes?: string;
  createdAt: Date;
}

// Типы для салона (регистрация)
export interface SalonRegistration {
  name: string;
  city: string;
  address: string; // для обратной совместимости
  structuredAddress?: StructuredAddress; // новый структурированный адрес
  phone: string;
  email: string;
  website?: string;
  description: string;
  openHours: string;
  workingHours?: WorkingHours[];
  services: string[];
  photos: File[] | string[];
  byAppointment?: boolean;
  paymentMethods?: string[];
  languages?: string[];
  // Социальные сети
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  // Ценник
  priceList?: File[] | string[];
  // Галерея
  galleryPhotos?: File[] | string[];
}

// Typy pro mistra (registrace)
export interface MasterRegistration {
  name: string;
  specialty: string;
  experience: string;
  phone: string;
  email: string;
  description: string;
  services: string[];
  languages: string[];
  photo: File | string;
  isFreelancer: boolean;
  salonId?: string;
  city?: string;
  address?: string; // для обратной совместимости
  structuredAddress?: StructuredAddress; // новый структурированный адрес
  workingHours?: WorkingHours[];
  byAppointment?: boolean;
  paymentMethods?: string[];
  // Социальные сети
  whatsapp?: string;
  telegram?: string;
  instagram?: string;
  facebook?: string;
  // Ценник
  priceList?: File[] | string[];
  // Галерея
  galleryPhotos?: File[] | string[];
}

// Типы для поиска и фильтров
export interface SearchFilters {
  city: string;
  service: string;
  searchTerm: string;
  minRating?: number;
  isPremium?: boolean;
}

// Типы для языков
export type Language = 'cs' | 'en';

// Типы для режимов просмотра
export type ViewMode = 'salons' | 'masters' | 'map';

// Типы для премиум функций
export interface PremiumFeature {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: 'day' | 'week' | 'month';
  type: 'salon' | 'master';
}

// Типы для системы бронирования
export interface TimeSlot {
  id: string;
  time: string; // "09:00", "10:30", etc.
  isAvailable: boolean;
  duration: number; // в минутах
}

export interface WorkingHours {
  dayOfWeek: number; // 0-6 (воскресенье-суббота)
  startTime: string; // "09:00"
  endTime: string; // "18:00"
  isWorking: boolean;
  breakStart?: string; // "12:00"
  breakEnd?: string; // "13:00"
}

export interface Service {
  id: string;
  name: string;
  duration: number; // в минутах
  price: number;
  description?: string;
}

export interface Booking {
  id: string;
  masterId: string;
  salonId?: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  serviceId: string;
  serviceName: string;
  date: string; // "2024-01-15"
  time: string; // "14:30"
  duration: number; // в минутах
  price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MasterSchedule {
  masterId: string;
  workingHours: WorkingHours[];
  services: Service[];
  unavailableDates: string[]; // ["2024-01-15", "2024-01-20"]
  bookings: Booking[];
}

// Дополнительные поля для Firebase
export interface FirebaseDocument {
  createdAt?: Date;
  updatedAt?: Date;
}
