import React, { useState } from 'react';
import { SalonRegistration, Language } from '../types';

interface SalonRegistrationFormProps {
  language: Language;
  translations: any;
  onSubmit: (data: SalonRegistration) => void;
  onCancel: () => void;
}

const SalonRegistrationForm: React.FC<SalonRegistrationFormProps> = ({
  language,
  translations,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState<SalonRegistration>({
    name: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    openHours: '',
    services: [],
    photos: []
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  // const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  const t = translations[language];

  const availableServices = [
    'Manicure', 'Pedicure', 'Haircut', 'Makeup', 'Facial', 
    'Massage', 'Nail Art', 'Eyebrows', 'Eyelashes', 'Hair Coloring',
    'Hair Treatment', 'Hair Styling', 'Wedding Makeup', 'Barber'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleServiceToggle = (service: string) => {
    const newServices = selectedServices.includes(service)
      ? selectedServices.filter(s => s !== service)
      : [...selectedServices, service];
    
    setSelectedServices(newServices);
    setFormData(prev => ({
      ...prev,
      services: newServices
    }));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData(prev => ({
        ...prev,
        photos: files
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="registration-form">
      <h2>{t.registerSalon}</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">{t.salonName} *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-input"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="city">{t.city} *</label>
            <select
              id="city"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">{t.selectCity}</option>
              <option value="Prague">Praha</option>
              <option value="Brno">Brno</option>
              <option value="Ostrava">Ostrava</option>
              <option value="Plzen">Plzeň</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="address">{t.address} *</label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">{t.phone} *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t.email} *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="website">{t.website}</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="form-input"
            placeholder="https://www.example.com"
          />
        </div>

        <div className="form-group">
          <label htmlFor="openHours">{t.openHours} *</label>
          <input
            type="text"
            id="openHours"
            name="openHours"
            value={formData.openHours}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder="Po-Pá: 9:00-20:00, So: 10:00-18:00"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">{t.description} *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            className="form-textarea"
            rows={4}
            placeholder={t.descriptionPlaceholder}
          />
        </div>

        <div className="form-group">
          <label>{t.services} *</label>
          <div className="services-grid">
            {availableServices.map(service => (
              <label key={service} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service)}
                  onChange={() => handleServiceToggle(service)}
                />
                <span className="service-label">{service}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="photos">{t.photos}</label>
          <input
            type="file"
            id="photos"
            multiple
            accept="image/*"
            onChange={handlePhotoChange}
            className="form-file"
          />
          <p className="form-help">{t.photosHelp}</p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {t.cancel}
          </button>
          <button type="submit" className="btn btn-primary">
            {t.register}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SalonRegistrationForm;
