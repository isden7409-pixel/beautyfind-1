import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Master, Booking, DashboardStats, WorkingHours, Service } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import PageHeader from '../../components/PageHeader';

interface MasterDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
}

const MasterDashboard: React.FC<MasterDashboardProps> = ({ language, onBack, onLanguageChange }) => {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'schedule' | 'profile'>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.type === 'master') {
      loadMasterData();
    }
  }, [userProfile]);

  const loadMasterData = async () => {
    if (!userProfile) return;

    try {
      setLoading(true);

      // Загружаем профиль мастера
      const masterQuery = query(
        collection(db, 'masters'),
        where('email', '==', userProfile.email)
      );
      const masterSnapshot = await getDocs(masterQuery);
      
      if (!masterSnapshot.empty) {
        const masterData = masterSnapshot.docs[0].data() as Master;
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

  const updateProfile = async (updatedData: Partial<Master>) => {
    if (!master) return;

    try {
      const masterRef = doc(db, 'masters', master.id);
      await updateDoc(masterRef, updatedData);
      setMaster({ ...master, ...updatedData });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const updateSchedule = async (workingHours: WorkingHours[]) => {
    if (!master) return;

    try {
      const masterRef = doc(db, 'masters', master.id);
      await updateDoc(masterRef, { workingHours });
      setMaster({ ...master, workingHours });
      setEditingSchedule(false);
    } catch (error) {
      console.error('Error updating schedule:', error);
    }
  };

  const translations = {
    cs: {
      title: 'Kabinet mistra',
      back: 'Zpět',
      overview: 'Přehled',
      bookings: 'Rezervace',
      schedule: 'Rozvrh',
      profile: 'Profil',
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
      }
    },
    en: {
      title: 'Master Dashboard',
      back: 'Back',
      overview: 'Overview',
      bookings: 'Bookings',
      schedule: 'Schedule',
      profile: 'Profile',
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

  if (!master) {
    return (
      <div className="dashboard">
        <div className="error">Master profile not found</div>
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
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <h2>Přehled</h2>
            <div className="master-info">
              <h3>{master.name}</h3>
              <p>Specialty: {master.specialty}</p>
              <p>Experience: {master.experience}</p>
              <p>Rating: {master.rating} ({master.reviews} reviews)</p>
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
                      <p>Client: {booking.clientName}</p>
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
            <p>Schedule editing will be implemented here</p>
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
            {/* TODO: Implement profile editing component */}
            <div className="profile-info">
              <p><strong>Name:</strong> {master.name}</p>
              <p><strong>Specialty:</strong> {master.specialty}</p>
              <p><strong>Experience:</strong> {master.experience}</p>
              <p><strong>Phone:</strong> {master.phone}</p>
              <p><strong>Email:</strong> {master.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MasterDashboard;
