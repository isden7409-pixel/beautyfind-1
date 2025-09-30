import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy
} from 'firebase/firestore';
import { db } from './config';
import { Salon, Master, Review, SalonRegistration, MasterRegistration } from '../types';
import { uploadMultipleFiles } from './upload';
import { geocodeAddress, geocodeStructuredAddress } from '../utils/geocoding';

// Collections
const SALONS_COLLECTION = 'salons';
const MASTERS_COLLECTION = 'masters';
const REVIEWS_COLLECTION = 'reviews';

// Salon services
export const salonService = {
  // Get all salons
  async getAll(): Promise<Salon[]> {
    const querySnapshot = await getDocs(collection(db, SALONS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Salon[];
  },

  // Get salon by ID
  async getById(id: string): Promise<Salon | null> {
    const docRef = doc(db, SALONS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Salon;
    }
    return null;
  },

  // Get salons by city
  async getByCity(city: string): Promise<Salon[]> {
    const q = query(
      collection(db, SALONS_COLLECTION),
      where('city', '==', city)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Salon[];
  },

  // Search salons
  async search(searchTerm: string): Promise<Salon[]> {
    const q = query(
      collection(db, SALONS_COLLECTION),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Salon[];
  },

  // Add new salon
  async create(salon: Omit<Salon, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, SALONS_COLLECTION), salon);
    return docRef.id;
  },

  // Create salon from registration form (handles photo upload)
  async createFromRegistration(data: SalonRegistration): Promise<string> {
    const photoUrls = data.photos && data.photos.length
      ? await uploadMultipleFiles(data.photos, 'salon_photos')
      : [];

    // Геокодируем адрес (приоритет структурированному адресу)
    let coordinates = undefined;
    if (data.structuredAddress) {
      coordinates = await geocodeStructuredAddress(data.structuredAddress);
    } else if (data.address && data.city) {
      coordinates = await geocodeAddress(`${data.address}, ${data.city}`);
    }

    // Нормализуем workingHours: Firestore не принимает undefined
    const normalizedSalonWorkingHours = data.byAppointment ? null : (Array.isArray(data.workingHours) ? data.workingHours : null);

    const salonBase = {
      name: data.name,
      city: data.city,
      address: data.address,
      structuredAddress: data.structuredAddress,
      byAppointment: data.byAppointment,
      workingHours: normalizedSalonWorkingHours,
      services: data.services,
      rating: 0,
      reviews: 0,
      image: photoUrls[0] || '',
      description: data.description,
      phone: data.phone,
      email: data.email,
      website: data.website,
      openHours: data.openHours,
      photos: photoUrls,
      masters: [],
    } as Partial<Salon>;

    // Добавляем coordinates только если они есть
    if (coordinates) {
      salonBase.coordinates = coordinates;
    }

    const salon = salonBase as Omit<Salon, 'id'>;

    const id = await this.create(salon);
    return id;
  },

  // Update salon
  async update(id: string, updates: Partial<Salon>): Promise<void> {
    const docRef = doc(db, SALONS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  // Delete salon
  async delete(id: string): Promise<void> {
    const docRef = doc(db, SALONS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};

// Master services
export const masterService = {
  // Get all masters
  async getAll(): Promise<Master[]> {
    const querySnapshot = await getDocs(collection(db, MASTERS_COLLECTION));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Master[];
  },

  // Get master by ID
  async getById(id: string): Promise<Master | null> {
    const docRef = doc(db, MASTERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Master;
    }
    return null;
  },

  // Get masters by city
  async getByCity(city: string): Promise<Master[]> {
    const q = query(
      collection(db, MASTERS_COLLECTION),
      where('city', '==', city)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Master[];
  },

  // Get masters by salon
  async getBySalon(salonId: string): Promise<Master[]> {
    const q = query(
      collection(db, MASTERS_COLLECTION),
      where('salonId', '==', salonId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Master[];
  },

  // Search masters
  async search(searchTerm: string): Promise<Master[]> {
    const q = query(
      collection(db, MASTERS_COLLECTION),
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Master[];
  },

  // Add new master
  async create(master: Omit<Master, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, MASTERS_COLLECTION), master);
    return docRef.id;
  },

  // Create master from registration form (handles photo upload)
  async createFromRegistration(data: MasterRegistration): Promise<string> {
    let photoUrl = '';
    // MasterRegistration.photo в форме мы храним как File (один файл)
    if (data.photo && (data.photo as File).size !== undefined) {
      const urls = await uploadMultipleFiles([data.photo], 'master_photos');
      photoUrl = urls[0] || '';
    }

    // Подготовим координаты и адрес
    let coords = undefined as any;
    let finalAddress = data.address;
    let finalCity = data.city;
    let finalStructuredAddress = data.structuredAddress;

    if (data.isFreelancer) {
      // Фрилансер: геокодируем введенный адрес (приоритет структурированному)
      if (data.structuredAddress) {
        coords = await geocodeStructuredAddress(data.structuredAddress);
      } else if (data.address) {
        coords = await geocodeAddress(`${data.address}${data.city ? ', ' + data.city : ''}`);
      }
    } else if (data.salonId) {
      // Работает в салоне: подставляем адрес/координаты салона
      const salon = await salonService.getById(data.salonId);
      if (salon) {
        finalAddress = finalAddress || salon.address;
        finalCity = finalCity || salon.city;
        finalStructuredAddress = finalStructuredAddress || salon.structuredAddress;
        if (salon.coordinates) {
          coords = salon.coordinates;
        } else if (salon.structuredAddress) {
          coords = await geocodeStructuredAddress(salon.structuredAddress);
        } else if (salon.address) {
          coords = await geocodeAddress(`${salon.address}${salon.city ? ', ' + salon.city : ''}`);
        }
      }
    }

    // Нормализуем workingHours: Firestore не принимает undefined
    const normalizedMasterWorkingHours = data.byAppointment ? null : (Array.isArray(data.workingHours) ? data.workingHours : null);

    const masterBase = {
      name: data.name,
      specialty: data.specialty,
      experience: data.experience,
      rating: 0,
      reviews: 0,
      photo: photoUrl,
      worksInSalon: !!data.salonId,
      isFreelancer: data.isFreelancer,
      byAppointment: data.byAppointment,
      workingHours: normalizedMasterWorkingHours,
      description: data.description,
      phone: data.phone,
      email: data.email,
      services: data.services,
      languages: data.languages,
    } as Partial<Master>;

    // Добавляем coordinates только если они есть
    if (coords) {
      masterBase.coordinates = coords;
    }

    if (finalCity) masterBase.city = finalCity;
    if (finalAddress) masterBase.address = finalAddress;
    if (finalStructuredAddress) masterBase.structuredAddress = finalStructuredAddress;
    if (data.salonId) masterBase.salonId = data.salonId;

    const master = masterBase as Omit<Master, 'id'>;

    const id = await this.create(master);
    
    // Если мастер работает в салоне, добавляем его в список мастеров салона
    if (data.salonId) {
      try {
        const salon = await salonService.getById(data.salonId);
        if (salon) {
          const updatedMasters = [...salon.masters, { ...master, id }];
          await salonService.update(data.salonId, { masters: updatedMasters });
        }
      } catch (error) {
        console.error('Error adding master to salon:', error);
        // Не прерываем создание мастера, если не удалось добавить в салон
      }
    }
    
    return id;
  },

  // Update master
  async update(id: string, updates: Partial<Master>): Promise<void> {
    const docRef = doc(db, MASTERS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  // Delete master
  async delete(id: string): Promise<void> {
    const docRef = doc(db, MASTERS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};

// Review services
export const reviewService = {
  // helper to normalize createdAt/date to timestamp
  _ts(r: any): number {
    const v = r?.createdAt ?? r?.date ?? null;
    if (!v) return 0;
    // Firestore Timestamp
    if (v && typeof v.toDate === 'function') {
      return v.toDate().getTime();
    }
    // ISO/string
    if (typeof v === 'string') return new Date(v).getTime();
    // Date
    if (v instanceof Date) return v.getTime();
    // Fallback
    try { return new Date(v).getTime(); } catch { return 0; }
  },
  // Get reviews for salon
  async getBySalon(salonId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('salonId', '==', salonId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
    } catch (err: any) {
      // Fallback without composite index: filter only, then sort on client
      if (err?.code === 'failed-precondition') {
        const q = query(
          collection(db, REVIEWS_COLLECTION),
          where('salonId', '==', salonId)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
        return items.sort((a, b) => this._ts(b) - this._ts(a));
      }
      throw err;
    }
  },

  // Get reviews for master
  async getByMaster(masterId: string): Promise<Review[]> {
    try {
      const q = query(
        collection(db, REVIEWS_COLLECTION),
        where('masterId', '==', masterId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
    } catch (err: any) {
      // Fallback without composite index: filter only, then sort on client
      if (err?.code === 'failed-precondition') {
        const q = query(
          collection(db, REVIEWS_COLLECTION),
          where('masterId', '==', masterId)
        );
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
        return items.sort((a, b) => this._ts(b) - this._ts(a));
      }
      throw err;
    }
  },

  // Add new review
  async create(review: Omit<Review, 'id'>): Promise<string> {
    // Прочистим undefined-поля
    const clean: any = { ...review, createdAt: new Date() };
    if (clean.salonId === undefined) delete clean.salonId;
    if (clean.masterId === undefined) delete clean.masterId;

    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), clean);
    return docRef.id;
  },

  // Update review
  async update(id: string, updates: Partial<Review>): Promise<void> {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  // Delete review
  async delete(id: string): Promise<void> {
    const docRef = doc(db, REVIEWS_COLLECTION, id);
    await deleteDoc(docRef);
  }
};

