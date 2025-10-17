/**
 * Компонент настроек резервации
 */

import React, { useState, useEffect } from 'react';
import { BookingSettings, BookingSettingsFormData } from '../types/booking';
import { getBookingSettings, updateBookingSettings } from '../firebase/bookingServices';

interface BookingSettingsFormProps {
  providerId: string;
  providerType: 'salon' | 'master';
  language: 'cs' | 'en';
}

export const BookingSettingsForm: React.FC<BookingSettingsFormProps> = ({
  providerId,
  providerType,
  language,
}) => {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [formData, setFormData] = useState<BookingSettingsFormData>({
    minAdvanceBookingTime: 120, // 2 часа по умолчанию
    cancellationDeadline: 180, // 3 часа по умолчанию
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const t = {
    cs: {
      title: 'Nastavení rezervací',
      minAdvance: 'Minimální čas pro rezervaci',
      minAdvanceDesc: 'Klienti mohou rezervovat minimálně X hodin před službou',
      cancellationDeadline: 'Lhůta pro zrušení klientem',
      cancellationDeadlineDesc: 'Klienti mohou zrušit rezervaci do X hodin před službou',
      hours: 'hodin',
      save: 'Uložit nastavení',
      saving: 'Ukládání...',
      loading: 'Načítání...',
      saved: 'Nastavení uloženo!',
    },
    en: {
      title: 'Booking Settings',
      minAdvance: 'Minimum advance booking time',
      minAdvanceDesc: 'Clients can book at least X hours before service',
      cancellationDeadline: 'Cancellation deadline',
      cancellationDeadlineDesc: 'Clients can cancel up to X hours before service',
      hours: 'hours',
      save: 'Save settings',
      saving: 'Saving...',
      loading: 'Loading...',
      saved: 'Settings saved!',
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadSettings();
  }, [providerId]);

  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getBookingSettings(providerId);
      if (data) {
        setSettings(data);
        setFormData({
          minAdvanceBookingTime: data.minAdvanceBookingTime,
          cancellationDeadline: data.cancellationDeadline,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof BookingSettingsFormData, hours: number) => {
    const minutes = hours * 60;
    setFormData(prev => ({ ...prev, [field]: minutes }));
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      await updateBookingSettings(providerId, providerType, formData);
      setSuccess(true);
      await loadSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        {translations.loading}
      </div>
    );
  }

  const minAdvanceHours = Math.floor(formData.minAdvanceBookingTime / 60);
  const cancellationHours = Math.floor(formData.cancellationDeadline / 60);

  return (
    <div className="booking-settings-form max-w-2xl">
      <h3 className="text-xl font-bold mb-6">⚙️ {translations.title}</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {translations.saved}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Минимальное время до услуги */}
        <div className="p-4 border rounded bg-gray-50">
          <label className="block font-medium mb-2">
            ⏰ {translations.minAdvance}
          </label>
          <p className="text-sm text-gray-600 mb-3">
            {translations.minAdvanceDesc}
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              step="1"
              value={minAdvanceHours}
              onChange={(e) => handleChange('minAdvanceBookingTime', parseInt(e.target.value) || 0)}
              className="w-24 p-2 border rounded focus:ring-2 focus:ring-pink-500"
            />
            <span className="text-gray-700">{translations.hours}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {language === 'cs' ? 'Doporučeno: 1-3 hodiny' : 'Recommended: 1-3 hours'}
          </div>
        </div>

        {/* Время для отмены клиентом */}
        <div className="p-4 border rounded bg-gray-50">
          <label className="block font-medium mb-2">
            ❌ {translations.cancellationDeadline}
          </label>
          <p className="text-sm text-gray-600 mb-3">
            {translations.cancellationDeadlineDesc}
          </p>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              step="1"
              value={cancellationHours}
              onChange={(e) => handleChange('cancellationDeadline', parseInt(e.target.value) || 0)}
              className="w-24 p-2 border rounded focus:ring-2 focus:ring-pink-500"
            />
            <span className="text-gray-700">{translations.hours}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {language === 'cs' ? 'Doporučeno: 2-4 hodiny' : 'Recommended: 2-4 hours'}
          </div>
        </div>

        {/* Кнопка сохранения */}
        <button
          type="submit"
          disabled={saving}
          className="w-full px-4 py-3 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 font-medium"
        >
          {saving ? translations.saving : `💾 ${translations.save}`}
        </button>
      </form>

      {/* Подсказка */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <div className="flex gap-2">
          <span className="text-blue-600 text-xl">💡</span>
          <div className="text-sm text-blue-800">
            {language === 'cs' ? (
              <>
                <p className="font-medium mb-1">Tipy:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Minimální čas pro rezervaci zabraňuje rezervacím na poslední chvíli</li>
                  <li>Lhůta pro zrušení chrání váš čas před pozdními zrušeními</li>
                  <li>Můžete nastavit obě hodnoty na 0 pro maximální flexibilitu</li>
                </ul>
              </>
            ) : (
              <>
                <p className="font-medium mb-1">Tips:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Minimum advance time prevents last-minute bookings</li>
                  <li>Cancellation deadline protects your time from late cancellations</li>
                  <li>You can set both values to 0 for maximum flexibility</li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};






