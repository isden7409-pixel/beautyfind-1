import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { UserBooking, DashboardStats, Salon, Master } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { userService } from '../../firebase/services';
import PageHeader from '../../components/PageHeader';
import ClientProfileEditForm from '../../components/ClientProfileEditForm';
import { UserBookingsTab } from '../../components/dashboard/UserBookingsTab';

interface UserDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
  onNavigate?: (path: string) => void;
  onOpenRegistration?: () => void;
  onOpenPremium?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ language, onBack, onLanguageChange, onNavigate, onOpenRegistration, onOpenPremium }) => {
  const { userProfile } = useAuth();
  const [favoriteSalons, setFavoriteSalons] = useState<Salon[]>([]);
  const [favoriteMasters, setFavoriteMasters] = useState<Master[]>([]);
  const [userReviews, setUserReviews] = useState<any[]>([]);
  const [bookings, setBookings] = useState<UserBooking[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    averageRating: 0,
    totalReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'rezervace' | 'favorites' | 'reviews'>('profile');
  const [editingProfile, setEditingProfile] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!userProfile) return;

    try {
      const favorites = await userService.getFavorites(userProfile.uid);

      // Загружаем данные салонов
      if (favorites.favoriteSalons.length > 0) {
        const salonPromises = favorites.favoriteSalons.map(async (salonId: string) => {
          const salonQuery = query(collection(db, 'salons'), where('__name__', '==', salonId));
          const salonSnapshot = await getDocs(salonQuery);
          return salonSnapshot.empty ? null : { id: salonSnapshot.docs[0].id, ...salonSnapshot.docs[0].data() } as Salon;
        });
        const salons = (await Promise.all(salonPromises)).filter(Boolean) as Salon[];
        setFavoriteSalons(salons);
      } else {
        setFavoriteSalons([]);
      }

      // Загружаем данные мастеров
      if (favorites.favoriteMasters.length > 0) {
        const masterPromises = favorites.favoriteMasters.map(async (masterId: string) => {
          const masterQuery = query(collection(db, 'masters'), where('__name__', '==', masterId));
          const masterSnapshot = await getDocs(masterQuery);
          return masterSnapshot.empty ? null : { id: masterSnapshot.docs[0].id, ...masterSnapshot.docs[0].data() } as Master;
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

  const loadUserData = useCallback(async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Загружаем бронирования
      const bookingsQuery = query(
        collection(db, 'userBookings'),
        where('userId', '==', userProfile.uid)
      );
      const bookingsSnapshot = await getDocs(bookingsQuery);
      const bookingsData = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserBooking[];
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
        averageRating: 0, // TODO: реализовать загрузку рейтингов
        totalReviews: 0 // TODO: реализовать загрузку отзывов
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [userProfile]);

  useEffect(() => {
    if (userProfile) {
      loadUserData();
      loadFavorites();
      loadUserReviews();
    }
  }, [userProfile, loadFavorites, loadUserReviews, loadUserData]);

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

  const cancelBooking = async (bookingId: string) => {
    try {
      const bookingRef = doc(db, 'userBookings', bookingId);
      await updateDoc(bookingRef, { status: 'cancelled' });
      setBookings(bookings.map(b => 
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ));
    } catch (error) {
      console.error('Error cancelling booking:', error);
    }
  };

  const updateProfile = async (updatedData: any) => {
    if (!userProfile) return;

    try {
      const userRef = doc(db, 'users', userProfile.uid);
      await updateDoc(userRef, updatedData);
      setEditingProfile(false);
      // Обновляем локальное состояние профиля
      // userProfile будет обновлен через AuthProvider
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const translations = {
    cs: {
      title: 'Můj účet',
      back: 'Hlavní stránka',
      profile: 'Profil',
      rezervace: 'Moje rezervace',
      favorites: 'Oblíbené',
      reviews: 'Moje recenze',
      bookings: 'Rezervace',
      totalBookings: 'Celkem rezervací',
      pendingBookings: 'Čekající',
      completedBookings: 'Dokončené',
      totalSpent: 'Celkem utraceno',
      noFavorites: 'Nemáte žádné oblíbené salony nebo mistry',
      favoriteSalons: 'Oblíbené salony',
      favoriteMasters: 'Oblíbení mistři',
      noBookings: 'Nemáte žádné rezervace',
      remove: 'Odebrat',
      cancel: 'Zrušit',
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
        email: 'Email',
        phone: 'Telefon',
        type: 'Typ',
        address: 'Adresa',
        website: 'Webové stránky',
        description: 'Popis'
      }
    },
    en: {
      title: 'My Account',
      back: 'Main Page',
      profile: 'Profile',
      rezervace: 'My Bookings',
      favorites: 'Favorites',
      reviews: 'My Reviews',
      bookings: 'Bookings',
      totalBookings: 'Total Bookings',
      pendingBookings: 'Pending',
      completedBookings: 'Completed',
      totalSpent: 'Total Spent',
      noFavorites: 'You have no favorite salons or masters',
      favoriteSalons: 'Favorite Salons',
      favoriteMasters: 'Favorite Masters',
      noBookings: 'You have no bookings',
      remove: 'Remove',
      cancel: 'Cancel',
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
        email: 'Email',
        phone: 'Phone',
        type: 'Type',
        address: 'Address',
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
        userNameClickable={false}
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
          <p>{t.totalSpent}</p>
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
          className={activeTab === 'rezervace' ? 'active' : ''}
          onClick={() => setActiveTab('rezervace')}
        >
          {t.rezervace}
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
          {t.reviews}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'rezervace' && userProfile && (
          <UserBookingsTab
            user={userProfile}
            language={language}
          />
        )}

        {activeTab === 'favorites' && (
          <div className="favorites-section">
            <div className="favorites-content">
              <div className="favorites-category">
                <h3>{t.favoriteSalons}</h3>
                {favoriteSalons.length > 0 ? (
                  <div className="favorites-grid">
                    {favoriteSalons.map((salon) => (
                      <div key={salon.id} className="favorite-item" onClick={() => window.location.href = `/salon/${salon.id}`}>
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
                          {t.remove}
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
                <h3>{t.favoriteMasters}</h3>
                {favoriteMasters.length > 0 ? (
                  <div className="favorites-grid">
                    {favoriteMasters.map((master) => (
                      <div key={master.id} className="favorite-item" onClick={() => window.location.href = `/master/${master.id}`}>
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
                          {t.remove}
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

        {activeTab === 'rezervace' && (
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
                      <p>{booking.date} at {booking.time}</p>
                      <p>Price: {booking.price} Kč</p>
                      <p>Status: {t.status[booking.status]}</p>
                    </div>
                    {booking.status === 'pending' && (
                      <button 
                        onClick={() => cancelBooking(booking.id)}
                        className="cancel-button"
                      >
                        {t.cancel}
                      </button>
                    )}
                  </div>
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
                <p><strong>{t.profileFields.name}:</strong> {userProfile?.name}</p>
                <p><strong>{t.profileFields.email}:</strong> {userProfile?.email}</p>
                <p><strong>{t.profileFields.phone}:</strong> {userProfile?.phone}</p>
                <p><strong>{t.profileFields.type}:</strong> {userProfile?.type === 'client' ? (language === 'cs' ? 'Klient' : 'Client') : userProfile?.type}</p>
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

            {editingProfile && userProfile && (
              <ClientProfileEditForm
                userProfile={userProfile}
                language={language}
                translations={{
                  name: t.profileFields.name,
                  email: t.profileFields.email,
                  phone: t.profileFields.phone,
                  type: t.profileFields.type,
                  basicInfo: language === 'cs' ? 'Základní informace' : 'Basic Information',
                  namePlaceholder: language === 'cs' ? 'Zadejte své jméno' : 'Enter your name',
                  emailPlaceholder: language === 'cs' ? 'Zadejte svůj email' : 'Enter your email',
                  phonePlaceholder: language === 'cs' ? 'Zadejte svůj telefon' : 'Enter your phone',
                  client: language === 'cs' ? 'Klient' : 'Client',
                  cancel: t.cancel,
                  save: t.save,
                  saving: language === 'cs' ? 'Ukládání...' : 'Saving...'
                }}
                onSave={updateProfile}
                onCancel={() => setEditingProfile(false)}
              />
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="reviews-section">
            <h2>{t.reviews}</h2>
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

export default UserDashboard;
