import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase configuration
// В реальном проекте эти данные должны быть в .env файле
const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "beautyfind-demo.firebaseapp.com",
  projectId: "beautyfind-demo",
  storageBucket: "beautyfind-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export default app;

