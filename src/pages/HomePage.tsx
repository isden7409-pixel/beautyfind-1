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
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop&crop=center",
    description: "Prémiový kosmetický salon v centru Prahy s moderním vybavením a profesionálním týmem. Specializujeme se na manikúru, pedikúru a péči o pleť.",
    phone: "+420 123 456 789",
    email: "info@elegancebeauty.cz",
    website: "www.elegancebeauty.cz",
    openHours: "Po-Pá: 9:00-20:00, So: 10:00-18:00",
    photos: [
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 101,
        name: "Kateřina Nováková",
        specialty: "Manikúra a pedikúra",
        experience: "5 let",
        rating: 4.9,
        reviews: 45,
        photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
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
        photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&crop=center",
    description: "Moderní studio v srdci Brna nabízející komplexní péči o krásu. Zaměřujeme se na wedding makeup a speciální účesy.",
    phone: "+420 987 654 321",
    email: "studio@glamourbrno.cz",
    openHours: "Po-Ne: 8:00-21:00",
    photos: [
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 201,
        name: "Eva Krásná",
        specialty: "Wedding Makeup",
        experience: "6 let",
        rating: 4.8,
        reviews: 67,
        photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&crop=center",
    description: "Specialisté na nail design a gelové nehty v historickém centru Prahy. Používáme pouze prémiové produkty.",
    phone: "+420 555 123 456",
    email: "nailart@prague.cz",
    openHours: "Út-Ne: 10:00-19:00",
    photos: [
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 301,
        name: "Andrea Nehtová",
        specialty: "Nail Design",
        experience: "7 let",
        rating: 4.9,
        reviews: 134,
        photo: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop&crop=center",
    description: "Kadeřnický salon s 15letou tradicí a špičkovými produkty. Nabízíme kompletní služby pro vlasy.",
    phone: "+420 777 888 999",
    email: "info@hairparadise.cz",
    openHours: "Po-Pá: 8:00-19:00, So: 9:00-16:00",
    photos: [
      "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 401,
        name: "Petra Vlasová",
        specialty: "Barvení vlasů",
        experience: "10 let",
        rating: 4.8,
        reviews: 89,
        photo: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
    description: "Moderní centrum krásy v centru Prahy s profesionálním týmem a nejnovějšími technologiemi.",
    phone: "+420 234 567 890",
    email: "info@beautycenter.cz",
    openHours: "Po-Pá: 8:00-20:00, So: 9:00-17:00",
    photos: [
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 501,
        name: "Zuzana Krásná",
        specialty: "Facial treatments",
        experience: "8 let",
        rating: 4.7,
        reviews: 67,
        photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop&crop=center",
    description: "Stylový salon v centru Brna nabízející kompletní služby pro moderní ženy.",
    phone: "+420 345 678 901",
    email: "info@stylestudio.cz",
    openHours: "Po-Pá: 9:00-19:00, So: 10:00-16:00",
    photos: [
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 601,
        name: "Tereza Stylová",
        specialty: "Hair Styling",
        experience: "6 let",
        rating: 4.6,
        reviews: 45,
        photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop&crop=center",
    description: "Luxusní spa v centru Prahy s prémiovými službami a relaxačním prostředím.",
    phone: "+420 456 789 012",
    email: "info@luxuryspa.cz",
    openHours: "Po-Ne: 7:00-22:00",
    photos: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 701,
        name: "Anna Relaxová",
        specialty: "Massage Therapy",
        experience: "12 let",
        rating: 4.9,
        reviews: 89,
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
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
    image: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&crop=center",
    description: "Moderní kadeřnický salon s trendy střihy a profesionálním přístupem.",
    phone: "+420 567 890 123",
    email: "info@modernhair.cz",
    openHours: "Po-Pá: 8:00-18:00, So: 9:00-15:00",
    photos: [
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=300&fit=crop&crop=center",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop&crop=center"
    ],
    masters: [
      {
        id: 801,
        name: "Tomáš Moderní",
        specialty: "Pánské střihy",
        experience: "9 let",
        rating: 4.7,
        reviews: 78,
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
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
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
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
    mapView: "Mapa",
    howItWorks: "Jak to funguje",
    step1: "Vyberte balíček",
    step1Desc: "Zvolte si délku prémiového zobrazení",
    step2: "Zaplaťte",
    step2Desc: "Bezpečná platba kartou nebo převodem",
    step3: "Začněte získávat klienty",
    step3Desc: "Váš profil bude zobrazen na vrcholu"
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
    mapView: "Map",
    howItWorks: "How it works",
    step1: "Choose package",
    step1Desc: "Select the duration of premium display",
    step2: "Pay",
    step2Desc: "Secure payment by card or transfer",
    step3: "Start getting clients",
    step3Desc: "Your profile will be displayed at the top"
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
        
        {/* Premium packages for masters */}
        <section className="premium-packages-section">
          <div className="premium-packages-content">
            <h2>Prémiové balíčky pro mistry</h2>
            <div className="premium-packages-grid">
              <div className="premium-package">
                <h3>Top Master - Den</h3>
                <div className="price">200 Kč</div>
                <p className="description">Zobrazte sebe na vrcholu výsledků vyhledávání na 24 hodin</p>
                <ul className="features">
                  <li>Zobrazení na vrcholu výsledků</li>
                  <li>Zvýrazněný profil</li>
                  <li>Více zobrazení</li>
                  <li>Okamžité aktivace</li>
                </ul>
                <button className="purchase-btn">Zakoupit</button>
              </div>
              <div className="premium-package">
                <h3>Top Master - Týden</h3>
                <div className="price">1 000 Kč</div>
                <p className="description">Zobrazte sebe na vrcholu výsledků vyhledávání na 7 dní</p>
                <ul className="features">
                  <li>Zobrazení na vrcholu výsledků</li>
                  <li>Zvýrazněný profil</li>
                  <li>Více zobrazení</li>
                  <li>Okamžitá aktivace</li>
                </ul>
                <button className="purchase-btn">Zakoupit</button>
              </div>
              <div className="premium-package">
                <h3>Top Master - Měsíc</h3>
                <div className="price">3 000 Kč</div>
                <p className="description">Zobrazte sebe na vrcholu výsledků vyhledávání na 30 dní</p>
                <ul className="features">
                  <li>Zobrazení na vrcholu výsledků</li>
                  <li>Zvýrazněný profil</li>
                  <li>Více zobrazení</li>
                  <li>Okamžitá aktivace</li>
                </ul>
                <button className="purchase-btn">Zakoupit</button>
              </div>
            </div>
          </div>
        </section>

        {/* Jak to funguje section */}
        <section className="how-it-works">
          <div className="how-it-works-content">
            <h2>{t.howItWorks}</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <h3>{t.step1}</h3>
                  <p>{t.step1Desc}</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <h3>{t.step2}</h3>
                  <p>{t.step2Desc}</p>
                </div>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <h3>{t.step3}</h3>
                  <p>{t.step3Desc}</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
