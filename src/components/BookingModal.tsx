import React, { useState } from 'react';
import { Master, Service, Booking, Language } from '../types';
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import { translateServices } from '../utils/serviceTranslations';

interface BookingModalProps {
  master: Master;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  language: 'cs' | 'en';
  translations: any;
}

const BookingModal: React.FC<BookingModalProps> = ({
  master,
  isOpen,
  onClose,
  onBookingSuccess,
  language,
  translations
}) => {
  const [currentStep, setCurrentStep] = useState<'service' | 'calendar' | 'form'>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const t = translations[language];

  // Сброс состояния при открытии модального окна
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep('service');
      setSelectedService(null);
      setSelectedDate(null);
      setSelectedTime(null);
    }
  }, [isOpen]);

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep('calendar');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setCurrentStep('form');
  };


  const handleBack = () => {
    switch (currentStep) {
      case 'calendar':
        setCurrentStep('service');
        setSelectedService(null);
        break;
      case 'form':
        setCurrentStep('calendar');
        setSelectedTime(null);
        break;
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="booking-modal-overlay" onClick={handleClose}>
      <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
        <div className="booking-modal-header">
          <h2>{t.bookWith} {master.name}</h2>
          <button className="close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="booking-modal-content">
          {currentStep === 'service' && (
            <div className="service-selection">
              <h3>{t.selectService}</h3>
              <div className="services-grid">
                {master.availableServices?.map(service => (
                  <div
                    key={service.id}
                    className={`service-card ${selectedService?.id === service.id ? 'selected' : ''}`}
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h4>{translateServices([service.name], language)[0]}</h4>
                    <p className="service-duration">{service.duration} {t.minutes}</p>
                    <p className="service-price">{service.price} CZK</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'calendar' && selectedService && (
            <div className="calendar-selection">
              <div className="step-header">
                <button className="back-btn" onClick={handleBack}>
                  {t.back}
                </button>
                <h3>{t.selectDateAndTime}</h3>
              </div>
              <BookingCalendar
                master={master}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
                selectedService={selectedService}
                language={language}
                translations={translations}
              />
            </div>
          )}

          {currentStep === 'form' && selectedService && selectedDate && selectedTime && (
            <div className="form-selection">
              <div className="step-header">
                <button className="back-btn" onClick={handleBack}>
                  {t.back}
                </button>
              </div>
              <BookingForm
                master={master}
                selectedService={selectedService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBookingSuccess={onBookingSuccess}
                language={language}
                translations={translations}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
