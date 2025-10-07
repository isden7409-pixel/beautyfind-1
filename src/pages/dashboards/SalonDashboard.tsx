import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { Salon, Master, Booking, DashboardStats } from '../../types';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import PageHeader from '../../components/PageHeader';

interface SalonDashboardProps {
  language: 'cs' | 'en';
  onBack: () => void;
  onLanguageChange: (language: 'cs' | 'en') => void;
}

const SalonDashboard: React.FC<SalonDashboardProps> = ({ language, onBack, onLanguageChange }) => {
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
  const [activeTab, setActiveTab] = useState<'overview' | 'masters' | 'bookings' | 'profile'>('overview');
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAddMaster, setShowAddMaster] = useState(false);

  useEffect(() => {
    if (userProfile && userProfile.type === 'salon') {
      loadSalonData();
    }
  }, [userProfile]);

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

  const updateSalonProfile = async (updatedData: Partial<Salon>) => {
    if (!salon) return;

    try {
      const salonRef = doc(db, 'salons', salon.id);
      await updateDoc(salonRef, updatedData);
      setSalon({ ...salon, ...updatedData });
      setEditingProfile(false);
    } catch (error) {
      console.error('Error updating salon profile:', error);
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

  const translations = {
    cs: {
      title: 'Kabinet salonu',
      back: 'Zpět',
      overview: 'Přehled',
      masters: 'Mistři',
      bookings: 'Rezervace',
      profile: 'Profil',
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
      }
    },
    en: {
      title: 'Salon Dashboard',
      back: 'Back',
      overview: 'Overview',
      masters: 'Masters',
      bookings: 'Bookings',
      profile: 'Profile',
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

  if (!salon) {
    return (
      <div className="dashboard">
        <div className="error">Salon profile not found</div>
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
            {/* TODO: Implement profile editing component */}
            <div className="profile-info">
              <p><strong>Name:</strong> {salon.name}</p>
              <p><strong>Address:</strong> {salon.address}</p>
              <p><strong>Phone:</strong> {salon.phone}</p>
              <p><strong>Email:</strong> {salon.email}</p>
              <p><strong>Website:</strong> {salon.website}</p>
              <p><strong>Description:</strong> {salon.description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SalonDashboard;
