import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { UserProfile } from '../../types';

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  language: 'cs' | 'en';
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin, language }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    type: 'client' as 'client' | 'salon' | 'master'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(language === 'cs' 
        ? 'Hesla se neshodují' 
        : 'Passwords do not match'
      );
      return;
    }

    if (formData.password.length < 6) {
      setError(language === 'cs' 
        ? 'Heslo musí mít alespoň 6 znaků' 
        : 'Password must be at least 6 characters'
      );
      return;
    }

    setLoading(true);

    try {
      const userData: Partial<UserProfile> = {
        name: formData.name,
        phone: formData.phone,
        type: formData.type
      };

      await signUp(formData.email, formData.password, userData);
      onSuccess();
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = language === 'cs' 
        ? 'Chyba při registraci. Zkuste to znovu.' 
        : 'Registration error. Please try again.';

      // Более детальные сообщения об ошибках
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = language === 'cs' 
              ? 'Tento email je již registrován. Zkuste se přihlásit místo registrace.' 
              : 'This email is already registered. Try signing in instead of registering.';
            break;
          case 'auth/weak-password':
            errorMessage = language === 'cs' 
              ? 'Heslo je příliš slabé.' 
              : 'Password is too weak.';
            break;
          case 'auth/invalid-email':
            errorMessage = language === 'cs' 
              ? 'Neplatný email.' 
              : 'Invalid email address.';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = language === 'cs' 
              ? 'Registrace není povolena. Kontaktujte administrátora.' 
              : 'Registration is not allowed. Contact administrator.';
            break;
          case 'auth/network-request-failed':
            errorMessage = language === 'cs' 
              ? 'Chyba připojení. Zkontrolujte internetové připojení.' 
              : 'Network error. Check your internet connection.';
            break;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const translations = {
    cs: {
      title: 'Registrace',
      name: 'Jméno',
      email: 'Email',
      phone: 'Telefon',
      password: 'Heslo',
      confirmPassword: 'Potvrdit heslo',
      type: 'Typ účtu',
      client: 'Klient',
      salon: 'Salon',
      master: 'Mistr',
      register: 'Zaregistrovat se',
      hasAccount: 'Máte účet?',
      login: 'Přihlásit se',
      loading: 'Registrace...'
    },
    en: {
      title: 'Register',
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      type: 'Account Type',
      client: 'Client',
      salon: 'Salon',
      master: 'Master',
      register: 'Register',
      hasAccount: 'Have an account?',
      login: 'Sign In',
      loading: 'Registering...'
    }
  };

  const t = translations[language];

  return (
    <div className="auth-form">
      <h2>{t.title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">{t.name}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">{t.email}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">{t.phone}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">{t.type}</label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            disabled={loading}
          >
            <option value="client">{t.client}</option>
            <option value="salon">{t.salon}</option>
            <option value="master">{t.master}</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="password">{t.password}</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">{t.confirmPassword}</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? t.loading : t.register}
        </button>
      </form>

      <div className="auth-switch">
        <p>{t.hasAccount} <button type="button" onClick={onSwitchToLogin} className="link-button">{t.login}</button></p>
      </div>
    </div>
  );
};

export default RegisterForm;

