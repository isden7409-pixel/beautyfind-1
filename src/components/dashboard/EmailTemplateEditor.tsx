/**
 * Компонент редактирования email шаблонов
 */

import React, { useState, useEffect } from 'react';
import { EmailTemplate, EmailTemplateContent } from '../../types/booking';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

interface EmailTemplateEditorProps {
  providerId: string;
  providerType: 'salon' | 'master';
  language: 'cs' | 'en';
}

type TemplateType = 'bookingConfirmation' | 'bookingReminder' | 'bookingCancelled' | 'reviewRequest';

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  providerId,
  providerType,
  language,
}) => {
  const [templates, setTemplates] = useState<EmailTemplate | null>(null);
  const [selectedType, setSelectedType] = useState<TemplateType>('bookingConfirmation');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const t = {
    cs: {
      title: 'Nastavení e-mailů',
      templateType: 'Typ e-mailu',
      useDefault: 'Použít výchozí šablonu',
      customText: 'Vlastní text',
      czechText: 'České znění',
      englishText: 'Anglické znění',
      availableVars: 'Dostupné proměnné',
      preview: 'Náhled',
      save: 'Uložit šablonu',
      saving: 'Ukládání...',
      saved: 'Šablona uložena!',
      loading: 'Načítání...',
      types: {
        bookingConfirmation: 'E-mail potvrzení rezervace',
        bookingReminder: 'E-mail připomínky (24h před službou)',
        bookingCancelled: 'E-mail zrušení rezervace',
        reviewRequest: 'E-mail žádosti o hodnocení',
      },
      variables: {
        bookingConfirmation: '{JMÉNO}, {SLUŽBA}, {DATUM}, {ČAS}, {CENA}, {ADRESA}, {TELEFON}',
        bookingReminder: '{JMÉNO}, {SLUŽBA}, {DATUM}, {ČAS}, {ADRESA}, {TELEFON}',
        bookingCancelled: '{JMÉNO}, {SLUŽBA}, {DATUM}, {ČAS}, {DŮVOD}',
        reviewRequest: '{JMÉNO}, {SLUŽBA}, {DATUM}',
      },
      defaultTemplates: {
        bookingConfirmation: 'Dobrý den {JMÉNO},\n\nVaše rezervace byla úspěšně vytvořena!\n\nSlužba: {SLUŽBA}\nDatum: {DATUM}\nČas: {ČAS}\nCena: {CENA} Kč\n\nTěšíme se na vás!',
        bookingReminder: 'Dobrý den {JMÉNO},\n\nPřipomínáme vaši zítřejší rezervaci:\n\nSlužba: {SLUŽBA}\nDatum: {DATUM}\nČas: {ČAS}\nAdresa: {ADRESA}\nTelefon: {TELEFON}\n\nOdpovězte "ANO" pro potvrzení.\n\nTěšíme se na vás!',
        bookingCancelled: 'Dobrý den {JMÉNO},\n\nRezervace byla zrušena.\n\nSlužba: {SLUŽBA}\nDatum: {DATUM}\nČas: {ČAS}\nDůvod: {DŮVOD}',
        reviewRequest: 'Dobrý den {JMÉNO},\n\nDěkujeme za návštěvu!\n\nJak jste spokojeni s naší službou {SLUŽBA}?\n\nZanechte prosím hodnocení.',
      },
    },
    en: {
      title: 'Email Settings',
      templateType: 'Email type',
      useDefault: 'Use default template',
      customText: 'Custom text',
      czechText: 'Czech version',
      englishText: 'English version',
      availableVars: 'Available variables',
      preview: 'Preview',
      save: 'Save template',
      saving: 'Saving...',
      saved: 'Template saved!',
      loading: 'Loading...',
      types: {
        bookingConfirmation: 'Booking confirmation email',
        bookingReminder: 'Booking reminder email (24h before)',
        bookingCancelled: 'Booking cancellation email',
        reviewRequest: 'Review request email',
      },
      variables: {
        bookingConfirmation: '{NAME}, {SERVICE}, {DATE}, {TIME}, {PRICE}, {ADDRESS}, {PHONE}',
        bookingReminder: '{NAME}, {SERVICE}, {DATE}, {TIME}, {ADDRESS}, {PHONE}',
        bookingCancelled: '{NAME}, {SERVICE}, {DATE}, {TIME}, {REASON}',
        reviewRequest: '{NAME}, {SERVICE}, {DATE}',
      },
      defaultTemplates: {
        bookingConfirmation: 'Hello {NAME},\n\nYour booking has been successfully created!\n\nService: {SERVICE}\nDate: {DATE}\nTime: {TIME}\nPrice: {PRICE} CZK\n\nLooking forward to seeing you!',
        bookingReminder: 'Hello {NAME},\n\nThis is a reminder of your booking tomorrow:\n\nService: {SERVICE}\nDate: {DATE}\nTime: {TIME}\nAddress: {ADDRESS}\nPhone: {PHONE}\n\nReply "YES" to confirm.\n\nLooking forward to seeing you!',
        bookingCancelled: 'Hello {NAME},\n\nThe booking has been cancelled.\n\nService: {SERVICE}\nDate: {DATE}\nTime: {TIME}\nReason: {REASON}',
        reviewRequest: 'Hello {NAME},\n\nThank you for your visit!\n\nHow satisfied are you with our {SERVICE} service?\n\nPlease leave a review.',
      },
    },
  };

  const translations = t[language];

  useEffect(() => {
    loadTemplates();
  }, [providerId]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'emailTemplates', providerId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setTemplates(docSnap.data() as EmailTemplate);
      } else {
        // Создать шаблон по умолчанию
        const defaultTemplate: EmailTemplate = {
          id: providerId,
          providerType,
          templates: {
            bookingConfirmation: { useDefault: true },
            bookingReminder: { useDefault: true },
            bookingCancelled: { useDefault: true },
            reviewRequest: { useDefault: true },
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setTemplates(defaultTemplate);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!templates) return;

    setSaving(true);
    setError('');
    setSuccess(false);

    try {
      const docRef = doc(db, 'emailTemplates', providerId);
      await setDoc(docRef, {
        ...templates,
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const getCurrentTemplate = (): EmailTemplateContent => {
    return templates?.templates[selectedType] || { useDefault: true };
  };

  const handleToggleDefault = (useDefault: boolean) => {
    if (!templates) return;

    setTemplates({
      ...templates,
      templates: {
        ...templates.templates,
        [selectedType]: {
          ...getCurrentTemplate(),
          useDefault,
        },
      },
    });
  };

  const handleTextChange = (field: 'customText_cs' | 'customText_en', value: string) => {
    if (!templates) return;

    setTemplates({
      ...templates,
      templates: {
        ...templates.templates,
        [selectedType]: {
          ...getCurrentTemplate(),
          [field]: value,
        },
      },
    });
  };

  if (loading) {
    return <div className="text-center py-8">{translations.loading}</div>;
  }

  const currentTemplate = getCurrentTemplate();

  return (
    <div className="email-template-editor max-w-4xl">
      <h3 className="text-xl font-bold mb-6">📧 {translations.title}</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          ✅ {translations.saved}
        </div>
      )}

      {/* Выбор типа шаблона */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {translations.templateType}
        </label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as TemplateType)}
          className="w-full p-2 border rounded focus:ring-2 focus:ring-pink-500"
        >
          <option value="bookingConfirmation">{translations.types.bookingConfirmation}</option>
          <option value="bookingReminder">{translations.types.bookingReminder}</option>
          <option value="bookingCancelled">{translations.types.bookingCancelled}</option>
          <option value="reviewRequest">{translations.types.reviewRequest}</option>
        </select>
      </div>

      {/* Переключатель: стандартный / свой */}
      <div className="mb-6 p-4 bg-gray-50 rounded border">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={currentTemplate.useDefault}
              onChange={() => handleToggleDefault(true)}
              className="w-4 h-4 text-pink-600"
            />
            <span>{translations.useDefault}</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              checked={!currentTemplate.useDefault}
              onChange={() => handleToggleDefault(false)}
              className="w-4 h-4 text-pink-600"
            />
            <span>{translations.customText}</span>
          </label>
        </div>
      </div>

      {/* Редактирование текста */}
      {!currentTemplate.useDefault && (
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {translations.czechText}:
            </label>
            <textarea
              value={currentTemplate.customText_cs || translations.defaultTemplates[selectedType]}
              onChange={(e) => handleTextChange('customText_cs', e.target.value)}
              rows={10}
              className="w-full p-3 border rounded font-mono text-sm focus:ring-2 focus:ring-pink-500"
              placeholder={translations.defaultTemplates[selectedType]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {translations.englishText}:
            </label>
            <textarea
              value={currentTemplate.customText_en || ''}
              onChange={(e) => handleTextChange('customText_en', e.target.value)}
              rows={10}
              className="w-full p-3 border rounded font-mono text-sm focus:ring-2 focus:ring-pink-500"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <strong>💡 {translations.availableVars}:</strong>{' '}
            {translations.variables[selectedType]}
          </div>
        </div>
      )}

      {/* Кнопка сохранения */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-4 py-3 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50 font-medium"
      >
        {saving ? translations.saving : `💾 ${translations.save}`}
      </button>
    </div>
  );
};




