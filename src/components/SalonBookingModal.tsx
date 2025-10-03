import React, { useState } from 'react';
import { Salon, Master, Service, Booking, Language } from '../types';
import SalonMasterSelection from './SalonMasterSelection';
import BookingCalendar from './BookingCalendar';
import BookingForm from './BookingForm';
import { translateServices } from '../utils/serviceTranslations';

interface SalonBookingModalProps {
  salon: Salon;
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
  language: Language;
  translations: any;
}

type BookingStep = 'service' | 'master' | 'calendar' | 'form';

const SalonBookingModal: React.FC<SalonBookingModalProps> = ({
  salon,
  isOpen,
  onClose,
  onBookingSuccess,
  language,
  translations,
}) => {
  const t = translations[language];
  const [currentStep, setCurrentStep] = useState<BookingStep>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // SalonBookingModal render
  if (!isOpen) return null;

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setCurrentStep('master');
  };

  const handleMasterSelect = (master: Master) => {
    setSelectedMaster(master);
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
      case 'master':
        setCurrentStep('service');
        break;
      case 'calendar':
        setCurrentStep('master');
        break;
      case 'form':
        setCurrentStep('calendar');
        break;
      default:
        onClose();
    }
  };

  const handleBookingSuccess = (booking: Booking) => {
    onBookingSuccess(booking);
    onClose();
    // Reset state
    setCurrentStep('service');
    setSelectedService(null);
    setSelectedMaster(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleBookingClose = () => {
    onClose();
    // Reset state
    setCurrentStep('service');
    setSelectedService(null);
    setSelectedMaster(null);
    setSelectedDate('');
    setSelectedTime('');
  };

  return (
    <div className="modal-overlay">
      <div className="booking-modal">
        <div className="booking-header">
          <h2>{t.bookWith} {salon.name}</h2>
          <button className="close-btn" onClick={handleBookingClose}>×</button>
        </div>

        {currentStep === 'service' && (
          <>
            <div className="step-header">
              <button className="back-btn" onClick={handleBack}>
                {t.back}
              </button>
              <h3>{t.selectService}</h3>
            </div>
            <div className="booking-content">
              <div className="services-grid">
                {salon.availableServices?.map((service) => (
                  <div
                    key={service.id}
                    className="service-card"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <h4>{translateServices([service.name], language)[0]}</h4>
                    <p>{service.description}</p>
                    <div className="service-details">
                      <span className="duration">{service.duration} {t.minutes}</span>
                      <span className="price">{service.price} Kč</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {currentStep === 'master' && selectedService && (
          <SalonMasterSelection
            masters={salon.masters}
            selectedService={selectedService}
            language={language}
            translations={translations}
            onMasterSelect={handleMasterSelect}
            onBack={handleBack}
          />
        )}

        {currentStep === 'calendar' && selectedMaster && selectedService && (
          <>
            <div className="step-header">
              <button className="back-btn" onClick={handleBack}>
                {t.back}
              </button>
              <h3>{t.selectDateAndTime}</h3>
            </div>
            <div className="booking-content">
              <div className="selected-master-info">
                <h4>{t.master}: {selectedMaster.name}</h4>
                <p>{t.salon}: {salon.name}</p>
                <p>{t.service}: {selectedService.name}</p>
              </div>
              <BookingCalendar
                master={selectedMaster}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                selectedTime={selectedTime}
                onTimeSelect={handleTimeSelect}
                selectedService={selectedService}
                language={language}
                translations={translations}
              />
            </div>
          </>
        )}

        {currentStep === 'form' && selectedMaster && selectedService && selectedDate && selectedTime && (
          <>
            <div className="step-header">
              <button className="back-btn" onClick={handleBack}>
                {t.back}
              </button>
              <h3>{t.contactDetails}</h3>
            </div>
            <div className="booking-content">
              <BookingForm
                master={selectedMaster}
                salon={salon}
                selectedService={selectedService}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
                onBookingSuccess={handleBookingSuccess}
                language={language}
                translations={translations}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SalonBookingModal;
