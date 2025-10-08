import React, { useState, useEffect } from 'react';
import { Salon, Language } from '../types';
import { translateServices } from '../utils/serviceTranslations';
import { getRequiredMessage, getValidationMessages } from '../utils/form';
import FileUpload from './FileUpload';
import WorkingHoursInput from './WorkingHoursInput';
import StructuredAddressInput from './StructuredAddressInput';

// Список всех чешских городов
const CZECH_CITIES = [
  { value: 'Prague', label: 'Praha' },
  { value: 'Brno', label: 'Brno' },
  { value: 'Ostrava', label: 'Ostrava' },
  { value: 'Plzen', label: 'Plzeň' },
  { value: 'Liberec', label: 'Liberec' },
  { value: 'Olomouc', label: 'Olomouc' },
  { value: 'Budweis', label: 'České Budějovice' },
  { value: 'Hradec', label: 'Hradec Králové' },
  { value: 'Pardubice', label: 'Pardubice' },
  { value: 'Zlín', label: 'Zlín' },
  { value: 'Havirov', label: 'Havířov' },
  { value: 'Kladno', label: 'Kladno' },
  { value: 'Most', label: 'Most' },
  { value: 'Opava', label: 'Opava' },
  { value: 'Frydek', label: 'Frýdek-Místek' },
  { value: 'Karvina', label: 'Karviná' },
  { value: 'Jihlava', label: 'Jihlava' },
  { value: 'Teplice', label: 'Teplice' },
  { value: 'Decin', label: 'Děčín' },
  { value: 'Chomutov', label: 'Chomutov' },
  { value: 'Jablonec', label: 'Jablonec nad Nisou' },
  { value: 'Mlada', label: 'Mladá Boleslav' },
  { value: 'Prostejov', label: 'Prostějov' },
  { value: 'Prerov', label: 'Přerov' },
  { value: 'Trebic', label: 'Třebíč' },
  { value: 'Ceska', label: 'Česká Lípa' },
  { value: 'Tabor', label: 'Tábor' },
  { value: 'Znojmo', label: 'Znojmo' },
  { value: 'Pribram', label: 'Příbram' },
  { value: 'Orlova', label: 'Orlová' },
  { value: 'Cheb', label: 'Cheb' },
  { value: 'Modrany', label: 'Modřany' },
  { value: 'Litvinov', label: 'Litvínov' },
  { value: 'Trinec', label: 'Třinec' },
  { value: 'Kolin', label: 'Kolín' },
  { value: 'Kromeriz', label: 'Kroměříž' },
  { value: 'Sumperk', label: 'Šumperk' },
  { value: 'Usti', label: 'Ústí nad Labem' },
  { value: 'Hodonin', label: 'Hodonín' },
  { value: 'Cesky', label: 'Český Těšín' },
  { value: 'Kladno', label: 'Kladno' },
  { value: 'Karvina', label: 'Karviná' },
  { value: 'Jablonec', label: 'Jablonec nad Nisou' },
  { value: 'Mlada', label: 'Mladá Boleslav' },
  { value: 'Prostejov', label: 'Prostějov' },
  { value: 'Prerov', label: 'Přerov' },
  { value: 'Trebic', label: 'Třebíč' },
  { value: 'Ceska', label: 'Česká Lípa' },
  { value: 'Tabor', label: 'Tábor' },
  { value: 'Znojmo', label: 'Znojmo' },
  { value: 'Pribram', label: 'Příbram' },
  { value: 'Orlova', label: 'Orlová' },
  { value: 'Cheb', label: 'Cheb' },
  { value: 'Modrany', label: 'Modřany' },
  { value: 'Litvinov', label: 'Litvínov' },
  { value: 'Trinec', label: 'Třinec' },
  { value: 'Kolin', label: 'Kolín' },
  { value: 'Kromeriz', label: 'Kroměříž' },
  { value: 'Sumperk', label: 'Šumperk' },
  { value: 'Usti', label: 'Ústí nad Labem' },
  { value: 'Hodonin', label: 'Hodonín' },
  { value: 'Cesky', label: 'Český Těšín' }
];

interface SalonProfileEditFormProps {
  salon: Salon;
  language: Language;
  translations: any;
  onSave: (updatedData: any) => Promise<void>;
  onCancel: () => void;
}

const SalonProfileEditForm: React.FC<SalonProfileEditFormProps> = ({
  salon,
  language,
  translations,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    name: salon.name || '',
    email: salon.email || '',
    phone: salon.phone || '',
    address: salon.address || '',
    website: salon.website || '',
    description: salon.description || '',
    services: salon.services || [],
    workingHours: salon.workingHours || [],
    structuredAddress: salon.structuredAddress || null,
    photos: salon.photos || [],
    city: salon.city || '',
    rating: salon.rating || 0,
    reviews: salon.reviews || 0,
    coordinates: salon.coordinates || null,
    byAppointment: salon.byAppointment || false,
    paymentMethods: salon.paymentMethods || []
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const t = translations[language];
  const validationMessages = getValidationMessages(language);

  useEffect(() => {
    setFormData({
      name: salon.name || '',
      email: salon.email || '',
      phone: salon.phone || '',
      address: salon.address || '',
      website: salon.website || '',
      description: salon.description || '',
      services: salon.services || [],
      workingHours: salon.workingHours || [],
      structuredAddress: salon.structuredAddress || null,
      photos: salon.photos || [],
      city: salon.city || '',
      rating: salon.rating || 0,
      reviews: salon.reviews || 0,
      coordinates: salon.coordinates || null,
      byAppointment: salon.byAppointment || false,
      paymentMethods: salon.paymentMethods || []
    });
  }, [salon]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleServicesChange = (selectedServices: string[]) => {
    setFormData(prev => ({
      ...prev,
      services: selectedServices
    }));
  };

  const handleWorkingHoursChange = (hours: any[]) => {
    setFormData(prev => ({
      ...prev,
      workingHours: hours
    }));
  };

  const handleAddressChange = (address: any) => {
    setFormData(prev => ({
      ...prev,
      structuredAddress: address,
      address: address ? `${address.street} ${address.houseNumber}, ${address.postalCode} ${address.city}` : prev.address
    }));
  };

  const handlePhotosChange = (files: FileList | null) => {
    if (files) {
      const photoUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const url = URL.createObjectURL(file);
        photoUrls.push(url);
      }
      setFormData(prev => ({
        ...prev,
        photos: photoUrls
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

    if (!formData.address.trim()) {
      newErrors.address = getRequiredMessage(language);
    }

    if (formData.services.length === 0) {
      newErrors.services = getRequiredMessage(language);
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
      console.error('Error saving salon profile:', error);
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
          <label htmlFor="website">
            {translations.website}
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            placeholder={translations.websitePlaceholder}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">
            {translations.description}
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            placeholder={translations.descriptionPlaceholder}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>{translations.location}</h3>
        
        <StructuredAddressInput
          value={formData.structuredAddress || undefined}
          onChange={handleAddressChange}
          language={language}
          translations={translations}
        />
      </div>

      <div className="form-section">
        <h3>{translations.servicesLabel}</h3>
        
        <div className="form-group">
          <label>
            {translations.selectServices} <span className="required">*</span>
          </label>
          <div className="services-grid">
            {Object.keys(translations.services).map((serviceKey) => (
              <label key={serviceKey} className="service-option">
                <input
                  type="checkbox"
                  checked={formData.services.includes(serviceKey)}
                  onChange={(e) => {
                    const selectedServices = e.target.checked
                      ? [...formData.services, serviceKey]
                      : formData.services.filter(s => s !== serviceKey);
                    handleServicesChange(selectedServices);
                  }}
                />
                <span className="service-name">{translations.services[serviceKey]}</span>
              </label>
            ))}
          </div>
          {errors.services && <span className="error-message">{errors.services}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>{translations.workingHours}</h3>
        
        <WorkingHoursInput
          value={formData.workingHours}
          onChange={handleWorkingHoursChange}
          language={language}
        />
      </div>

      <div className="form-section">
        <h3>{translations.photos}</h3>
        
        <FileUpload
          id="salon-photos"
          multiple={true}
          onChange={handlePhotosChange}
          selectedFiles={null}
          selectButtonText={language === 'cs' ? 'Vybrat fotografie' : 'Select photos'}
          noFileText={language === 'cs' ? 'Žádné fotografie nebyly vybrány' : 'No photos selected'}
          filesSelectedText={language === 'cs' ? 'fotografií vybráno' : 'photos selected'}
          fileSelectedText={language === 'cs' ? 'fotografie vybrána' : 'photo selected'}
        />
      </div>

      <div className="form-section">
        <h3>{translations.additionalInfo}</h3>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="byAppointment"
              checked={formData.byAppointment}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">{translations.byAppointment}</span>
          </label>
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

export default SalonProfileEditForm;
