/**
 * Компонент управления паузами в расписании
 */

import React, { useState } from 'react';
import { ScheduleBreak } from '../types/booking';

interface ScheduleBreakManagerProps {
  date: string;
  breaks: ScheduleBreak[];
  onAddBreak: (breakData: ScheduleBreak) => void;
  onRemoveBreak: (index: number) => void;
  language: 'cs' | 'en';
}

export const ScheduleBreakManager: React.FC<ScheduleBreakManagerProps> = ({
  date,
  breaks,
  onAddBreak,
  onRemoveBreak,
  language,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBreak, setNewBreak] = useState<ScheduleBreak>({
    start: '12:00',
    end: '13:00',
    label: language === 'cs' ? 'Oběd' : 'Lunch',
  });

  const t = {
    cs: {
      breaks: 'Pauzy',
      addBreak: 'Přidat pauzu',
      label: 'Název pauzy',
      from: 'Od',
      to: 'Do',
      save: 'Přidat',
      cancel: 'Zrušit',
      remove: 'Odstranit',
      noBreaks: 'Žádné pauzy',
      breakTypes: {
        lunch: 'Oběd',
        break: 'Přestávka',
        personal: 'Osobní záležitost',
        other: 'Jiné',
      },
    },
    en: {
      breaks: 'Breaks',
      addBreak: 'Add Break',
      label: 'Break label',
      from: 'From',
      to: 'To',
      save: 'Add',
      cancel: 'Cancel',
      remove: 'Remove',
      noBreaks: 'No breaks',
      breakTypes: {
        lunch: 'Lunch',
        break: 'Break',
        personal: 'Personal matter',
        other: 'Other',
      },
    },
  };

  const translations = t[language];

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const handleAddBreak = () => {
    if (newBreak.start >= newBreak.end) {
      alert(language === 'cs' ? 'Čas konce musí být po času začátku' : 'End time must be after start time');
      return;
    }

    onAddBreak(newBreak);
    setShowAddForm(false);
    setNewBreak({
      start: '12:00',
      end: '13:00',
      label: language === 'cs' ? 'Oběd' : 'Lunch',
    });
  };

  return (
    <div className="schedule-breaks-section">
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-medium text-gray-700">
          ⏸️ {translations.breaks}:&nbsp;&nbsp;&nbsp;&nbsp;
        </label>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="schedule-button secondary small"
          >
            + {translations.addBreak}
          </button>
        )}
      </div>

      {/* Список пауз */}
      {breaks.length > 0 ? (
        <div className="space-y-2 mb-3">
          {breaks.map((breakItem, index) => (
            <div
              key={index}
              className="schedule-break-item"
            >
              <div className="flex-1">
                <span className="font-medium text-sm">{breakItem.label || translations.breakTypes.break}</span>
                <span className="text-gray-600 text-sm" style={{ marginLeft: 8 }}>
                  {breakItem.start} - {breakItem.end}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveBreak(index)}
                className="schedule-icon-btn danger"
                aria-label={translations.remove}
                title={translations.remove}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      ) : (
        !showAddForm && (
          <div className="text-sm text-gray-500 italic mb-3" style={{ marginTop: 8 }}>
            {translations.noBreaks}
          </div>
        )
      )}

      {/* Форма добавления паузы */}
      {showAddForm && (
        <div className="p-3 bg-blue-50 rounded border border-blue-200 space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">
              {translations.label}:&nbsp;&nbsp;&nbsp;&nbsp;
            </label>
            <select
              value={newBreak.label}
              onChange={(e) => setNewBreak({ ...newBreak, label: e.target.value })}
              className="w-full p-2 border rounded text-sm"
            >
              <option value={translations.breakTypes.lunch}>{translations.breakTypes.lunch}</option>
              <option value={translations.breakTypes.break}>{translations.breakTypes.break}</option>
              <option value={translations.breakTypes.personal}>{translations.breakTypes.personal}</option>
              <option value={translations.breakTypes.other}>{translations.breakTypes.other}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                {translations.from}:&nbsp;&nbsp;&nbsp;&nbsp;
              </label>
              <select
                value={newBreak.start}
                onChange={(e) => setNewBreak({ ...newBreak, start: e.target.value })}
                className="w-full p-2 border rounded text-sm"
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
                {translations.to}:&nbsp;&nbsp;&nbsp;&nbsp;
              </label>
              <select
                value={newBreak.end}
                onChange={(e) => setNewBreak({ ...newBreak, end: e.target.value })}
                className="w-full p-2 border rounded text-sm"
              >
                {timeOptions.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex" style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="schedule-button secondary small flex-1"
            >
              ❌ {translations.cancel}
            </button>
            <button
              type="button"
              onClick={handleAddBreak}
              className="schedule-button secondary small flex-1"
              style={{ marginLeft: 12 }}
            >
              ✅ {translations.save}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



