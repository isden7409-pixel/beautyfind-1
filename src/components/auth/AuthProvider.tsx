import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/config';
import { AuthUser, UserProfile } from '../../types';

interface AuthContextType {
  currentUser: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Создаем профиль пользователя в Firestore
      const profile: UserProfile = {
        id: user.uid,
        uid: user.uid,
        name: userData.name || '',
        email: email,
        phone: userData.phone || '',
        type: userData.type || 'client',
        avatar: userData.avatar, // Оставляем undefined если нет значения
        salonId: userData.salonId, // Оставляем undefined если нет значения
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Создаем объект для Firestore без undefined полей
      const firestoreProfile: any = {
        id: profile.id,
        uid: profile.uid,
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        type: profile.type,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt
      };

      // Добавляем опциональные поля только если они не undefined
      if (profile.avatar !== undefined) {
        firestoreProfile.avatar = profile.avatar;
      }
      if (profile.salonId !== undefined) {
        firestoreProfile.salonId = profile.salonId;
      }

      await setDoc(doc(db, 'users', user.uid), firestoreProfile);
      setUserProfile(profile);
    } catch (error: any) {
      console.error('Error signing up:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await updateDoc(userRef, updateData);
      
      if (userProfile) {
        setUserProfile({ ...userProfile, ...updateData });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
      if (user) {
        const authUser: AuthUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        };
        setCurrentUser(authUser);

        // Загружаем профиль пользователя
        try {
          console.log('Loading user profile for:', user.uid);
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          console.log('User document exists:', userDoc.exists());
          if (userDoc.exists()) {
            const profileData = userDoc.data() as UserProfile;
            console.log('Profile data loaded:', profileData);
            setUserProfile(profileData);
          } else {
            console.log('User document does not exist in Firestore - creating default profile');
            // Создаем базовый профиль для пользователя
            const defaultProfile: UserProfile = {
              id: user.uid,
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              phone: '',
              type: 'client', // По умолчанию клиент
              avatar: undefined,
              salonId: undefined,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };

            // Создаем объект для Firestore без undefined полей
            const firestoreProfile: any = {
              id: defaultProfile.id,
              uid: defaultProfile.uid,
              name: defaultProfile.name,
              email: defaultProfile.email,
              phone: defaultProfile.phone,
              type: defaultProfile.type,
              isActive: defaultProfile.isActive,
              createdAt: defaultProfile.createdAt,
              updatedAt: defaultProfile.updatedAt
            };

            try {
              await setDoc(doc(db, 'users', user.uid), firestoreProfile);
              console.log('Default profile created successfully');
              setUserProfile(defaultProfile);
            } catch (createError) {
              console.error('Error creating default profile:', createError);
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signUp,
    signIn,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

