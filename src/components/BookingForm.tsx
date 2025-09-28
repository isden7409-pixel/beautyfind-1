import React, { useState } from 'react';
import { Master, Salon, Service, Booking } from '../types';

interface BookingFormProps {
  master: Master;
  salon?: Salon;
  selectedService: Service | null;
  selectedDate: string | null;
  selectedTime: string | null;
  onBookingSuccess: (booking: Booking) => void;
  language: 'cs' | 'en';
  translations: any;
}

const BookingForm: React.FC<BookingFormProps> = ({
  master,
  salon,
  selectedService,
  selectedDate,
  selectedTime,
  onBookingSuccess,
  language,
  translations
}) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedDate || !selectedTime) {
      return;
    }

    setIsSubmitting(true);

    // Валидация
    if (!formData.clientName.trim()) {
      alert(t.pleaseEnterName);
      setIsSubmitting(false);
      return;
    }

    if (!formData.clientPhone.trim()) {
      alert(t.pleaseEnterPhone);
      setIsSubmitting(false);
      return;
    }

    if (!formData.clientEmail.trim()) {
      alert(t.pleaseEnterEmail);
      setIsSubmitting(false);
      return;
    }

    // Создаем объект бронирования
    const booking: Booking = {
      id: Date.now().toString(),
      masterId: master.id,
      salonId: salon?.id || master.salonId,
      clientName: formData.clientName.trim(),
      clientPhone: formData.clientPhone.trim(),
      clientEmail: formData.clientEmail.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      duration: selectedService.duration,
      price: selectedService.price,
      status: 'pending',
      notes: formData.notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      onBookingSuccess(booking);
    } catch (error) {
      console.error('Booking error:', error);
      alert(t.bookingError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    };
    return date.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', options);
  };

  return (
    <div className="booking-form">
      <div className="booking-summary">
        <h3>{t.bookingSummary}</h3>
        <div className="summary-item">
          <strong>{t.master}:</strong> {master.name}
        </div>
        {salon && (
          <div className="summary-item">
            <strong>{t.salon}:</strong> {salon.name}
          </div>
        )}
        {master.address && (
          <div className="summary-item">
            <strong>{t.address}:</strong> {master.address}
          </div>
        )}
        <div className="summary-item">
          <strong>{t.service}:</strong> {selectedService?.name}
        </div>
        <div className="summary-item">
          <strong>{t.duration}:</strong> {selectedService?.duration} {t.minutes}
        </div>
        <div className="summary-item">
          <strong>{t.date}:</strong> {selectedDate ? formatDate(selectedDate) : ''}
        </div>
        <div className="summary-item">
          <strong>{t.time}:</strong> {selectedTime}
        </div>
        <div className="summary-item price">
          <strong>{t.price}:</strong> {selectedService?.price} CZK
        </div>
      </div>

      <form onSubmit={handleSubmit} className="booking-details-form">
        <h3>{t.contactDetails}</h3>
        
        <div className="form-group">
          <label htmlFor="clientName">{t.fullName} *</label>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            required
            placeholder={t.enterFullName}
          />
        </div>

        <div className="form-group">
          <label htmlFor="clientPhone">{t.phoneNumber} *</label>
          <input
            type="tel"
            id="clientPhone"
            name="clientPhone"
            value={formData.clientPhone}
            onChange={handleInputChange}
            required
            placeholder={t.enterPhoneNumber}
          />
        </div>

        <div className="form-group">
          <label htmlFor="clientEmail">{t.emailAddress} *</label>
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleInputChange}
            required
            placeholder={t.enterEmailAddress}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes">{t.additionalNotes}</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder={t.enterAdditionalNotes}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting || !selectedService || !selectedDate || !selectedTime}
          >
            {isSubmitting ? `${t.booking}...` : t.confirmBooking}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
