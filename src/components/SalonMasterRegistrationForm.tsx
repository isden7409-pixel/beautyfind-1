import React, { useState, useEffect } from 'react';
import { Salon, Master, Language } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import { getRequiredMessage, getValidationMessages } from '../utils/form';
import FileUpload from './FileUpload';
import WorkingHoursInput from './WorkingHoursInput';
import StructuredAddressInput from './StructuredAddressInput';

interface SalonMasterRegistrationFormProps {
  salon: Salon | null;
  master?: Master | null; // For editing existing master
  language: Language;
  translations: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const SalonMasterRegistrationForm: React.FC<SalonMasterRegistrationFormProps> = ({
  salon,
  master,
  language,
  translations,
  onSubmit,
  onCancel,
}) => {
  const isEditing = !!master;
  
  const [formData, setFormData] = useState({
    name: master?.name || '',
    specialty: master?.specialty || '',
    experience: master?.experience || '',
    description: master?.description || '',
    services: master?.services || [],
    languages: master?.languages || ['Czech'],
    workingHours: master?.workingHours || [],
    byAppointment: master?.byAppointment || false,
    photo: master?.photo || null as File | string | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Available services and languages
  const availableServices = [
    'Manicure', 'Pedicure', 'Nail Art', 'Nail Extension', 'Gel Polish',
    'Haircuts', 'Hair Styling', 'Hair Coloring', 'Highlights', 'Balayage',
    'Facial', 'Eyebrows', 'Eyelashes', 'Makeup', 'Massage',
    'Barber', 'Beard Trim', 'Mustache', 'Hot Towel', 'Shaving'
  ];

  const availableLanguages = [
    'Czech', 'English', 'German', 'Slovak', 'Russian', 'Ukrainian', 'Polish', 'French', 'Spanish', 'Italian'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = getRequiredMessage(language);
    }

    if (!formData.specialty.trim()) {
      newErrors.specialty = getRequiredMessage(language);
    }

    if (!formData.experience.trim()) {
      newErrors.experience = getRequiredMessage(language);
    }

    if (formData.services.length === 0) {
      newErrors.services = getRequiredMessage(language);
    }

    if (!formData.languages || formData.languages.length === 0) {
      newErrors.languages = language === 'cs' ? 'Vyberte alespoň jeden jazyk' : 'Select at least one language';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service]
    }));
    if (errors.services) {
      setErrors(prev => ({ ...prev, services: '' }));
    }
  };

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
    if (errors.languages) {
      setErrors(prev => ({ ...prev, languages: '' }));
    }
  };

  const handleWorkingHoursChange = (workingHours: any) => {
    setFormData(prev => ({ ...prev, workingHours }));
  };

  const handlePhotoChange = (files: FileList | null) => {
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, photo: files[0] as File }));
    }
  };

  const handlePhotoRemove = () => {
    setFormData(prev => ({ ...prev, photo: null }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const t = translations;

  return (
    <div className="salon-master-form">
      <h3>{isEditing ? (language === 'cs' ? 'Upravit mistra' : 'Edit Master') : (language === 'cs' ? 'Přidat mistra' : 'Add Master')}</h3>
      
      <form onSubmit={handleSubmit} className="form">
        {/* Basic Information */}
        <div className="form-section">
          <h4>{language === 'cs' ? 'Základní informace' : 'Basic Information'}</h4>
          
          <div className="form-group">
            <label htmlFor="name">
              {language === 'cs' ? 'Jméno' : 'Name'} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              placeholder={language === 'cs' ? 'Zadejte jméno mistra' : 'Enter master name'}
              required
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="specialty">
              {language === 'cs' ? 'Specializace' : 'Specialty'} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              className={errors.specialty ? 'error' : ''}
              placeholder={language === 'cs' ? 'Např. Kosmetologie' : 'e.g. Cosmetology'}
              required
              onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
            />
            {errors.specialty && <span className="error-message">{errors.specialty}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="experience">
              {language === 'cs' ? 'Zkušenosti (roky)' : 'Experience (years)'} <span className="required">*</span>
            </label>
            <input
              type="number"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className={errors.experience ? 'error' : ''}
              placeholder={language === 'cs' ? 'Např. 5' : 'e.g. 5'}
              min="0"
              max="50"
              required
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.validity.valueMissing) {
                  target.setCustomValidity(getRequiredMessage(language));
                } else if (target.validity.rangeUnderflow) {
                  target.setCustomValidity(language === 'cs' ? 'Hodnota musí být alespoň 0' : 'Value must be at least 0');
                } else if (target.validity.rangeOverflow) {
                  target.setCustomValidity(language === 'cs' ? 'Hodnota musí být maximálně 50' : 'Value must be at most 50');
                } else {
                  target.setCustomValidity('');
                }
              }}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
            />
            {errors.experience && <span className="error-message">{errors.experience}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">
              {language === 'cs' ? 'Popis' : 'Description'}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="form-textarea"
              rows={4}
              placeholder={language === 'cs' ? 'Popište mistra a jeho služby' : 'Describe the master and their services'}
            />
          </div>
        </div>

        {/* Services */}
        <div className="form-section">
          <h4>{language === 'cs' ? 'Služby' : 'Services'} <span className="required">*</span></h4>
          <div className="form-group">
            <div className="services-grid">
              {availableServices.map((service) => (
                <label key={service} className="service-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.services.includes(service)}
                    onChange={() => handleServiceToggle(service)}
                  />
                  <span className="service-label">{translateServices([service], language)[0]}</span>
                </label>
              ))}
            </div>
            {errors.services && <span className="error-message">{errors.services}</span>}
          </div>
        </div>

        {/* Languages */}
        <div className="form-section">
          <h4>{language === 'cs' ? 'Jazyky' : 'Languages'} <span className="required">*</span></h4>
          <div className="form-group">
            <div className="services-grid">
              {availableLanguages.map((lang) => (
                <label key={lang} className="service-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.languages.includes(lang)}
                    onChange={() => handleLanguageToggle(lang)}
                  />
                  <span className="service-label">{translateLanguages([lang], language)[0]}</span>
                </label>
              ))}
            </div>
            {errors.languages && <span className="error-message">{errors.languages}</span>}
          </div>
        </div>

        {/* Working Hours */}
        <div className="form-section">
          <h4>{language === 'cs' ? 'Pracovní doba' : 'Working Hours'}</h4>
          <WorkingHoursInput
            value={formData.workingHours}
            onChange={handleWorkingHoursChange}
            language={language}
            byAppointment={formData.byAppointment}
            onByAppointmentChange={(value) => setFormData(prev => ({ ...prev, byAppointment: value }))}
          />
        </div>

        {/* Photo */}
        <div className="form-section">
          <h4>{language === 'cs' ? 'Fotografie' : 'Photo'}</h4>
          <div className="form-group">
            <FileUpload
              id="master-photo"
              multiple={false}
              onChange={handlePhotoChange}
              selectedFiles={formData.photo instanceof File ? [formData.photo] as any : null}
              previewUrls={typeof formData.photo === 'string' ? [formData.photo] : []}
              onRemoveUrl={handlePhotoRemove}
              maxFiles={1}
              selectButtonText={language === 'cs' ? 'Vybrat fotografii' : 'Select photo'}
              noFileText={language === 'cs' ? 'Žádná fotografie nebyla vybrána' : 'No photo selected'}
              filesSelectedText={language === 'cs' ? 'fotografií vybráno' : 'photos selected'}
              fileSelectedText={language === 'cs' ? 'fotografie vybrána' : 'photo selected'}
            />
            <p className="form-help">{language === 'cs' ? 'Nahrajte profesionální fotografii mistra (max 1)' : 'Upload professional photo of master (max 1)'}</p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="cancel-button"
            disabled={submitting}
          >
            {language === 'cs' ? 'Zrušit' : 'Cancel'}
          </button>
          <button
            type="submit"
            className="save-button"
            disabled={submitting}
          >
            {submitting 
              ? (language === 'cs' ? 'Ukládání...' : 'Saving...')
              : (isEditing 
                ? (language === 'cs' ? 'Uložit změny' : 'Save Changes')
                : (language === 'cs' ? 'Registrovat mistra' : 'Register Master')
              )
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalonMasterRegistrationForm;
