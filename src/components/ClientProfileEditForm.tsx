import React, { useState, useEffect } from 'react';
import { UserProfile, Language } from '../types';
import { getRequiredMessage, getValidationMessages } from '../utils/form';

interface ClientProfileEditFormProps {
  userProfile: UserProfile;
  language: Language;
  translations: any;
  onSave: (updatedData: any) => Promise<void>;
  onCancel: () => void;
}

const ClientProfileEditForm: React.FC<ClientProfileEditFormProps> = ({
  userProfile,
  language,
  translations,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: userProfile.name || '',
    email: userProfile.email || '',
    phone: userProfile.phone || '',
    type: userProfile.type || 'client'
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = translations[language];
  const validationMessages = getValidationMessages(language);

  useEffect(() => {
    setFormData({
      name: userProfile.name || '',
      email: userProfile.email || '',
      phone: userProfile.phone || '',
      type: userProfile.type || 'client'
    });
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = getRequiredMessage(language);
    }

    if (!formData.email.trim()) {
      newErrors.email = getRequiredMessage(language);
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = language === 'cs' ? 'Neplatný email' : 'Invalid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = getRequiredMessage(language);
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving client profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="registration-form">
      <div className="form-section">
        <h3>{translations.basicInfo}</h3>
        
        <div className="form-group">
          <label htmlFor="name">
            {translations.name} <span className="required">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={errors.name ? 'error' : ''}
            placeholder={translations.namePlaceholder}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">
            {translations.email} <span className="required">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
            placeholder={translations.emailPlaceholder}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="phone">
            {translations.phone} <span className="required">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
            placeholder={translations.phonePlaceholder}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="type">
            {translations.type}
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            disabled
          >
            <option value="client">{translations.client}</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancel}
          className="cancel-button"
          disabled={submitting}
        >
          {translations.cancel}
        </button>
        <button
          type="submit"
          className="submit-button"
          disabled={submitting}
        >
          {submitting ? translations.saving : translations.save}
        </button>
      </div>
    </form>
  );
};

export default ClientProfileEditForm;
