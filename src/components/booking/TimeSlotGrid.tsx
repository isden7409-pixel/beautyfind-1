/**
 * Компонент сетки временных слотов
 */

import React from 'react';
import { TimeSlot } from '../../types/booking';

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  language: 'cs' | 'en';
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  timeSlots,
  selectedTime,
  onSelectTime,
  language,
}) => {
  const t = {
    cs: {
      noSlots: 'Na tento den nejsou dostupné žádné časy',
      selectTime: 'Vyberte čas',
      booked: 'Obsazeno',
      break: 'Pauza',
      blocked: 'Blokováno',
      tooLate: 'Příliš brzy',
    },
    en: {
      noSlots: 'No available times for this day',
      selectTime: 'Select time',
      booked: 'Booked',
      break: 'Break',
      blocked: 'Blocked',
      tooLate: 'Too soon',
    },
  };

  const translations = t[language];

  const availableSlots = timeSlots.filter(slot => slot.available);

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {translations.noSlots}
      </div>
    );
  }

  const getReasonText = (reason?: string): string => {
    if (!reason) return '';
    
    switch (reason) {
      case 'booked':
        return translations.booked;
      case 'break':
        return translations.break;
      case 'blocked':
        return translations.blocked;
      case 'too_late':
        return translations.tooLate;
      default:
        return '';
    }
  };

  return (
    <div>
      <h4 className="text-sm font-medium mb-3">{translations.selectTime}</h4>
      <div className="grid grid-cols-4 md:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-2">
        {timeSlots.map((slot) => {
          const isSelected = slot.time === selectedTime;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.time}
              onClick={() => isAvailable && onSelectTime(slot.time)}
              disabled={!isAvailable}
              className={`
                px-3 py-2 rounded text-sm font-medium transition-all
                ${
                  isSelected
                    ? 'bg-pink-500 text-white ring-2 ring-pink-600'
                    : isAvailable
                    ? 'bg-white border border-gray-300 hover:border-pink-500 hover:bg-pink-50'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
              title={!isAvailable ? getReasonText(slot.reason) : undefined}
            >
              {slot.time}
            </button>
          );
        })}
      </div>
    </div>
  );
};




