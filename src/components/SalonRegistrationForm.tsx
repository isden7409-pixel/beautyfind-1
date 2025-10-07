import React, { useState } from 'react';
import { SalonRegistration, Language } from '../types';
import { translateServices } from '../utils/serviceTranslations';
import { getRequiredMessage, getValidationMessages } from '../utils/form';
import FileUpload from './FileUpload';
import WorkingHoursInput from './WorkingHoursInput';
import StructuredAddressInput from './StructuredAddressInput';
import { salonService } from '../firebase/services';
import { useAuth } from './auth/AuthProvider';
import { auth, db } from '../firebase/config';
import { doc, setDoc } from 'firebase/firestore';

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
  const { currentUser, updateProfile, signUp } = useAuth();
  const [formData, setFormData] = useState<SalonRegistration>({
    name: '',
    city: '',
    address: '',
    structuredAddress: undefined,
    phone: '',
    email: '',
    website: '',
    description: '',
    openHours: '',
    workingHours: undefined,
    byAppointment: false,
    services: [],
    photos: [],
    paymentMethods: []
  });

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<FileList | null>(null);
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
    'Lymphatic Massage', 'Women\'s Haircuts', 'Highlights', 'Anti-aging',
    'Skin Cleansing', 'Men\'s Haircuts and Beards', 'Hot Towel',
    'Women\'s Haircuts and Coloring', 'Body Treatment', 'Sauna',
    'Massage Therapy', 'Facial & Body Treatments', 'Men\'s Haircuts'
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

  const handlePhotoChange = (files: FileList | null) => {
    setPhotoFiles(files);
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        photos: fileArray
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        photos: []
      }));
    }
  };

  const [submitting, setSubmitting] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
      // Validate payment methods
      if (selectedPaymentMethods.length === 0) {
        setPaymentError(t.atLeastOnePayment);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      } else {
        setPaymentError(null);
      }
      // If not by appointment, require working hours to be provided
      if (!formData.byAppointment) {
        const hasHours = Array.isArray(formData.workingHours) && (formData.workingHours as any[]).some((d: any) => typeof d.isWorking === 'boolean');
        if (!hasHours) {
          alert(validationMessages.workingHoursRequired);
          return;
        }
      }
      setSubmitting(true);
      // Validate address via geocoding if structuredAddress present
      if (formData.structuredAddress) {
        try {
          const { geocodeStructuredAddress } = await import('../utils/geocoding');
          const coords = await geocodeStructuredAddress(formData.structuredAddress);
          if (!coords) {
            alert(validationMessages.addressNotFound);
            setSubmitting(false);
            return;
          }
        } catch {
          alert(validationMessages.addressValidationFailed);
          setSubmitting(false);
          return;
        }
      }
      // Ensure owner account exists; create if needed
      let ownerId = currentUser?.uid;
      const isNewUser = !ownerId;
      if (isNewUser) {
        await signUp(formData.email, password, {
          name: formData.name,
          phone: formData.phone,
          type: 'salon'
        } as any);
        ownerId = auth.currentUser?.uid || undefined;
      }

      const id = await salonService.createFromRegistration(formData, ownerId);
      // Обновляем профиль пользователя, добавляя salonId
      if (ownerId) {
        if (isNewUser) {
          // Для нового пользователя используем setDoc с merge
          const userRef = doc(db, 'users', ownerId);
          await setDoc(userRef, { salonId: id, updatedAt: new Date() }, { merge: true });
        } else {
          // Для существующего пользователя используем updateProfile
          await updateProfile({ salonId: id, type: 'salon' as any });
        }
      }
      // Salon created successfully
      alert(validationMessages.registrationSuccess);
      setFormData({
        name: '',
        city: '',
        address: '',
        structuredAddress: undefined,
        phone: '',
        email: '',
        website: '',
        description: '',
        openHours: '',
        workingHours: undefined,
        services: [],
        photos: []
      });
      setSelectedServices([]);
      setSelectedPaymentMethods([]);
      setPhotoFiles(null);
      setPassword('');
      setConfirmPassword('');
      onSubmit(formData);
    } catch (error) {
      // Failed to create salon
      alert(validationMessages.registrationFailed);
    } finally {
      setSubmitting(false);
    }
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
            placeholder={language === 'cs' ? 'Např. Můj salon' : 'e.g. My Salon'}
          onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
          onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
        />
        </div>


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

        <div className="form-group">
          <label htmlFor="openHours">{t.openHours} *</label>
          <WorkingHoursInput
            language={language}
            value={formData.workingHours || []}
            onChange={(wh: any) => setFormData(prev => ({ ...prev, workingHours: wh }))}
            byAppointment={formData.byAppointment || false}
            onByAppointmentChange={(val: boolean) => setFormData(prev => ({ ...prev, byAppointment: val }))}
          />
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
            onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity('')}
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

        <div className="form-group">
          <label htmlFor="website">{t.website}</label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleInputChange}
            className="form-input"
            placeholder={language === 'cs' ? 'https://www.vzor.cz' : 'https://www.example.com'}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
        </div>


        <div className="form-group">
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
          <label htmlFor="photos">{t.photos}</label>
          <FileUpload
            id="photos"
            multiple={true}
            accept="image/*"
            onChange={handlePhotoChange}
            selectedFiles={photoFiles}
            selectButtonText={t.selectFiles}
            noFileText={t.noFileSelected}
            filesSelectedText={t.filesSelected}
            fileSelectedText={t.fileSelected}
            className="form-file"
          />
          <p className="form-help">{t.photosHelp}</p>
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

export default SalonRegistrationForm;
