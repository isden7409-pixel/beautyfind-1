import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { UserProfile } from '../../types';

interface LoginFormProps {
  onSuccess: () => void;
  language: 'cs' | 'en';
  onGoToRegistration?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, language, onGoToRegistration }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      onSuccess();
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = language === 'cs' 
        ? 'Nesprávný email nebo heslo' 
        : 'Invalid email or password';

      // Более детальные сообщения об ошибках
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = language === 'cs' 
              ? 'Uživatel s tímto emailem neexistuje. Zaregistrujte se.' 
              : 'No user found with this email. Please register.';
            break;
          case 'auth/wrong-password':
            errorMessage = language === 'cs' 
              ? 'Nesprávné heslo.' 
              : 'Wrong password.';
            break;
          case 'auth/invalid-credential':
            errorMessage = language === 'cs' 
              ? 'Nesprávný email nebo heslo.' 
              : 'Invalid email or password.';
            break;
          case 'auth/invalid-email':
            errorMessage = language === 'cs' 
              ? 'Neplatný email.' 
              : 'Invalid email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = language === 'cs' 
              ? 'Příliš mnoho pokusů. Zkuste to později.' 
              : 'Too many attempts. Try again later.';
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
      title: 'Přihlášení',
      email: 'Email',
      password: 'Heslo',
      login: 'Přihlásit se',
      noAccount: 'Nemáte účet? Nejprve se prosím zaregistrujte v sekci',
      registration: 'Registrace',
      loading: 'Přihlašování...'
    },
    en: {
      title: 'Login',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      noAccount: "Don't have an account? Please register first in",
      registration: 'Registration',
      loading: 'Signing in...'
    }
  };

  const t = translations[language];

  return (
    <div className="auth-form">
      <h2>{t.title}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">{t.email}</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">{t.password}</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="auth-button">
          {loading ? t.loading : t.login}
        </button>
      </form>

      <div className="auth-switch">
        <p>
          {t.noAccount} {" "}
          <button type="button" className="link-button" onClick={onGoToRegistration}>{t.registration}</button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;

