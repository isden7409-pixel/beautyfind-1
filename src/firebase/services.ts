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
  orderBy,
  arrayUnion,
  arrayRemove
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

  // Get salon by owner ID
  async getByOwnerId(ownerId: string): Promise<Salon | null> {
    const q = query(
      collection(db, SALONS_COLLECTION),
      where('ownerId', '==', ownerId)
    );
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      return {
        id: querySnapshot.docs[0].id,
        ...querySnapshot.docs[0].data()
      } as Salon;
    }
    return null;
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
  async createFromRegistration(data: SalonRegistration, ownerId?: string): Promise<string> {
    // Проверяем, являются ли photos уже URL-адресами или это файлы для загрузки
    let photoUrls: string[] = [];
    if (data.photos && data.photos.length) {
      if (typeof data.photos[0] === 'string') {
        // Уже загружены, это URL-адреса
        photoUrls = data.photos as string[];
      } else {
        // Это файлы, нужно загрузить
        photoUrls = await uploadMultipleFiles(data.photos as File[], 'salon_photos');
      }
    }

    // Геокодируем адрес (приоритет структурированному адресу)
    let coordinates = undefined;
    if (data.structuredAddress) {
      coordinates = await geocodeStructuredAddress(data.structuredAddress);
    } else if (data.address && data.city) {
      coordinates = await geocodeAddress(`${data.address}, ${data.city}`);
    }

    // Обрабатываем priceList
    let priceListUrls: string[] = [];
    if (data.priceList && data.priceList.length) {
      if (typeof data.priceList[0] === 'string') {
        // Уже загружены, это URL-адреса
        priceListUrls = data.priceList as string[];
      } else {
        // Это файлы, нужно загрузить
        priceListUrls = await uploadMultipleFiles(data.priceList as File[], 'salon_price_list');
      }
    }

    // Нормализуем workingHours: Firestore не принимает undefined
    const normalizedSalonWorkingHours = data.byAppointment ? null : (Array.isArray(data.workingHours) ? data.workingHours : null);

    // Создаем заглушку для салонов без фото
    const defaultImage = 'data:image/svg+xml;base64,' + btoa(`
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f8f9fa"/>
        <text x="200" y="150" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#6c757d">
          BeautyFind.cz
        </text>
      </svg>
    `);

    const salonBase = {
      name: data.name,
      city: data.city,
      address: data.address,
      structuredAddress: data.structuredAddress,
      byAppointment: data.byAppointment,
      workingHours: normalizedSalonWorkingHours,
      services: data.services,
      languages: data.languages,
      rating: 0,
      reviews: 0,
      image: photoUrls[0] || defaultImage,
      description: data.description,
      phone: data.phone,
      email: data.email,
      website: data.website,
      openHours: data.openHours,
      photos: photoUrls,
      masters: [],
      paymentMethods: data.paymentMethods,
      priceList: priceListUrls,
      // Социальные сети
      whatsapp: data.whatsapp,
      telegram: data.telegram,
      instagram: data.instagram,
      facebook: data.facebook,
    } as Partial<Salon>;

    // Добавляем coordinates только если они есть
    if (coordinates) {
      salonBase.coordinates = coordinates;
    }

    // Добавляем ownerId если передан
    if (ownerId) {
      salonBase.ownerId = ownerId;
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

  // Update existing masters to add salonName
  async updateMastersWithSalonName(): Promise<void> {
    try {
      const mastersSnapshot = await getDocs(collection(db, MASTERS_COLLECTION));
      const salonsSnapshot = await getDocs(collection(db, SALONS_COLLECTION));
      
      const salonsMap = new Map<string, string>();
      salonsSnapshot.docs.forEach(doc => {
        const salon = { id: doc.id, ...doc.data() } as Salon;
        salonsMap.set(salon.id, salon.name);
      });

      const updatePromises: Promise<void>[] = [];
      mastersSnapshot.docs.forEach(doc => {
        const master = doc.data() as Master;
        if (master.salonId && !master.salonName) {
          const salonName = salonsMap.get(master.salonId);
          if (salonName) {
            updatePromises.push(
              updateDoc(doc.ref, { salonName })
            );
          }
        }
      });
      await Promise.all(updatePromises);
      // Updated masters with salon names
    } catch (error) {
      // Error updating masters with salon names
    }
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
    console.log('Creating master from registration, paymentMethods:', data.paymentMethods);
    let photoUrl = '';
    // Проверяем, является ли photo уже URL-адресом или это файл для загрузки
    if (data.photo) {
      if (typeof data.photo === 'string') {
        // Уже загружен, это URL-адрес
        photoUrl = data.photo;
      } else if ((data.photo as File).size !== undefined) {
        // Это файл, нужно загрузить
        const urls = await uploadMultipleFiles([data.photo as File], 'master_photos');
        photoUrl = urls[0] || '';
      }
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

    // Обрабатываем priceList
    let priceListUrls: string[] = [];
    if (data.priceList && data.priceList.length) {
      if (typeof data.priceList[0] === 'string') {
        // Уже загружены, это URL-адреса
        priceListUrls = data.priceList as string[];
      } else {
        // Это файлы, нужно загрузить
        priceListUrls = await uploadMultipleFiles(data.priceList as File[], 'master_price_list');
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
      paymentMethods: data.paymentMethods,
      priceList: priceListUrls,
      // Социальные сети
      whatsapp: data.whatsapp,
      telegram: data.telegram,
      instagram: data.instagram,
      facebook: data.facebook,
    } as Partial<Master>;

    // Добавляем coordinates только если они есть
    if (coords) {
      masterBase.coordinates = coords;
    }

    if (finalCity) masterBase.city = finalCity;
    if (finalAddress) masterBase.address = finalAddress;
    if (finalStructuredAddress) masterBase.structuredAddress = finalStructuredAddress;
    if (data.salonId) {
      masterBase.salonId = data.salonId;
      // Получаем название салона
      try {
        const salon = await salonService.getById(data.salonId);
        if (salon) {
          masterBase.salonName = salon.name;
        }
      } catch (error) {
      }
    }

    const master = masterBase as Omit<Master, 'id'>;
    
    console.log('Master object before saving to Firestore:', master);
    console.log('Payment methods in master object:', master.paymentMethods);

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
  // Favorites: toggle for current user
  async toggleFavorite(userId: string, itemId: string, itemType: 'salon' | 'master'): Promise<'added' | 'removed'> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error('User profile not found');
    const data: any = snap.data();
    const field = itemType === 'salon' ? 'favoriteSalons' : 'favoriteMasters';
    const list: string[] = Array.isArray(data[field]) ? data[field] : [];
    const exists = list.includes(itemId);
    const updated = exists ? list.filter((x) => x !== itemId) : [...list, itemId];
    await updateDoc(userRef, { [field]: updated, updatedAt: new Date() });
    return exists ? 'removed' : 'added';
  },
  async getFavorites(userId: string): Promise<{ favoriteSalons: string[]; favoriteMasters: string[] }> {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (!snap.exists()) throw new Error('User profile not found');
    const data: any = snap.data();
    return {
      favoriteSalons: Array.isArray(data.favoriteSalons) ? data.favoriteSalons : [],
      favoriteMasters: Array.isArray(data.favoriteMasters) ? data.favoriteMasters : []
    };
  },
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

    // Server-side guard: allow only signed-in users (any type) to create reviews
    try {
      const uid: string | undefined = clean.userId;
      if (!uid) {
        throw new Error('Missing userId');
      }
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        throw new Error('User profile not found');
      }
      // any existing user type is allowed now
    } catch (guardErr) {
      // Прерываем создание отзыва с понятной ошибкой
      throw guardErr instanceof Error ? guardErr : new Error('Not allowed to create review');
    }

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

export const userService = {
  async toggleFavorite(userId: string, itemId: string, itemType: 'master' | 'salon'): Promise<'added' | 'removed'> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error('User not found.');
    }

    const userProfile = userSnap.data() as any;
    let status: 'added' | 'removed';

    if (itemType === 'master') {
      if (userProfile.favoriteMasters?.includes(itemId)) {
        await updateDoc(userRef, {
          favoriteMasters: arrayRemove(itemId)
        });
        status = 'removed';
      } else {
        await updateDoc(userRef, {
          favoriteMasters: arrayUnion(itemId)
        });
        status = 'added';
      }
    } else { // itemType === 'salon'
      if (userProfile.favoriteSalons?.includes(itemId)) {
        await updateDoc(userRef, {
          favoriteSalons: arrayRemove(itemId)
        });
        status = 'removed';
      } else {
        await updateDoc(userRef, {
          favoriteSalons: arrayUnion(itemId)
        });
        status = 'added';
      }
    }
    return status;
  },

  async getFavorites(userId: string): Promise<{ favoriteMasters: string[]; favoriteSalons: string[] }> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return { favoriteMasters: [], favoriteSalons: [] };
    }

    const userProfile = userSnap.data() as any;
    return {
      favoriteMasters: userProfile.favoriteMasters || [],
      favoriteSalons: userProfile.favoriteSalons || []
    };
  }
};

