import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Master, Booking, DashboardStats, Salon } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { reviewService, userService } from '../../firebase/services';
import PageHeader from '../../components/PageHeader';
import MasterProfileEditForm from '../../components/MasterProfileEditForm';
import { formatExperienceYears } from '../../utils/formatters';
import { translateServices, translateLanguages } from '../../utils/serviceTranslations';
import { translateCityToCzech } from '../../utils/cities';

interface MasterDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
  onNavigate?: (path: string) => void;
}

const MasterDashboard: React.FC<MasterDashboardProps> = ({ language, onBack, onLanguageChange, onNavigate }) => {
  const { userProfile } = useAuth();
  const [master, setMaster] = useState<Master | null>(null);
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
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'schedule' | 'profile' | 'favorites' | 'reviews'>('overview');
  const [editingProfile, setEditingProfile] = useState(false);

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
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [favoriteSalons, setFavoriteSalons] = useState<Salon[]>([]);
  const [favoriteMasters, setFavoriteMasters] = useState<Master[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);

  const loadMasterData = useCallback(async () => {
    if (!userProfile) return;

    try {
      setLoading(true);
      console.log('Loading master data for user:', userProfile.email, 'type:', userProfile.type);

      // Сначала ищем профиль мастера в коллекции masters
      const masterQuery = query(
        collection(db, 'masters'),
        where('email', '==', userProfile.email)
      );
      const masterSnapshot = await getDocs(masterQuery);
      console.log('Master query result:', masterSnapshot.empty ? 'No masters found' : 'Masters found');
      
      let masterData: Master | null = null;
      
      if (!masterSnapshot.empty) {
        // Найден профиль в коллекции masters
        masterData = masterSnapshot.docs[0].data() as Master;
        masterData.id = masterSnapshot.docs[0].id;
      } else {
        // Если профиль не найден в masters, создаем базовый профиль из данных пользователя
        console.log('Master profile not found in masters collection, creating from user profile');
        
        masterData = {
          id: userProfile.id,
          name: userProfile.name,
          specialty: 'Beauty Services', // Значение по умолчанию
          experience: '0', // Значение по умолчанию
          rating: 0,
          reviews: 0,
          photo: '',
          worksInSalon: false,
          isFreelancer: true,
          byAppointment: false,
          workingHours: undefined,
          description: '',
          phone: userProfile.phone || '',
          email: userProfile.email,
          services: [],
          languages: ['Czech'],
          city: '',
          address: '',
          structuredAddress: undefined,
          coordinates: undefined,
          salonId: undefined,
          salonName: undefined
        };
        
        // Сохраняем базовый профиль в коллекцию masters
        try {
          const masterRef = doc(db, 'masters', userProfile.id);
          await setDoc(masterRef, masterData);
          console.log('Master profile created successfully');
        } catch (error) {
          console.error('Error creating master profile:', error);
        }
      }

      if (masterData) {
        setMaster(masterData);

        // Загружаем бронирования мастера
        const bookingsQuery = query(
          collection(db, 'bookings'),
          where('masterId', '==', masterData.id)
        );
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingsData = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Booking[];
        setBookings(bookingsData);

        // Вычисляем статистику
        const totalBookings = bookingsData.length;
        const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
        const completedBookings = bookingsData.filter(b => b.status === 'completed').length;
        const totalRevenue = bookingsData
          .filter(b => b.status === 'completed')
          .reduce((sum, b) => sum + b.price, 0);

        setStats({
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue,
          averageRating: masterData.rating || 0,
          totalReviews: masterData.reviews || 0
        });
      }

    } catch (error) {
      console.error('Error loading master data:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

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

  useEffect(() => {
    console.log('MasterDashboard useEffect - userProfile:', userProfile);
    if (userProfile && userProfile.type === 'master') {
      loadMasterData();
      loadFavorites();
      loadUserReviews();
    } else if (userProfile && userProfile.type !== 'master') {
      console.log('User is not a master, type:', userProfile.type);
    }
  }, [userProfile, loadMasterData, loadFavorites, loadUserReviews]);

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

  const updateProfile = async (updatedData: any) => {
    if (!master) return;

    try {
      const masterRef = doc(db, 'masters', master.id);
      await updateDoc(masterRef, updatedData);
      setMaster({ ...master, ...updatedData });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const translations = {
    cs: {
      title: 'Kabinet mistra',
      back: 'Hlavní stránka',
      overview: 'Přehled',
      bookings: 'Rezervace',
      schedule: 'Rozvrh',
      profile: 'Profil',
      favorites: 'Oblíbené',
      totalBookings: 'Celkem rezervací',
      pendingBookings: 'Čekající',
      completedBookings: 'Dokončené',
      totalEarnings: 'Celkový výdělek',
      averageRating: 'Průměrné hodnocení',
      totalReviews: 'Celkem recenzí',
      noBookings: 'Nemáte žádné rezervace',
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
        specialty: 'Specializace',
        experience: 'Zkušenosti',
        phone: 'Telefon',
        email: 'Email',
        address: 'Adresa',
        website: 'Webové stránky',
        description: 'Popis'
      },
      specialty: 'Specializace',
      experience: 'Zkušenosti',
      rating: 'Hodnocení',
      reviews: 'recenzí',
      scheduleEditingMessage: 'Úprava rozvrhu bude implementována zde',
      name: 'Jméno',
      phone: 'Telefon',
      email: 'Email',
      client: 'Klient',
      date: 'Datum',
      price: 'Cena',
      statusLabel: 'Stav'
    },
    en: {
      title: 'Master Dashboard',
      back: 'Main Page',
      overview: 'Overview',
      bookings: 'Bookings',
      schedule: 'Schedule',
      profile: 'Profile',
      favorites: 'Favorites',
      totalBookings: 'Total Bookings',
      pendingBookings: 'Pending',
      completedBookings: 'Completed',
      totalEarnings: 'Total Earnings',
      averageRating: 'Average Rating',
      totalReviews: 'Total Reviews',
      noBookings: 'You have no bookings',
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
        specialty: 'Specialty',
        experience: 'Experience',
        phone: 'Phone',
        email: 'Email',
        address: 'Address',
        website: 'Website',
        description: 'Description'
      },
      specialty: 'Specialty',
      experience: 'Experience',
      rating: 'Rating',
      reviews: 'reviews',
      scheduleEditingMessage: 'Schedule editing will be implemented here',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      client: 'Client',
      date: 'Date',
      price: 'Price',
      statusLabel: 'Status'
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

  if (!master) {
    return (
      <div className="dashboard">
        <div className="error">{language === 'cs' ? 'Profil mistra nebyl nalezen' : 'Master profile not found'}</div>
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
          <p>{t.totalEarnings}</p>
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
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          {t.overview}
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          {t.bookings}
        </button>
        <button 
          className={activeTab === 'schedule' ? 'active' : ''}
          onClick={() => setActiveTab('schedule')}
        >
          {t.schedule}
        </button>
        <button 
          className={activeTab === 'profile' ? 'active' : ''}
          onClick={() => setActiveTab('profile')}
        >
          {t.profile}
        </button>
        <button 
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          {t.favorites}
        </button>
        <button 
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          {language === 'cs' ? 'Moje recenze' : 'My Reviews'}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>{t.overview}</h2>
            <div className="master-info">
              <h3>{master.name}</h3>
              <p>{t.specialty}: {master.specialty}</p>
              <p>{t.experience}: {master.experience}</p>
              <p>{t.rating}: {master.rating} ({master.reviews} {t.reviews})</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>{t.bookings}</h2>
            {bookings.length === 0 ? (
              <p>{t.noBookings}</p>
            ) : (
              <div className="bookings-list">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-item">
                    <div className="booking-info">
                      <h4>{booking.serviceName}</h4>
                      <p>{t.client}: {booking.clientName}</p>
                      <p>{t.date}: {booking.date} at {booking.time}</p>
                      <p>{t.price}: {booking.price} Kč</p>
                      <p>{t.statusLabel}: {t.status[booking.status]}</p>
                    </div>
                    <div className="booking-actions">
                      {booking.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                            className="confirm-button"
                          >
                            {t.confirm}
                          </button>
                          <button 
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="cancel-button"
                          >
                            {t.cancel}
                          </button>
                        </>
                      )}
                      {booking.status === 'confirmed' && (
                        <button 
                          onClick={() => updateBookingStatus(booking.id, 'completed')}
                          className="complete-button"
                        >
                          {t.complete}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="schedule-section">
            <h2>{t.schedule}</h2>
            <button 
              onClick={() => setEditingSchedule(!editingSchedule)}
              className="edit-button"
            >
              {editingSchedule ? t.save : t.edit}
            </button>
            {/* TODO: Implement schedule editing component */}
            <p>{t.scheduleEditingMessage}</p>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>{t.profile}</h2>

            {!editingProfile && (
              <div className="profile-info">
                <p><strong>{t.profileFields.name}:</strong> {master.name}</p>
                <p><strong>{t.profileFields.specialty}:</strong> {master.specialty}</p>
                <p><strong>{t.profileFields.experience}:</strong> {formatExperienceYears(master.experience, language, false)}</p>
                <p><strong>{t.profileFields.phone}:</strong> {master.phone}</p>
                <p><strong>{t.profileFields.email}:</strong> {master.email}</p>
                
                {/* Социальные сети */}
                {master.whatsapp && (
                  <p><strong>WhatsApp:</strong> {master.whatsapp}</p>
                )}
                {master.telegram && (
                  <p><strong>Telegram:</strong> {master.telegram}</p>
                )}
                {master.instagram && (
                  <p><strong>Instagram:</strong> {master.instagram}</p>
                )}
                {master.facebook && (
                  <p><strong>Facebook:</strong> {master.facebook}</p>
                )}
                
                {master.city && <p><strong>{language === 'cs' ? 'Město' : 'City'}:</strong> {language === 'cs' ? translateCityToCzech(master.city) : master.city}</p>}
                {master.address && <p><strong>{t.profileFields.address}:</strong> {formatAddressWithoutCity(master.address, master.structuredAddress || undefined)}</p>}
                {master.website && (
                  <p>
                    <strong>{t.profileFields.website}:</strong>{' '}
                    <a 
                      href={master.website.startsWith('http') ? master.website : `https://${master.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      {master.website}
                    </a>
                  </p>
                )}
                {master.description && (
                  <>
                    <p><strong>{t.profileFields.description}:</strong></p>
                    <p className="pre-line">{master.description}</p>
                  </>
                )}
                {master.services && master.services.length > 0 && (
                  <p><strong>{language === 'cs' ? 'Služby' : 'Services'}:</strong> {translateServices(master.services, language).join(', ')}</p>
                )}
                {master.languages && master.languages.length > 0 && (
                  <p><strong>{language === 'cs' ? 'Jazyky' : 'Languages'}:</strong> {translateLanguages(master.languages, language).join(', ')}</p>
                )}
                <p><strong>{language === 'cs' ? 'Typ práce' : 'Work Type'}:</strong> {master.isFreelancer ? (language === 'cs' ? 'Samostatný pracovník' : 'Freelancer') : (language === 'cs' ? 'V salonu' : 'In Salon')}</p>
                {master.salonName && <p><strong>{language === 'cs' ? 'Salon' : 'Salon'}:</strong> {master.salonName}</p>}
                <p><strong>{language === 'cs' ? 'Pouze na objednání' : 'By appointment only'}:</strong> {master.byAppointment ? (language === 'cs' ? 'Ano' : 'Yes') : (language === 'cs' ? 'Ne' : 'No')}</p>
                
                {/* Ceník */}
                <p><strong>{language === 'cs' ? 'Ceník' : 'Price List'}:</strong> {master.priceList && master.priceList.length > 0 ? (language === 'cs' ? 'Ano' : 'Yes') : (language === 'cs' ? 'Ne' : 'No')}</p>
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
              <MasterProfileEditForm
                master={master}
                language={language}
                translations={{
                  name: t.profileFields.name,
                  email: t.profileFields.email,
                  phone: t.profileFields.phone,
                  specialty: t.profileFields.specialty,
                  experience: t.profileFields.experience,
                  address: t.profileFields.address,
                  website: t.profileFields.website,
                  description: t.profileFields.description,
                  basicInfo: language === 'cs' ? 'Základní informace' : 'Basic Information',
                  location: language === 'cs' ? 'Lokace' : 'Location',
                  servicesLabel: language === 'cs' ? 'Služby' : 'Services',
                  languagesLabel: language === 'cs' ? 'Jazyky' : 'Languages',
                  workingHours: language === 'cs' ? 'Pracovní doba' : 'Working Hours',
                  photo: language === 'cs' ? 'Fotografie' : 'Photo',
                  additionalInfo: language === 'cs' ? 'Další informace' : 'Additional Information',
                  namePlaceholder: language === 'cs' ? 'Zadejte své jméno' : 'Enter your name',
                  emailPlaceholder: language === 'cs' ? 'Zadejte svůj email' : 'Enter your email',
                  phonePlaceholder: language === 'cs' ? 'Zadejte svůj telefon' : 'Enter your phone',
                  specialtyPlaceholder: language === 'cs' ? 'Zadejte svou specializaci' : 'Enter your specialty',
                  experiencePlaceholder: language === 'cs' ? 'Zadejte své zkušenosti' : 'Enter your experience',
                  websitePlaceholder: language === 'cs' ? 'Zadejte URL vašich webových stránek' : 'Enter your website URL',
                  descriptionPlaceholder: language === 'cs' ? 'Popište sebe a své služby' : 'Describe yourself and your services',
                  selectServices: language === 'cs' ? 'Vyberte služby' : 'Select services',
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
                    'Slovak': language === 'cs' ? 'Slovenština' : 'Slovak'
                  }
                }}
                onSave={updateProfile}
                onCancel={() => setEditingProfile(false)}
              />
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
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
                      <p className="review-date">
                        {new Date(review.createdAt?.toDate ? review.createdAt.toDate() : review.createdAt).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDashboard;
