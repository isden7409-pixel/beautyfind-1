// Типы для салонов красоты
export interface Salon {
  id: number;
  name: string;
  city: string;
  address: string;
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
  isPremium?: boolean;
  premiumUntil?: string;
}

// Типы для мастеров
export interface Master {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  rating: number;
  reviews: number;
  photo: string;
  worksInSalon: boolean;
  isFreelancer: boolean;
  city?: string;
  address?: string;
  description?: string;
  phone?: string;
  email?: string;
  services?: string[];
  salonName?: string;
  salonId?: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isPremium?: boolean;
  premiumUntil?: string;
}

// Типы для отзывов
export interface Review {
  id: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  salonId?: number;
  masterId?: number;
}

// Типы для пользователей
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  type: 'client' | 'salon' | 'master';
  avatar?: string;
}

// Типы для салона (регистрация)
export interface SalonRegistration {
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  openHours: string;
  services: string[];
  photos: File[];
}

// Типы для мастера (регистрация)
export interface MasterRegistration {
  name: string;
  specialty: string;
  experience: string;
  phone: string;
  email: string;
  description: string;
  services: string[];
  photo: File;
  isFreelancer: boolean;
  salonId?: number;
  city?: string;
  address?: string;
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
export type ViewMode = 'salons' | 'masters';

// Типы для премиум функций
export interface PremiumFeature {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: 'day' | 'week' | 'month';
  type: 'salon' | 'master';
}
