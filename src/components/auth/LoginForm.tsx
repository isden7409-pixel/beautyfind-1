import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { UserProfile } from '../../types';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToRegister: () => void;
  language: 'cs' | 'en';
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister, language }) => {
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
      setError(language === 'cs' 
        ? 'Nesprávný email nebo heslo' 
        : 'Invalid email or password'
      );
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
      noAccount: 'Nemáte účet?',
      register: 'Zaregistrujte se',
      loading: 'Přihlašování...'
    },
    en: {
      title: 'Login',
      email: 'Email',
      password: 'Password',
      login: 'Sign In',
      noAccount: "Don't have an account?",
      register: 'Register',
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
        <p>{t.noAccount} <button type="button" onClick={onSwitchToRegister} className="link-button">{t.register}</button></p>
      </div>
    </div>
  );
};

export default LoginForm;

