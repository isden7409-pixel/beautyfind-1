import React from 'react';
import { SearchFilters, Language } from '../types';

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
        </select>
        <select
          value={filters.service}
          onChange={(e) => handleServiceChange(e.target.value)}
          className="filter-select"
        >
          <option value="All">{t.allServices}</option>
          <option value="Manicure">Manikúra</option>
          <option value="Pedicure">Pedikúra</option>
          <option value="Haircut">Střih vlasů</option>
          <option value="Makeup">Make-up</option>
          <option value="Facial">Péče o pleť</option>
          <option value="Nail Art">Nail Art</option>
          <option value="Massage">Masáže</option>
          <option value="Eyebrows">Úprava obočí</option>
          <option value="Eyelashes">Řasy</option>
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
