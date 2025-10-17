import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Salon, Master, Booking, DashboardStats } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { reviewService, userService, salonService } from '../../firebase/services';
import { uploadSingleFile } from '../../firebase/upload';
import PageHeader from '../../components/PageHeader';
import SalonProfileEditForm from '../../components/SalonProfileEditForm';
import SalonMasterRegistrationForm from '../../components/SalonMasterRegistrationForm';
import SalonMasterCard from '../../components/SalonMasterCard';
import { translateServices, translateLanguages } from '../../utils/serviceTranslations';
import { ServiceManagement } from '../../components/ServiceManagement';
import { ScheduleManagement } from '../../components/ScheduleManagement';
import { SalonBookingsTab } from '../../components/dashboard/SalonBookingsTab';
import { SalonAnalytics } from '../../components/dashboard/SalonAnalytics';
import FavoritesSection from '../../components/dashboard/FavoritesSection';

interface SalonDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
  onNavigate?: (path: string) => void;
  onOpenRegistration?: () => void;
  onOpenPremium?: () => void;
}

const SalonDashboard: React.FC<SalonDashboardProps> = ({ language, onBack, onLanguageChange, onNavigate, onOpenRegistration, onOpenPremium }) => {
  const { userProfile } = useAuth();
  const [salon, setSalon] = useState<Salon | null>(null);
  const [masters, setMasters] = useState<Master[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'analytika' | 'profile' | 'sluzby' | 'rozvrh' | 'rezervace' | 'masters' | 'reviews' | 'oblibene'>('profile');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showMasterForm, setShowMasterForm] = useState(false);
  const [editingMaster, setEditingMaster] = useState<Master | null>(null);
  const [favoriteSalons, setFavoriteSalons] = useState<Salon[]>([]);
  const [favoriteMasters, setFavoriteMasters] = useState<Master[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]); // Отзывы, написанные салоном
  const [salonReviews, setSalonReviews] = useState<any[]>([]); // Отзывы о салоне
  const [mastersReviews, setMastersReviews] = useState<any[]>([]); // Отзывы о мастерах салона

  // Helper: format address without city because city is displayed separately
  const formatAddressWithoutCity = (addr: string | undefined, structured?: { street: string; houseNumber: string; orientationNumber?: string; postalCode: string; city: string; }) => {
    if (structured) {
      const num = structured.orientationNumber ? `${structured.houseNumber}/${structured.orientationNumber}` : structured.houseNumber;
      return `${structured.street} ${num}, ${structured.postalCode}`;
    }
    if (!addr) return '';
    // Convert patterns like "Street 1, 123 45 Brno" -> "Street 1, 123 45"
    return addr.replace(/,\s*(\d{3}\s?\d{2})\s+.+$/, ', $1');
  };

  const loadFavorites = useCallback(async () => {
    if (!userProfile) return;

    try {
      const favorites = await reviewService.getFavorites(userProfile.uid);
      
      // Загружаем данные салонов
      if (favorites.favoriteSalons.length > 0) {
        const salonPromises = favorites.favoriteSalons.map(async (salonId) => {
          const salonQuery = query(collection(db, 'salons'), where('__name__', '==', salonId));
          const salonSnapshot = await getDocs(salonQuery);
          if (salonSnapshot.empty) return null;
          const d = salonSnapshot.docs[0];
          return { id: d.id, ...(d.data() as any) } as Salon;
        });
        const salons = (await Promise.all(salonPromises)).filter(Boolean) as Salon[];
        setFavoriteSalons(salons);
      } else {
        setFavoriteSalons([]);
      }

      // Загружаем данные мастеров
      if (favorites.favoriteMasters.length > 0) {
        const masterPromises = favorites.favoriteMasters.map(async (masterId) => {
          const masterQuery = query(collection(db, 'masters'), where('__name__', '==', masterId));
          const masterSnapshot = await getDocs(masterQuery);
          if (masterSnapshot.empty) return null;
          const d = masterSnapshot.docs[0];
          return { id: d.id, ...(d.data() as any) } as Master;
        });
        const masters = (await Promise.all(masterPromises)).filter(Boolean) as Master[];
        setFavoriteMasters(masters);
      } else {
        setFavoriteMasters([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, [userProfile]);

  const removeFavorite = async (itemId: string, itemType: 'master' | 'salon') => {
    if (!userProfile) return;
    
    try {
      await userService.toggleFavorite(userProfile.uid, itemId, itemType);
      // Перезагружаем избранное
      loadFavorites();
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await reviewService.delete(reviewId);
      // Перезагружаем все списки отзывов
      loadSalonReviews();
      loadMastersReviews();
      loadUserReviews();
    } catch (error) {
      console.error('Error deleting review:', error);
      alert(language === 'cs' ? 'Chyba při mazání recenze' : 'Error deleting review');
    }
  };

  const loadUserReviews = useCallback(async () => {
    if (!userProfile) return;

    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('userId', '==', userProfile.uid)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Загружаем данные салонов и мастеров для отзывов
      const reviewsWithDetails = await Promise.all(reviewsData.map(async (review) => {
        let targetData = null;
        if (review.salonId) {
          const salonDoc = await getDoc(doc(db, 'salons', review.salonId));
          if (salonDoc.exists()) {
            targetData = { id: salonDoc.id, ...salonDoc.data(), type: 'salon' };
          }
        } else if (review.masterId) {
          const masterDoc = await getDoc(doc(db, 'masters', review.masterId));
          if (masterDoc.exists()) {
            targetData = { id: masterDoc.id, ...masterDoc.data(), type: 'master' };
          }
        }
        return { ...review, targetData };
      }));

      setUserReviews(reviewsWithDetails);
    } catch (error) {
      console.error('Error loading user reviews:', error);
    }
  }, [userProfile]);

  const loadSalonReviews = useCallback(async () => {
    if (!salon) return;

    try {
      // Загружаем отзывы о салоне (где salonId == salon.id)
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('salonId', '==', salon.id)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = reviewsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as any[];
      
      // Загружаем данные пользователей, которые оставили отзывы
      const reviewsWithUsers = await Promise.all(reviewsData.map(async (review) => {
        let userData = null;
        if (review.userId) {
          const userDoc = await getDoc(doc(db, 'users', review.userId));
          if (userDoc.exists()) {
            userData = { id: userDoc.id, ...userDoc.data() };
          }
        }
        return { ...review, userData };
      }));

      setSalonReviews(reviewsWithUsers);
    } catch (error) {
      console.error('Error loading salon reviews:', error);
    }
  }, [salon]);

  const loadMastersReviews = useCallback(async () => {
    if (!salon || masters.length === 0) return;

    try {
      // Получаем ID всех мастеров салона
      const masterIds = masters.map(m => m.id);
      
      // Загружаем отзывы о всех мастерах салона
      const allReviews: any[] = [];
      
      for (const masterId of masterIds) {
        const reviewsQuery = query(
          collection(db, 'reviews'),
          where('masterId', '==', masterId)
        );
        const reviewsSnapshot = await getDocs(reviewsQuery);
        const reviewsData = reviewsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as any[];
        
        allReviews.push(...reviewsData);
      }
      
      // Загружаем данные пользователей и мастеров для каждого отзыва
      const reviewsWithDetails = await Promise.all(allReviews.map(async (review) => {
        let userData = null;
        let masterData = null;
        
        if (review.userId) {
          const userDoc = await getDoc(doc(db, 'users', review.userId));
          if (userDoc.exists()) {
            userData = { id: userDoc.id, ...userDoc.data() };
          }
        }
        
        if (review.masterId) {
          const masterDoc = await getDoc(doc(db, 'masters', review.masterId));
          if (masterDoc.exists()) {
            masterData = { id: masterDoc.id, ...masterDoc.data() };
          }
        }
        
        return { ...review, userData, masterData };
      }));

      setMastersReviews(reviewsWithDetails);
    } catch (error) {
      console.error('Error loading masters reviews:', error);
    }
  }, [salon, masters]);

  const loadSalonData = useCallback(async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Загружаем профиль салона - сначала пытаемся по ownerId, потом по email
      let salonSnapshot;
      
      // Вариант 1: Ищем по ownerId (новый подход)
      if (userProfile.uid) {
        const salonQueryByOwner = query(
          collection(db, 'salons'),
          where('ownerId', '==', userProfile.uid)
        );
        salonSnapshot = await getDocs(salonQueryByOwner);
      }
      
      // Вариант 2: Если не нашли по ownerId, ищем по email (обратная совместимость)
      if (!salonSnapshot || salonSnapshot.empty) {
        const salonQueryByEmail = query(
          collection(db, 'salons'),
          where('email', '==', userProfile.email)
        );
        salonSnapshot = await getDocs(salonQueryByEmail);
      }
      
      if (!salonSnapshot.empty) {
        const salonData = { 
          id: salonSnapshot.docs[0].id,
          ...salonSnapshot.docs[0].data() 
        } as Salon;
        setSalon(salonData);

        // Загружаем мастеров салона
        const mastersQuery = query(
          collection(db, 'masters'),
          where('salonId', '==', salonData.id)
        );
        const mastersSnapshot = await getDocs(mastersQuery);
        const mastersData = mastersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Master[];
        setMasters(mastersData);

        // Загружаем все бронирования салона (включая мастеров)
        const allBookings: Booking[] = [];
        for (const master of mastersData) {
          const bookingsQuery = query(
            collection(db, 'bookings'),
            where('masterId', '==', master.id)
          );
          const bookingsSnapshot = await getDocs(bookingsQuery);
          const masterBookings = bookingsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Booking[];
          allBookings.push(...masterBookings);
        }
        setBookings(allBookings);

        // Вычисляем статистику
        const totalBookings = allBookings.length;
        const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
        const completedBookings = allBookings.filter(b => b.status === 'completed').length;
        const totalRevenue = allBookings
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.price, 0);

        setStats({
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue,
          averageRating: salonData.rating || 0,
          totalReviews: salonData.reviews || 0
        });
      }

    } catch (error) {
      console.error('Error loading salon data:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  const loadMastersData = useCallback(async () => {
    if (!salon) return;

    try {
      // Загружаем мастеров салона
      const mastersQuery = query(
        collection(db, 'masters'),
        where('salonId', '==', salon.id)
      );
      const mastersSnapshot = await getDocs(mastersQuery);
      const mastersData = mastersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Master[];
      setMasters(mastersData);
    } catch (error) {
      console.error('Error loading masters data:', error);
    }
  }, [salon]);

  useEffect(() => {
    if (userProfile && userProfile.type === 'salon') {
      loadSalonData();
      loadFavorites();
      loadUserReviews();
    }
  }, [userProfile, loadFavorites, loadUserReviews, loadSalonData]);

  // Загружаем отзывы о салоне когда salon загружен
  useEffect(() => {
    if (salon) {
      loadSalonReviews();
    }
  }, [salon, loadSalonReviews]);

  // Загружаем отзывы о мастерах салона когда masters загружены
  useEffect(() => {
    if (salon && masters.length > 0) {
      loadMastersReviews();
    }
  }, [salon, masters, loadMastersReviews]);

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, { 
        status,
        updatedAt: new Date().toISOString()
      });
      
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status } : b
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };



  const updateSalonProfile = async (updatedData: any) => {
    if (!salon) return;

    try {
      const salonRef = doc(db, 'salons', salon.id);
      await updateDoc(salonRef, updatedData);
      setSalon({ ...salon, ...updatedData });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating salon profile:', error);
      throw error;
    }
  };

  const handleMasterSubmit = async (masterData: any) => {
    try {
      // Handle photo upload if it's a File object
      let photoUrl = masterData.photo;
      if (masterData.photo && masterData.photo instanceof File) {
        photoUrl = await uploadSingleFile(masterData.photo, 'masters/photos');
      }

      // Prepare master data without File objects
      const processedMasterData = {
        ...masterData,
        photo: photoUrl
      };

      if (editingMaster) {
        // Update existing master
        const masterRef = doc(db, 'masters', editingMaster.id);
        await updateDoc(masterRef, {
          ...processedMasterData,
          // Inherit salon contact data
          phone: salon?.phone,
          email: salon?.email,
          address: salon?.address,
          structuredAddress: salon?.structuredAddress,
          paymentMethods: salon?.paymentMethods,
          website: salon?.website,
          updatedAt: new Date()
        });
      } else {
        // Create new master
        const masterRef = doc(collection(db, 'masters'));
        await setDoc(masterRef, {
          id: masterRef.id,
          ...processedMasterData,
          // Inherit salon contact data
          phone: salon?.phone,
          email: salon?.email,
          address: salon?.address,
          structuredAddress: salon?.structuredAddress,
          paymentMethods: salon?.paymentMethods,
          website: salon?.website,
          salonId: salon?.id,
          salonName: salon?.name,
          isFreelancer: false,
          rating: 0,
          reviews: 0,
          ownerId: userProfile?.uid, // Добавляем ownerId для связи с пользователем
          createdAt: new Date(),
          updatedAt: new Date()
        });

        // Add master to salon's masters array
        if (salon) {
          const salonRef = doc(db, 'salons', salon.id);
          await updateDoc(salonRef, {
            masters: [...(salon.masters || []), masterRef.id]
          });
        }
      }

      setShowMasterForm(false);
      setEditingMaster(null);
      setActiveTab('masters'); // Переходим к разделу Masters
      loadMastersData();
    } catch (error) {
      console.error('Error saving master:', error);
      alert(language === 'cs' ? 'Chyba při ukládání mistra' : 'Error saving master');
    }
  };

  const handleMasterRemove = async (masterId: string) => {
    if (!window.confirm(language === 'cs' ? 'Opravdu chcete odebrat tohoto mistra?' : 'Are you sure you want to remove this master?')) {
      return;
    }

    try {
      // Remove master from salon's masters array
      if (salon) {
        const salonRef = doc(db, 'salons', salon.id);
        await updateDoc(salonRef, {
          masters: (salon.masters || []).filter((master: Master) => master.id !== masterId)
        });
      }

      // Optionally delete master document (or mark as inactive)
      // const masterRef = doc(db, 'masters', masterId);
      // await deleteDoc(masterRef);

      loadMastersData();
      alert(language === 'cs' ? 'Mistr byl odebrán' : 'Master was removed');
    } catch (error) {
      console.error('Error removing master:', error);
      alert(language === 'cs' ? 'Chyba při odebírání mistra' : 'Error removing master');
    }
  };

  const translations = {
    cs: {
      title: 'Kabinet salonu',
      back: 'Hlavní stránka',
      analytika: 'Analytika',
      profile: 'Profil',
      sluzby: 'Naše služby',
      rozvrh: 'Rozvrh',
      rezervace: 'Rezervace',
      masters: 'Mistři',
      reviews: 'Recenze',
      oblibene: 'Oblíbené',
      overview: 'Přehled',
      bookings: 'Rezervace',
      favorites: 'Oblíbené',
      totalBookings: 'Celkem rezervací',
      pendingBookings: 'Čekající',
      completedBookings: 'Dokončené',
      totalRevenue: 'Celkový příjem',
      averageRating: 'Průměrné hodnocení',
      totalReviews: 'Celkem recenzí',
      noBookings: 'Nemáte žádné rezervace',
      noMasters: 'Nemáte žádné mistry',
      addMaster: 'Přidat mistra',
      confirm: 'Potvrdit',
      cancel: 'Zrušit',
      complete: 'Dokončit',
      edit: 'Upravit',
      save: 'Uložit',
      status: {
        pending: 'Čekající',
        confirmed: 'Potvrzeno',
        cancelled: 'Zrušeno',
        completed: 'Dokončeno'
      },
      profileFields: {
        name: 'Jméno',
        address: 'Adresa',
        phone: 'Telefon',
        email: 'Email',
        website: 'Webové stránky',
        description: 'Popis'
      }
    },
    en: {
      title: 'Salon Dashboard',
      back: 'Main Page',
      analytika: 'Analytics',
      profile: 'Profile',
      sluzby: 'Our Services',
      rozvrh: 'Schedule',
      rezervace: 'Bookings',
      masters: 'Masters',
      reviews: 'Reviews',
      oblibene: 'Favorites',
      overview: 'Overview',
      bookings: 'Bookings',
      favorites: 'Favorites',
      totalBookings: 'Total Bookings',
      pendingBookings: 'Pending',
      completedBookings: 'Completed',
      totalRevenue: 'Total Revenue',
      averageRating: 'Average Rating',
      totalReviews: 'Total Reviews',
      noBookings: 'You have no bookings',
      noMasters: 'You have no masters',
      addMaster: 'Add Master',
      confirm: 'Confirm',
      cancel: 'Cancel',
      complete: 'Complete',
      edit: 'Edit',
      save: 'Save',
      status: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed'
      },
      profileFields: {
        name: 'Name',
        address: 'Address',
        phone: 'Phone',
        email: 'Email',
        website: 'Website',
        description: 'Description'
      }
    }
  };

  const t = translations[language];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <div>{language === 'cs' ? 'Načítání...' : 'Loading...'}</div>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="dashboard">
        <div className="error">{language === 'cs' ? 'Profil salonu nebyl nalezen' : 'Salon profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <PageHeader
        title={t.title}
        currentLanguage={language}
        onLanguageChange={onLanguageChange}
        showBackButton={true}
        onBack={onBack}
        backText={t.back || 'Back'}
        leftButtons={[
          { label: language === 'cs' ? 'Registrace' : 'Registration', onClick: () => onOpenRegistration && onOpenRegistration() },
          { label: language === 'cs' ? 'Prémiové funkce' : 'Premium Features', onClick: () => onOpenPremium && onOpenPremium() }
        ]}
        userNameClickable={true}
        onNavigateToDashboard={async () => {
          if (onNavigate && userProfile) {
            // Получаем салон по ownerId (userProfile.uid)
            const salon = await salonService.getByOwnerId(userProfile.uid);
            if (salon) {
              onNavigate(`/salon/${salon.id}`);
            }
          }
        }}
      />

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{stats.totalBookings}</h3>
          <p>{t.totalBookings}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.pendingBookings}</h3>
          <p>{t.pendingBookings}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.completedBookings}</h3>
          <p>{t.completedBookings}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalRevenue} Kč</h3>
          <p>{t.totalRevenue}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.averageRating.toFixed(1)}</h3>
          <p>{t.averageRating}</p>
        </div>
        <div className="stat-card">
          <h3>{stats.totalReviews}</h3>
          <p>{t.totalReviews}</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          {t.profile}
        </button>
        <button 
          className={activeTab === 'masters' ? 'active' : ''}
          onClick={() => setActiveTab('masters')}
        >
          {t.masters}
        </button>
        <button 
          className={activeTab === 'sluzby' ? 'active' : ''}
          onClick={() => setActiveTab('sluzby')}
        >
          {t.sluzby}
        </button>
        <button 
          className={activeTab === 'rozvrh' ? 'active' : ''}
          onClick={() => setActiveTab('rozvrh')}
        >
          {t.rozvrh}
        </button>
        <button 
          className={activeTab === 'rezervace' ? 'active' : ''}
          onClick={() => setActiveTab('rezervace')}
        >
          {t.rezervace}
        </button>
        <button 
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          {t.reviews}
        </button>
        <button 
          className={activeTab === 'oblibene' ? 'active' : ''}
          onClick={() => setActiveTab('oblibene')}
        >
          {t.oblibene}
        </button>
        <button 
          className={activeTab === 'analytika' ? 'active' : ''}
          onClick={() => setActiveTab('analytika')}
        >
          {t.analytika}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'analytika' && (
          <SalonAnalytics 
            salon={salon} 
            masters={masters}
            language={language} 
          />
        )}

        {activeTab === 'sluzby' && (
          <ServiceManagement
            providerId={salon.id}
            providerType="salon"
            masters={masters}
            language={language}
          />
        )}

        {activeTab === 'rozvrh' && (
          <ScheduleManagement
            providerId={salon.id}
            providerType="salon"
            masters={masters}
            language={language}
          />
        )}

        {activeTab === 'rezervace' && salon && (
          <SalonBookingsTab
            salon={salon}
            masters={masters}
            language={language}
          />
        )}

        {activeTab === 'analytika' && (
          <div className="overview-section">
            <h2>Přehled</h2>
            <div className="salon-info">
              <h3>{salon.name}</h3>
              <p>Address: {salon.address}</p>
              <p>Phone: {salon.phone}</p>
              <p>Email: {salon.email}</p>
              <p>Rating: {salon.rating} ({salon.reviews} reviews)</p>
              <p>Masters: {masters.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'masters' && (
          <div className="masters-section">
            <div className="section-header">
              <h2>{t.masters}</h2>
              <button 
                onClick={() => setShowMasterForm(true)}
                className="add-master-button"
              >
                {t.addMaster}
              </button>
            </div>

            {showMasterForm && (
              <div className="master-form-overlay">
                <div className="master-form-container">
                  <SalonMasterRegistrationForm
                    salon={salon}
                    master={editingMaster}
                    language={language}
                    translations={t}
                    onSubmit={handleMasterSubmit}
                    onCancel={() => {
                      setShowMasterForm(false);
                      setEditingMaster(null);
                    }}
                  />
                </div>
              </div>
            )}

            {masters.length === 0 ? (
              <p>{t.noMasters}</p>
            ) : (
              <div className="masters-list">
                {masters.map(master => (
                  <SalonMasterCard
                    key={master.id}
                    master={master}
                    salon={salon}
                    language={language}
                    translations={t}
                    onEdit={(master) => {
                      setEditingMaster(master);
                      setShowMasterForm(true);
                    }}
                    onRemove={handleMasterRemove}
                    onNavigate={onNavigate}
                  />
                ))}
              </div>
            )}
          </div>
        )}


        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>{t.profile}</h2>

            {!editingProfile && (
              <div className="profile-info">
                {/* Jméno */}
                <p><strong>{t.profileFields.name}:</strong> {salon.name}</p>

                {/* Město */}
                {salon.city && (
                  <p><strong>{language === 'cs' ? 'Město' : 'City'}:</strong> {(
                    {
                      Prague: 'Praha', Brno: 'Brno', Ostrava: 'Ostrava', Plzen: 'Plzeň',
                      Liberec: 'Liberec', Olomouc: 'Olomouc'
                    } as Record<string, string>
                  )[salon.city] || salon.city}</p>
                )}

                {/* Adresa (without city, which is shown above) */}
                <p><strong>{t.profileFields.address}:</strong> {formatAddressWithoutCity(salon.address, salon.structuredAddress || undefined)}</p>

                {/* Telefon, Email, Web */}
                <p><strong>{t.profileFields.phone}:</strong> {salon.phone}</p>
                <p><strong>{t.profileFields.email}:</strong> {salon.email}</p>
                {salon.website && (
                  <p>
                    <strong>{t.profileFields.website}:</strong>{' '}
                    <a 
                      href={salon.website.startsWith('http') ? salon.website : `https://${salon.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {salon.website}
                    </a>
                  </p>
                )}

                {/* Социальные сети */}
                {salon.whatsapp && (
                  <p>
                    <strong>WhatsApp:</strong> {salon.whatsapp}
                  </p>
                )}
                {salon.telegram && (
                  <p>
                    <strong>Telegram:</strong> {salon.telegram}
                  </p>
                )}
                {salon.instagram && (
                  <p>
                    <strong>Instagram:</strong> {salon.instagram}
                  </p>
                )}
                {salon.facebook && (
                  <p>
                    <strong>Facebook:</strong> {salon.facebook}
                  </p>
                )}

                {/* Popis */}
                {salon.description && (
                  <>
                    <p><strong>{t.profileFields.description}:</strong></p>
                    <p className="pre-line">{salon.description}</p>
                  </>
                )}

                {/* Pouze na objednání */}
                <p><strong>{language === 'cs' ? 'Pouze na objednání' : 'By appointment only'}:</strong> {salon.byAppointment ? (language === 'cs' ? 'Ano' : 'Yes') : (language === 'cs' ? 'Ne' : 'No')}</p>

                {/* Ceník */}
                <p><strong>{language === 'cs' ? 'Ceník' : 'Price List'}:</strong> {salon.priceList && salon.priceList.length > 0 ? (language === 'cs' ? 'Ano' : 'Yes') : (language === 'cs' ? 'Ne' : 'No')}</p>

                {/* Služby */}
                {salon.services && salon.services.length > 0 && (
                  <p><strong>{language === 'cs' ? 'Služby' : 'Services'}:</strong> {translateServices(salon.services, language).join(', ')}</p>
                )}

                {/* Jazyky */}
                {salon.languages && salon.languages.length > 0 && (
                  <p><strong>{language === 'cs' ? 'Jazyky' : 'Languages'}:</strong> {translateLanguages(salon.languages, language).join(', ')}</p>
                )}

                {/* Způsoby platby */}
                {salon.paymentMethods && salon.paymentMethods.length > 0 && (
                  <p>
                    <strong>{language === 'cs' ? 'Způsoby platby' : 'Payment Methods'}:</strong>{' '}
                    {salon.paymentMethods
                      .map((method) => ({
                        cash: language === 'cs' ? 'Hotově' : 'Cash',
                        card: language === 'cs' ? 'Kartou' : 'Card',
                        qr: language === 'cs' ? 'QR platba' : 'QR payment',
                        account: language === 'cs' ? 'Převod na účet' : 'Bank transfer',
                        voucher: language === 'cs' ? 'Dárkový poukaz' : 'Voucher',
                        benefit: language === 'cs' ? 'Benefitní karta' : 'Benefit card'
                      } as Record<string, string>)[method] || method)
                      .join(', ')}
                  </p>
                )}
              </div>
            )}

            {!editingProfile && (
              <button 
                onClick={() => setEditingProfile(!editingProfile)}
                className="edit-button profile-edit-button"
              >
                {t.edit}
              </button>
            )}

            {editingProfile && (
              <SalonProfileEditForm
                salon={salon}
                language={language}
                translations={{
                  name: language === 'cs' ? 'Název salonu' : 'Salon name',
                  email: t.profileFields.email,
                  phone: t.profileFields.phone,
                  address: t.profileFields.address,
                  website: t.profileFields.website,
                  description: t.profileFields.description,
                  basicInfo: language === 'cs' ? 'Základní informace' : 'Basic Information',
                  location: language === 'cs' ? 'Lokace' : 'Location',
                  servicesLabel: language === 'cs' ? 'Služby' : 'Services',
                  workingHours: language === 'cs' ? 'Otevírací doba' : 'Opening Hours',
                  photos: language === 'cs' ? 'Fotografie' : 'Photos',
                  additionalInfo: language === 'cs' ? 'Další informace' : 'Additional Information',
                  namePlaceholder: language === 'cs' ? 'Zadejte název salonu' : 'Enter salon name',
                  emailPlaceholder: language === 'cs' ? 'Zadejte email salonu' : 'Enter salon email',
                  phonePlaceholder: language === 'cs' ? 'Zadejte telefon salonu' : 'Enter salon phone',
                  websitePlaceholder: language === 'cs' ? 'Zadejte URL webových stránek' : 'Enter website URL',
                  descriptionPlaceholder: language === 'cs' ? 'Popište salon a jeho služby' : 'Describe salon and its services',
                  selectServices: language === 'cs' ? 'Vyberte služby' : 'Select services',
                  selectPaymentMethods: language === 'cs' ? 'Způsoby platby' : 'Payment methods',
                  paymentCash: language === 'cs' ? 'Hotově' : 'Cash',
                  paymentCard: language === 'cs' ? 'Kartou' : 'Card',
                  languagesLabel: language === 'cs' ? 'Jazyky' : 'Languages',
                  selectLanguages: language === 'cs' ? 'Vyberte jazyky' : 'Select languages',
                  byAppointment: language === 'cs' ? 'Pouze na objednání' : 'By appointment only',
                  cancel: t.cancel,
                  save: t.save,
                  saving: language === 'cs' ? 'Ukládání...' : 'Saving...',
                  services: {
                    'Manicure and Pedicure': language === 'cs' ? 'Manikúra a pedikúra' : 'Manicure and Pedicure',
                    'Gel Nails': language === 'cs' ? 'Gelové nehty' : 'Gel Nails',
                    'Nail Art': language === 'cs' ? 'Nail Art' : 'Nail Art',
                    'Eyebrows & Eyelashes': language === 'cs' ? 'Obličejové chloupky' : 'Eyebrows & Eyelashes',
                    'Relaxation Massage': language === 'cs' ? 'Relaxační masáž' : 'Relaxation Massage',
                    'Women\'s Haircuts': language === 'cs' ? 'Dámské střihy' : 'Women\'s Haircuts',
                    'Men\'s Haircuts and Beards': language === 'cs' ? 'Pánské střihy a vousy' : 'Men\'s Haircuts and Beards',
                    'Makeup Artist': language === 'cs' ? 'Vizážistka' : 'Makeup Artist',
                    'Nail Design': language === 'cs' ? 'Nail Design' : 'Nail Design',
                    'Makeup & Nail Art': language === 'cs' ? 'Makeup & Nail Art' : 'Makeup & Nail Art'
                  },
                  languages: {
                    'Czech': language === 'cs' ? 'Čeština' : 'Czech',
                    'English': language === 'cs' ? 'Angličtina' : 'English',
                    'German': language === 'cs' ? 'Němčina' : 'German',
                    'Slovak': language === 'cs' ? 'Slovenština' : 'Slovak',
                    'Russian': language === 'cs' ? 'Ruština' : 'Russian'
                  }
                }}
                onSave={updateSalonProfile}
                onCancel={() => setEditingProfile(false)}
              />
            )}
          </div>
        )}

        {false && (
          <div className="favorites-section">
            
            <div className="favorites-content">
              <div className="favorites-category">
                <h3>{language === 'cs' ? 'Oblíbené salony' : 'Favorite Salons'}</h3>
                {favoriteSalons.length > 0 ? (
                  <div className="favorites-grid">
                    {favoriteSalons.map((salon) => (
                      <div
                        key={salon.id}
                        className="favorite-item clickable"
                        onClick={() => { window.location.href = `/salon/${salon.id}`; }}
                      >
                        <div className="favorite-item-content">
                          <h4>{salon.name}</h4>
                          <p className="favorite-item-address">
                            {salon.structuredAddress 
                              ? require('../../utils/cities').formatStructuredAddressCzech(salon.structuredAddress)
                              : salon.address
                            }
                          </p>
                          <p className="favorite-item-rating">
                            ⭐ {salon.rating} ({salon.reviews} {language === 'cs' ? 'recenzí' : 'reviews'})
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(salon.id, 'salon');
                          }}
                          className="remove-button"
                        >
                          {language === 'cs' ? 'Odebrat' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-favorites">
                    {language === 'cs' ? 'Nemáte žádné oblíbené salony' : 'You have no favorite salons'}
                  </p>
                )}
              </div>

              <div className="favorites-category">
                <h3>{language === 'cs' ? 'Oblíbení mistři' : 'Favorite Masters'}</h3>
                {favoriteMasters.length > 0 ? (
                  <div className="favorites-grid">
                    {favoriteMasters.map((master) => (
                      <div
                        key={master.id}
                        className="favorite-item clickable"
                        onClick={() => { window.location.href = `/master/${master.id}`; }}
                      >
                        <div className="favorite-item-content">
                          <h4>{master.name}</h4>
                          <p className="favorite-item-address">
                            {master.structuredAddress 
                              ? require('../../utils/cities').formatStructuredAddressCzech(master.structuredAddress)
                              : master.address}
                          </p>
                          <p className="favorite-item-rating">
                            ⭐ {master.rating} ({master.reviews} {language === 'cs' ? 'recenzí' : 'reviews'})
                          </p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFavorite(master.id, 'master');
                          }}
                          className="remove-button"
                        >
                          {language === 'cs' ? 'Odebrat' : 'Remove'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-favorites">
                    {language === 'cs' ? 'Nemáte žádné oblíbené mistry' : 'You have no favorite masters'}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            {/* Секция 1: Отзывы о салоне */}
            <div style={{ marginBottom: '40px' }}>
              <h2>{language === 'cs' ? 'Recenze o mém salonu' : 'Reviews About My Salon'}</h2>
              {salonReviews.length === 0 ? (
                <p>{language === 'cs' ? 'Zatím žádné recenze o vašem salonu' : 'No reviews about your salon yet'}</p>
              ) : (
                <div className="reviews-list">
                  {salonReviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-content">
                        <div className="review-header">
                          <h4>
                            {review.userData ? (
                              <span>{review.userData.name || (language === 'cs' ? 'Anonym' : 'Anonymous')}</span>
                            ) : (
                              <span>{language === 'cs' ? 'Anonym' : 'Anonymous'}</span>
                            )}
                          </h4>
                          <div className="review-rating">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={i < review.rating ? 'star filled' : 'star'}>⭐</span>
                            ))}
                            <span className="rating-number">({review.rating})</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="review-comment">"{review.comment}"</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="review-date">
                            {new Date(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US')}
                          </p>
                          <button 
                            onClick={() => deleteReview(review.id)}
                            className="remove-button"
                          >
                            {language === 'cs' ? 'Smazat' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Секция 2: Отзывы о мастерах салона */}
            <div style={{ marginBottom: '40px' }}>
              <h2>{language === 'cs' ? 'Recenze našich mistrů' : 'Reviews of Our Masters'}</h2>
              {mastersReviews.length === 0 ? (
                <p>{language === 'cs' ? 'Zatím žádné recenze o vašich mistrech' : 'No reviews about your masters yet'}</p>
              ) : (
                <div className="reviews-list">
                  {mastersReviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-content">
                        <div className="review-header">
                          <h4>
                            <span style={{ fontWeight: 500, color: '#6b7280', fontSize: '0.9rem' }}>
                              {language === 'cs' ? 'Klient: ' : 'Client: '}
                            </span>
                            {review.userData ? (
                              <span>{review.userData.name || (language === 'cs' ? 'Anonym' : 'Anonymous')}</span>
                            ) : (
                              <span>{language === 'cs' ? 'Anonym' : 'Anonymous'}</span>
                            )}
                          </h4>
                          <div style={{ marginBottom: '8px' }}>
                            <span style={{ fontWeight: 600, color: '#ec4899' }}>
                              {language === 'cs' ? 'Mistr: ' : 'Master: '}
                            </span>
                            {review.masterData ? (
                              <span 
                                className="clickable-target"
                                onClick={() => window.location.href = `/master/${review.masterData.id}`}
                              >
                                {review.masterData.name}
                              </span>
                            ) : (
                              <span className="deleted-target">
                                {language === 'cs' ? 'Smazaný mistr' : 'Deleted master'}
                              </span>
                            )}
                          </div>
                          <div className="review-rating">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={i < review.rating ? 'star filled' : 'star'}>⭐</span>
                            ))}
                            <span className="rating-number">({review.rating})</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="review-comment">"{review.comment}"</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="review-date">
                            {new Date(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US')}
                          </p>
                          <button 
                            onClick={() => deleteReview(review.id)}
                            className="remove-button"
                          >
                            {language === 'cs' ? 'Smazat' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Секция 3: Отзывы, написанные салоном */}
            <div style={{ marginBottom: '40px' }}>
              <h2>{language === 'cs' ? 'Moje recenze' : 'My Reviews'}</h2>
              {userReviews.length === 0 ? (
                <p>{language === 'cs' ? 'Nemáte žádné recenze' : 'You have no reviews'}</p>
              ) : (
                <div className="reviews-list">
                  {userReviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-content">
                        <div className="review-header">
                          <h4>
                            {review.targetData ? (
                              <span 
                                className="clickable-target"
                                onClick={() => window.location.href = `/${review.targetData.type}/${review.targetData.id}`}
                              >
                                {review.targetData.name}
                              </span>
                            ) : (
                              <span className="deleted-target">
                                {language === 'cs' ? 'Smazaný ' : 'Deleted '}
                                {review.salonId ? (language === 'cs' ? 'salon' : 'salon') : (language === 'cs' ? 'mistr' : 'master')}
                              </span>
                            )}
                          </h4>
                          <div className="review-rating">
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} className={i < review.rating ? 'star filled' : 'star'}>⭐</span>
                            ))}
                            <span className="rating-number">({review.rating})</span>
                          </div>
                        </div>
                        {review.comment && (
                          <p className="review-comment">"{review.comment}"</p>
                        )}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <p className="review-date">
                            {new Date(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US')}
                          </p>
                          <button 
                            onClick={() => deleteReview(review.id)}
                            className="remove-button"
                          >
                            {language === 'cs' ? 'Smazat' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'oblibene' && userProfile && (
          <FavoritesSection 
            language={language} 
            userId={userProfile.uid}
            onNavigateToSalon={(salonId) => {
              // Navigate to salon detail page
              window.location.href = `/salon/${salonId}`;
            }}
            onNavigateToMaster={(masterId) => {
              // Navigate to master detail page
              window.location.href = `/master/${masterId}`;
            }}
          />
        )}

      </div>
    </div>
  );
};

export default SalonDashboard;
