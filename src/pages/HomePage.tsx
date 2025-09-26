import React, { useState } from 'react';
import { Salon, Master, SearchFilters, Language, ViewMode } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchAndFilters from '../components/SearchAndFilters';
import SalonCard from '../components/SalonCard';
import MasterCard from '../components/MasterCard';
import MapView from '../components/MapView';

// Тестовые данные салонов
const mockSalons: Salon[] = [
  {
    id: 1,
    name: "Elegance Beauty Prague",
    city: "Prague",
    address: "Václavské náměstí 1",
    services: ["Manicure", "Pedicure", "Haircut", "Makeup", "Facial"],
    rating: 4.8,
    reviews: 127,
    image: "https://via.placeholder.com/400x300/667eea/ffffff?text=Elegance+Beauty",
    description: "Prémiový kosmetický salon v centru Prahy s moderním vybavením a profesionálním týmem. Specializujeme se na manikúru, pedikúru a péči o pleť.",
    phone: "+420 123 456 789",
    email: "info@elegancebeauty.cz",
    website: "www.elegancebeauty.cz",
    openHours: "Po-Pá: 9:00-20:00, So: 10:00-18:00",
    photos: [
      "https://via.placeholder.com/400x300/764ba2/ffffff?text=Interiér+1",
      "https://via.placeholder.com/400x300/5a6fd8/ffffff?text=Interiér+2",
      "https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Interiér+3"
    ],
    masters: [
      {
        id: 101,
        name: "Kateřina Nováková",
        specialty: "Manikúra a pedikúra",
        experience: "5 let",
        rating: 4.9,
        reviews: 45,
        photo: "https://via.placeholder.com/150x150/667eea/ffffff?text=KN",
        worksInSalon: true,
        isFreelancer: false
      },
      {
        id: 102,
        name: "Lucie Svobodová",
        specialty: "Kadeřnice",
        experience: "8 let",
        rating: 4.7,
        reviews: 82,
        photo: "https://via.placeholder.com/150x150/764ba2/ffffff?text=LS",
        worksInSalon: true,
        isFreelancer: false
      }
    ],
    coordinates: { lat: 50.0755, lng: 14.4378 }
  },
  {
    id: 2,
    name: "Glamour Studio Brno",
    city: "Brno",
    address: "Náměstí Svobody 15",
    services: ["Makeup", "Hair Styling", "Facial", "Massage"],
    rating: 4.6,
    reviews: 89,
    image: "https://via.placeholder.com/400x300/ff6b6b/ffffff?text=Glamour+Studio",
    description: "Moderní studio v srdci Brna nabízející komplexní péči o krásu. Zaměřujeme se na wedding makeup a speciální účesy.",
    phone: "+420 987 654 321",
    email: "studio@glamourbrno.cz",
    openHours: "Po-Ne: 8:00-21:00",
    photos: [
      "https://via.placeholder.com/400x300/ff5252/ffffff?text=Studio+1",
      "https://via.placeholder.com/400x300/ff8e8e/ffffff?text=Studio+2"
    ],
    masters: [
      {
        id: 201,
        name: "Martina Krásná",
        specialty: "Wedding Makeup",
        experience: "6 let",
        rating: 4.8,
        reviews: 67,
        photo: "https://via.placeholder.com/150x150/ff6b6b/ffffff?text=MK",
        worksInSalon: true,
        isFreelancer: false
      }
    ],
    coordinates: { lat: 49.1951, lng: 16.6068 }
  }
];

// Фрилансеры (мастера работающие на себя)
const freelancerMasters: Master[] = [
  {
    id: 1001,
    name: "Anna Krásná",
    specialty: "Nail Design",
    experience: "7 let",
    rating: 4.9,
    reviews: 56,
    photo: "https://via.placeholder.com/150x150/a55eea/ffffff?text=AK",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Domácí salon, Vinohrady",
    description: "Nail design specialist s 7 lety zkušeností. Pracuji z pohodlí domova s prémiovými produkty.",
    phone: "+420 987 654 321",
    email: "anna@nailart.cz",
    services: ["Manicure", "Nail Art", "Gel Nails"],
    coordinates: { lat: 50.0755, lng: 14.4378 }
  },
  {
    id: 1002,
    name: "Petr Kadeřník",
    specialty: "Pánské střihy",
    experience: "5 let",
    rating: 4.8,
    reviews: 34,
    photo: "https://via.placeholder.com/150x150/3867d6/ffffff?text=PK",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Výjezdová služba, celé Brno",
    description: "Pánský kadeřník s výjezdovou službou. Přijedu kamkoliv v Brně. Specializace na moderní pánské střihy.",
    phone: "+420 555 444 333",
    email: "petr@hairmaster.cz",
    services: ["Haircut", "Beard Trim", "Hair Coloring"],
    coordinates: { lat: 49.1951, lng: 16.6068 }
  }
];

// Тексты для разных языков
const translations = {
  cs: {
    title: "BeautyFind.cz",
    subtitle: "Najděte svůj perfektní kosmetický salon v Česku",
    searchPlaceholder: "Hledat salony, služby nebo města...",
    allCities: "Všechna města",
    allServices: "Všechny služby",
    foundSalons: "Nalezeno {count} salonů",
    foundMasters: "Nalezeno {count} mistrů",
    address: "📍",
    rating: "⭐",
    reviews: "recenzí",
    viewDetails: "Zobrazit detaily",
    noResults: "Nebyl nalezen žádný salon odpovídající kritériím",
    noMasters: "Nebyl nalezen žádný mistr odpovídající kritériím",
    viewSalons: "Salony",
    viewMasters: "Mistři",
    freelancer: "🏠 Frikancer",
    inSalon: "🏢 V salonu",
    experience: "zkušeností",
    adminPanel: "Admin Panel",
    listView: "Seznam",
    mapView: "Mapa"
  },
  en: {
    title: "BeautyFind.cz",
    subtitle: "Find your perfect beauty salon in Czech Republic",
    searchPlaceholder: "Search for salons, services, or cities...",
    allCities: "All Cities",
    allServices: "All Services",
    foundSalons: "Found {count} salons",
    foundMasters: "Found {count} masters",
    address: "📍",
    rating: "⭐",
    reviews: "reviews",
    viewDetails: "View Details",
    noResults: "No salons found matching your criteria",
    noMasters: "No masters found matching your criteria",
    viewSalons: "Salons",
    viewMasters: "Masters",
    freelancer: "🏠 Freelancer",
    inSalon: "🏢 In Salon",
    experience: "experience",
    adminPanel: "Admin Panel",
    listView: "List",
    mapView: "Map"
  }
};

interface HomePageProps {
  onSalonSelect: (salon: Salon) => void;
  onMasterSelect: (master: Master) => void;
  onAdminPanel: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSalonSelect, onMasterSelect, onAdminPanel }) => {
  const [salons] = useState<Salon[]>(mockSalons);
  const [freelancers] = useState<Master[]>(freelancerMasters);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('cs');
  const [viewMode, setViewMode] = useState<ViewMode>('salons');
  const [displayMode, setDisplayMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<SearchFilters>({
    city: "All",
    service: "All",
    searchTerm: "",
    minRating: 0
  });

  const t = translations[currentLanguage];

  // Все мастера вместе (из салонов + фрилансеры)
  const allMasters: Master[] = [
    ...salons.flatMap(salon => salon.masters.map(master => ({
      ...master,
      salonName: salon.name,
      salonId: salon.id,
      city: salon.city,
      address: salon.address,
      coordinates: salon.coordinates
    }))),
    ...freelancers
  ];

  // Фильтрация салонов
  const filteredSalons = salons.filter(salon => {
    const matchesCity = filters.city === "All" || salon.city === filters.city;
    const matchesService = filters.service === "All" || salon.services.includes(filters.service);
    const matchesSearch = salon.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         salon.address.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesRating = !filters.minRating || salon.rating >= filters.minRating;
    return matchesCity && matchesService && matchesSearch && matchesRating;
  });

  // Фильтрация мастеров
  const filteredMasters = allMasters.filter(master => {
    const masterServices = master.services || [master.specialty];
    const matchesCity = filters.city === "All" || master.city === filters.city;
    const matchesService = filters.service === "All" || masterServices.includes(filters.service);
    const matchesSearch = master.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (master.address && master.address.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesRating = !filters.minRating || master.rating >= filters.minRating;
    return matchesCity && matchesService && matchesSearch && matchesRating;
  });

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <button onClick={onAdminPanel} className="admin-btn">
            {t.adminPanel}
          </button>
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
          />
        </div>
        <div className="header-content">
          <h1>{t.title}</h1>
          <p className="subtitle">{t.subtitle}</p>
          <div className="view-mode-switcher">
            <button
              className={`mode-btn ${viewMode === 'salons' ? 'active' : ''}`}
              onClick={() => setViewMode('salons')}
            >
              {t.viewSalons}
            </button>
            <button
              className={`mode-btn ${viewMode === 'masters' ? 'active' : ''}`}
              onClick={() => setViewMode('masters')}
            >
              {t.viewMasters}
            </button>
          </div>
          <SearchAndFilters
            filters={filters}
            onFiltersChange={setFilters}
            language={currentLanguage}
            translations={translations}
          />
        </div>
      </header>
      <main className="main-content">
        <div className="view-toggle">
          <button
            className={`view-toggle-btn ${displayMode === 'list' ? 'active' : ''}`}
            onClick={() => setDisplayMode('list')}
          >
            📋 {t.listView}
          </button>
          <button
            className={`view-toggle-btn ${displayMode === 'map' ? 'active' : ''}`}
            onClick={() => setDisplayMode('map')}
          >
            🗺️ {t.mapView}
          </button>
        </div>
        <h2>
          {viewMode === 'salons'
            ? t.foundSalons.replace('{count}', filteredSalons.length.toString())
            : t.foundMasters.replace('{count}', filteredMasters.length.toString())
          }
        </h2>
        
        {displayMode === 'map' ? (
          <MapView
            salons={filteredSalons}
            masters={filteredMasters}
            language={currentLanguage}
            translations={translations}
            onSalonSelect={onSalonSelect}
            onMasterSelect={onMasterSelect}
            selectedType={viewMode}
          />
        ) : viewMode === 'salons' ? (
          filteredSalons.length === 0 ? (
            <div className="no-results">
              <p>{t.noResults}</p>
            </div>
          ) : (
            <div className="salons-grid">
              {filteredSalons.map(salon => (
                <SalonCard
                  key={salon.id}
                  salon={salon}
                  language={currentLanguage}
                  translations={translations}
                  onViewDetails={onSalonSelect}
                />
              ))}
            </div>
          )
        ) : (
          filteredMasters.length === 0 ? (
            <div className="no-results">
              <p>{t.noMasters}</p>
            </div>
          ) : (
            <div className="masters-grid-main">
              {filteredMasters.map(master => (
                <MasterCard
                  key={master.id}
                  master={master}
                  language={currentLanguage}
                  translations={translations}
                  onViewDetails={onMasterSelect}
                />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
};

export default HomePage;
