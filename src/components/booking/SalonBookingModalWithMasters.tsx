/**
 * Модальное окно резервации для салона С мастерами
 * Резервация: Мастер → Услуга мастера → Дата → Время → Подтверждение
 */

import React, { useState, useEffect } from 'react';
import { Service, TimeSlot, BookingCreateParams } from '../../types/booking';
import { Salon, Master } from '../../types';
import { getServices, createBooking } from '../../firebase/bookingServices';
import { getAvailableTimeSlots } from '../../utils/bookingLogic';
import { ServiceSelector } from './ServiceSelector';
import { TimeSlotGrid } from './TimeSlotGrid';

interface SalonBookingModalWithMastersProps {
  salon: Salon;
  masters: Master[];
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (bookingId: string) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserPhone: string;
  language: 'cs' | 'en';
}

type Step = 'master' | 'service' | 'date' | 'time' | 'confirmation' | 'success';

export const SalonBookingModalWithMasters: React.FC<SalonBookingModalWithMastersProps> = ({
  salon,
  masters,
  isOpen,
  onClose,
  onBookingComplete,
  currentUserId,
  currentUserName,
  currentUserEmail,
  currentUserPhone,
  language,
}) => {
  const [step, setStep] = useState<Step>('master');
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [clientNote, setClientNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    cs: {
      title: 'Rezervace v salonu',
      stepMaster: 'Krok 1 z 5: Vyberte mistra',
      stepService: 'Krok 2 z 5: Vyberte službu',
      stepDate: 'Krok 3 z 5: Vyberte datum',
      stepTime: 'Krok 4 z 5: Vyberte čas',
      stepConfirmation: 'Krok 5 z 5: Potvrzení',
      next: 'Další',
      back: 'Zpět',
      cancel: 'Zrušit',
      confirm: 'Potvrdit rezervaci',
      loading: 'Načítání...',
      yourNote: 'Vaše poznámka (nepovinné)',
      notePlaceholder: 'Např. Prvně u vás...',
      summary: 'Souhrn rezervace',
      salon: 'Salon',
      master: 'Mistr',
      service: 'Služba',
      date: 'Datum',
      time: 'Čas',
      duration: 'Délka',
      price: 'Cena',
      minutes: 'min',
      rating: 'Hodnocení',
      reviews: 'recenzí',
      specialty: 'Specializace',
      experience: 'Zkušenosti',
      address: 'Adresa',
      phone: 'Telefon',
      success: 'Rezervace vytvořena!',
      successMessage: 'Vaše rezervace byla úspěšně vytvořena. Brzy vám přijde potvrzovací e-mail.',
      contactInfo: 'Kontaktní informace',
      close: 'Zavřít',
    },
    en: {
      title: 'Salon Booking',
      stepMaster: 'Step 1 of 5: Select master',
      stepService: 'Step 2 of 5: Select service',
      stepDate: 'Step 3 of 5: Select date',
      stepTime: 'Step 4 of 5: Select time',
      stepConfirmation: 'Step 5 of 5: Confirmation',
      next: 'Next',
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm booking',
      loading: 'Loading...',
      yourNote: 'Your note (optional)',
      notePlaceholder: 'E.g. First time here...',
      summary: 'Booking Summary',
      salon: 'Salon',
      master: 'Master',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      price: 'Price',
      minutes: 'min',
      rating: 'Rating',
      reviews: 'reviews',
      specialty: 'Specialty',
      experience: 'Experience',
      address: 'Address',
      phone: 'Phone',
      success: 'Booking created!',
      successMessage: 'Your booking has been successfully created. You will receive a confirmation email shortly.',
      contactInfo: 'Contact Information',
      close: 'Close',
    },
  };

  const translations = t[language];

  useEffect(() => {
    if (selectedMaster) {
      loadServices();
    }
  }, [selectedMaster]);

  useEffect(() => {
    if (selectedDate && selectedService && selectedMaster) {
      loadTimeSlots();
    }
  }, [selectedDate, selectedService]);

  const loadServices = async () => {
    if (!selectedMaster) return;

    try {
      const data = await getServices(salon.id, 'salon', selectedMaster.id);
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedService || !selectedDate || !selectedMaster) return;

    setLoading(true);
    try {
      const slots = await getAvailableTimeSlots({
        providerId: salon.id,
        providerType: 'salon',
        masterId: selectedMaster.id,
        date: selectedDate,
        duration: selectedService.duration,
      });
      setTimeSlots(slots);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMasterSelect = (master: Master) => {
    setSelectedMaster(master);
    setSelectedService(null);
    setStep('service');
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setStep('date');
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setStep('time');
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleNext = () => {
    if (step === 'time' && selectedTime) {
      setStep('confirmation');
    }
  };

  const handleBack = () => {
    if (step === 'service') setStep('master');
    else if (step === 'date') setStep('service');
    else if (step === 'time') setStep('date');
    else if (step === 'confirmation') setStep('time');
  };

  const handleConfirm = async () => {
    if (!selectedMaster || !selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    setError('');

    try {
      const params: BookingCreateParams = {
        clientId: currentUserId,
        clientName: currentUserName,
        clientPhone: currentUserPhone,
        clientEmail: currentUserEmail,
        
        providerId: salon.id,
        providerType: 'salon',
        providerName: salon.name,
        providerPhone: salon.phone || '',
        providerEmail: salon.email || '',
        providerAddress: salon.address || '',
        
        masterId: selectedMaster.id,
        masterName: selectedMaster.name,
        
        serviceId: selectedService.id,
        serviceName_cs: selectedService.name_cs,
        serviceName_en: selectedService.name_en,
        serviceDescription_cs: selectedService.description_cs,
        serviceDescription_en: selectedService.description_en,
        
        date: selectedDate,
        time: selectedTime,
        duration: selectedService.duration,
        price: selectedService.price,
        
        clientNote,
      };

      const bookingId = await createBooking(params);
      
      setStep('success');
      onBookingComplete(bookingId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('master');
    setSelectedMaster(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setClientNote('');
    setError('');
    onClose();
  };

  const getNext30Days = (): string[] => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold">{translations.title}</h2>
              <p className="text-gray-600 text-sm">{salon.name}</p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
              <span className={step === 'master' ? 'text-pink-600 font-medium' : ''}>1</span>
              <span className={step === 'service' ? 'text-pink-600 font-medium' : ''}>2</span>
              <span className={step === 'date' ? 'text-pink-600 font-medium' : ''}>3</span>
              <span className={step === 'time' ? 'text-pink-600 font-medium' : ''}>4</span>
              <span className={step === 'confirmation' ? 'text-pink-600 font-medium' : ''}>5</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-pink-500 h-2 rounded-full transition-all"
                style={{
                  width:
                    step === 'master'
                      ? '20%'
                      : step === 'service'
                      ? '40%'
                      : step === 'date'
                      ? '60%'
                      : step === 'time'
                      ? '80%'
                      : '100%',
                }}
              />
            </div>
          </div>

          {/* Step: Master */}
          {step === 'master' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepMaster}</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {masters.map((master) => {
                  const isSelected = selectedMaster?.id === master.id;
                  
                  return (
                    <button
                      key={master.id}
                      onClick={() => handleMasterSelect(master)}
                      className={`
                        w-full text-left p-4 rounded-lg border-2 transition-all
                        ${
                          isSelected
                            ? 'border-pink-500 bg-pink-50'
                            : 'border-gray-200 hover:border-pink-300 bg-white'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={master.photo}
                          alt={master.name}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                        <div className="flex-1">
                          <h5 className="font-semibold text-gray-900 mb-1">{master.name}</h5>
                          <p className="text-sm text-gray-600 mb-2">{master.specialty}</p>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1">
                              ⭐ {master.rating} ({master.reviews} {translations.reviews})
                            </span>
                            <span className="text-gray-500">{master.experience}</span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="text-pink-500 text-xl">
                            ✓
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step: Service */}
          {step === 'service' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepService}</h3>
              {selectedMaster && (
                <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedMaster.photo}
                      alt={selectedMaster.name}
                      className="w-10 h-10 object-cover rounded-full"
                    />
                    <div>
                      <div className="font-medium">{selectedMaster.name}</div>
                      <div className="text-sm text-gray-600">{selectedMaster.specialty}</div>
                    </div>
                  </div>
                </div>
              )}
              <ServiceSelector
                services={services}
                selectedServiceId={selectedService?.id || null}
                onSelectService={handleServiceSelect}
                language={language}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {translations.back}
                </button>
              </div>
            </div>
          )}

          {/* Step: Date */}
          {step === 'date' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepDate}</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {getNext30Days().map((date) => {
                  const dateObj = new Date(date);
                  const isSelected = date === selectedDate;
                  
                  return (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className={`
                        p-3 rounded border text-center transition-all
                        ${
                          isSelected
                            ? 'bg-pink-500 text-white border-pink-500'
                            : 'bg-white border-gray-300 hover:border-pink-500'
                        }
                      `}
                    >
                      <div className="text-xs">{dateObj.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { weekday: 'short' })}</div>
                      <div className="font-bold">{dateObj.getDate()}</div>
                      <div className="text-xs">{dateObj.toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { month: 'short' })}</div>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {translations.back}
                </button>
              </div>
            </div>
          )}

          {/* Step: Time */}
          {step === 'time' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepTime}</h3>
              {loading ? (
                <div className="text-center py-8 text-gray-500">{translations.loading}</div>
              ) : (
                <TimeSlotGrid
                  timeSlots={timeSlots}
                  selectedTime={selectedTime}
                  onSelectTime={handleTimeSelect}
                  language={language}
                />
              )}
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {translations.back}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!selectedTime}
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
                >
                  {translations.next}
                </button>
              </div>
            </div>
          )}

          {/* Step: Confirmation */}
          {step === 'confirmation' && selectedMaster && selectedService && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepConfirmation}</h3>
              
              <div className="bg-gray-50 rounded p-4 mb-4">
                <h4 className="font-semibold mb-3">{translations.summary}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.salon}:</span>
                    <span className="font-medium">{salon.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.master}:</span>
                    <span className="font-medium">{selectedMaster.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.service}:</span>
                    <span className="font-medium">{language === 'cs' ? selectedService.name_cs : (selectedService.name_en || selectedService.name_cs)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.date}:</span>
                    <span className="font-medium">{new Date(selectedDate).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.time}:</span>
                    <span className="font-medium">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.duration}:</span>
                    <span className="font-medium">{selectedService.duration} {translations.minutes}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600">{translations.price}:</span>
                    <span className="font-bold text-pink-600">{selectedService.price} {language === 'cs' ? 'Kč' : 'CZK'}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded p-4 mb-4">
                <h4 className="font-semibold mb-2 text-sm">{translations.contactInfo}</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span>📍</span>
                    <span>{salon.address}</span>
                  </div>
                  {salon.phone && (
                    <div className="flex items-center gap-2">
                      <span>📞</span>
                      <span>{salon.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">
                  {translations.yourNote}
                </label>
                <textarea
                  value={clientNote}
                  onChange={(e) => setClientNote(e.target.value)}
                  rows={3}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
                  placeholder={translations.notePlaceholder}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="px-4 py-2 border rounded hover:bg-gray-50"
                >
                  {translations.back}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
                >
                  {loading ? translations.loading : `✅ ${translations.confirm}`}
                </button>
              </div>
            </div>
          )}

          {/* Step: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2">{translations.success}</h3>
              <p className="text-gray-600 mb-6">{translations.successMessage}</p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
              >
                {translations.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};




