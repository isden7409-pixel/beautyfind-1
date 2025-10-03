import React, { useState } from 'react';
import { MasterRegistration, Language, Salon } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import FileUpload from './FileUpload';
import WorkingHoursInput from './WorkingHoursInput';
import StructuredAddressInput from './StructuredAddressInput';
import { masterService } from '../firebase/services';
import { getRequiredMessage, getValidationMessages } from '../utils/form';

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
  salons?: Salon[];
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
    address: '',
    structuredAddress: undefined,
    workingHours: undefined,
    byAppointment: false
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<FileList | null>(null);

  const t = translations[language];
  const validationMessages = getValidationMessages(language);

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
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [languagesError, setLanguagesError] = useState<string | null>(null);

  const isWorkingHoursFilled = (wh?: any[]): boolean => {
    if (!wh || wh.length === 0) return false;
    // At least one working day or at least one entry provided
    return wh.some((d: any) => typeof d.isWorking === 'boolean');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate services
      if (selectedServices.length === 0) {
        setServicesError(validationMessages.servicesRequired);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setServicesError(null);
      }
      // Validate languages
      if (selectedLanguages.length === 0) {
        setLanguagesError(validationMessages.languagesRequired);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setLanguagesError(null);
      }
      // Validate working hours unless "by appointment" selected
      if (!formData.byAppointment && !isWorkingHoursFilled(formData.workingHours)) {
        setHoursError(validationMessages.workingHoursRequired);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      // Clear possible old error if byAppointment is active
      if (formData.byAppointment) {
        setHoursError(null);
      }
      // Validate geocoding if structuredAddress present
      if (formData.structuredAddress) {
        try {
          const { geocodeStructuredAddress } = await import('../utils/geocoding');
          const coords = await geocodeStructuredAddress(formData.structuredAddress);
          if (!coords) {
            alert(validationMessages.addressNotFound);
            return;
          }
        } catch {
          alert(validationMessages.addressValidationFailed);
          return;
        }
      }
      setHoursError(null);
      setSubmitting(true);
      const id = await masterService.createFromRegistration(formData);
      // Master created successfully
      alert(validationMessages.registrationSuccess);
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
        address: '',
        structuredAddress: undefined,
        workingHours: undefined,
        byAppointment: false
      });
      setSelectedServices([]);
      setSelectedLanguages([]);
      setPhotoFile(null);
      onSubmit(formData);
    } catch (error) {
      // Failed to create master
      const message = (error as Error)?.message || validationMessages.registrationFailed;
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>{t.registerMaster}</h2>
      <form onSubmit={handleSubmit} className="form">
        {hoursError && !formData.byAppointment && (
          <div className="form-error" role="alert">{hoursError}</div>
        )}
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
            placeholder={language === 'cs' ? 'Např. Marie Nováková' : 'e.g. Mary Smith'}
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
              placeholder={language === 'cs' ? 'Např. Manikúra a pedikúra' : 'e.g. Manicure and pedicure'}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
          </div>

          <div className="form-group">
            <label htmlFor="experience">{language === 'cs' ? 'Počet let praxe' : 'Years of experience'} *</label>
            <input
              type="number"
              id="experience"
              name="experience"
              min={0}
              max={55}
              value={Number(formData.experience) || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
              required
              className="form-input"
              placeholder={language === 'cs' ? 'Např. 5' : 'e.g. 5'}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
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
              placeholder={language === 'cs' ? 'Např. +420 123 456 789' : 'e.g. +420 123 456 789'}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
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
              placeholder={language === 'cs' ? 'Např. mujmail@seznam.cz' : 'e.g. mymail@gmail.com'}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
          </div>
        </div>

        <div className="form-group">
          <div className="work-type-selection">
            <div className="work-type-option">
              <input
                type="radio"
                name="workType"
                value="freelancer"
                checked={formData.isFreelancer}
                onChange={() => setFormData(prev => ({ ...prev, isFreelancer: true, salonId: undefined }))}
                id="freelancer"
              />
              <label htmlFor="freelancer" className="work-type-label">{t.freelancer}</label>
            </div>
            <div className="work-type-option">
              <input
                type="radio"
                name="workType"
                value="salon"
                checked={!formData.isFreelancer}
                onChange={() => setFormData(prev => ({ ...prev, isFreelancer: false }))}
                id="salon"
              />
              <label htmlFor="salon" className="work-type-label">{language === 'cs' ? 'Pracuje v salonu' : 'Works in salon'}</label>
            </div>
          </div>
        </div>

        {formData.isFreelancer ? (
          <>
          <div className="form-group city-field">
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

            <div className="form-group address-group">
              <StructuredAddressInput
                language={language}
                translations={translations}
                value={formData.structuredAddress}
                city={formData.city}
                onChange={(structuredAddress) => {
                  setFormData(prev => ({
                    ...prev,
                    structuredAddress,
                    address: structuredAddress?.fullAddress || ''
                  }));
                }}
                required
                showErrors={false}
              />
            </div>
          </>
        ) : (
          <div>
            <div className="form-group form-group-tight">
              <label htmlFor="salonId">{t.salon}</label>
              <select
                id="salonId"
                name="salonId"
                value={formData.salonId || ''}
                onChange={(e) => {
                  const selectedSalonId = e.target.value;
                  const selectedSalon = salons.find(s => s.id === selectedSalonId);
                  setFormData(prev => ({ 
                    ...prev, 
                    salonId: selectedSalonId,
                    // Автоматически копируем адрес салона
                    address: selectedSalon?.address || '',
                    city: selectedSalon?.city || '',
                    structuredAddress: selectedSalon?.structuredAddress
                  }));
                }}
                required
                className="form-select"
              >
                <option value="">{t.selectSalon} *</option>
                {salons.map(salon => (
                  <option key={salon.id} value={salon.id}>
                    {salon.name} - {salon.structuredAddress 
                      ? require('../utils/cities').formatStructuredAddressCzech(salon.structuredAddress, language)
                      : `${salon.address}, ${salon.city}`}
                  </option>
                ))}
              </select>
            </div>
            
            {formData.salonId && (
              <div className="salon-info">
                <h4>{language === 'cs' ? 'Informace o salonu' : 'Salon Information'}</h4>
                {(() => {
                  const selectedSalon = salons.find(s => s.id === formData.salonId);
                  return selectedSalon ? (
                    <div className="salon-details">
                      <p><strong>{language === 'cs' ? 'Název:' : 'Name:'}</strong> {selectedSalon.name}</p>
                      <p><strong>{language === 'cs' ? 'Adresa:' : 'Address:'}</strong> {selectedSalon.structuredAddress 
                        ? require('../utils/cities').formatStructuredAddressCzech(selectedSalon.structuredAddress, language)
                        : `${selectedSalon.address}, ${selectedSalon.city}`}</p>
                      <p><strong>{language === 'cs' ? 'Telefon:' : 'Phone:'}</strong> {selectedSalon.phone}</p>
                      <p><strong>{language === 'cs' ? 'Email:' : 'Email:'}</strong> {selectedSalon.email}</p>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        <div className="form-group working-hours-group">
          <label htmlFor="openHours">{t.openHours} *</label>
          <WorkingHoursInput
            language={language}
            value={formData.workingHours || []}
            onChange={(wh: any) => setFormData(prev => ({ ...prev, workingHours: wh }))}
            byAppointment={formData.byAppointment || false}
            onByAppointmentChange={(val: boolean) => {
              if (val) setHoursError(null);
              setFormData(prev => ({ ...prev, byAppointment: val }));
            }}
          />
        </div>

        <div className="form-group description-group">
          <label htmlFor="description">{t.description}</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
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
          {servicesError && <div className="form-error" role="alert">{servicesError}</div>}
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
          {languagesError && <div className="form-error" role="alert">{languagesError}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="photo">{t.photo}</label>
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
            required={false}
          />
          <p className="form-help">{t.photoHelp}</p>
        </div>

        <div className="form-buttons">
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
