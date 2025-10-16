/**
 * Форма создания/редактирования услуги
 */

import React, { useState } from 'react';
import { Service, ServiceFormData } from '../types/booking';
import FileUpload from './FileUpload';

interface ServiceFormProps {
  service?: Service;
  onSave: (data: ServiceFormData) => Promise<void>;
  onCancel: () => void;
  language: 'cs' | 'en';
}

export const ServiceForm: React.FC<ServiceFormProps> = ({
  service,
  onSave,
  onCancel,
  language,
}) => {
  const [formData, setFormData] = useState<ServiceFormData>({
    name_cs: service?.name_cs || '',
    name_en: service?.name_en || '',
    description_cs: service?.description_cs || '',
    description_en: service?.description_en || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    photoUrl: service?.photoUrl || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = {
    cs: {
      title: service ? 'Upravit službu' : 'Přidat službu',
      nameCz: 'Název služby (česky)',
      nameEn: 'Název služby (anglicky)',
      descriptionCz: 'Popis služby (česky)',
      descriptionEn: 'Popis služby (anglicky)',
      price: 'Cena (Kč)',
      duration: 'Délka (minuty)',
      photo: 'Fotografie',
      uploadPhoto: 'Nahrát fotografii',
      required: 'Povinné',
      optional: 'Nepovinné',
      atLeastOne: 'Vyplňte alespoň jeden název',
      save: 'Uložit službu',
      cancel: 'Zrušit',
      saving: 'Ukládání...',
    },
    en: {
      title: service ? 'Edit Service' : 'Add Service',
      nameCz: 'Service name (Czech)',
      nameEn: 'Service name (English)',
      descriptionCz: 'Service description (Czech)',
      descriptionEn: 'Service description (English)',
      price: 'Price (CZK)',
      duration: 'Duration (minutes)',
      photo: 'Photo',
      uploadPhoto: 'Upload photo',
      required: 'Required',
      optional: 'Optional',
      atLeastOne: 'Fill in at least one name',
      save: 'Save service',
      cancel: 'Cancel',
      saving: 'Saving...',
    },
  };

  const translations = t[language];

  const handleChange = (
    field: keyof ServiceFormData,
    value: string | number
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Валидация: минимум одно название обязательно
    if (!formData.name_cs.trim() && !formData.name_en?.trim()) {
      setError(translations.atLeastOne);
      return;
    }

    // Валидация: цена и длительность > 0
    if (formData.price <= 0 || formData.duration <= 0) {
      setError(language === 'cs' ? 'Cena a délka musí být větší než 0' : 'Price and duration must be greater than 0');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave(formData);
    } catch (err: any) {
      setError(err.message || (language === 'cs' ? 'Chyba při ukládání' : 'Error saving'));
      setLoading(false);
    }
  };


  return (
    <div className="service-form">
      <h2 className="text-2xl font-bold mb-6">{translations.title}</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Название (чешский) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.nameCz} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name_cs}
            onChange={(e) => handleChange('name_cs', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder={language === 'cs' ? 'Např. Dámský střih' : 'E.g. Women\'s haircut'}
          />
        </div>

        {/* Название (английский) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.nameEn} <span className="text-gray-400">({translations.optional})</span>
          </label>
          <input
            type="text"
            value={formData.name_en || ''}
            onChange={(e) => handleChange('name_en', e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder={language === 'cs' ? 'Např. Women\'s haircut' : 'E.g. Women\'s haircut'}
          />
        </div>

        {/* Описание (чешский) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.descriptionCz} <span className="text-gray-400">({translations.optional})</span>
          </label>
          <textarea
            value={formData.description_cs || ''}
            onChange={(e) => handleChange('description_cs', e.target.value)}
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder={language === 'cs' ? 'Profesionální střih pro dámy včetně mytí a foukání' : 'Professional haircut for women including washing and blow-dry'}
          />
        </div>

        {/* Описание (английский) */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.descriptionEn} <span className="text-gray-400">({translations.optional})</span>
          </label>
          <textarea
            value={formData.description_en || ''}
            onChange={(e) => handleChange('description_en', e.target.value)}
            rows={3}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder={language === 'cs' ? 'Professional haircut for women including washing and blow-dry' : 'Professional haircut for women including washing and blow-dry'}
          />
        </div>

        {/* Цена */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.price} <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={formData.price}
            onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="600"
          />
        </div>

        {/* Длительность */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.duration} <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.duration}
            onChange={(e) => handleChange('duration', parseInt(e.target.value))}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value={15}>15 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={30}>30 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={45}>45 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={60}>60 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={75}>75 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={90}>90 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={120}>120 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={150}>150 {language === 'cs' ? 'minut' : 'minutes'}</option>
            <option value={180}>180 {language === 'cs' ? 'minut' : 'minutes'}</option>
          </select>
        </div>

        {/* Фото */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {translations.photo} <span className="text-gray-400">({translations.optional})</span>
          </label>
          <FileUpload
            id="service-photo"
            onChange={(files) => {
              if (files && files.length > 0) {
                const file = files[0];
                const reader = new FileReader();
                reader.onload = (e) => {
                  if (e.target?.result) {
                    setFormData(prev => ({ ...prev, photoUrl: e.target!.result as string }));
                  }
                };
                reader.readAsDataURL(file);
              }
            }}
            selectedFiles={formData.photoUrl ? null : null}
            selectButtonText={language === 'cs' ? 'Vybrat foto' : 'Select photo'}
            noFileText={language === 'cs' ? 'Žádné foto' : 'No photo'}
            filesSelectedText={language === 'cs' ? 'Fotky vybrány' : 'Photos selected'}
            fileSelectedText={language === 'cs' ? 'Foto vybráno' : 'Photo selected'}
            accept="image/*"
            maxFiles={1}
          />
          {formData.photoUrl && (
            <div className="mt-2">
              <img
                src={formData.photoUrl}
                alt="Service preview"
                className="w-32 h-32 object-cover rounded"
              />
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            {translations.cancel}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 flex-1"
          >
            {loading ? translations.saving : translations.save}
          </button>
        </div>
      </form>
    </div>
  );
};

