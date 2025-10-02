import React, { useState } from 'react';

interface PhotoCarouselProps {
  images: string[];
  mainImage: string;
  altText: string;
  className?: string;
  language?: string;
}

const PhotoCarousel: React.FC<PhotoCarouselProps> = ({
  images,
  mainImage,
  altText,
  className = '',
  language = 'cs'
}) => {
  // Объединяем главное фото с дополнительными фото
  const allImages = [mainImage, ...images.filter(img => img && img.trim() !== '' && img !== mainImage)];
  const [currentIndex, setCurrentIndex] = useState(0);

  // Если только одно фото, показываем без стрелочек
  if (allImages.length <= 1) {
    return (
      <div className={`photo-carousel ${className}`}>
        {mainImage && mainImage.trim() !== '' ? (
          <img 
            src={mainImage} 
            alt={altText} 
            className="carousel-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const placeholder = target.nextElementSibling as HTMLElement;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
        ) : (
          <div className="image-placeholder">
            <div className="placeholder-content">
              <div className="placeholder-icon">🏢</div>
              <div className="placeholder-text">{language === 'cs' ? 'SALON' : 'SALON'}</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? allImages.length - 1 : prevIndex - 1
    );
  };

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => 
      prevIndex === allImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  return (
    <div className={`photo-carousel ${className}`}>
      <div className="carousel-container">
        <img 
          src={allImages[currentIndex]} 
          alt={altText} 
          className="carousel-image"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const placeholder = target.nextElementSibling as HTMLElement;
            if (placeholder) {
              placeholder.style.display = 'flex';
            }
          }}
        />
        <div className="image-placeholder" style={{ display: 'none' }}>
          <div className="placeholder-content">
            <div className="placeholder-icon">🏢</div>
            <div className="placeholder-text">{language === 'cs' ? 'SALON' : 'SALON'}</div>
          </div>
        </div>

        {/* Стрелочки навигации */}
        <button 
          className="carousel-arrow carousel-arrow-left" 
          onClick={goToPrevious}
          aria-label="Предыдущее фото"
        >
          ‹
        </button>
        <button 
          className="carousel-arrow carousel-arrow-right" 
          onClick={goToNext}
          aria-label="Следующее фото"
        >
          ›
        </button>

        {/* Индикаторы точек */}
        <div className="carousel-indicators">
          {allImages.map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${index === currentIndex ? 'active' : ''}`}
              onClick={(e) => goToSlide(index, e)}
              aria-label={`Перейти к фото ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoCarousel;
