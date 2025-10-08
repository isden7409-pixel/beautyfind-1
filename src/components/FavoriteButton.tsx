import React, { useState, useEffect } from 'react';
import { useAuth } from './auth/AuthProvider';
import { reviewService } from '../firebase/services';
import AuthModal from './auth/AuthModal';

interface FavoriteButtonProps {
  itemId: string;
  itemType: 'salon' | 'master';
  language: 'cs' | 'en';
  className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  itemId,
  itemType,
  language,
  className = ''
}) => {
  const { currentUser, userProfile } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Загружаем статус избранного при монтировании
  useEffect(() => {
    if (currentUser && userProfile) {
      loadFavoriteStatus();
    }
  }, [currentUser, userProfile, itemId, itemType]);

  const loadFavoriteStatus = async () => {
    if (!currentUser) return;
    
    try {
      const favorites = await reviewService.getFavorites(currentUser.uid);
      const field = itemType === 'salon' ? 'favoriteSalons' : 'favoriteMasters';
      setIsFavorite(favorites[field].includes(itemId));
    } catch (error) {
      console.error('Error loading favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    try {
      const result = await reviewService.toggleFavorite(currentUser.uid, itemId, itemType);
      setIsFavorite(result === 'added');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert(language === 'cs' ? 'Chyba při přidávání do oblíbených' : 'Error adding to favorites');
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) {
      return language === 'cs' ? 'Načítání...' : 'Loading...';
    }
    return isFavorite 
      ? (language === 'cs' ? 'V oblíbených' : 'In favorites')
      : (language === 'cs' ? 'Přidat do oblíbených' : 'Add to favorites');
  };

  return (
    <>
      <button
        onClick={handleToggleFavorite}
        disabled={loading}
        className={`favorite-button ${className} ${isFavorite ? 'favorited' : ''}`}
        style={{
          background: isFavorite ? '#ff6b6b' : '#f8f9fa',
          color: isFavorite ? 'white' : '#333',
          border: `2px solid ${isFavorite ? '#ff6b6b' : '#dee2e6'}`,
          borderRadius: '25px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.3s ease',
          opacity: loading ? 0.7 : 1,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isFavorite ? '❤️' : '🤍'}
        <span>{getButtonText()}</span>
      </button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => {
          setShowAuthModal(false);
          // После успешного входа пользователь может добавить в избранное
        }}
        language={language}
        onGoToRegistration={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default FavoriteButton;
