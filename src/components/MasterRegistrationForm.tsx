import React, { useState } from 'react';
import { MasterRegistration, Language } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import FileUpload from './FileUpload';
import { masterService } from '../firebase/services';

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
  { value: 'Vsetin', label: 'Vsetín' },
  { value: 'Valasske', label: 'Valašské Meziříčí' },
  { value: 'Litomysl', label: 'Litomyšl' },
  { value: 'Novy', label: 'Nový Jičín' },
  { value: 'Uherske', label: 'Uherské Hradiště' },
  { value: 'Chrudim', label: 'Chrudim' },
  { value: 'Havlickuv', label: 'Havlíčkův Brod' },
  { value: 'Koprivnice', label: 'Kopřivnice' },
  { value: 'Jindrichuv', label: 'Jindřichův Hradec' },
  { value: 'Svitavy', label: 'Svitavy' },
  { value: 'Kralupy', label: 'Kralupy nad Vltavou' },
  { value: 'Vyskov', label: 'Vyškov' },
  { value: 'Ceský', label: 'Český Těšín' },
  { value: 'Kutna', label: 'Kutná Hora' },
  { value: 'Breclav', label: 'Břeclav' },
  { value: 'Hodonin', label: 'Hodonín' },
  { value: 'Strakonice', label: 'Strakonice' }
];

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
    languages: [],
    photo: new File([], ''),
    isFreelancer: true,
    city: '',
    address: ''
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<FileList | null>(null);

  const t = translations[language];

  const availableServices = [
    'Manicure', 'Pedicure', 'Haircut', 'Makeup', 'Facial', 
    'Massage', 'Nail Art', 'Eyebrows', 'Eyelashes', 'Hair Coloring',
    'Hair Treatment', 'Hair Styling', 'Wedding Makeup', 'Barber',
    'Gel Nails', 'Nail Extensions', 'Coloring', 'Styling', 'Beard Trim',
    'Event Makeup', 'Bridal Makeup', 'Relaxation Massage', 'Sports Massage',
    'Lymphatic Massage', 'Women\'s Haircuts', 'Women\'s Haircut', 'Highlights', 'Anti-aging',
    'Skin Cleansing', 'Men\'s Haircuts and Beards', 'Hot Towel',
    'Women\'s Haircuts and Coloring', 'Body Treatment', 'Sauna',
    'Massage Therapy', 'Facial & Body Treatments', 'Men\'s Haircuts',
    'Eyebrow Shaping', 'Eyebrow Shaping & Tinting', 'Balayage', 'Hair Wash',
    'Skin Treatment', 'Cleansing', 'Lash Extensions', 'Wedding Hairstyles',
    'Relaxation', 'Therapeutic Massage', 'Aromatherapy', 'Detox'
  ];

  const availableLanguages = [
    'Czech', 'English', 'German', 'French', 'Spanish', 'Italian', 
    'Russian', 'Slovak', 'Polish', 'Ukrainian', 'Portuguese', 'Dutch'
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

  const handleLanguageToggle = (language: string) => {
    const newLanguages = selectedLanguages.includes(language)
      ? selectedLanguages.filter(l => l !== language)
      : [...selectedLanguages, language];
    
    setSelectedLanguages(newLanguages);
    setFormData(prev => ({
      ...prev,
      languages: newLanguages
    }));
  };

  const handlePhotoChange = (files: FileList | null) => {
    setPhotoFile(files);
    if (files && files[0]) {
      setFormData(prev => ({
        ...prev,
        photo: files[0]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        photo: new File([], '')
      }));
    }
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const id = await masterService.createFromRegistration(formData);
      console.log('Master created with id', id);
      alert(t.registrationSuccess);
      setFormData({
        name: '',
        specialty: '',
        experience: '',
        phone: '',
        email: '',
        description: '',
        services: [],
        languages: [],
        photo: new File([], ''),
        isFreelancer: true,
        city: '',
        address: ''
      });
      setSelectedServices([]);
      setSelectedLanguages([]);
      setPhotoFile(null);
      onSubmit(formData);
    } catch (error) {
      console.error('Failed to create master', error);
      const message = (error as Error)?.message || 'Failed to create master';
      alert(message);
    } finally {
      setSubmitting(false);
    }
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
              placeholder="Např. Manicure and Pedicure"
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
                {CZECH_CITIES.map(city => (
                  <option key={city.value} value={city.value}>
                    {city.label}
                  </option>
                ))}
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
              onChange={(e) => setFormData(prev => ({ ...prev, salonId: e.target.value }))}
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
                <span className="service-label">{translateServices([service], language)[0]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>{language === 'cs' ? 'Jazyky *' : 'Languages *'}</label>
          <div className="services-grid">
            {availableLanguages.map(languageItem => (
              <label key={languageItem} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={selectedLanguages.includes(languageItem)}
                  onChange={() => handleLanguageToggle(languageItem)}
                />
                <span className="service-label">{translateLanguages([languageItem], language)[0]}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="photo">{t.photo} *</label>
          <FileUpload
            id="photo"
            multiple={false}
            accept="image/*"
            onChange={handlePhotoChange}
            selectedFiles={photoFile}
            selectButtonText={t.selectFiles}
            noFileText={t.noFileSelected}
            filesSelectedText={t.filesSelected}
            fileSelectedText={t.fileSelected}
            className="form-file"
            required={true}
          />
          <p className="form-help">{t.photoHelp}</p>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {t.cancel}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? `${(t.loading || (language === 'cs' ? 'Načítání' : 'Loading'))}...` : t.register}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MasterRegistrationForm;
