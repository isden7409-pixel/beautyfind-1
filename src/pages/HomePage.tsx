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
    address: "Václavské náměstí 28, 110 00 Praha 1",
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
        isFreelancer: false,
        address: "Václavské náměstí 28, 110 00 Praha 1"
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
        isFreelancer: false,
        address: "Václavské náměstí 28, 110 00 Praha 1"
      },
      {
        id: 103,
        name: "Martina Krásná",
        specialty: "Make-up artist",
        experience: "6 let",
        rating: 4.8,
        reviews: 67,
        photo: "https://via.placeholder.com/150x150/ff6b6b/ffffff?text=MK",
        worksInSalon: true,
        isFreelancer: false,
        address: "Václavské náměstí 28, 110 00 Praha 1"
      }
    ],
    coordinates: { lat: 50.0755, lng: 14.4378 }
  },
  {
    id: 2,
    name: "Glamour Studio Brno",
    city: "Brno",
    address: "Náměstí Svobody 15, 602 00 Brno-střed",
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
        name: "Eva Krásná",
        specialty: "Wedding Makeup",
        experience: "6 let",
        rating: 4.8,
        reviews: 67,
        photo: "https://via.placeholder.com/150x150/ff6b6b/ffffff?text=EK",
        worksInSalon: true,
        isFreelancer: false,
        address: "Náměstí Svobody 15, 602 00 Brno-střed"
      },
      {
        id: 202,
        name: "Jana Svobodová",
        specialty: "Hair Styling",
        experience: "4 let",
        rating: 4.6,
        reviews: 34,
        photo: "https://via.placeholder.com/150x150/ff8e8e/ffffff?text=JS",
        worksInSalon: true,
        isFreelancer: false,
        address: "Náměstí Svobody 15, 602 00 Brno-střed"
      }
    ],
    coordinates: { lat: 49.1951, lng: 16.6068 }
  },
  {
    id: 3,
    name: "Nail Art Prague",
    city: "Prague",
    address: "Karlova 25, 110 00 Praha 1",
    services: ["Manicure", "Nail Art", "Gel Nails", "Nail Extensions"],
    rating: 4.9,
    reviews: 203,
    image: "https://via.placeholder.com/400x300/4ecdc4/ffffff?text=Nail+Art",
    description: "Specialisté na nail design a gelové nehty v historickém centru Prahy. Používáme pouze prémiové produkty.",
    phone: "+420 555 123 456",
    email: "nailart@prague.cz",
    openHours: "Út-Ne: 10:00-19:00",
    photos: [
      "https://via.placeholder.com/400x300/45b7d1/ffffff?text=Salon+1",
      "https://via.placeholder.com/400x300/96ceb4/ffffff?text=Salon+2"
    ],
    masters: [
      {
        id: 301,
        name: "Andrea Nehtová",
        specialty: "Nail Design",
        experience: "7 let",
        rating: 4.9,
        reviews: 134,
        photo: "https://via.placeholder.com/150x150/4ecdc4/ffffff?text=AN",
        worksInSalon: true,
        isFreelancer: false,
        address: "Karlova 25, 110 00 Praha 1"
      },
      {
        id: 302,
        name: "Monika Krásná",
        specialty: "Gel Nails",
        experience: "3 let",
        rating: 4.7,
        reviews: 56,
        photo: "https://via.placeholder.com/150x150/96ceb4/ffffff?text=MK",
        worksInSalon: true,
        isFreelancer: false,
        address: "Karlova 25, 110 00 Praha 1"
      }
    ],
    coordinates: { lat: 50.0865, lng: 14.4206 }
  },
  {
    id: 4,
    name: "Hair Paradise Brno",
    city: "Brno",
    address: "Joštova 8, 602 00 Brno-střed",
    services: ["Haircut", "Coloring", "Hair Treatment", "Styling"],
    rating: 4.7,
    reviews: 156,
    image: "https://via.placeholder.com/400x300/f9ca24/ffffff?text=Hair+Paradise",
    description: "Kadeřnický salon s 15letou tradicí a špičkovými produkty. Nabízíme kompletní služby pro vlasy.",
    phone: "+420 777 888 999",
    email: "info@hairparadise.cz",
    openHours: "Po-Pá: 8:00-19:00, So: 9:00-16:00",
    photos: [
      "https://via.placeholder.com/400x300/f0932b/ffffff?text=Salon+1",
      "https://via.placeholder.com/400x300/eb4d4b/ffffff?text=Salon+2"
    ],
    masters: [
      {
        id: 401,
        name: "Petra Vlasová",
        specialty: "Barvení vlasů",
        experience: "10 let",
        rating: 4.8,
        reviews: 89,
        photo: "https://via.placeholder.com/150x150/f9ca24/ffffff?text=PV",
        worksInSalon: true,
        isFreelancer: false,
        address: "Joštova 8, 602 00 Brno-střed"
      },
      {
        id: 402,
        name: "Lucie Kadeřníková",
        specialty: "Pánské střihy",
        experience: "5 let",
        rating: 4.6,
        reviews: 42,
        photo: "https://via.placeholder.com/150x150/eb4d4b/ffffff?text=LK",
        worksInSalon: true,
        isFreelancer: false,
        address: "Joštova 8, 602 00 Brno-střed"
      }
    ],
    coordinates: { lat: 49.2000, lng: 16.6100 }
  },
  {
    id: 5,
    name: "Beauty Center Prague",
    city: "Prague",
    address: "Wenceslas Square 47, 110 00 Praha 1",
    services: ["Facial", "Massage", "Eyebrows", "Eyelashes"],
    rating: 4.5,
    reviews: 98,
    image: "https://via.placeholder.com/400x300/a55eea/ffffff?text=Beauty+Center",
    description: "Moderní centrum krásy v centru Prahy s profesionálním týmem a nejnovějšími technologiemi.",
    phone: "+420 234 567 890",
    email: "info@beautycenter.cz",
    openHours: "Po-Pá: 8:00-20:00, So: 9:00-17:00",
    photos: [
      "https://via.placeholder.com/400x300/8e44ad/ffffff?text=Center+1",
      "https://via.placeholder.com/400x300/9b59b6/ffffff?text=Center+2"
    ],
    masters: [
      {
        id: 501,
        name: "Zuzana Krásná",
        specialty: "Facial treatments",
        experience: "8 let",
        rating: 4.7,
        reviews: 67,
        photo: "https://via.placeholder.com/150x150/a55eea/ffffff?text=ZK",
        worksInSalon: true,
        isFreelancer: false,
        address: "Wenceslas Square 47, 110 00 Praha 1"
      },
      {
        id: 502,
        name: "Michaela Svobodová",
        specialty: "Eyebrows & Eyelashes",
        experience: "4 let",
        rating: 4.5,
        reviews: 31,
        photo: "https://via.placeholder.com/150x150/9b59b6/ffffff?text=MS",
        worksInSalon: true,
        isFreelancer: false,
        address: "Wenceslas Square 47, 110 00 Praha 1"
      }
    ],
    coordinates: { lat: 50.0810, lng: 14.4270 }
  },
  {
    id: 6,
    name: "Style Studio Brno",
    city: "Brno",
    address: "Masarykova 15, 602 00 Brno-střed",
    services: ["Haircut", "Coloring", "Makeup", "Nail Art"],
    rating: 4.4,
    reviews: 76,
    image: "https://via.placeholder.com/400x300/2ecc71/ffffff?text=Style+Studio",
    description: "Stylový salon v centru Brna nabízející kompletní služby pro moderní ženy.",
    phone: "+420 345 678 901",
    email: "info@stylestudio.cz",
    openHours: "Po-Pá: 9:00-19:00, So: 10:00-16:00",
    photos: [
      "https://via.placeholder.com/400x300/27ae60/ffffff?text=Studio+1",
      "https://via.placeholder.com/400x300/16a085/ffffff?text=Studio+2"
    ],
    masters: [
      {
        id: 601,
        name: "Tereza Stylová",
        specialty: "Hair Styling",
        experience: "6 let",
        rating: 4.6,
        reviews: 45,
        photo: "https://via.placeholder.com/150x150/2ecc71/ffffff?text=TS",
        worksInSalon: true,
        isFreelancer: false,
        address: "Masarykova 15, 602 00 Brno-střed"
      },
      {
        id: 602,
        name: "Nikola Krásná",
        specialty: "Makeup & Nail Art",
        experience: "3 let",
        rating: 4.3,
        reviews: 31,
        photo: "https://via.placeholder.com/150x150/16a085/ffffff?text=NK",
        worksInSalon: true,
        isFreelancer: false,
        address: "Masarykova 15, 602 00 Brno-střed"
      }
    ],
    coordinates: { lat: 49.1900, lng: 16.6100 }
  },
  {
    id: 7,
    name: "Luxury Spa Prague",
    city: "Prague",
    address: "Národní třída 25, 110 00 Praha 1",
    services: ["Massage", "Facial", "Body Treatment", "Sauna"],
    rating: 4.9,
    reviews: 145,
    image: "https://via.placeholder.com/400x300/e74c3c/ffffff?text=Luxury+Spa",
    description: "Luxusní spa v centru Prahy s prémiovými službami a relaxačním prostředím.",
    phone: "+420 456 789 012",
    email: "info@luxuryspa.cz",
    openHours: "Po-Ne: 7:00-22:00",
    photos: [
      "https://via.placeholder.com/400x300/c0392b/ffffff?text=Spa+1",
      "https://via.placeholder.com/400x300/a93226/ffffff?text=Spa+2"
    ],
    masters: [
      {
        id: 701,
        name: "Anna Relaxová",
        specialty: "Massage Therapy",
        experience: "12 let",
        rating: 4.9,
        reviews: 89,
        photo: "https://via.placeholder.com/150x150/e74c3c/ffffff?text=AR",
        worksInSalon: true,
        isFreelancer: false,
        address: "Národní třída 25, 110 00 Praha 1"
      },
      {
        id: 702,
        name: "Jana Wellness",
        specialty: "Facial & Body Treatments",
        experience: "7 let",
        rating: 4.8,
        reviews: 56,
        photo: "https://via.placeholder.com/150x150/c0392b/ffffff?text=JW",
        worksInSalon: true,
        isFreelancer: false,
        address: "Národní třída 25, 110 00 Praha 1"
      }
    ],
    coordinates: { lat: 50.0820, lng: 14.4200 }
  },
  {
    id: 8,
    name: "Modern Hair Brno",
    city: "Brno",
    address: "Kobližná 3, 602 00 Brno-střed",
    services: ["Haircut", "Coloring", "Hair Treatment", "Beard Trim"],
    rating: 4.6,
    reviews: 112,
    image: "https://via.placeholder.com/400x300/3498db/ffffff?text=Modern+Hair",
    description: "Moderní kadeřnický salon s trendy střihy a profesionálním přístupem.",
    phone: "+420 567 890 123",
    email: "info@modernhair.cz",
    openHours: "Po-Pá: 8:00-18:00, So: 9:00-15:00",
    photos: [
      "https://via.placeholder.com/400x300/2980b9/ffffff?text=Hair+1",
      "https://via.placeholder.com/400x300/1f618d/ffffff?text=Hair+2"
    ],
    masters: [
      {
        id: 801,
        name: "Tomáš Moderní",
        specialty: "Pánské střihy",
        experience: "9 let",
        rating: 4.7,
        reviews: 78,
        photo: "https://via.placeholder.com/150x150/3498db/ffffff?text=TM",
        worksInSalon: true,
        isFreelancer: false,
        address: "Kobližná 3, 602 00 Brno-střed"
      },
      {
        id: 802,
        name: "Veronika Trendová",
        specialty: "Dámské střihy a barvení",
        experience: "5 let",
        rating: 4.5,
        reviews: 34,
        photo: "https://via.placeholder.com/150x150/1f618d/ffffff?text=VT",
        worksInSalon: true,
        isFreelancer: false,
        address: "Kobližná 3, 602 00 Brno-střed"
      }
    ],
    coordinates: { lat: 49.1950, lng: 16.6080 }
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
    address: "Korunní 2565/108, 120 00 Praha 2",
    description: "Nail design specialist s 7 lety zkušeností. Pracuji z pohodlí domova s prémiovými produkty.",
    phone: "+420 987 654 321",
    email: "anna@nailart.cz",
    services: ["Manicure", "Nail Art", "Gel Nails"],
    coordinates: { lat: 50.0750, lng: 14.4500 }
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
    coordinates: { lat: 49.2000, lng: 16.6100 }
  },
  {
    id: 1003,
    name: "Marie Makeup",
    specialty: "Wedding Makeup",
    experience: "8 let",
    rating: 4.9,
    reviews: 78,
    photo: "https://via.placeholder.com/150x150/e91e63/ffffff?text=MM",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Vodičkova 699/36, 110 00 Praha 1",
    description: "Profesionální makeup artist specializující se na svatební make-up a speciální události.",
    phone: "+420 123 456 789",
    email: "marie@makeup.cz",
    services: ["Wedding Makeup", "Event Makeup", "Bridal Makeup"],
    coordinates: { lat: 50.0800, lng: 14.4300 }
  },
  {
    id: 1004,
    name: "Tomáš Masér",
    specialty: "Relaxační masáže",
    experience: "6 let",
    rating: 4.7,
    reviews: 45,
    photo: "https://via.placeholder.com/150x150/ff9800/ffffff?text=TM",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Kounicova 20, 602 00 Brno-střed",
    description: "Certifikovaný masér s výjezdovou službou. Specializace na relaxační a sportovní masáže.",
    phone: "+420 234 567 890",
    email: "tomas@masaz.cz",
    services: ["Relaxační masáž", "Sportovní masáž", "Lymfatická masáž"],
    coordinates: { lat: 49.1900, lng: 16.6000 }
  },
  {
    id: 1005,
    name: "Lucie Kadeřnice",
    specialty: "Dámské střihy",
    experience: "4 let",
    rating: 4.6,
    reviews: 32,
    photo: "https://via.placeholder.com/150x150/4caf50/ffffff?text=LK",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Národní 25, 110 00 Praha 1",
    description: "Stylová kadeřnice s moderním přístupem. Specializace na trendy střihy a barvení vlasů.",
    phone: "+420 345 678 901",
    email: "lucie@hair.cz",
    services: ["Dámské střihy", "Barvení vlasů", "Melírování"],
    coordinates: { lat: 50.0820, lng: 14.4200 }
  },
  {
    id: 1006,
    name: "Jana Kosmetička",
    specialty: "Péče o pleť",
    experience: "9 let",
    rating: 4.8,
    reviews: 67,
    photo: "https://via.placeholder.com/150x150/9c27b0/ffffff?text=JK",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Zelný trh 2, 602 00 Brno-střed",
    description: "Kosmetička s dlouholetou praxí. Nabízím komplexní péči o pleť a anti-aging procedury.",
    phone: "+420 456 789 012",
    email: "jana@kosmetika.cz",
    services: ["Facial", "Anti-aging", "Čištění pleti"],
    coordinates: { lat: 49.1950, lng: 16.6050 }
  },
  {
    id: 1007,
    name: "Pavel Barber",
    specialty: "Pánské střihy a vousy",
    experience: "7 let",
    rating: 4.9,
    reviews: 89,
    photo: "https://via.placeholder.com/150x150/795548/ffffff?text=PB",
    worksInSalon: false,
    isFreelancer: true,
    city: "Prague",
    address: "Václavské náměstí 42, 110 00 Praha 1",
    description: "Profesionální barber s výjezdovou službou. Specializace na pánské střihy, vousy a úpravu obočí.",
    phone: "+420 567 890 123",
    email: "pavel@barber.cz",
    services: ["Pánské střihy", "Úprava vousů", "Horký ručník"],
    coordinates: { lat: 50.0755, lng: 14.4378 }
  },
  {
    id: 1008,
    name: "Eva Manikérka",
    specialty: "Manikúra a pedikúra",
    experience: "5 let",
    rating: 4.7,
    reviews: 43,
    photo: "https://via.placeholder.com/150x150/f44336/ffffff?text=EM",
    worksInSalon: false,
    isFreelancer: true,
    city: "Brno",
    address: "Masarykova 8, 602 00 Brno-střed",
    description: "Manikérka s výjezdovou službou. Nabízím klasickou i gelovou manikúru a pedikúru.",
    phone: "+420 678 901 234",
    email: "eva@manikura.cz",
    services: ["Manikúra", "Pedikúra", "Gelové nehty"],
    coordinates: { lat: 49.2000, lng: 16.6100 }
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
