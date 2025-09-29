import React, { useState, useEffect } from 'react';
import { Master, TimeSlot, WorkingHours, Service, Booking } from '../types';

interface BookingCalendarProps {
  master: Master;
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  selectedTime: string | null;
  onTimeSelect: (time: string) => void;
  selectedService: Service | null;
  language: 'cs' | 'en';
  translations: any;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({
  master,
  selectedDate,
  onDateSelect,
  selectedTime,
  onTimeSelect,
  selectedService,
  language,
  translations
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  // Генерируем календарь на месяц
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toISOString().split('T')[0];
      const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
      const isUnavailable = master.workingHours?.some(wh => 
        wh.dayOfWeek === date.getDay() && !wh.isWorking
      ) || master.unavailableDates?.includes(dateString);
      
      days.push({
        day,
        date: dateString,
        isPast,
        isUnavailable: isUnavailable || false,
        isSelected: selectedDate === dateString
      });
    }
    
    return days;
  };

  // Генерируем временные слоты для выбранной даты
  const generateTimeSlots = (date: string) => {
    if (!master.workingHours || !selectedService) return [];

    const selectedDateObj = new Date(date);
    const dayOfWeek = selectedDateObj.getDay();
    const workingDay = master.workingHours.find(wh => wh.dayOfWeek === dayOfWeek);
    
    if (!workingDay || !workingDay.isWorking) return [];

    const slots: TimeSlot[] = [];
    const startTime = workingDay.startTime;
    const endTime = workingDay.endTime;
    const breakStart = workingDay.breakStart;
    const breakEnd = workingDay.breakEnd;
    const serviceDuration = selectedService.duration;

    // Парсим время
    const parseTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const formatTime = (minutes: number) => {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    const breakStartMinutes = breakStart ? parseTime(breakStart) : null;
    const breakEndMinutes = breakEnd ? parseTime(breakEnd) : null;

    // Генерируем слоты с интервалом 30 минут
    for (let time = startMinutes; time + serviceDuration <= endMinutes; time += 30) {
      // Проверяем, не попадает ли время в перерыв
      if (breakStartMinutes && breakEndMinutes && 
          time < breakEndMinutes && time + serviceDuration > breakStartMinutes) {
        continue;
      }

      const timeString = formatTime(time);
      const isBooked = master.bookings?.some(booking => 
        booking.date === date && 
        booking.time === timeString &&
        booking.status !== 'cancelled'
      );

      slots.push({
        id: `${date}-${timeString}`,
        time: timeString,
        isAvailable: !isBooked,
        duration: serviceDuration
      });
    }

    return slots;
  };

  // Обновляем временные слоты при изменении даты или услуги
  useEffect(() => {
    if (selectedDate && selectedService) {
      setLoading(true);
      // Имитируем загрузку
      setTimeout(() => {
        const slots = generateTimeSlots(selectedDate);
        setTimeSlots(slots);
        setLoading(false);
      }, 300);
    }
  }, [selectedDate, selectedService, master]);

  const handleDateClick = (date: string, isPast: boolean, isUnavailable: boolean) => {
    if (!isPast && !isUnavailable) {
      onDateSelect(date);
    }
  };

  const handleTimeClick = (time: string) => {
    onTimeSelect(time);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const calendarDays = generateCalendarDays();
  const monthNames = language === 'cs' 
    ? ['Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const dayNames = language === 'cs'
    ? ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
    : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="booking-calendar">
      <div className="calendar-header">
        <button onClick={goToPreviousMonth} className="calendar-nav-btn">
          ‹
        </button>
        <h3>
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button onClick={goToNextMonth} className="calendar-nav-btn">
          ›
        </button>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${
              day?.isPast ? 'past' : ''
            } ${
              day?.isUnavailable ? 'unavailable' : ''
            } ${
              day?.isSelected ? 'selected' : ''
            }`}
            onClick={() => day && handleDateClick(day.date, day.isPast, day.isUnavailable)}
          >
            {day?.day}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="time-slots">
          <h4>{t.selectTime}</h4>
          {loading ? (
            <div className="loading">{t.loading}...</div>
          ) : (
            <div className="time-slots-grid">
              {timeSlots.map(slot => (
                <button
                  key={slot.id}
                  className={`time-slot ${slot.isAvailable ? 'available' : 'unavailable'} ${
                    selectedTime === slot.time ? 'selected' : ''
                  }`}
                  onClick={() => slot.isAvailable && handleTimeClick(slot.time)}
                  disabled={!slot.isAvailable}
                >
                  {slot.time}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
