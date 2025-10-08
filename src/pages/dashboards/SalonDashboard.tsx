import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../components/auth/AuthProvider';
import { Salon, Master, Booking, DashboardStats } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { reviewService, userService } from '../../firebase/services';
import PageHeader from '../../components/PageHeader';
import SalonProfileEditForm from '../../components/SalonProfileEditForm';

interface SalonDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
}

const SalonDashboard: React.FC<SalonDashboardProps> = ({ language, onBack, onLanguageChange }) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
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
  const [activeTab, setActiveTab] = useState<'overview' | 'masters' | 'bookings' | 'profile' | 'favorites' | 'reviews'>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddMaster, setShowAddMaster] = useState(false);
  const [favoriteSalons, setFavoriteSalons] = useState<Salon[]>([]);
  const [favoriteMasters, setFavoriteMasters] = useState<Master[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);

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
    if (userProfile && userProfile.type === 'salon') {
      loadSalonData();
      loadFavorites();
      loadUserReviews();
    }
  }, [userProfile, loadFavorites, loadUserReviews]);

  const loadSalonData = async () => {
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
  };

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


  const addMaster = async (masterData: Partial<Master>) => {
    if (!salon) return;

    try {
      const newMaster: Master = {
        id: '', // Will be set by Firestore
        name: masterData.name || '',
        specialty: masterData.specialty || '',
        experience: masterData.experience || '',
        rating: 0,
        reviews: 0,
        photo: masterData.photo || '',
        worksInSalon: true,
        isFreelancer: false,
        salonId: salon.id,
        salonName: salon.name,
        email: masterData.email || '',
        phone: masterData.phone || '',
        services: masterData.services || [],
        languages: masterData.languages || [],
        bookingEnabled: true,
        workingHours: [],
        availableServices: [],
        unavailableDates: [],
        bookings: [],
        byAppointment: false
      };

      const docRef = await addDoc(collection(db, 'masters'), newMaster);
      newMaster.id = docRef.id;
      setMasters([...masters, newMaster]);
      setShowAddMaster(false);
    } catch (error) {
      console.error('Error adding master:', error);
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

  const translations = {
    cs: {
      title: 'Kabinet salonu',
      back: 'Zpět',
      overview: 'Přehled',
      masters: 'Mistři',
      bookings: 'Rezervace',
      profile: 'Profil',
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
      back: 'Back',
      overview: 'Overview',
      masters: 'Masters',
      bookings: 'Bookings',
      profile: 'Profile',
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
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          {t.overview}
        </button>
        <button 
          className={activeTab === 'masters' ? 'active' : ''}
          onClick={() => setActiveTab('masters')}
        >
          {t.masters}
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          {t.bookings}
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
                onClick={() => setShowAddMaster(true)}
                className="add-button"
              >
                {t.addMaster}
              </button>
            </div>
            {masters.length === 0 ? (
              <p>{t.noMasters}</p>
            ) : (
              <div className="masters-list">
                {masters.map(master => (
                  <div key={master.id} className="master-item">
                    <div className="master-info">
                      <h4>{master.name}</h4>
                      <p>Specialty: {master.specialty}</p>
                      <p>Experience: {master.experience}</p>
                      <p>Rating: {master.rating} ({master.reviews} reviews)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                      <p>Client: {booking.clientName}</p>
                      <p>Master: {masters.find(m => m.id === booking.masterId)?.name}</p>
                      <p>Date: {booking.date} at {booking.time}</p>
                      <p>Price: {booking.price} Kč</p>
                      <p>Status: {t.status[booking.status]}</p>
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

        {activeTab === 'profile' && (
          <div className="profile-section">
            <h2>{t.profile}</h2>
            <button 
              onClick={() => setEditingProfile(!editingProfile)}
              className="edit-button"
            >
              {editingProfile ? t.save : t.edit}
            </button>
            
            {!editingProfile && (
              <div className="profile-info">
                <p><strong>{t.profileFields.name}:</strong> {salon.name}</p>
                <p><strong>{t.profileFields.address}:</strong> {salon.address}</p>
                <p><strong>{t.profileFields.phone}:</strong> {salon.phone}</p>
                <p><strong>{t.profileFields.email}:</strong> {salon.email}</p>
                <p><strong>{t.profileFields.website}:</strong> {salon.website}</p>
                <p><strong>{t.profileFields.description}:</strong> {salon.description}</p>
              </div>
            )}

            <SalonProfileEditForm
              salon={salon}
              language={language}
              translations={{
                name: t.profileFields.name,
                email: t.profileFields.email,
                phone: t.profileFields.phone,
                address: t.profileFields.address,
                website: t.profileFields.website,
                description: t.profileFields.description,
                basicInfo: language === 'cs' ? 'Základní informace' : 'Basic Information',
                location: language === 'cs' ? 'Lokace' : 'Location',
                servicesLabel: language === 'cs' ? 'Služby' : 'Services',
                workingHours: language === 'cs' ? 'Pracovní doba' : 'Working Hours',
                photos: language === 'cs' ? 'Fotografie' : 'Photos',
                additionalInfo: language === 'cs' ? 'Další informace' : 'Additional Information',
                namePlaceholder: language === 'cs' ? 'Zadejte název salonu' : 'Enter salon name',
                emailPlaceholder: language === 'cs' ? 'Zadejte email salonu' : 'Enter salon email',
                phonePlaceholder: language === 'cs' ? 'Zadejte telefon salonu' : 'Enter salon phone',
                websitePlaceholder: language === 'cs' ? 'Zadejte URL webových stránek' : 'Enter website URL',
                descriptionPlaceholder: language === 'cs' ? 'Popište salon a jeho služby' : 'Describe salon and its services',
                selectServices: language === 'cs' ? 'Vyberte služby' : 'Select services',
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
                }
              }}
              onSave={updateSalonProfile}
              onCancel={() => setEditingProfile(false)}
            />
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

export default SalonDashboard;
