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
  limit 
} from 'firebase/firestore';
import { db } from './config';
import { Salon, Master, Review } from '../types';

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
  // Get reviews for salon
  async getBySalon(salonId: string): Promise<Review[]> {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('salonId', '==', salonId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  },

  // Get reviews for master
  async getByMaster(masterId: string): Promise<Review[]> {
    const q = query(
      collection(db, REVIEWS_COLLECTION),
      where('masterId', '==', masterId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
  },

  // Add new review
  async create(review: Omit<Review, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), {
      ...review,
      createdAt: new Date()
    });
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

