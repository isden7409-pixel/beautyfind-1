import React from 'react';
import { WorkingHours, Language } from '../types';

interface WorkingHoursDisplayProps {
  workingHours?: WorkingHours[];
  language: Language;
  title?: string;
}

const DAY_LABELS: Record<Language, string[]> = {
  cs: ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const ORDER = [1, 2, 3, 4, 5, 6, 0]; // Po-Ne

function normalizeHours(hours?: WorkingHours[]): Record<number, WorkingHours> {
  const byDay: Record<number, WorkingHours> = {};
  (hours || []).forEach(h => { byDay[h.dayOfWeek] = h; });
  return byDay;
}

const WorkingHoursDisplay: React.FC<WorkingHoursDisplayProps> = ({ workingHours, language, title }) => {
  if (!workingHours || workingHours.length === 0) return null;
  const byDay = normalizeHours(workingHours);
  const labels = DAY_LABELS[language];

  return (
    <div className="working-hours-display">
      {title && <h3>{title}</h3>}
      <div className="whd-grid">
        {ORDER.map(day => {
          const h = byDay[day];
          const isWorking = h ? h.isWorking : false;
          const start = h?.startTime || '';
          const end = h?.endTime || '';
          return (
            <div key={day} className="whd-row">
              <div className="whd-inline">
                <span className="whd-day">{labels[day]}</span>
                <span className="whd-sep">&nbsp;</span>
                <span className="whd-time">
                  {isWorking ? (
                    <span>{start} — {end}</span>
                  ) : (
                    <span>{language === 'cs' ? 'Zavřeno' : 'Closed'}</span>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkingHoursDisplay;


