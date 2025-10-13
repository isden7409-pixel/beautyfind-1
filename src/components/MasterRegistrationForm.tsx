import React, { useState } from 'react';
import { MasterRegistration, Language, Salon } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import FileUpload from './FileUpload';
import WorkingHoursInput from './WorkingHoursInput';
import StructuredAddressInput from './StructuredAddressInput';
import { masterService } from '../firebase/services';
import { useAuth } from './auth/AuthProvider';
import { auth } from '../firebase/config';
import { uploadSingleFile, uploadMultipleFiles } from '../firebase/upload';
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
  const { currentUser, signUp, updateProfile, userProfile } = useAuth();
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
    byAppointment: false,
    paymentMethods: [],
    priceList: []
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<FileList | null>(null);
  const [priceListFiles, setPriceListFiles] = useState<FileList | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  const handlePaymentMethodToggle = (method: string) => {
    const newMethods = selectedPaymentMethods.includes(method)
      ? selectedPaymentMethods.filter(m => m !== method)
      : [...selectedPaymentMethods, method];
    
    setSelectedPaymentMethods(newMethods);
    setFormData(prev => ({
      ...prev,
      paymentMethods: newMethods
    }));
  };

  const handlePhotoChange = async (files: FileList | null) => {
    setPhotoFile(files);
    if (files && files[0]) {
      try {
        const url = await uploadSingleFile(files[0], `masters/photo/${userProfile?.uid || 'temp'}`);
        setFormData(prev => ({
          ...prev,
          photo: url
        }));
      } catch (error) {
        console.error('Error uploading master photo:', error);
        setFormData(prev => ({
          ...prev,
          photo: files[0]
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        photo: new File([], '')
      }));
    }
  };

  const handlePriceListChange = async (files: FileList | null) => {
    // Добавляем новые файлы к уже выбранным, не заменяя их (до 3)
    const dataTransfer = new DataTransfer();
    const existing = priceListFiles ? Array.from(priceListFiles) : [];
    existing.forEach(f => dataTransfer.items.add(f));

    if (files) {
      Array.from(files).forEach(f => dataTransfer.items.add(f));
    }
    // Ограничиваем 3
    const limited = new DataTransfer();
    const all = Array.from(dataTransfer.files).slice(0, 3);
    all.forEach(f => limited.items.add(f));

    setPriceListFiles(limited.files);
    
    try {
      const fileArray = Array.from(limited.files);
      const urls = await uploadMultipleFiles(fileArray, `masters/price-list/${userProfile?.uid || 'temp'}`);
      setFormData(prev => ({
        ...prev,
        priceList: urls
      }));
    } catch (error) {
      console.error('Error uploading price list files:', error);
      setFormData(prev => ({
        ...prev,
        priceList: Array.from(limited.files)
      }));
    }
  };

  const handleRemovePriceListFile = async (index: number) => {
    if (!priceListFiles) return;
    
    const dt = new DataTransfer();
    Array.from(priceListFiles).forEach((f, i) => {
      if (i !== index) dt.items.add(f);
    });
    
    setPriceListFiles(dt.files);
    
    if (dt.files.length === 0) {
      setFormData(prev => ({ ...prev, priceList: [] }));
      return;
    }
    
    try {
      const fileArray = Array.from(dt.files);
      const urls = await uploadMultipleFiles(fileArray, `masters/price-list/${userProfile?.uid || 'temp'}`);
      setFormData(prev => ({ ...prev, priceList: urls }));
    } catch (error) {
      console.error('Error re-uploading price list files:', error);
      setFormData(prev => ({ ...prev, priceList: Array.from(dt.files) }));
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [languagesError, setLanguagesError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const isWorkingHoursFilled = (wh?: any[]): boolean => {
    if (!wh || wh.length === 0) return false;
    // At least one working day or at least one entry provided
    return wh.some((d: any) => typeof d.isWorking === 'boolean');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate passwords
      if (!password || !confirmPassword) {
        setPasswordError(language === 'cs' ? 'Heslo je povinné' : 'Password is required');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (password !== confirmPassword) {
        setPasswordError(language === 'cs' ? 'Hesla se neshodují' : 'Passwords do not match');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      setPasswordError(null);
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
      // Validate payment methods
      if (selectedPaymentMethods.length === 0) {
        setPaymentError(t.atLeastOnePayment);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setPaymentError(null);
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

      // Create user account if not logged in
      let ownerId = currentUser?.uid;
      if (!ownerId) {
        await signUp(formData.email, password, {
          name: formData.name,
          phone: formData.phone,
          type: 'master'
        } as any);
        ownerId = auth.currentUser?.uid || undefined;
      }

      const id = await masterService.createFromRegistration({ ...formData, isFreelancer: true }, ownerId);
      // Master created successfully
      
      // Вызываем onSubmit с данными ДО очистки формы
      onSubmit(formData);
      
      // Очищаем форму после успешной отправки
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
        byAppointment: false,
        paymentMethods: [],
        priceList: []
      });
      setSelectedServices([]);
      setSelectedLanguages([]);
      setSelectedPaymentMethods([]);
      setPhotoFile(null);
      setPriceListFiles(null);
      setPassword('');
      setConfirmPassword('');
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
      <h2>
        {language === 'cs' ? 'Zaregistrovat se jako mistr' : 'Register as Master'}
        <br />
        {language === 'cs' ? '(samostatný pracovník)' : '(Freelancer)'}
      </h2>
      <p className="form-help form-help-centered">
        {language === 'cs'
          ? 'Pokud mistr pracuje v salonu, registraci provádí salon ve svém kabinetu.'
          : 'If a master works in a salon, the salon must register them from its dashboard.'}
      </p>
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
              placeholder={language === 'cs' ? 'Např. Kosmetologie' : 'e.g. Cosmetology'}
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
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.validity.valueMissing) {
                  target.setCustomValidity(getRequiredMessage(language));
                } else if (target.validity.rangeUnderflow) {
                  target.setCustomValidity(language === 'cs' ? 'Hodnota musí být alespoň 0' : 'Value must be at least 0');
                } else if (target.validity.rangeOverflow) {
                  target.setCustomValidity(language === 'cs' ? 'Hodnota musí být maximálně 55' : 'Value must be at most 55');
                } else {
                  target.setCustomValidity('');
                }
              }}
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
              onInvalid={(e) => {
                const target = e.target as HTMLInputElement;
                if (target.validity.valueMissing) {
                  target.setCustomValidity(getRequiredMessage(language));
                } else if (target.validity.typeMismatch) {
                  target.setCustomValidity(language === 'cs' ? 'Zadejte platnou emailovou adresu' : 'Please enter a valid email address');
                } else {
                  target.setCustomValidity('');
                }
              }}
              onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
          </div>
        </div>

        {/* Социальные сети */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="whatsapp">WhatsApp</label>
            <input
              type="text"
              id="whatsapp"
              name="whatsapp"
              value={formData.whatsapp || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder={language === 'cs' ? '+420123456789' : '+420123456789'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telegram">Telegram</label>
            <input
              type="text"
              id="telegram"
              name="telegram"
              value={formData.telegram || ''}
              onChange={handleInputChange}
              className="form-input"
              placeholder={language === 'cs' ? '@uživatelské_jméno' : '@username'}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
                <label htmlFor="instagram">Instagram</label>
                <input
                  type="text"
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || ''}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={language === 'cs' ? 'uživatelské_jméno' : 'user_name'}
            />
          </div>
          <div className="form-group">
            <label htmlFor="facebook">Facebook</label>
            <div className="input-with-prefix">
              <span className="input-prefix">https://www.facebook.com/</span>
              <input
                type="text"
                id="facebook"
                name="facebook"
                value={formData.facebook || ''}
                onChange={handleInputChange}
                className="form-input"
                placeholder={language === 'cs' ? 'uzivatel' : 'profile.name'}
              />
            </div>
          </div>
        </div>

        {/* Passwords */}
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">{language === 'cs' ? 'Nastavit heslo *' : 'Password *'}</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{language === 'cs' ? 'Potvrzení hesla *' : 'Confirm Password *'}</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="form-input"
            />
          </div>
        </div>
        {passwordError && <div className="form-error" role="alert">{passwordError}</div>}

        {/* Work type forced to freelancer: UI removed */}

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
        ) : null}

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
          <label>{t.selectPaymentMethods}</label>
          <div className="services-grid">
            <label className="service-checkbox">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes('cash')}
                onChange={() => handlePaymentMethodToggle('cash')}
              />
              <span className="service-label">{t.paymentCash}</span>
            </label>
            <label className="service-checkbox">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes('card')}
                onChange={() => handlePaymentMethodToggle('card')}
              />
              <span className="service-label">{t.paymentCard}</span>
            </label>
            <label className="service-checkbox">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes('qr')}
                onChange={() => handlePaymentMethodToggle('qr')}
              />
              <span className="service-label">{t.paymentQR}</span>
            </label>
            <label className="service-checkbox">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes('account')}
                onChange={() => handlePaymentMethodToggle('account')}
              />
              <span className="service-label">{t.paymentAccount}</span>
            </label>
            <label className="service-checkbox">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes('voucher')}
                onChange={() => handlePaymentMethodToggle('voucher')}
              />
              <span className="service-label">{t.paymentVoucher}</span>
            </label>
            <label className="service-checkbox">
              <input
                type="checkbox"
                checked={selectedPaymentMethods.includes('benefit')}
                onChange={() => handlePaymentMethodToggle('benefit')}
              />
              <span className="service-label">{t.paymentBenefit}</span>
            </label>
          </div>
          {paymentError && <div className="form-error" role="alert">{paymentError}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="photo">{language === 'cs' ? 'Fotografie mistra' : 'Master Photo'}</label>
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

        <div className="form-group">
          <label htmlFor="priceList">{language === 'cs' ? 'Ceník' : 'Price List'}</label>
          <FileUpload
            id="priceList"
            multiple={true}
            accept="image/*"
            onChange={handlePriceListChange}
            selectedFiles={priceListFiles}
            onRemoveFile={handleRemovePriceListFile}
            maxFiles={3}
            selectButtonText={t.selectFiles}
            noFileText={t.noFileSelected}
            filesSelectedText={t.filesSelected}
            fileSelectedText={t.fileSelected}
            className="form-file"
          />
          <p className="form-help">{language === 'cs' ? 'Nahrajte fotografie vašeho ceníku (max 3)' : 'Upload photos of your price list (max 3)'}</p>
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
