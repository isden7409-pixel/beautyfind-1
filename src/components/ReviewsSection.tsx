import React, { useState } from 'react';
import { Review, Language } from '../types';
import { reviewService } from '../firebase/services';

interface ReviewsSectionProps {
  reviews: Review[];
  language: Language;
  translations: any;
  onAddReview: (review: Omit<Review, 'id'>) => void;
  salonId?: string;
  masterId?: string;
}

const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  language,
  translations,
  onAddReview,
  salonId,
  masterId,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReview, setNewReview] = useState({
    userName: '',
    rating: 5,
    comment: '',
  });

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.userName.trim() && newReview.comment.trim()) {
      const payload: any = {
        userId: Math.random().toString(),
        userName: newReview.userName,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString(),
      };
      if (salonId) payload.salonId = salonId;
      if (masterId) payload.masterId = masterId;
      await onAddReview(payload);
      setNewReview({ userName: '', rating: 5, comment: '' });
      setShowAddForm(false);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`star ${i < rating ? 'filled' : ''}`}
      >
        ⭐
      </span>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US');
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h3>{t.reviews}</h3>
        <div className="rating-summary">
          <div className="average-rating">
            <span className="rating-number">{averageRating}</span>
            <div className="stars">{renderStars(Math.round(Number(averageRating)))}</div>
            <span className="review-count">({reviews.length} {t.reviews})</span>
          </div>
        </div>
        <button
          className="add-review-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {t.addReview}
        </button>
      </div>

      {showAddForm && (
        <div className="add-review-form">
          <h4>{t.writeReview}</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="userName">{t.yourName} *</label>
              <input
                type="text"
                id="userName"
                value={newReview.userName}
                onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                required
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label>{t.rating} *</label>
              <div className="rating-input">
                {Array.from({ length: 5 }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`star-btn ${i < newReview.rating ? 'active' : ''}`}
                    onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                  >
                    ⭐
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="comment">{t.comment} *</label>
              <textarea
                id="comment"
                value={newReview.comment}
                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                required
                className="form-textarea"
                rows={4}
                placeholder={t.commentPlaceholder}
              />
            </div>
            
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="btn btn-secondary"
              >
                {t.cancel}
              </button>
              <button type="submit" className="btn btn-primary">
                {t.submitReview}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="reviews-list">
        {reviews.length === 0 ? (
          <p className="no-reviews">{t.noReviews}</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <h4>{review.userName}</h4>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <span className="review-date">{formatDate(review.date)}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;
