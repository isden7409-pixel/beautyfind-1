import React, { useState } from 'react';
import { Language } from '../types';
import { getRequiredMessage } from '../utils/form';
import { useAuth } from './auth/AuthProvider';

interface ClientRegistrationFormProps {
  language: Language;
  translations: any;
  onSubmit: () => void;
  onCancel: () => void;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({
  language,
  translations,
  onSubmit,
  onCancel,
}) => {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const t = translations[language];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate passwords
      if (!formData.password || !formData.confirmPassword) {
        setPasswordError(language === 'cs' ? 'Heslo je povinné' : 'Password is required');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setPasswordError(language === 'cs' ? 'Hesla se neshodují' : 'Passwords do not match');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      
      setPasswordError(null);
      setSubmitting(true);

      // Create user account
      await signUp(formData.email, formData.password, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        type: 'client'
      } as any);

      onSubmit();
    } catch (error) {
      alert(language === 'cs' ? 'Registrace se nezdařila' : 'Registration failed');
      console.error('Registration error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>{language === 'cs' ? 'Registrace klienta' : 'Client Registration'}</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">{language === 'cs' ? 'Jméno' : 'Name'} *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="form-input"
            placeholder={language === 'cs' ? 'Např. Jan Novák' : 'e.g. John Doe'}
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{language === 'cs' ? 'Email' : 'Email'} *</label>
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

        <div className="form-group">
          <label htmlFor="phone">{language === 'cs' ? 'Telefon' : 'Phone'} *</label>
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
          <label htmlFor="password">{language === 'cs' ? 'Heslo' : 'Password'} *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="form-input"
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{language === 'cs' ? 'Potvrzení hesla' : 'Confirm Password'} *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            className="form-input"
            onInvalid={(e) => (e.target as HTMLInputElement).setCustomValidity(getRequiredMessage(language))}
            onInput={(e) => (e.target as HTMLInputElement).setCustomValidity('')}
          />
        </div>


        {passwordError && <div className="form-error" role="alert">{passwordError}</div>}

        <div className="form-buttons">
          <button type="button" onClick={onCancel} className="btn btn-secondary">
            {language === 'cs' ? 'Zrušit' : 'Cancel'}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (language === 'cs' ? 'Načítání...' : 'Loading...') : (language === 'cs' ? 'Zaregistrovat' : 'Register')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ClientRegistrationForm;
