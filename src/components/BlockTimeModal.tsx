/**
 * Модальное окно для блокировки времени
 */

import React, { useState } from 'react';
import { createBlockedTime } from '../firebase/bookingServices';

interface BlockTimeModalProps {
  providerId: string;
  providerType: 'salon' | 'master';
  masterId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language: 'cs' | 'en';
}

export const BlockTimeModal: React.FC<BlockTimeModalProps> = ({
  providerId,
  providerType,
  masterId,
  isOpen,
  onClose,
  onSuccess,
  language,
}) => {
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    cs: {
      title: 'Blokovat čas',
      date: 'Datum',
      startTime: 'Od',
      endTime: 'Do',
      reason: 'Důvod (nepovinný)',
      reasonPlaceholder: 'Např. Školení, Dovolená...',
      cancel: 'Zrušit',
      block: 'Blokovat',
      blocking: 'Blokování...',
      success: 'Čas zablokován!',
    },
    en: {
      title: 'Block Time',
      date: 'Date',
      startTime: 'From',
      endTime: 'To',
      reason: 'Reason (optional)',
      reasonPlaceholder: 'E.g. Training, Vacation...',
      cancel: 'Cancel',
      block: 'Block',
      blocking: 'Blocking...',
      success: 'Time blocked!',
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

  const getNext90Days = (): string[] => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 90; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d.toISOString().split('T')[0]);
    }
    return dates;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !startTime || !endTime) {
      setError(language === 'cs' ? 'Vyplňte všechna povinná pole' : 'Fill in all required fields');
      return;
    }

    if (startTime >= endTime) {
      setError(language === 'cs' ? 'Čas konce musí být po času začátku' : 'End time must be after start time');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createBlockedTime({
        providerId,
        providerType,
        masterId: masterId || undefined,
        date,
        startTime,
        endTime,
        reason: reason.trim() || undefined,
        createdBy: providerId,
      });

      alert(translations.success);
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setDate('');
    setStartTime('09:00');
    setEndTime('10:00');
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">🚫 {translations.title}</h2>
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {translations.date} <span className="text-red-500">*</span>
              </label>
              <select
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
              >
                <option value="">{language === 'cs' ? 'Vyberte datum' : 'Select date'}</option>
                {getNext90Days().map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString(language === 'cs' ? 'cs-CZ' : 'en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {translations.startTime} <span className="text-red-500">*</span>
                </label>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
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
                  {translations.endTime} <span className="text-red-500">*</span>
                </label>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
                >
                  {timeOptions.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {translations.reason}
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
                placeholder={translations.reasonPlaceholder}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
              >
                {translations.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? translations.blocking : `🚫 ${translations.block}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};






