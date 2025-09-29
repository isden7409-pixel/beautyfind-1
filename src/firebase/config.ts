import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// Используем переменные окружения для безопасности
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyD0s0yw7SItY66TtI3b_oLpYpzDvQAJXMs", // fallback для разработки
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "beautyfind-8c466.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "beautyfind-8c466",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "beautyfind-8c466.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "861512568251",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:861512568251:web:ebe42ff86825efe25d489e",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-LDQRZ3M63T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

