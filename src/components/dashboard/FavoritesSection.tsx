import React, { useState, useEffect } from 'react';
import { Master, Salon } from '../../types';
import { masterService, salonService, reviewService } from '../../firebase/services';
import { useReviewSummary } from '../../hooks/useReviewSummary';

interface FavoritesSectionProps {
  language: 'cs' | 'en';
  userId: string;
  onNavigateToSalon?: (salonId: string) => void;
  onNavigateToMaster?: (masterId: string) => void;
}

const FavoritesSection: React.FC<FavoritesSectionProps> = ({ 
  language, 
  userId, 
  onNavigateToSalon, 
  onNavigateToMaster 
}) => {
  const [favoriteSalons, setFavoriteSalons] = useState<Salon[]>([]);
  const [favoriteMasters, setFavoriteMasters] = useState<Master[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = {
    cs: {
      favoriteSalons: 'Oblíbené salony',
      favoriteMasters: 'Oblíbení mistři',
      noFavoriteSalons: 'Zatím nemáte žádné oblíbené salony',
      noFavoriteMasters: 'Zatím nemáte žádné oblíbené mistry',
      remove: 'Odebrat',
      reviews: 'recenzí',
      loading: 'Načítání oblíbených...',
    },
    en: {
      favoriteSalons: 'Favorite Salons',
      favoriteMasters: 'Favorite Masters',
      noFavoriteSalons: 'You have no favorite salons yet',
      noFavoriteMasters: 'You have no favorite masters yet',
      remove: 'Remove',
      reviews: 'reviews',
      loading: 'Loading favorites...',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadFavorites();
  }, [userId]);

  // Обновляем список при изменении избранного
  useEffect(() => {
    const handleFavoritesChange = () => {
      loadFavorites();
    };

    // Слушаем изменения в localStorage или можно использовать custom event
    window.addEventListener('favoritesChanged', handleFavoritesChange);
    
    return () => {
      window.removeEventListener('favoritesChanged', handleFavoritesChange);
    };
  }, [userId]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      
      // Получаем список ID избранных элементов
      const favorites = await reviewService.getFavorites(userId);
      
      // Загружаем данные салонов
      if (favorites.favoriteSalons.length > 0) {
        const salonsData = await Promise.all(
          favorites.favoriteSalons.map(id => salonService.getById(id))
        );
        setFavoriteSalons(salonsData.filter(salon => salon !== null) as Salon[]);
      } else {
        setFavoriteSalons([]);
      }
      
      // Загружаем данные мастеров
      if (favorites.favoriteMasters.length > 0) {
        const mastersData = await Promise.all(
          favorites.favoriteMasters.map(id => masterService.getById(id))
        );
        setFavoriteMasters(mastersData.filter(master => master !== null) as Master[]);
      } else {
        setFavoriteMasters([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSalon = async (salonId: string) => {
    try {
      // Удаляем из избранного через reviewService
      await reviewService.toggleFavorite(userId, salonId, 'salon');
      // Обновляем локальное состояние
      setFavoriteSalons(prev => prev.filter(s => s.id !== salonId));
      // Отправляем событие об изменении избранного
      window.dispatchEvent(new CustomEvent('favoritesChanged'));
    } catch (error) {
      console.error('Error removing salon from favorites:', error);
    }
  };

  const handleRemoveMaster = async (masterId: string) => {
    try {
      // Удаляем из избранного через reviewService
      await reviewService.toggleFavorite(userId, masterId, 'master');
      // Обновляем локальное состояние
      setFavoriteMasters(prev => prev.filter(m => m.id !== masterId));
      // Отправляем событие об изменении избранного
      window.dispatchEvent(new CustomEvent('favoritesChanged'));
    } catch (error) {
      console.error('Error removing master from favorites:', error);
    }
  };

  const formatAddress = (salon: Salon) => {
    if (salon.structuredAddress) {
      return `${salon.structuredAddress.street} ${salon.structuredAddress.houseNumber}, ${salon.structuredAddress.postalCode} ${salon.structuredAddress.city}`;
    }
    return salon.address || '';
  };

  const formatMasterAddress = (master: Master) => {
    if (master.structuredAddress) {
      return `${master.structuredAddress.street} ${master.structuredAddress.houseNumber}, ${master.structuredAddress.postalCode} ${master.structuredAddress.city}`;
    }
    return master.address || '';
  };

  const handleSalonClick = (salonId: string) => {
    if (onNavigateToSalon) {
      onNavigateToSalon(salonId);
    } else {
      // Fallback to window navigation
      window.location.href = `/salon/${salonId}`;
    }
  };

  const handleMasterClick = (masterId: string) => {
    if (onNavigateToMaster) {
      onNavigateToMaster(masterId);
    } else {
      // Fallback to window navigation
      window.location.href = `/master/${masterId}`;
    }
  };

  // Компонент карточки салона с реальным рейтингом
  const FavoriteSalonCard: React.FC<{ salon: Salon }> = ({ salon }) => {
    const { count, average } = useReviewSummary('salon', salon.id);
    
    return (
      <div 
        className="favorite-item" 
        onClick={() => handleSalonClick(salon.id)}
      >
        <div className="favorite-item-content">
          <h4>{salon.name}</h4>
          <p className="favorite-item-address">
            {formatAddress(salon)}
          </p>
          <p className="favorite-item-rating">
            ⭐ {average.toFixed(1)} ({count} {translations.reviews})
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveSalon(salon.id);
          }}
          className="remove-button"
        >
          {translations.remove}
        </button>
      </div>
    );
  };

  // Компонент карточки мастера с реальным рейтингом
  const FavoriteMasterCard: React.FC<{ master: Master }> = ({ master }) => {
    const { count, average } = useReviewSummary('master', master.id);
    
    return (
      <div 
        className="favorite-item" 
        onClick={() => handleMasterClick(master.id)}
      >
        <div className="favorite-item-content">
          <h4>{master.name}</h4>
          <p className="favorite-item-address">
            {formatMasterAddress(master)}
          </p>
          <p className="favorite-item-rating">
            ⭐ {average.toFixed(1)} ({count} {translations.reviews})
          </p>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveMaster(master.id);
          }}
          className="remove-button"
        >
          {translations.remove}
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="favorites-loading">
        <p>{translations.loading}</p>
      </div>
    );
  }

  return (
    <div className="favorites-section">
      {/* Oblíbené salony */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{
          color: '#333',
          marginBottom: '15px',
          fontSize: '1.2rem',
          borderBottom: '2px solid #6A75D4', // Синяя линия как в клиентском дашборде
          paddingBottom: '8px'
        }}>
          {translations.favoriteSalons}
        </h3>
        {favoriteSalons.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {favoriteSalons.map((salon) => (
              <FavoriteSalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontStyle: 'italic',
            padding: '40px 20px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            {translations.noFavoriteSalons}
          </p>
        )}
      </div>

      {/* Oblíbení mistři */}
      <div style={{ marginBottom: '10px' }}>
        <h3 style={{
          color: '#333',
          marginBottom: '15px',
          fontSize: '1.2rem',
          borderBottom: '2px solid #6A75D4', // Синяя линия как в клиентском дашборде
          paddingBottom: '8px'
        }}>
          {translations.favoriteMasters}
        </h3>
        {favoriteMasters.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            {favoriteMasters.map((master) => (
              <FavoriteMasterCard key={master.id} master={master} />
            ))}
          </div>
        ) : (
          <p style={{
            textAlign: 'center',
            color: '#6b7280',
            fontStyle: 'italic',
            padding: '40px 20px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px dashed #d1d5db'
          }}>
            {translations.noFavoriteMasters}
          </p>
        )}
      </div>
    </div>
  );
};

export default FavoritesSection;