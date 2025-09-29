import React from 'react';
import { WorkingHours, Language } from '../types';

interface WorkingHoursInputProps {
  language: Language;
  value: WorkingHours[];
  onChange: (value: WorkingHours[]) => void;
}

const DAY_LABELS_CS = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
const ORDER = [1,2,3,4,5,6,0]; // Пн-Вс

function formatTime(value: string): string {
  return value || '';
}

const WorkingHoursInput: React.FC<WorkingHoursInputProps> = ({ language, value, onChange }) => {
  const hoursByDay: Record<number, WorkingHours> = {};
  value.forEach(h => { hoursByDay[h.dayOfWeek] = h; });

  const getDay = (day: number): WorkingHours => {
    return hoursByDay[day] || { dayOfWeek: day, startTime: '09:00', endTime: '18:00', isWorking: day !== 0 };
  };

  const updateDay = (day: number, patch: Partial<WorkingHours>) => {
    const next = ORDER.map(d => d).map(d => ({...getDay(d)}));
    const idx = next.findIndex(d => d.dayOfWeek === day);
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  return (
    <div className="working-hours-input">
      {ORDER.map((day) => {
        const h = getDay(day);
        const disabled = !h.isWorking;
        return (
          <div key={day} className="wh-row">
            <div className="wh-day">{DAY_LABELS_CS[day]}</div>
            <div className="wh-time">
              <input
                type="time"
                value={formatTime(h.startTime)}
                onChange={(e) => updateDay(day, { startTime: e.target.value })}
                disabled={disabled}
                className="wh-input"
              />
              <span className="wh-sep">—</span>
              <input
                type="time"
                value={formatTime(h.endTime)}
                onChange={(e) => updateDay(day, { endTime: e.target.value })}
                disabled={disabled}
                className="wh-input"
              />
            </div>
            <label className="wh-closed">
              <input
                type="checkbox"
                checked={!h.isWorking}
                onChange={(e) => updateDay(day, { isWorking: !e.target.checked })}
              />
              <span>{language === 'cs' ? 'Zavřeno' : 'Closed'}</span>
            </label>
          </div>
        );
      })}
    </div>
  );
};

export default WorkingHoursInput;

