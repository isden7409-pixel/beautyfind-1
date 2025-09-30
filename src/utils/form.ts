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


