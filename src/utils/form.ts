import { Language } from '../types';

export function getRequiredMessage(language: Language): string {
  switch (language) {
    case 'cs':
      return 'Vyplňte prosím toto pole.';
    case 'en':
    default:
      return 'Please fill out this field.';
  }
}

export function getValidationMessages(language: Language) {
  return {
    required: getRequiredMessage(language),
    servicesRequired: language === 'cs' ? 'Vyberte prosím alespoň jednu službu' : 'Please select at least one service',
    languagesRequired: language === 'cs' ? 'Vyberte prosím alespoň jeden jazyk' : 'Please select at least one language',
    workingHoursRequired: language === 'cs' ? 'Vyplňte prosím otevírací dobu' : 'Please fill in working hours',
    addressNotFound: language === 'cs' ? 'Zadaná adresa nebyla nalezena na mapě. Zkontrolujte prosím údaje.' : 'The entered address could not be found on the map. Please check the details.',
    addressValidationFailed: language === 'cs' ? 'Nepodařilo se ověřit adresu.' : 'Failed to validate address.',
    registrationSuccess: language === 'cs' ? 'Registrace byla úspěšná!' : 'Registration successful!',
    registrationFailed: language === 'cs' ? 'Registrace se nezdařila' : 'Registration failed'
  };
}


