import React, { useState, useEffect } from 'react';
import { Salon, Master, SearchFilters, Language, ViewMode } from '../types';
import LanguageSwitcher from '../components/LanguageSwitcher';
import SearchAndFilters from '../components/SearchAndFilters';
import SalonCard from '../components/SalonCard';
import MasterCard from '../components/MasterCard';
import SimpleMapView from '../components/SimpleMapView';

// Тестовые данные салонов
const mockSalons: Salon[] = [
  {
    id: "1",
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
        id: "101",
        name: "Kateřina Nováková",
        specialty: "Manicure and Pedicure",
        experience: "5 let",
        rating: 4.9,
        reviews: 45,
        photo: "https://picsum.photos/150/150?random=1",
        worksInSalon: true,
        isFreelancer: false,
        address: "Václavské náměstí 28, 110 00 Praha 1",
        description: "Profesionální manikérka s 5 lety zkušeností. Specializuji se na gelové nehty a nail art. Vytvářím jedinečné designy pro každou příležitost.",
        phone: "+420 123 456 789",
        email: "katerina@elegancebeauty.cz",
        services: ["Manicure", "Pedicure", "Nail Art", "Gel Nails"],
        languages: ["Czech", "English", "German"],
        salonName: "Elegance Beauty Prague",
        salonId: "1",
        bookingEnabled: true,
        workingHours: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 6, startTime: "10:00", endTime: "16:00", isWorking: true },
          { dayOfWeek: 0, startTime: "10:00", endTime: "16:00", isWorking: false }
        ],
        availableServices: [
          { id: "manicure", name: "Manicure", duration: 60, price: 800, description: "Klasická manikúra s lakováním" },
          { id: "pedicure", name: "Pedicure", duration: 90, price: 1200, description: "Péče o nohy s lakováním" },
          { id: "nail-art", name: "Nail Art", duration: 120, price: 1500, description: "Umělecké zdobení nehtů" },
          { id: "gel-nails", name: "Gel Nails", duration: 90, price: 1000, description: "Gelové nehty" }
        ]
      },
      {
        id: "102",
        name: "Lucie Svobodová",
        specialty: "Kadeřnice",
        experience: "8 let",
        rating: 4.7,
        reviews: 82,
        photo: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Václavské náměstí 28, 110 00 Praha 1",
        description: "Zkušená kadeřnice s 8 lety praxe. Specializuji se na moderní střihy a barvení vlasů. Vytvářím účesy pro každou příležitost s důrazem na kvalitu a spokojenost klientek.",
        phone: "+420 234 567 890",
        email: "lucie@elegancebeauty.cz",
        services: ["Haircut", "Hair Coloring", "Hair Styling", "Highlights"],
        languages: ["Czech", "English"],
        salonName: "Elegance Beauty Prague",
        salonId: "1",
        bookingEnabled: true,
        workingHours: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 6, startTime: "10:00", endTime: "18:00", isWorking: true },
          { dayOfWeek: 0, startTime: "10:00", endTime: "18:00", isWorking: false }
        ],
        availableServices: [
          { id: "haircut", name: "Dámský střih", duration: 90, price: 1200, description: "Profesionální střih vlasů" },
          { id: "coloring", name: "Barvení vlasů", duration: 180, price: 2500, description: "Kompletní barvení vlasů" },
          { id: "styling", name: "Účes", duration: 60, price: 800, description: "Profesionální účes" },
          { id: "highlights", name: "Melíry", duration: 150, price: 2000, description: "Melíry a balayage" }
        ]
      },
      {
        id: "103",
        name: "Martina Krásná",
        specialty: "Makeup Artist",
        experience: "6 let",
        rating: 4.8,
        reviews: 67,
        photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Václavské náměstí 28, 110 00 Praha 1",
        description: "Profesionální vizážistka s 6 lety zkušeností. Specializuji se na svatební a event makeup. Vytvářím přirozené a elegantní vzhledy pro každou příležitost.",
        phone: "+420 345 678 901",
        email: "martina@elegancebeauty.cz",
        services: ["Makeup", "Wedding Makeup", "Event Makeup", "Facial"],
        languages: ["Czech", "English", "French"],
        salonName: "Elegance Beauty Prague",
        salonId: "1",
        bookingEnabled: true,
        workingHours: [
          { dayOfWeek: 1, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 2, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 3, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 4, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 5, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
          { dayOfWeek: 6, startTime: "10:00", endTime: "18:00", isWorking: true },
          { dayOfWeek: 0, startTime: "10:00", endTime: "18:00", isWorking: false }
        ],
        availableServices: [
          { id: "makeup", name: "Makeup", duration: 60, price: 800, description: "Profesionální makeup" },
          { id: "wedding-makeup", name: "Svatební makeup", duration: 120, price: 2500, description: "Kompletní svatební makeup" },
          { id: "event-makeup", name: "Event makeup", duration: 90, price: 1500, description: "Makeup pro speciální příležitosti" },
          { id: "facial", name: "Ošetření pleti", duration: 90, price: 1500, description: "Kompletní péče o pleť" }
        ]
      }
    ],
    coordinates: { lat: 50.0755, lng: 14.4378 },
    bookingEnabled: true,
    workingHours: [
      { dayOfWeek: 1, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 2, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 5, startTime: "09:00", endTime: "20:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 6, startTime: "10:00", endTime: "18:00", isWorking: true },
      { dayOfWeek: 0, startTime: "10:00", endTime: "18:00", isWorking: false }
    ],
    availableServices: [
      { id: "manicure", name: "Manicure", duration: 60, price: 800, description: "Klasická manikúra s lakováním" },
      { id: "pedicure", name: "Pedicure", duration: 90, price: 1200, description: "Péče o nohy s lakováním" },
      { id: "nail-art", name: "Nail Art", duration: 120, price: 1500, description: "Umělecké zdobení nehtů" },
      { id: "gel-nails", name: "Gel Nails", duration: 90, price: 1000, description: "Gelové nehty" },
      { id: "haircut", name: "Dámský střih", duration: 90, price: 1200, description: "Profesionální střih vlasů" },
      { id: "coloring", name: "Barvení vlasů", duration: 180, price: 2500, description: "Kompletní barvení vlasů" },
      { id: "eyebrows", name: "Úprava obočí", duration: 30, price: 400, description: "Tvarování a barvení obočí" },
      { id: "makeup", name: "Makeup", duration: 60, price: 800, description: "Profesionální makeup" },
      { id: "facial", name: "Ošetření pleti", duration: 90, price: 1500, description: "Kompletní péče o pleť" }
    ]
  },
  {
    id: "2",
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
        id: "201",
        name: "Eva Krásná",
        specialty: "Svatební make-up",
        experience: "6 let",
        rating: 4.8,
        reviews: 67,
        photo: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Náměstí Svobody 15, 602 00 Brno-střed",
        description: "Specialistka na svatební make-up s 6 lety zkušeností. Vytvářím dokonalé vzhledy pro nejdůležitější den vašeho života. Zaměřuji se na dlouhotrvající a fotograficky krásné make-upy.",
        phone: "+420 456 789 012",
        email: "eva@glamourstudio.cz",
        services: ["Makeup", "Wedding Makeup", "Event Makeup", "Facial"],
        languages: ["Czech", "English", "German"],
        salonName: "Glamour Studio Brno",
        salonId: "2"
      },
      {
          id: "202",
        name: "Jana Svobodová",
        specialty: "Účesy",
        experience: "4 let",
        rating: 4.6,
        reviews: 34,
        photo: "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Náměstí Svobody 15, 602 00 Brno-střed",
        description: "Kreativní kadeřnice s 4 lety zkušeností. Specializuji se na svatební účesy a speciální příležitosti. Vytvářím jedinečné a elegantní účesy, které zdůrazní vaši krásu.",
        phone: "+420 567 890 123",
        email: "jana@glamourstudio.cz",
        services: ["Hair Styling", "Haircut", "Hair Coloring", "Wedding Makeup"],
        languages: ["Czech", "English"],
        salonName: "Glamour Studio Brno",
        salonId: "2"
      }
    ],
    coordinates: { lat: 49.1951, lng: 16.6068 },
    bookingEnabled: true,
    workingHours: [
      { dayOfWeek: 1, startTime: "08:00", endTime: "21:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 2, startTime: "08:00", endTime: "21:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 3, startTime: "08:00", endTime: "21:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 4, startTime: "08:00", endTime: "21:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 5, startTime: "08:00", endTime: "21:00", isWorking: true, breakStart: "12:00", breakEnd: "13:00" },
      { dayOfWeek: 6, startTime: "09:00", endTime: "19:00", isWorking: true },
      { dayOfWeek: 0, startTime: "09:00", endTime: "19:00", isWorking: true }
    ],
    availableServices: [
      { id: "makeup", name: "Makeup", duration: 60, price: 800, description: "Profesionální makeup" },
      { id: "wedding-makeup", name: "Svatební makeup", duration: 120, price: 2500, description: "Kompletní svatební makeup" },
      { id: "hair-styling", name: "Účes", duration: 90, price: 1200, description: "Profesionální účes" },
      { id: "facial", name: "Ošetření pleti", duration: 90, price: 1500, description: "Kompletní péče o pleť" },
      { id: "massage", name: "Masáž", duration: 60, price: 1000, description: "Relaxační masáž" },
      { id: "eyebrows", name: "Úprava obočí", duration: 30, price: 400, description: "Tvarování a barvení obočí" }
    ]
  },
  {
    id: "3",
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
        id: "301",
        name: "Andrea Nehtová",
        specialty: "Nail Design",
        experience: "7 let",
        rating: 4.9,
        reviews: 134,
        photo: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Karlova 25, 110 00 Praha 1",
        description: "Expertka na nail art s 7 lety zkušeností. Vytvářím jedinečné designy nehtů s použitím nejnovějších technik a prémiových materiálů. Specializuji se na složité vzory a 3D efekty.",
        phone: "+420 678 901 234",
        email: "andrea@nailartprague.cz",
        services: ["Nail Art", "Manicure", "Gel Nails", "Nail Extensions"],
        languages: ["Czech", "English", "Italian"],
        salonName: "Nail Art Prague",
        salonId: "3"
      },
      {
          id: "302",
        name: "Monika Krásná",
        specialty: "Gel Nails",
        experience: "3 let",
        rating: 4.7,
        reviews: 56,
        photo: "https://images.unsplash.com/photo-1521119989659-a83eee488004?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Karlova 25, 110 00 Praha 1",
        description: "Specialistka na gelové nehty s 3 lety zkušeností. Zaměřuji se na kvalitní a dlouhotrvající gelové nehty s moderními technikami. Vytvářím krásné a praktické nehty pro každodenní nošení.",
        phone: "+420 789 012 345",
        email: "monika@nailartprague.cz",
        services: ["Gel Nails", "Manicure", "Nail Art", "Nail Extensions"],
        languages: ["Czech", "English", "Spanish"],
        salonName: "Nail Art Prague",
        salonId: "3"
      }
    ],
    coordinates: { lat: 50.0865, lng: 14.4206 }
  },
  {
    id: "4",
    name: "Hair Paradise Brno",
    city: "Brno",
    address: "Joštova 8, 602 00 Brno-střed",
    services: ["Haircut", "Hair Coloring", "Hair Treatment", "Hair Styling"],
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
        id: "401",
        name: "Petra Vlasová",
        specialty: "Barvení vlasů",
        experience: "10 let",
        rating: 4.8,
        reviews: 89,
        photo: "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Joštova 8, 602 00 Brno-střed",
        description: "Expertka na barvení vlasů s 10 lety zkušeností. Specializuji se na moderní techniky barvení včetně balayage a ombré. Používám pouze prémiové produkty pro nejlepší výsledky.",
        phone: "+420 890 123 456",
        email: "petra@hairparadise.cz",
        services: ["Hair Coloring", "Highlights", "Balayage", "Hair Treatment"],
        languages: ["Czech", "English", "German"],
        salonName: "Hair Paradise Brno",
        salonId: "4"
      },
      {
          id: "402",
        name: "Lucie Kadeřníková",
        specialty: "Men's Haircuts",
        experience: "5 let",
        rating: 4.6,
        reviews: 42,
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Joštova 8, 602 00 Brno-střed",
        description: "Specialistka na pánské střihy s 5 lety zkušeností. Vytvářím moderní a stylové účesy pro muže všech věkových kategorií. Zaměřuji se na precizní práci a spokojenost klientů.",
        phone: "+420 901 234 567",
        email: "lucie@hairparadise.cz",
        services: ["Men's Haircut", "Beard Trim", "Hair Styling", "Hair Wash"],
        languages: ["Czech", "English"],
        salonName: "Hair Paradise Brno",
        salonId: "4"
      }
    ],
    coordinates: { lat: 49.2000, lng: 16.6100 }
  },
  {
    id: "5",
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
        id: "501",
        name: "Zuzana Krásná",
        specialty: "Facial treatments",
        experience: "8 let",
        rating: 4.7,
        reviews: 67,
        photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Wenceslas Square 47, 110 00 Praha 1",
        description: "Specialistka na péči o pleť s 8 lety zkušeností. Zaměřuji se na anti-aging ošetření a regeneraci pleti. Používám nejnovější technologie a prémiové kosmetické produkty.",
        phone: "+420 012 345 678",
        email: "zuzana@beautycenter.cz",
        services: ["Facial", "Skin Treatment", "Anti-aging", "Cleansing"],
        languages: ["Czech", "English", "Russian"],
        salonName: "Beauty Center Prague",
        salonId: "5"
      },
      {
          id: "502",
        name: "Michaela Svobodová",
        specialty: "Eyebrows & Eyelashes",
        experience: "4 let",
        rating: 4.5,
        reviews: 31,
        photo: "https://images.unsplash.com/photo-1580518324671-c2f0833a3af3?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Wenceslas Square 47, 110 00 Praha 1",
        description: "Specialistka na úpravu obočí a řas s 4 lety zkušeností. Vytvářím přirozené a krásné obočí pomocí henny a microblading technik. Specializuji se také na prodlužování řas.",
        phone: "+420 111 222 333",
        email: "michaela@beautycenter.cz",
        services: ["Eyebrows", "Eyelashes", "Eyebrow Shaping", "Lash Extensions"],
        languages: ["Czech", "English", "Russian"],
        salonName: "Beauty Center Prague",
        salonId: "5"
      }
    ],
    coordinates: { lat: 50.0810, lng: 14.4270 }
  },
  {
    id: "6",
    name: "Style Studio Brno",
    city: "Brno",
    address: "Masarykova 15, 602 00 Brno-střed",
    services: ["Haircut", "Hair Coloring", "Makeup", "Nail Art"],
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
        id: "601",
        name: "Tereza Stylová",
        specialty: "Účesy",
        experience: "6 let",
        rating: 4.6,
        reviews: 45,
        photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Masarykova 15, 602 00 Brno-střed",
        description: "Kreativní kadeřnice s 6 lety zkušeností. Specializuji se na svatební účesy a speciální příležitosti. Vytvářím jedinečné a elegantní účesy, které zdůrazní vaši krásu.",
        phone: "+420 222 333 444",
        email: "tereza@stylestudio.cz",
        services: ["Hair Styling", "Wedding Hairstyles", "Haircut", "Hair Coloring"],
        languages: ["Czech", "English", "Slovak"],
        salonName: "Style Studio Brno",
        salonId: "6"
      },
      {
        id: "602",
        name: "Nikola Krásná",
        specialty: "Makeup & Nail Art",
        experience: "3 let",
        rating: 4.3,
        reviews: 31,
        photo: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Masarykova 15, 602 00 Brno-střed",
        description: "Kombinovaná specialistka na makeup a nail art s 3 lety zkušeností. Vytvářím krásné make-upy a jedinečné designy nehtů pro každou příležitost. Zaměřuji se na moderní trendy a kreativní řešení.",
        phone: "+420 333 444 555",
        email: "nikola@stylestudio.cz",
        services: ["Makeup", "Nail Art", "Manicure", "Event Makeup"],
        languages: ["Czech", "English"],
        salonName: "Style Studio Brno",
        salonId: "6"
      }
    ],
    coordinates: { lat: 49.1900, lng: 16.6100 }
  },
  {
    id: "7",
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
        id: "701",
        name: "Anna Relaxová",
        specialty: "Massage Therapy",
        experience: "12 let",
        rating: 4.9,
        reviews: 89,
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Národní třída 25, 110 00 Praha 1",
        description: "Zkušená masérka s 12 lety praxe. Specializuji se na relaxační a terapeutické masáže. Používám přírodní oleje a aromaterapii pro dokonalou relaxaci a regeneraci těla.",
        phone: "+420 444 555 666",
        email: "anna@luxuryspa.cz",
        services: ["Massage", "Relaxation", "Therapeutic Massage", "Aromatherapy"],
        languages: ["Czech", "English", "German", "French"],
        salonName: "Luxury Spa Prague",
        salonId: "7"
      },
      {
        id: "702",
        name: "Jana Wellness",
        specialty: "Facial & Body Treatments",
        experience: "7 let",
        rating: 4.8,
        reviews: 56,
        photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Národní třída 25, 110 00 Praha 1",
        description: "Specialistka na péči o pleť a tělo s 7 lety zkušeností. Zaměřuji se na anti-aging ošetření, detox a regeneraci. Používám nejnovější technologie a prémiové kosmetické produkty.",
        phone: "+420 555 666 777",
        email: "jana@luxuryspa.cz",
        services: ["Facial", "Body Treatment", "Anti-aging", "Detox"],
        languages: ["Czech", "English", "Italian"],
        salonName: "Luxury Spa Prague",
        salonId: "7"
      }
    ],
    coordinates: { lat: 50.0820, lng: 14.4200 }
  },
  {
    id: "8",
    name: "Modern Hair Brno",
    city: "Brno",
    address: "Kobližná 3, 602 00 Brno-střed",
    services: ["Haircut", "Hair Coloring", "Hair Treatment", "Beard Trim"],
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
        id: "801",
        name: "Tomáš Moderní",
        specialty: "Men's Haircuts",
        experience: "9 let",
        rating: 4.7,
        reviews: 78,
        photo: "https://images.unsplash.com/photo-1601455763557-db1bea8a9a5a?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Kobližná 3, 602 00 Brno-střed",
        description: "Specialista na pánské střihy s 9 lety zkušeností. Vytvářím moderní a stylové účesy pro muže všech věkových kategorií. Zaměřuji se na precizní práci a spokojenost klientů.",
        phone: "+420 666 777 888",
        email: "tomas@modernhair.cz",
        services: ["Men's Haircut", "Beard Trim", "Hair Styling", "Hair Wash"],
        languages: ["Czech", "English", "German"],
        salonName: "Modern Hair Brno",
        salonId: "8"
      },
      {
        id: "802",
        name: "Veronika Trendová",
        specialty: "Women's Haircuts and Coloring",
        experience: "5 let",
        rating: 4.5,
        reviews: 34,
        photo: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face&auto=format&q=80",
        worksInSalon: true,
        isFreelancer: false,
        address: "Kobližná 3, 602 00 Brno-střed",
        description: "Kadeřnice specializující se na dámské střihy a barvení s 5 lety zkušeností. Vytvářím moderní účesy a trendy barvení vlasů. Zaměřuji se na individuální přístup ke každé klientce.",
        phone: "+420 777 888 999",
        email: "veronika@modernhair.cz",
        services: ["Women's Haircut", "Hair Coloring", "Highlights", "Hair Styling"],
        languages: ["Czech", "English", "Slovak"],
        salonName: "Modern Hair Brno",
        salonId: "8"
      }
    ],
    coordinates: { lat: 49.1950, lng: 16.6080 }
  }
];

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
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  translations: any;
  initialViewMode?: 'salons' | 'masters';
}

const HomePage: React.FC<HomePageProps> = ({ onSalonSelect, onMasterSelect, onAdminPanel, onPremiumFeatures, currentLanguage, onLanguageChange, translations, initialViewMode = 'salons' }) => {
  const [salons] = useState<Salon[]>(mockSalons);
  const [freelancers] = useState<Master[]>(freelancerMasters);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [displayMode, setDisplayMode] = useState<'list' | 'map'>('list');
  const [filters, setFilters] = useState<SearchFilters>({
    city: "All",
    service: "All",
    searchTerm: "",
    minRating: 0
  });

  const t = translations[currentLanguage];

  // Обновляем viewMode при изменении initialViewMode
  useEffect(() => {
    setViewMode(initialViewMode);
  }, [initialViewMode]);

  // Všichni mistři dohromady (ze salonů + frikanceři)
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

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-top">
          <div className="header-buttons">
            <button onClick={onAdminPanel} className="admin-btn">
              {t.adminPanel}
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
          <SimpleMapView
            salons={filteredSalons}
            masters={filteredMasters}
            language={currentLanguage}
            translations={translations}
            onSalonSelect={onSalonSelect}
            onMasterSelect={onMasterSelect}
            selectedType={viewMode}
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
