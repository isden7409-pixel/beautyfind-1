import React, { useState, useEffect } from 'react';
import { Salon, Master, SearchFilters, Language, ViewMode } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchAndFilters from '../components/SearchAndFilters';
import SalonCard from '../components/SalonCard';
import MasterCard from '../components/MasterCard';
import SimpleMapView from '../components/SimpleMapView';
import { useSalonsData, useMastersData } from '../hooks/useAppData';
import { masterService } from '../firebase/services';
import { useCurrentViewMode, useSetCurrentViewMode } from '../store/useStore';

// Тестовые данные салонов
// Убраны тестовые данные салонов - используются только реальные данные из Firebase
const mockSalons: Salon[] = [];

// Frikanceři (mistři pracující na sebe)
const freelancerMasters: Master[] = [
  {
    id: "1001",
    name: "Anna Krásná",
    specialty: "Nail Design",
    experience: "7 let",
    rating: 4.9,
    reviews: 56,
    photo: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Korunní 2565/108, 120 00 Praha 2",
    description: "Nail design specialist s 7 lety zkušeností. Pracuji z pohodlí domova s prémiovými produkty.",
    phone: "+420 987 654 321",
    email: "anna@nailart.cz",
    services: ["Manicure", "Nail Art", "Gel Nails"],
    languages: ["Czech", "English", "Russian"],
    coordinates: { lat: 50.0750, lng: 14.4500 }
  },
  {
    id: "1002",
    name: "Petr Kadeřník",
    specialty: "Pánské střihy",
    experience: "5 let",
    rating: 4.8,
    reviews: 34,
    photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Výjezdová služba, celé Brno",
    description: "Pánský kadeřník s výjezdovou službou. Přijedu kamkoliv v Brně. Specializace na moderní pánské střihy.",
    phone: "+420 555 444 333",
    email: "petr@hairmaster.cz",
    services: ["Haircut", "Beard Trim", "Hair Coloring"],
    languages: ["Czech", "English", "German"],
    coordinates: { lat: 49.2000, lng: 16.6100 }
  },
  {
    id: "1003",
    name: "Marie Makeup",
    specialty: "Wedding Makeup",
    experience: "8 let",
    rating: 4.9,
    reviews: 78,
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Vodičkova 699/36, 110 00 Praha 1",
    description: "Profesionální makeup artist specializující se na svatební make-up a speciální události.",
    phone: "+420 123 456 789",
    email: "marie@makeup.cz",
    services: ["Wedding Makeup", "Event Makeup", "Bridal Makeup"],
    languages: ["Czech", "English", "French"],
    coordinates: { lat: 50.0800, lng: 14.4300 }
  },
  {
    id: "1004",
    name: "Tomáš Masér",
    specialty: "Relaxation Massage",
    experience: "6 let",
    rating: 4.7,
    reviews: 45,
    photo: "https://images.unsplash.com/photo-1532074205216-d0e1f4b87368?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Kounicova 20, 602 00 Brno-střed",
    description: "Certifikovaný masér s výjezdovou službou. Specializace na relaxační a sportovní masáže.",
    phone: "+420 234 567 890",
    email: "tomas@masaz.cz",
    services: ["Relaxation Massage", "Sports Massage", "Lymphatic Massage"],
    languages: ["Czech", "English", "Slovak"],
    coordinates: { lat: 49.1900, lng: 16.6000 }
  },
  {
    id: "1005",
    name: "Lucie Kadeřnice",
    specialty: "Women's Haircuts",
    experience: "4 let",
    rating: 4.6,
    reviews: 32,
    photo: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Národní 25, 110 00 Praha 1",
    description: "Stylová kadeřnice s moderním přístupem. Specializace na trendy střihy a barvení vlasů.",
    phone: "+420 345 678 901",
    email: "lucie@hair.cz",
    services: ["Women's Haircuts", "Hair Coloring", "Highlights"],
    languages: ["Czech", "English", "Italian"],
    coordinates: { lat: 50.0820, lng: 14.4200 }
  },
  {
    id: "1006",
    name: "Jana Kosmetička",
    specialty: "Péče o pleť",
    experience: "9 let",
    rating: 4.8,
    reviews: 67,
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Zelný trh 2, 602 00 Brno-střed",
    description: "Kosmetička s dlouholetou praxí. Nabízím komplexní péči o pleť a anti-aging procedury.",
    phone: "+420 456 789 012",
    email: "jana@kosmetika.cz",
    services: ["Facial", "Anti-aging", "Skin Cleansing"],
    languages: ["Czech", "English", "German"],
    coordinates: { lat: 49.1950, lng: 16.6050 }
  },
  {
    id: "1007",
    name: "Pavel Barber",
        specialty: "Men's Haircuts and Beards",
    experience: "7 let",
    rating: 4.9,
    reviews: 89,
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Václavské náměstí 42, 110 00 Praha 1",
    description: "Profesionální barber s výjezdovou službou. Specializace na pánské střihy, vousy a úpravu obočí.",
    phone: "+420 567 890 123",
    email: "pavel@barber.cz",
    services: ["Men's Haircuts", "Beard Trim", "Hot Towel"],
    languages: ["Czech", "English", "Russian"],
    coordinates: { lat: 50.0755, lng: 14.4378 }
  },
  {
    id: "1008",
    name: "Eva Manikérka",
    specialty: "Manicure and Pedicure",
    experience: "5 let",
    rating: 4.7,
    reviews: 43,
    photo: "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Masarykova 8, 602 00 Brno-střed",
    description: "Manikérka s výjezdovou službou. Nabízím klasickou i gelovou manikúru a pedikúru.",
    phone: "+420 678 901 234",
    email: "eva@manikura.cz",
    services: ["Manicure", "Pedicure", "Gel Nails"],
    languages: ["Czech", "English", "Spanish"],
    coordinates: { lat: 49.2000, lng: 16.6100 }
  }
];

// Тексты для разных языков

interface HomePageProps {
  onSalonSelect: (salon: Salon) => void;
  onMasterSelect: (master: Master) => void;
  onAdminPanel: () => void;
  onPremiumFeatures: () => void;
  onOpenAuth: () => void;
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  translations: any;
  initialViewMode?: 'salons' | 'masters' | 'map';
  isLoggedIn?: boolean;
  userProfile?: any;
}

const HomePage: React.FC<HomePageProps> = ({ onSalonSelect, onMasterSelect, onAdminPanel, onPremiumFeatures, onOpenAuth, currentLanguage, onLanguageChange, translations, initialViewMode = 'salons', isLoggedIn = false, userProfile }) => {
  const salonsData = useSalonsData();
  const mastersData = useMastersData();
  const salons = salonsData?.salons && salonsData.salons.length > 0 ? salonsData.salons : mockSalons;
  const masters = mastersData?.masters && mastersData.masters.length > 0 ? mastersData.masters : [];
  const salonsLoading = salonsData?.loading || false;
  const mastersLoading = mastersData?.loading || false;
  
  // Используем глобальный стор вместо локального состояния
  const viewMode = useCurrentViewMode();
  const setViewMode = useSetCurrentViewMode();

  // Update existing masters with salon names
  useEffect(() => {
    if (!mastersLoading && masters.length > 0) {
      masterService.updateMastersWithSalonName();
    }
  }, [mastersLoading, masters.length]);
  const [filters, setFilters] = useState<SearchFilters>({
    city: "All",
    service: "All",
    searchTerm: "",
    minRating: 0
  });

  const t = translations[currentLanguage];

  // Все мастера из Firestore (включая фрилансеров и мастеров из салонов)
  const allMasters: Master[] = masters;

  // Фильтрация салонов
  const filteredSalons = salons.filter(salon => {
    const matchesCity = filters.city === "All" || salon.city === filters.city;
    const matchesService = filters.service === "All" || salon.services.includes(filters.service);
    const matchesSearch = salon.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         salon.address.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesRating = !filters.minRating || salon.rating >= filters.minRating;
    return matchesCity && matchesService && matchesSearch && matchesRating;
  });

  // Filtrování mistrů
  const filteredMasters = allMasters.filter(master => {
    const masterServices = master.services || [master.specialty];
    const matchesCity = filters.city === "All" || master.city === filters.city;
    const matchesService = filters.service === "All" || masterServices.includes(filters.service);
    const matchesSearch = master.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         (master.address && master.address.toLowerCase().includes(filters.searchTerm.toLowerCase()));
    const matchesRating = !filters.minRating || master.rating >= filters.minRating;
    return matchesCity && matchesService && matchesSearch && matchesRating;
  });

  const isLoading = salonsLoading || mastersLoading;

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <div className="header-buttons">
            <button onClick={onOpenAuth} className="admin-btn">
              {isLoggedIn 
                ? (currentLanguage === 'cs' ? `Můj účet (${userProfile?.name || 'Uživatel'})` : `My Account (${userProfile?.name || 'User'})`)
                : (currentLanguage === 'cs' ? 'Přihlášení' : 'Login')
              }
            </button>
            <button onClick={onAdminPanel} className="admin-btn">
              {currentLanguage === 'cs' ? 'Registrace' : 'Registration'}
            </button>
            <button onClick={onPremiumFeatures} className="admin-btn">
              {currentLanguage === 'cs' ? 'Prémiové funkce' : 'Premium Features'}
            </button>
          </div>
          <LanguageSwitcher
            currentLanguage={currentLanguage}
            onLanguageChange={onLanguageChange}
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
            <button
              className={`mode-btn ${viewMode === 'map' ? 'active' : ''}`}
              onClick={() => setViewMode('map')}
            >
              {t.mapView}
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
        {isLoading && (
          <div className="loading">{t.loading}...</div>
        )}
        <h2>
          {viewMode === 'salons'
            ? t.foundSalons.replace('{count}', filteredSalons.length.toString())
            : viewMode === 'masters'
            ? t.foundMasters.replace('{count}', filteredMasters.length.toString())
            : `Nalezeno ${filteredSalons.length} ${currentLanguage === 'cs' ? 'salonů' : 'salons'} a ${filteredMasters.filter(m => m.isFreelancer).length} ${currentLanguage === 'cs' ? 'mistrů' : 'masters'}`
          }
        </h2>
        
        {viewMode === 'map' ? (
          <SimpleMapView
            salons={filteredSalons}
            masters={filteredMasters.filter(m => m.isFreelancer)}
            language={currentLanguage}
            translations={translations}
            onSalonSelect={onSalonSelect}
            onMasterSelect={onMasterSelect}
            selectedType="map"
            filters={filters}
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
                  onSalonSelect={(salonId) => {
                    const salon = salons.find(s => s.id === salonId);
                    if (salon) {
                      onSalonSelect(salon);
                    }
                  }}
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
