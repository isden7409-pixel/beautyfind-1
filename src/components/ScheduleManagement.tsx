/**
 * Компонент управления расписанием на 90 дней
 */

import React, { useState, useEffect } from 'react';
import { Schedule, ScheduleFormData, ScheduleBreak } from '../types/booking';
import { Master } from '../types';
import {
  getSchedules,
  upsertSchedule,
} from '../firebase/bookingServices';
import { ScheduleBreakManager } from './ScheduleBreakManager';
import { getNextDates, formatDate, getDayName } from '../utils/bookingLogic';

// Чешские названия дней недели
const dayNames = {
  cs: {
    0: 'Neděle',
    1: 'Pondělí', 
    2: 'Úterý',
    3: 'Středa',
    4: 'Čtvrtek',
    5: 'Pátek',
    6: 'Sobota'
  },
  en: {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday', 
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday'
  }
};

// Чешские названия месяцев
const monthNames = {
  cs: [
    'leden', 'únor', 'březen', 'duben', 'květen', 'červen',
    'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'
  ],
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
};

// Группировка дат по неделям
const groupDatesByWeeks = (dates: string[], language: 'cs' | 'en') => {
  const weeks: { [key: string]: Array<{ date: string; dayName: string; formatted: string }> } = {};
  
  dates.forEach(dateStr => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    const dayName = dayNames[language][dayOfWeek as keyof typeof dayNames[typeof language]];
    
    // Находим начало недели (понедельник)
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    
    const weekKey = startOfWeek.toISOString().split('T')[0];
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    // Форматируем дату
    const dayNum = date.getDate();
    const monthName = monthNames[language][date.getMonth()];
    const year = date.getFullYear();
    
    const formatted = language === 'cs' 
      ? `${dayNum}. ${monthName} ${year}`
      : `${monthName} ${dayNum}, ${year}`;
    
    weeks[weekKey].push({
      date: dateStr,
      dayName,
      formatted
    });
  });
  
  return weeks;
};

interface ScheduleManagementProps {
  providerId: string;
  providerType: 'salon' | 'master';
  masters?: Master[];
  language: 'cs' | 'en';
}

export const ScheduleManagement: React.FC<ScheduleManagementProps> = ({
  providerId,
  providerType,
  masters = [],
  language,
}) => {
  const [schedules, setSchedules] = useState<Map<string, Schedule>>(new Map());
  const [selectedMasterId, setSelectedMasterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  const hasMasters = providerType === 'salon' && masters.length > 0;
  const dates = getNextDates(90); // 90 дней вперед

  const t = {
    cs: {
      title: 'Rozvrh na 90 dní',
      selectMaster: 'Vyberte mistra',
      enableAll: 'Povolit všechny',
      disableAll: 'Zakázat všechny',
      save: 'Uložit rozvrh',
      saving: 'Ukládání...',
      loading: 'Načítání...',
      workingDay: 'Pracovní den',
      dayOff: 'Volno',
      from: 'Od',
      to: 'Do',
    },
    en: {
      title: 'Schedule for 90 Days',
      selectMaster: 'Select master',
      enableAll: 'Enable all',
      disableAll: 'Disable all',
      save: 'Save schedule',
      saving: 'Saving...',
      loading: 'Loading...',
      workingDay: 'Working day',
      dayOff: 'Day off',
      from: 'From',
      to: 'To',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadSchedules();
  }, [providerId, selectedMasterId]);

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const startDate = dates[0];
      const endDate = dates[dates.length - 1];
      
      const data = await getSchedules(
        providerId,
        providerType,
        startDate,
        endDate,
        hasMasters ? selectedMasterId || undefined : undefined
      );

      const scheduleMap = new Map<string, Schedule>();
      data.forEach(schedule => {
        scheduleMap.set(schedule.date, schedule);
      });

      setSchedules(scheduleMap);
    } catch (err: any) {
      console.error('Error loading schedules:', err);
      
      // Скрываем технические ошибки Firebase от пользователей
      const errorMessage = err.message || String(err);
      if (errorMessage.includes('index') || errorMessage.includes('query requires') || errorMessage.includes('building')) {
        // Для ошибок индекса показываем дружелюбное сообщение
        setError(language === 'cs' 
          ? 'Rozvrh se načítá, prosím počkejte...' 
          : 'Schedule is loading, please wait...'
        );
      } else {
        setError(language === 'cs' ? 'Chyba při načítání rozvrhu' : 'Error loading schedule');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (date: string) => {
    setSchedules(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(date);
      
      if (existing) {
        newMap.set(date, { ...existing, isWorking: !existing.isWorking });
      } else {
        newMap.set(date, {
          id: '',
          providerId,
          providerType,
          masterId: hasMasters ? selectedMasterId || undefined : undefined,
          date,
          isWorking: true,
          workingHours: { start: '09:00', end: '18:00' },
          breaks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return newMap;
    });
  };

  const handleTimeChange = (date: string, field: 'start' | 'end', value: string) => {
    setSchedules(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(date);
      
      if (existing) {
        newMap.set(date, {
          ...existing,
          workingHours: {
            ...existing.workingHours!,
            [field]: value,
          },
        });
      }

      return newMap;
    });
  };

  const handleAddBreak = (date: string, breakData: ScheduleBreak) => {
    setSchedules(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(date);
      
      if (existing) {
        const breaks = [...(existing.breaks || []), breakData];
        newMap.set(date, { ...existing, breaks });
      }

      return newMap;
    });
  };

  const handleRemoveBreak = (date: string, index: number) => {
    setSchedules(prev => {
      const newMap = new Map(prev);
      const existing = newMap.get(date);
      
      if (existing) {
        const breaks = [...(existing.breaks || [])];
        breaks.splice(index, 1);
        newMap.set(date, { ...existing, breaks });
      }

      return newMap;
    });
  };

  const handleEnableAll = () => {
    setSchedules(prev => {
      const newMap = new Map(prev);
      
      dates.forEach(date => {
        const existing = newMap.get(date);
        if (existing) {
          newMap.set(date, { ...existing, isWorking: true });
        } else {
          newMap.set(date, {
            id: '',
            providerId,
            providerType,
            masterId: hasMasters ? selectedMasterId || undefined : undefined,
            date,
            isWorking: true,
            workingHours: { start: '09:00', end: '18:00' },
            breaks: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      });

      return newMap;
    });
  };

  const handleDisableAll = () => {
    setSchedules(prev => {
      const newMap = new Map(prev);
      
      dates.forEach(date => {
        const existing = newMap.get(date);
        if (existing) {
          newMap.set(date, { ...existing, isWorking: false });
        }
      });

      return newMap;
    });
  };


  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      for (const [date, schedule] of Array.from(schedules.entries())) {
        const formData: ScheduleFormData = {
          date,
          isWorking: schedule.isWorking,
          workingHours: schedule.workingHours,
          breaks: schedule.breaks,
        };

        await upsertSchedule(
          providerId,
          providerType,
          formData,
          hasMasters ? selectedMasterId || undefined : undefined
        );
      }

      // Показываем успешное сообщение
      setError('');
      setSuccess(language === 'cs' ? 'Rozvrh byl úspěšně uložen!' : 'Schedule saved successfully!');
      await loadSchedules();
      
      // Автоматически скрываем сообщение через 3 секунды
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const timeOptions: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        {translations.loading}
      </div>
    );
  }

  return (
    <div className="schedule-management">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{translations.title}</h2>
        <button
          onClick={handleSave}
          disabled={saving || (hasMasters && !selectedMasterId)}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
        >
          {saving ? translations.saving : `💾 ${translations.save}`}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <span className="font-medium">{success}</span>
            </div>
          </div>
        </div>
      )}

      {/* Переключатель мастеров для салона */}
      {hasMasters && (
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            {translations.selectMaster}
          </label>
          <div className="flex gap-2 flex-wrap">
            {masters.map((master) => (
              <button
                key={master.id}
                onClick={() => setSelectedMasterId(master.id)}
                className={`px-4 py-2 rounded border ${
                  selectedMasterId === master.id
                    ? 'bg-pink-500 text-white border-pink-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {master.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Быстрые действия */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={handleEnableAll}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {translations.enableAll}
        </button>
        <button
          onClick={handleDisableAll}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          {translations.disableAll}
        </button>
      </div>

      {/* Календарь на 90 дней с группировкой по неделям - ОБНОВЛЕНО! */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
        {(() => {
          const weeks = groupDatesByWeeks(dates, language);
          const weekKeys = Object.keys(weeks).sort();
          
          return weekKeys.map((weekKey) => {
            const weekDates = weeks[weekKey];
            const weekStartDate = new Date(weekKey);
            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6);
            
            // Форматируем диапазон недели
            const startDay = weekStartDate.getDate();
            const startMonth = monthNames[language][weekStartDate.getMonth()];
            const endDay = weekEndDate.getDate();
            const endMonth = monthNames[language][weekEndDate.getMonth()];
            const year = weekStartDate.getFullYear();
            
            const weekRange = language === 'cs'
              ? `${startDay}. ${startMonth} - ${endDay}. ${endMonth} ${year}`
              : `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
            
            return (
              <div key={weekKey} className="border rounded-lg overflow-hidden">
                {/* Заголовок недели */}
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white p-3">
                  <h3 className="font-semibold text-lg">
                    📅 {language === 'cs' ? 'Týden' : 'Week'}: {weekRange}
                  </h3>
                </div>
                
                {/* Дни недели с отступом после заголовка недели */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
                  {weekDates.map(({ date, dayName, formatted }) => {
                    const schedule = schedules.get(date);
                    const isWorking = schedule?.isWorking ?? false;
                    const today = new Date().toISOString().split('T')[0];
                    const isPast = date < today;
                    const isToday = date === today;

                    return (
                      <div
                        key={date}
                        className={`p-3 border-l-4 ${
                          isWorking 
                            ? 'bg-green-50 border-green-400' 
                            : 'bg-red-50 border-red-400'
                        } ${isPast ? 'opacity-60' : ''} ${isToday ? 'ring-2 ring-blue-400' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-lg">
                              {isToday ? '🎯 ' : ''}{dayName} {formatted}
                              {isPast && <span className="ml-2 text-red-500"> (Minulý)</span>}
                              {isToday && <span className="ml-2 text-blue-500"> (Dnes)</span>}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isWorking}
                                onChange={() => handleDayToggle(date)}
                                disabled={isPast}
                                className="w-5 h-5 text-pink-600 rounded focus:ring-pink-500 disabled:opacity-50"
                              />
                              <span className="text-sm font-medium">
                                {isWorking ? ` ${translations.workingDay}` : ` ${translations.dayOff}`}
                              </span>
                            </label>
                          </div>
                        </div>

                        {isWorking && schedule && (
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  {translations.from}: 
                                </label>
                                <select
                                  value={schedule.workingHours?.start || '09:00'}
                                  onChange={(e) => handleTimeChange(date, 'start', e.target.value)}
                                  className="w-full p-2 border rounded"
                                >
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  {translations.to}: 
                                </label>
                                <select
                                  value={schedule.workingHours?.end || '18:00'}
                                  onChange={(e) => handleTimeChange(date, 'end', e.target.value)}
                                  className="w-full p-2 border rounded"
                                >
                                  {timeOptions.map((time) => (
                                    <option key={time} value={time}>
                                      {time}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            {/* Управление паузами */}
                            <ScheduleBreakManager
                              date={date}
                              breaks={schedule.breaks || []}
                              onAddBreak={(breakData) => handleAddBreak(date, breakData)}
                              onRemoveBreak={(index) => handleRemoveBreak(date, index)}
                              language={language}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          });
        })()}
      </div>
    </div>
  );
};

