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
  isLoggingOut: boolean;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  onLogout?: () => void;
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
  onLogout?: () => void;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      console.log('signUp called with userData:', userData);
      console.log('User type from userData:', userData.type);
      console.log('Email for signUp:', email);
      console.log('Password length for signUp:', password.length);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('Firebase user created successfully:', user.uid, user.email);
      
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

      // Дополнительная защита: убеждаемся, что тип мастера не может быть изменен
      if (profile.type === 'master') {
        console.log('Master profile created - ensuring type remains "master"');
        // Тип мастера должен оставаться 'master' даже если есть salonId
        profile.type = 'master';
      }

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

      console.log('Creating user profile in Firestore:', firestoreProfile);
      await setDoc(doc(db, 'users', user.uid), firestoreProfile);
      console.log('User profile created successfully with type:', firestoreProfile.type);
      console.log('User UID:', user.uid);
      console.log('User email:', user.email);
      console.log('User is currently signed in:', auth.currentUser?.email);
      setUserProfile(profile);
      
      // Тест: попробуем войти сразу после создания аккаунта
      console.log('Testing login immediately after account creation...');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        console.log('Login test after account creation successful!');
      } catch (testError) {
        console.error('Login test after account creation failed:', testError);
      }
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
      console.log('AuthProvider.signIn called with email:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('Firebase signIn successful, user:', result.user.uid);
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut(auth);
      setUserProfile(null);
      // Вызываем callback для перенаправления на главную страницу
      if (onLogout) {
        onLogout();
      }
      // Не сбрасываем isLoggingOut здесь - это будет сделано в onAuthStateChanged
    } catch (error) {
      console.error('Error signing out:', error);
      setIsLoggingOut(false);
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
            
            // Дополнительная защита: исправляем неправильный тип мастера
            if (profileData.email && profileData.email.includes('master') && profileData.type === 'salon') {
              console.log('Fixing incorrect master type - changing from salon to master');
              profileData.type = 'master';
            }
            
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
        // Небольшая задержка перед сбросом isLoggingOut для плавного перехода
        setTimeout(() => {
          setIsLoggingOut(false);
        }, 100);
      }
      
      // Небольшая задержка для плавного перехода
      setTimeout(() => {
        setLoading(false);
      }, 100);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    isLoggingOut,
    signUp,
    signIn,
    logout,
    updateProfile,
    onLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

