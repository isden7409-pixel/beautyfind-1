import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { FavoriteItem, UserBooking, DashboardStats } from '../../types';
import { collection, query, where, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import PageHeader from '../../components/PageHeader';

interface UserDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ language, onBack, onLanguageChange }) => {
  const { userProfile } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
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
  const [activeTab, setActiveTab] = useState<'favorites' | 'bookings' | 'profile'>('favorites');

  useEffect(() => {
    if (userProfile) {
      loadUserData();
    }
  }, [userProfile]);

  const loadUserData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Загружаем избранное
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', userProfile.uid)
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const favoritesData = favoritesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as FavoriteItem[];
      setFavorites(favoritesData);

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
  };

  const removeFavorite = async (favoriteId: string) => {
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      setFavorites(favorites.filter(f => f.id !== favoriteId));
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

  const translations = {
    cs: {
      title: 'Můj účet',
      back: 'Zpět',
      favorites: 'Oblíbené',
      bookings: 'Rezervace',
      profile: 'Profil',
      totalBookings: 'Celkem rezervací',
      pendingBookings: 'Čekající',
      completedBookings: 'Dokončené',
      totalSpent: 'Celkem utraceno',
      noFavorites: 'Nemáte žádné oblíbené salony nebo mistry',
      noBookings: 'Nemáte žádné rezervace',
      remove: 'Odebrat',
      cancel: 'Zrušit',
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
        type: 'Typ'
      }
    },
    en: {
      title: 'My Account',
      back: 'Back',
      favorites: 'Favorites',
      bookings: 'Bookings',
      profile: 'Profile',
      totalBookings: 'Total Bookings',
      pendingBookings: 'Pending',
      completedBookings: 'Completed',
      totalSpent: 'Total Spent',
      noFavorites: 'You have no favorite salons or masters',
      noBookings: 'You have no bookings',
      remove: 'Remove',
      cancel: 'Cancel',
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
        type: 'Type'
      }
    }
  };

  const t = translations[language];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Loading...</div>
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
          <p>{t.totalSpent}</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'favorites' ? 'active' : ''}
          onClick={() => setActiveTab('favorites')}
        >
          {t.favorites}
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
      </div>

      <div className="dashboard-content">
        {activeTab === 'favorites' && (
          <div className="favorites-section">
            <h2>{t.favorites}</h2>
            {favorites.length === 0 ? (
              <p>{t.noFavorites}</p>
            ) : (
              <div className="favorites-list">
                {favorites.map(favorite => (
                  <div key={favorite.id} className="favorite-item">
                    <div className="favorite-info">
                      <h4>{favorite.itemType === 'salon' ? 'Salon' : 'Master'}</h4>
                      <p>ID: {favorite.itemId}</p>
                    </div>
                    <button 
                      onClick={() => removeFavorite(favorite.id)}
                      className="remove-button"
                    >
                      {t.remove}
                    </button>
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
            <div className="profile-info">
              <p><strong>{t.profileFields.name}:</strong> {userProfile?.name}</p>
              <p><strong>{t.profileFields.email}:</strong> {userProfile?.email}</p>
              <p><strong>{t.profileFields.phone}:</strong> {userProfile?.phone}</p>
              <p><strong>{t.profileFields.type}:</strong> {userProfile?.type}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
