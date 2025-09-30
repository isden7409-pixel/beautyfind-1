import { Language } from '../types';

export function formatExperienceYears(yearsInput: string | number, language: Language, withSuffix: boolean = true): string {
  const years = Math.max(0, Math.floor(Number(yearsInput || 0)));

  if (language === 'cs') {
    // 1 rok, 2-4 roky, 5+ let
    let unit = 'let';
    if (years === 1) unit = 'rok';
    else if (years % 100 >= 10 && years % 100 <= 20) unit = 'let';
    else if (years % 10 >= 2 && years % 10 <= 4) unit = 'roky';
    else unit = 'let';
    return withSuffix ? `${years} ${unit} zkušeností` : `${years} ${unit}`;
  }

  // English
  const unitEn = years === 1 ? 'year' : 'years';
  return withSuffix ? `${years} ${unitEn} experience` : `${years} ${unitEn}`;
}


