import React, { useState } from 'react';
import { MasterRegistration, Language } from '../types';

interface MasterRegistrationFormProps {
  language: Language;
  translations: any;
  onSubmit: (data: MasterRegistration) => void;
  onCancel: () => void;
  salons?: Array<{ id: number; name: string; }>;
}

const MasterRegistrationForm: React.FC<MasterRegistrationFormProps> = ({
  language,
  translations,
  onSubmit,
  onCancel,
  salons = []
}) => {
  const [formData, setFormData] = useState<MasterRegistration>({
    name: '',
    specialty: '',
    experience: '',
    phone: '',
    email: '',
    description: '',
    services: [],
    photo: new File([], ''),
    isFreelancer: true,
    city: '',
    address: ''
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const t = translations[language];

  const availableServices = [
    'Manicure', 'Pedicure', 'Haircut', 'Makeup', 'Facial', 
    'Massage', 'Nail Art', 'Eyebrows', 'Eyelashes', 'Hair Coloring',
    'Hair Treatment', 'Hair Styling', 'Wedding Makeup', 'Barber'
  ];

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
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: e.target.files![0]
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="registration-form">
      <h2>{t.registerMaster}</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">{t.masterName} *</label>
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
            <label htmlFor="specialty">{t.specialty} *</label>
            <input
              type="text"
              id="specialty"
              name="specialty"
              value={formData.specialty}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Např. Manikúra a pedikúra"
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">{t.experience} *</label>
            <input
              type="text"
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              required
              className="form-input"
              placeholder="Např. 5 let"
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
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isFreelancer"
              checked={formData.isFreelancer}
              onChange={handleInputChange}
            />
            <span className="checkbox-text">{t.freelancer}</span>
          </label>
        </div>

        {formData.isFreelancer ? (
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
                placeholder="Např. Domácí salon, Vinohrady"
              />
            </div>
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="salonId">{t.salon} *</label>
            <select
              id="salonId"
              name="salonId"
              value={formData.salonId || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, salonId: Number(e.target.value) }))}
              required
              className="form-select"
            >
              <option value="">{t.selectSalon}</option>
              {salons.map(salon => (
                <option key={salon.id} value={salon.id}>{salon.name}</option>
              ))}
            </select>
          </div>
        )}

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
          <label htmlFor="photo">{t.photo} *</label>
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoChange}
            required
            className="form-file"
          />
          <p className="form-help">{t.photoHelp}</p>
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

export default MasterRegistrationForm;
