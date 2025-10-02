// Utility to translate canonical city identifiers to Czech display names
// Source cities in our data are mostly English identifiers like 'Prague', 'Brno', etc.

export function translateCityToCzech(city?: string): string {
  if (!city) return '';
  const map: Record<string, string> = {
    Prague: 'Praha',
    Brno: 'Brno',
    Ostrava: 'Ostrava',
    Plzen: 'Plzeň',
    Pilsen: 'Plzeň',
    Liberec: 'Liberec',
    Olomouc: 'Olomouc',
    Budweis: 'České Budějovice',
    'Ceske Budejovice': 'České Budějovice',
    'České Budějovice': 'České Budějovice',
    Hradec: 'Hradec Králové',
    'Hradec Kralove': 'Hradec Králové',
    Pardubice: 'Pardubice',
    Zlin: 'Zlín',
    Zlín: 'Zlín',
    'Usti nad Labem': 'Ústí nad Labem',
    'Ústí nad Labem': 'Ústí nad Labem',
    'Karlovy Vary': 'Karlovy Vary',
    Jihlava: 'Jihlava',
    'Mlada Boleslav': 'Mladá Boleslav',
    'Mladá Boleslav': 'Mladá Boleslav',
    Teplice: 'Teplice',
    Plzeň: 'Plzeň',
  };

  return map[city] || city;
}

// Best-effort conversion of a free-form address string to include Czech city name
export function translateAddressToCzech(address?: string, city?: string): string {
  if (!address) return '';
  const czCity = translateCityToCzech(city);
  if (!city || !czCity || city === czCity) return address; // nothing to change

  // Replace common variants at the end or after a comma/space
  const patterns = [
    new RegExp(`,\\s*${city}$`),
    new RegExp(`\\s${city}$`),
    new RegExp(`,\\s*${city}(,|\\s)`),
  ];
  let result = address;
  patterns.forEach((re) => {
    result = result.replace(re, (m) => m.replace(city, czCity));
  });
  return result;
}

// Format structured address with Czech city name
export function formatStructuredAddressCzech(structured?: {
  street: string;
  houseNumber: string;
  orientationNumber?: string;
  postalCode: string;
  city: string;
}): string {
  if (!structured) return '';
  const cityCz = translateCityToCzech(structured.city);
  const num = structured.orientationNumber 
    ? `${structured.houseNumber}/${structured.orientationNumber}`
    : structured.houseNumber;
  return `${structured.street} ${num}, ${structured.postalCode} ${cityCz}`;
}


