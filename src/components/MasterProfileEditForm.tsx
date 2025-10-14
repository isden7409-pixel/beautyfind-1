import React, { useState, useEffect } from 'react';
import { Master, Language } from '../types';
import { translateServices, translateLanguages } from '../utils/serviceTranslations';
import FileUpload from './FileUpload';
import WorkingHoursInput from './WorkingHoursInput';
import StructuredAddressInput from './StructuredAddressInput';
import { getRequiredMessage, getValidationMessages } from '../utils/form';
import { uploadSingleFile, uploadMultipleFiles } from '../firebase/upload';
import { useAuth } from './auth/AuthProvider';

interface MasterProfileEditFormProps {
  master: Master;
  language: Language;
  translations: any;
  onSave: (updatedData: any) => Promise<void>;
  onCancel: () => void;
}

const MasterProfileEditForm: React.FC<MasterProfileEditFormProps> = ({
  master,
  language,
  translations,
  onSave,
  onCancel,
}) => {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: master.name || '',
    email: master.email || '',
    phone: master.phone || '',
    specialty: master.specialty || '',
    experience: master.experience || '',
    address: master.address || '',
    website: master.website || '',
    description: master.description || '',
    services: master.services || [],
    languages: master.languages || ['Czech'],
    workingHours: master.workingHours || [],
    structuredAddress: master.structuredAddress || null,
    photo: master.photo || '',
    city: master.city || '',
    rating: master.rating || 0,
    reviews: master.reviews || 0,
    coordinates: master.coordinates || null,
    worksInSalon: master.worksInSalon || false,
    isFreelancer: master.isFreelancer || true,
    salonId: master.salonId || '',
    salonName: master.salonName || '',
    byAppointment: master.byAppointment || false,
    paymentMethods: master.paymentMethods || [],
    galleryPhotos: master.galleryPhotos || [],
    priceList: master.priceList || [],
    // Социальные сети
    whatsapp: master.whatsapp || '',
    telegram: master.telegram || '',
    instagram: master.instagram || '',
    facebook: master.facebook || ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validationMessages = getValidationMessages(language);

  // Полный список услуг как в форме регистрации
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

  useEffect(() => {
    setFormData({
      name: master.name || '',
      email: master.email || '',
      phone: master.phone || '',
      specialty: master.specialty || '',
      experience: master.experience || '',
      address: master.address || '',
      website: master.website || '',
      description: master.description || '',
      services: master.services || [],
      languages: master.languages || ['Czech'],
      workingHours: master.workingHours || [],
      structuredAddress: master.structuredAddress || null,
      photo: master.photo || '',
      city: master.city || '',
      rating: master.rating || 0,
      reviews: master.reviews || 0,
      coordinates: master.coordinates || null,
      worksInSalon: master.worksInSalon || false,
      isFreelancer: master.isFreelancer || true,
      salonId: master.salonId || '',
      salonName: master.salonName || '',
      byAppointment: master.byAppointment || false,
      paymentMethods: master.paymentMethods || [],
      galleryPhotos: master.galleryPhotos || [],
      priceList: master.priceList || [],
      // Социальные сети
      whatsapp: master.whatsapp || '',
      telegram: master.telegram || '',
      instagram: master.instagram || '',
      facebook: master.facebook || ''
    });
  }, [master]);

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

  const handleLanguagesChange = (selectedLanguages: string[]) => {
    setFormData(prev => ({
      ...prev,
      languages: selectedLanguages
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

  const handlePhotoChange = async (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      
      try {
        // Загружаем файл в Firebase Storage
        const url = await uploadSingleFile(file, `masters/photo/${userProfile?.uid || master.id}`);
        
        setFormData(prev => ({
          ...prev,
          photo: url
        }));
      } catch (error) {
        console.error('Error uploading master photo:', error);
        alert(language === 'cs' ? 'Chyba při nahrávání fotky' : 'Error uploading photo');
      }
    }
  };

  const handlePhotoRemove = () => {
    setFormData(prev => ({
      ...prev,
      photo: ''
    }));
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

    if (!formData.specialty.trim()) {
      newErrors.specialty = getRequiredMessage(language);
    }

    if (!formData.experience.trim()) {
      newErrors.experience = getRequiredMessage(language);
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
      console.error('Error saving master profile:', error);
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
          {errors.email && <span className="error-message">{errors.email}</span>}
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
          <label htmlFor="specialty">
            {translations.specialty} <span className="required">*</span>
          </label>
          <input
            type="text"
            id="specialty"
            name="specialty"
            value={formData.specialty}
            onChange={handleInputChange}
            className={errors.specialty ? 'error' : ''}
            placeholder={translations.specialtyPlaceholder}
          />
          {errors.specialty && <span className="error-message">{errors.specialty}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="experience">
            {translations.experience} <span className="required">*</span>
          </label>
          <input
            type="number"
            id="experience"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            className={errors.experience ? 'error' : ''}
            placeholder={translations.experiencePlaceholder}
            min="0"
            max="50"
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
        
        <div className="form-group city-field">
          <label htmlFor="city">{language === 'cs' ? 'Město *' : 'City *'}</label>
          <select
            id="city"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
            className="form-select"
            required
            onInvalid={(e) => (e.target as HTMLSelectElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLSelectElement).setCustomValidity('')}
          >
            <option value="">{language === 'cs' ? 'Vyberte město' : 'Select city'}</option>
            {[
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
            ].map(city => (
              <option key={city.value} value={city.value}>{city.label}</option>
            ))}
          </select>
        </div>
        
        <StructuredAddressInput
          value={formData.structuredAddress || undefined}
          onChange={handleAddressChange}
          language={language}
          translations={translations}
          city={formData.city}
        />
      </div>

      <div className="form-section">
        <h3>{language === 'cs' ? 'Otevírací doba' : 'Opening Hours'} <span className="required">*</span></h3>
        
        <WorkingHoursInput
          value={formData.workingHours}
          onChange={handleWorkingHoursChange}
          language={language}
          byAppointment={formData.byAppointment}
          onByAppointmentChange={(value) => setFormData(prev => ({ ...prev, byAppointment: value }))}
        />
      </div>

      <div className="form-section">
        <h3>{translations.servicesLabel} <span className="required">*</span></h3>
        
        <div className="form-group">
          <div className="services-grid">
            {availableServices.map((service) => (
              <label key={service} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={formData.services.includes(service)}
                  onChange={(e) => {
                    const selectedServices = e.target.checked
                      ? [...formData.services, service]
                      : formData.services.filter(s => s !== service);
                    handleServicesChange(selectedServices);
                  }}
                />
                <span className="service-label">{translateServices([service], language)[0]}</span>
              </label>
            ))}
          </div>
          {errors.services && <span className="error-message">{errors.services}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>{translations.languagesLabel} <span className="required">*</span></h3>
        
        <div className="form-group">
          <div className="services-grid">
            {availableLanguages.map((lang) => (
              <label key={lang} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(lang)}
                  onChange={(e) => {
                    const selectedLanguages = e.target.checked
                      ? [...formData.languages, lang]
                      : formData.languages.filter(l => l !== lang);
                    handleLanguagesChange(selectedLanguages);
                  }}
                />
                <span className="service-label">{translateLanguages([lang], language)[0]}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>{language === 'cs' ? 'Způsoby platby' : 'Payment Methods'} <span className="required">*</span></h3>
        <div className="form-group">
          <div className="services-grid">
            {[
              { key: 'cash', label: language === 'cs' ? 'Platba v hotovosti' : 'Cash payment' },
              { key: 'card', label: language === 'cs' ? 'Platba kartou' : 'Card payment' },
              { key: 'qr', label: language === 'cs' ? 'QR platba' : 'QR payment' },
              { key: 'account', label: language === 'cs' ? 'Převod na účet' : 'Bank transfer' },
              { key: 'voucher', label: language === 'cs' ? 'Dárkový poukaz' : 'Voucher' },
              { key: 'benefit', label: language === 'cs' ? 'Benefitní karta' : 'Benefit card' },
            ].map(method => (
              <label key={method.key} className="service-checkbox">
                <input
                  type="checkbox"
                  checked={(formData.paymentMethods || []).includes(method.key)}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? ([...(formData.paymentMethods || []), method.key])
                      : (formData.paymentMethods || []).filter(m => m !== method.key);
                    setFormData(prev => ({ ...prev, paymentMethods: next }));
                  }}
                />
                <span className="service-label">{method.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>{language === 'cs' ? 'Fotografie mistra' : 'Master Photo'}</h3>
        
        <FileUpload
          id="master-photo"
          multiple={false}
          onChange={handlePhotoChange}
          selectedFiles={null}
          previewUrls={formData.photo ? [formData.photo] : []}
          onRemoveUrl={handlePhotoRemove}
          maxFiles={1}
          selectButtonText={language === 'cs' ? 'Vybrat fotografii' : 'Select photo'}
          noFileText={language === 'cs' ? 'Žádná fotografie nebyla vybrána' : 'No photo selected'}
          filesSelectedText={language === 'cs' ? 'fotografií vybráno' : 'photos selected'}
          fileSelectedText={language === 'cs' ? 'fotografie vybrána' : 'photo selected'}
        />
        <p className="form-help">{language === 'cs' ? 'Nahrajte svou profesionální fotografii (max 1)' : 'Upload your professional photo (max 1)'}</p>
      </div>

      <div className="form-section">
        <h3>{language === 'cs' ? 'Galerie prací' : 'Work Gallery'}</h3>
        
        <FileUpload
          id="master-gallery"
          multiple={true}
          accept="image/*"
          onChange={async (files) => {
            if (!files || files.length === 0) return;
            
            const existing = formData.galleryPhotos || [];
            const remainingSlots = Math.max(0, 15 - existing.length);
            
            if (remainingSlots <= 0) return;
            
            try {
              const filesToUpload = Array.from(files).slice(0, remainingSlots);
              const newUrls = await uploadMultipleFiles(filesToUpload, `masters/gallery/${userProfile?.uid || master.id}`);
              
              setFormData(prev => ({
                ...prev,
                galleryPhotos: [...existing, ...newUrls]
              }));
            } catch (error) {
              console.error('Error uploading gallery:', error);
              alert(language === 'cs' ? 'Chyba při nahrávání galerie' : 'Error uploading gallery');
            }
          }}
          selectedFiles={null}
          previewUrls={formData.galleryPhotos}
          onRemoveUrl={(url) => setFormData(prev => ({ ...prev, galleryPhotos: (prev.galleryPhotos || []).filter(p => p !== url) }))}
          maxFiles={15}
          selectButtonText={language === 'cs' ? 'Vybrat fotografie' : 'Select photos'}
          noFileText={language === 'cs' ? 'Žádné fotografie nebyly vybrány' : 'No photos selected'}
          filesSelectedText={language === 'cs' ? 'fotografií vybráno' : 'photos selected'}
          fileSelectedText={language === 'cs' ? 'fotografie vybrána' : 'photo selected'}
        />
        <p className="form-help">{language === 'cs' ? 'Nahrajte fotografie vašich prací do galerie (max 15)' : 'Upload photos of your work to gallery (max 15)'}</p>
      </div>

      <div className="form-section">
        <h3>{language === 'cs' ? 'Ceník' : 'Price List'}</h3>
        
        <FileUpload
          id="master-price-list"
          multiple={true}
          accept="image/*"
          onChange={async (files) => {
            if (!files || files.length === 0) return;
            
            const existing = formData.priceList || [];
            const remainingSlots = Math.max(0, 3 - existing.length);
            
            if (remainingSlots <= 0) return;
            
            try {
              const filesToUpload = Array.from(files).slice(0, remainingSlots);
              const newUrls = await uploadMultipleFiles(filesToUpload, `masters/price-list/${userProfile?.uid || master.id}`);
              
              setFormData(prev => ({
                ...prev,
                priceList: [...existing, ...newUrls]
              }));
            } catch (error) {
              console.error('Error uploading price list:', error);
              alert(language === 'cs' ? 'Chyba při nahrávání ceníku' : 'Error uploading price list');
            }
          }}
          selectedFiles={null}
          previewUrls={formData.priceList}
          onRemoveUrl={(url) => setFormData(prev => ({ ...prev, priceList: (prev.priceList || []).filter(p => p !== url) }))}
          maxFiles={3}
          selectButtonText={language === 'cs' ? 'Vybrat fotografie' : 'Select photos'}
          noFileText={language === 'cs' ? 'Žádné fotografie nebyly vybrány' : 'No photos selected'}
          filesSelectedText={language === 'cs' ? 'fotografií vybráno' : 'photos selected'}
          fileSelectedText={language === 'cs' ? 'fotografie vybrána' : 'photo selected'}
        />
        <p className="form-help">{language === 'cs' ? 'Nahrajte fotografie vašeho ceníku (max 3)' : 'Upload photos of your price list (max 3)'}</p>
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
          className="save-button"
          disabled={submitting}
        >
          {submitting ? translations.saving : translations.save}
        </button>
      </div>
    </form>
  );
};

export default MasterProfileEditForm;
