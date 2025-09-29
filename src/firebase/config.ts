import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// В реальном проекте эти данные должны быть в .env файле
const firebaseConfig = {
  apiKey: "AIzaSyD0s0yw7SItY66TtI3b_oLpYpzDvQAJXMs",
  authDomain: "beautyfind-8c466.firebaseapp.com",
  projectId: "beautyfind-8c466",
  storageBucket: "beautyfind-8c466.firebasestorage.app",
  messagingSenderId: "861512568251",
  appId: "1:861512568251:web:ebe42ff86825efe25d489e",
  measurementId: "G-LDQRZ3M63T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

