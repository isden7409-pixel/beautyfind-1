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
  const [formData, setFormData] = useState<ServiceFormData & { photoFile?: File | null }>({
    name_cs: service?.name_cs || '',
    name_en: service?.name_en || '',
    description_cs: service?.description_cs || '',
    description_en: service?.description_en || '',
    price: service?.price || 0,
    duration: service?.duration || 30,
    photoUrl: service?.photoUrl || '',
    photoFile: null,
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
      // Убираем photoFile из данных перед сохранением в Firestore
      const { photoFile, ...serviceData } = formData;
      await onSave(serviceData);
    } catch (err: any) {
      setError(err.message || (language === 'cs' ? 'Chyba při ukládání' : 'Error saving'));
      setLoading(false);
    }
  };


  return (
    <div className="service-form-container">
      <div className="service-form-card">
        <h2 className="service-form-title">{translations.title}</h2>

        {error && (
          <div className="service-form-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="service-form">
          {/* Название (чешский) */}
          <div className="service-form-field">
            <label className="service-form-label">
              {translations.nameCz} <span className="service-form-required">*</span>
            </label>
            <input
              type="text"
              value={formData.name_cs}
              onChange={(e) => handleChange('name_cs', e.target.value)}
              className="service-form-input"
              placeholder={language === 'cs' ? 'Např. Dámský střih' : 'E.g. Women\'s haircut'}
            />
          </div>

          {/* Название (английский) */}
          <div className="service-form-field">
            <label className="service-form-label">
              {translations.nameEn} <span className="service-form-optional">({translations.optional})</span>
            </label>
            <input
              type="text"
              value={formData.name_en || ''}
              onChange={(e) => handleChange('name_en', e.target.value)}
              className="service-form-input"
              placeholder={language === 'cs' ? 'Např. Women\'s haircut' : 'E.g. Women\'s haircut'}
            />
          </div>

          {/* Описание (чешский) */}
          <div className="service-form-field">
            <label className="service-form-label">
              {translations.descriptionCz} <span className="service-form-optional">({translations.optional})</span>
            </label>
            <textarea
              value={formData.description_cs || ''}
              onChange={(e) => handleChange('description_cs', e.target.value)}
              rows={3}
              className="service-form-textarea"
              placeholder={language === 'cs' ? 'Profesionální střih pro dámy včetně mytí a foukání' : 'Professional haircut for women including washing and blow-dry'}
            />
          </div>

          {/* Описание (английский) */}
          <div className="service-form-field">
            <label className="service-form-label">
              {translations.descriptionEn} <span className="service-form-optional">({translations.optional})</span>
            </label>
            <textarea
              value={formData.description_en || ''}
              onChange={(e) => handleChange('description_en', e.target.value)}
              rows={3}
              className="service-form-textarea"
              placeholder={language === 'cs' ? 'Professional haircut for women including washing and blow-dry' : 'Professional haircut for women including washing and blow-dry'}
            />
          </div>

          {/* Цена и длительность в одной строке */}
          <div className="service-form-row">
            <div className="service-form-field">
              <label className="service-form-label">
                {translations.price} <span className="service-form-required">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
                className="service-form-input"
                placeholder="600"
              />
            </div>

            <div className="service-form-field">
              <label className="service-form-label">
                {translations.duration} <span className="service-form-required">*</span>
              </label>
              <select
                value={formData.duration}
                onChange={(e) => handleChange('duration', parseInt(e.target.value))}
                className="service-form-select"
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
          </div>

          {/* Фото */}
          <div className="service-form-field">
            <label className="service-form-label">
              {translations.photo} <span className="service-form-optional">({translations.optional})</span>
            </label>
                    <FileUpload
                      id="service-photo"
                      onChange={(files) => {
                        if (files && files.length > 0) {
                          const file = files[0];
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            if (e.target?.result) {
                              setFormData(prev => ({ ...prev, photoUrl: e.target!.result as string, photoFile: file }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      selectedFiles={formData.photoFile ? [formData.photoFile] as any : null}
                      previewUrls={formData.photoUrl && !formData.photoFile ? [formData.photoUrl] : []}
                      selectButtonText={language === 'cs' ? 'Vybrat foto' : 'Select photo'}
                      noFileText={language === 'cs' ? 'Žádné foto' : 'No photo'}
                      filesSelectedText={language === 'cs' ? 'Fotky vybrány' : 'Photos selected'}
                      fileSelectedText={language === 'cs' ? 'Foto vybráno' : 'Photo selected'}
                      accept="image/*"
                      maxFiles={1}
                      onRemoveFile={() => {
                        setFormData(prev => ({ ...prev, photoUrl: '', photoFile: null }));
                      }}
                      onRemoveUrl={() => {
                        setFormData(prev => ({ ...prev, photoUrl: '', photoFile: null }));
                      }}
                    />
            {formData.photoUrl && (
              <div className="file-upload-hint">
                {language === 'cs' ? 'Nahrajte foto služby (max 1)' : 'Add service photo (max 1)'}
              </div>
            )}
          </div>

          {/* Кнопки */}
          <div className="service-form-actions">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="service-form-button service-form-button-cancel"
            >
              {translations.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="service-form-button service-form-button-save"
            >
              {loading ? translations.saving : translations.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

