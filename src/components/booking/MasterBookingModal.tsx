/**
 * Модальное окно резервации для мастера-фрилансера
 */

import React, { useState, useEffect } from 'react';
import { Service, TimeSlot, BookingCreateParams } from '../../types/booking';
import { Master } from '../../types';
import { getServices, createBooking } from '../../firebase/bookingServices';
import { getAvailableTimeSlots } from '../../utils/bookingLogic';
import { ServiceSelector } from './ServiceSelector';
import { TimeSlotGrid } from './TimeSlotGrid';

interface MasterBookingModalProps {
  master: Master;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: (bookingId: string) => void;
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  currentUserPhone: string;
  language: 'cs' | 'en';
}

type Step = 'service' | 'date' | 'time' | 'details' | 'confirmation' | 'success';

export const MasterBookingModal: React.FC<MasterBookingModalProps> = ({
  master,
  isOpen,
  onClose,
  onBookingComplete,
  currentUserId,
  currentUserName,
  currentUserEmail,
  currentUserPhone,
  language,
}) => {
  const [step, setStep] = useState<Step>('service');
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
      title: 'Rezervace',
      stepService: 'Krok 1: Vyberte službu',
      stepDate: 'Krok 2: Vyberte datum',
      stepTime: 'Krok 3: Vyberte čas',
      stepDetails: 'Krok 4: Vaše údaje',
      stepConfirmation: 'Krok 5: Potvrzení',
      next: 'Další',
      back: 'Zpět',
      cancel: 'Zrušit',
      confirm: 'Potvrdit rezervaci',
      loading: 'Načítání...',
      yourNote: 'Vaše poznámka (nepovinné)',
      notePlaceholder: 'Např. Prvně u vás...',
      summary: 'Souhrn rezervace',
      service: 'Služba',
      date: 'Datum',
      time: 'Čas',
      duration: 'Délka',
      price: 'Cena',
      minutes: 'min',
      master: 'Mistr',
      success: 'Rezervace vytvořena!',
      successMessage: 'Vaše rezervace byla úspěšně vytvořena. Brzy vám přijde potvrzovací e-mail.',
      close: 'Zavřít',
    },
    en: {
      title: 'Booking',
      stepService: 'Step 1: Select service',
      stepDate: 'Step 2: Select date',
      stepTime: 'Step 3: Select time',
      stepDetails: 'Step 4: Your details',
      stepConfirmation: 'Step 5: Confirmation',
      next: 'Next',
      back: 'Back',
      cancel: 'Cancel',
      confirm: 'Confirm booking',
      loading: 'Loading...',
      yourNote: 'Your note (optional)',
      notePlaceholder: 'E.g. First time here...',
      summary: 'Booking Summary',
      service: 'Service',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      price: 'Price',
      minutes: 'min',
      master: 'Master',
      success: 'Booking created!',
      successMessage: 'Your booking has been successfully created. You will receive a confirmation email shortly.',
      close: 'Close',
    },
  };

  const translations = t[language];

  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen, master.id]);

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadTimeSlots();
    }
  }, [selectedDate, selectedService]);

  const loadServices = async () => {
    try {
      const data = await getServices(master.id, 'master');
      setServices(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const loadTimeSlots = async () => {
    if (!selectedService || !selectedDate) return;

    setLoading(true);
    try {
      const slots = await getAvailableTimeSlots({
        providerId: master.id,
        providerType: 'master',
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
    if (step === 'date') setStep('service');
    else if (step === 'time') setStep('date');
    else if (step === 'confirmation') setStep('time');
  };

  const handleConfirm = async () => {
    if (!selectedService || !selectedDate || !selectedTime) return;

    setLoading(true);
    setError('');

    try {
      const params: BookingCreateParams = {
        clientId: currentUserId,
        clientName: currentUserName,
        clientPhone: currentUserPhone,
        clientEmail: currentUserEmail,
        
        providerId: master.id,
        providerType: 'master',
        providerName: master.name,
        providerPhone: master.phone || '',
        providerEmail: master.email || '',
        providerAddress: master.address || '',
        
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
    setStep('service');
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
            <h2 className="text-2xl font-bold">{translations.title}</h2>
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

          {/* Step: Service */}
          {step === 'service' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepService}</h3>
              <ServiceSelector
                services={services}
                selectedServiceId={selectedService?.id || null}
                onSelectService={handleServiceSelect}
                language={language}
              />
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
          {step === 'confirmation' && selectedService && (
            <div>
              <h3 className="text-lg font-semibold mb-4">{translations.stepConfirmation}</h3>
              
              <div className="bg-gray-50 rounded p-4 mb-4">
                <h4 className="font-semibold mb-3">{translations.summary}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{translations.master}:</span>
                    <span className="font-medium">{master.name}</span>
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
                  {loading ? translations.loading : translations.confirm}
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

