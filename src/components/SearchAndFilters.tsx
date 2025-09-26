import React from 'react';
import { SearchFilters, Language } from '../types';
import { translateServices } from '../utils/serviceTranslations';

interface SearchAndFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  language: Language;
  translations: any;
}

const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  filters,
  onFiltersChange,
  language,
  translations,
}) => {
  const t = translations[language];
  
  const availableServices = [
    'Manicure', 'Pedicure', 'Haircut', 'Makeup', 'Facial', 
    'Massage', 'Nail Art', 'Eyebrows', 'Eyelashes', 'Hair Coloring',
    'Hair Treatment', 'Hair Styling', 'Wedding Makeup', 'Barber',
    'Gel Nails', 'Nail Extensions', 'Coloring', 'Styling', 'Beard Trim',
    'Event Makeup', 'Bridal Makeup', 'Relaxation Massage', 'Sports Massage',
    'Lymphatic Massage', 'Women\'s Haircuts', 'Highlights', 'Anti-aging',
    'Skin Cleansing', 'Men\'s Haircuts and Beards', 'Hot Towel',
    'Women\'s Haircuts and Coloring', 'Body Treatment', 'Sauna',
    'Massage Therapy', 'Facial & Body Treatments', 'Men\'s Haircuts'
  ];

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleCityChange = (value: string) => {
    onFiltersChange({ ...filters, city: value });
  };

  const handleServiceChange = (value: string) => {
    onFiltersChange({ ...filters, service: value });
  };

  return (
    <div className="search-container">
      <input
        type="text"
        placeholder={t.searchPlaceholder}
        className="search-input"
        value={filters.searchTerm}
        onChange={(e) => handleSearchChange(e.target.value)}
      />
      <div className="filters-container">
        <select
          value={filters.city}
          onChange={(e) => handleCityChange(e.target.value)}
          className="filter-select"
        >
          <option value="All">{t.allCities}</option>
          <option value="Prague">Praha</option>
          <option value="Brno">Brno</option>
          <option value="Ostrava">Ostrava</option>
          <option value="Plzen">Plzeň</option>
          <option value="Liberec">Liberec</option>
          <option value="Olomouc">Olomouc</option>
          <option value="Budweis">České Budějovice</option>
          <option value="Hradec">Hradec Králové</option>
          <option value="Pardubice">Pardubice</option>
          <option value="Zlín">Zlín</option>
          <option value="Havirov">Havířov</option>
          <option value="Kladno">Kladno</option>
          <option value="Most">Most</option>
          <option value="Opava">Opava</option>
          <option value="Frydek">Frýdek-Místek</option>
          <option value="Karvina">Karviná</option>
          <option value="Jihlava">Jihlava</option>
          <option value="Teplice">Teplice</option>
          <option value="Decin">Děčín</option>
          <option value="Chomutov">Chomutov</option>
          <option value="Jablonec">Jablonec nad Nisou</option>
          <option value="Mlada">Mladá Boleslav</option>
          <option value="Prostejov">Prostějov</option>
          <option value="Prerov">Přerov</option>
          <option value="Trebic">Třebíč</option>
          <option value="Ceska">Česká Lípa</option>
          <option value="Tabor">Tábor</option>
          <option value="Znojmo">Znojmo</option>
          <option value="Pribram">Příbram</option>
          <option value="Orlova">Orlová</option>
          <option value="Cheb">Cheb</option>
          <option value="Modrany">Modřany</option>
          <option value="Litvinov">Litvínov</option>
          <option value="Trinec">Třinec</option>
          <option value="Kolin">Kolín</option>
          <option value="Kromeriz">Kroměříž</option>
          <option value="Sumperk">Šumperk</option>
          <option value="Vsetin">Vsetín</option>
          <option value="Valasske">Valašské Meziříčí</option>
          <option value="Litomysl">Litomyšl</option>
          <option value="Novy">Nový Jičín</option>
          <option value="Uherske">Uherské Hradiště</option>
          <option value="Chrudim">Chrudim</option>
          <option value="Havlickuv">Havlíčkův Brod</option>
          <option value="Koprivnice">Kopřivnice</option>
          <option value="Jindrichuv">Jindřichův Hradec</option>
          <option value="Svitavy">Svitavy</option>
          <option value="Kralupy">Kralupy nad Vltavou</option>
          <option value="Vyskov">Vyškov</option>
          <option value="Ceský">Český Těšín</option>
          <option value="Kutna">Kutná Hora</option>
          <option value="Breclav">Břeclav</option>
          <option value="Hodonin">Hodonín</option>
          <option value="Strakonice">Strakonice</option>
        </select>
        <select
          value={filters.service}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="filter-select"
        >
          <option value="All">{t.allServices}</option>
          {availableServices.map(service => (
            <option key={service} value={service}>
              {translateServices([service], language)[0]}
            </option>
          ))}
        </select>
        <select
          value={filters.minRating || 0}
          onChange={(e) => onFiltersChange({ ...filters, minRating: Number(e.target.value) })}
          className="filter-select"
        >
          <option value={0}>Všechny hodnocení</option>
          <option value={4}>4+ hvězdy</option>
          <option value={4.5}>4.5+ hvězdy</option>
          <option value={4.8}>4.8+ hvězdy</option>
        </select>
      </div>
    </div>
  );
};

export default SearchAndFilters;

