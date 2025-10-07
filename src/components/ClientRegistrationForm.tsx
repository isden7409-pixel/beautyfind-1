import React, { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { uploadSingleFile } from '../firebase/upload';
import FileUpload from './FileUpload';

interface ClientRegistrationFormProps {
  language: 'cs' | 'en';
  translations: any;
  onSubmit: () => void;
  onCancel: () => void;
}

const ClientRegistrationForm: React.FC<ClientRegistrationFormProps> = ({ language, translations, onSubmit, onCancel }) => {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarFile, setAvatarFile] = useState<FileList | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) {
      setError(language === 'cs' ? 'Heslo je povinné' : 'Password is required');
      return;
    }
    if (password !== confirmPassword) {
      setError(language === 'cs' ? 'Hesla se neshodují' : 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      let avatarUrl: string | undefined;
      if (avatarFile && avatarFile[0]) {
        avatarUrl = await uploadSingleFile(avatarFile[0], 'user_avatars');
      }

      await signUp(email, password, {
        name,
        phone,
        type: 'client',
        avatar: avatarUrl
      } as any);

      onSubmit();
    } catch (err: any) {
      setError(t?.registrationFailed || (language === 'cs' ? 'Chyba při registraci.' : 'Registration error.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registration-form">
      <h2>{language === 'cs' ? 'Zaregistrovat se jako klient' : 'Register as Client'}</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="name">{language === 'cs' ? 'Jméno *' : 'Name *'}</label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="phone">{language === 'cs' ? 'Telefon *' : 'Phone *'}</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="form-input" />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="password">{language === 'cs' ? 'Nastavit heslo *' : 'Password *'}</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">{language === 'cs' ? 'Potvrzení hesla *' : 'Confirm Password *'}</label>
            <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="form-input" />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="avatar">{language === 'cs' ? 'Fotografie (nepovinné)' : 'Photo (optional)'}</label>
          <FileUpload
            id="avatar"
            multiple={false}
            accept="image/*"
            onChange={setAvatarFile}
            selectedFiles={avatarFile}
            selectButtonText={language === 'cs' ? 'Vyberte soubor' : 'Choose file'}
            noFileText={language === 'cs' ? 'Soubor není vybrán' : 'No file selected'}
            filesSelectedText={language === 'cs' ? 'Soubory vybrány' : 'Files selected'}
            fileSelectedText={language === 'cs' ? 'Soubor vybrán' : 'File selected'}
            className="form-file"
            required={false}
          />
        </div>
        {error && <div className="form-error" role="alert">{error}</div>}
        <div className="form-buttons">
          <button type="button" onClick={onCancel} className="btn btn-secondary">{language === 'cs' ? 'Zrušit' : 'Cancel'}</button>
          <button type="submit" disabled={loading} className="btn btn-primary">{loading ? (language === 'cs' ? 'Registrace...' : 'Registering...') : (language === 'cs' ? 'Zaregistrovat' : 'Register')}</button>
        </div>
      </form>
    </div>
  );
};

export default ClientRegistrationForm;



