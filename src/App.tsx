import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Salon, Master, Language } from './types';
import HomePage from './pages/HomePage';
import SalonDetailPage from './pages/SalonDetailPage';
import MasterDetailPage from './pages/MasterDetailPage';
import AdminPanel from './pages/AdminPanel';
import PremiumFeaturesPage from './pages/PremiumFeaturesPage';
import './App.css';

// Импортируем mock данные
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
    coordinates: { lat: 50.0755, lng: 14.4378 },
    description: "Luxury beauty salon in the heart of Prague offering premium beauty services.",
    phone: "+420 123 456 789",
    email: "info@elegancebeauty.cz",
    website: "www.elegancebeauty.cz",
    openHours: "Mon-Fri: 9:00-19:00, Sat: 9:00-17:00",
    photos: [],
    masters: []
  },
  {
    id: "2", 
    name: "Modern Style Brno",
    city: "Brno",
    address: "Náměstí Svobody 8, 602 00 Brno",
    services: ["Haircut", "Hair Coloring", "Hair Styling", "Barber"],
    rating: 4.6,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&h=300&fit=crop&crop=center",
    coordinates: { lat: 49.1951, lng: 16.6068 },
    description: "Contemporary hair salon specializing in modern cuts and coloring techniques.",
    phone: "+420 987 654 321",
    email: "info@modernstyle.cz",
    website: "www.modernstyle.cz",
    openHours: "Mon-Fri: 8:00-18:00, Sat: 8:00-16:00",
    photos: [],
    masters: []
  },
  {
    id: "3",
    name: "Nail Art Studio Ostrava", 
    city: "Ostrava",
    address: "Stodolní 1, 702 00 Ostrava",
    services: ["Manicure", "Pedicure", "Nail Art", "Gel Nails"],
    rating: 4.9,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&h=300&fit=crop&crop=center",
    coordinates: { lat: 49.8209, lng: 18.2625 },
    description: "Professional nail art studio with creative designs and premium nail care services.",
    phone: "+420 555 123 456",
    email: "info@nailartstudio.cz",
    website: "www.nailartstudio.cz", 
    openHours: "Mon-Fri: 9:00-20:00, Sat: 9:00-18:00",
    photos: [],
    masters: []
  }
];

const translations = {
  cs: {
    title: "BeautyFind.cz",
    subtitle: "Najděte svůj perfektní kosmetický salon v Česku",
    searchPlaceholder: "Hledat salony, služby nebo města...",
    allCities: "Všechna města",
    allServices: "Všechny služby",
    foundSalons: "Nalezeno {count} salonů",
    foundMasters: "Nalezeno {count} mistrů",
    addressIcon: "📍",
    ratingIcon: "⭐",
    reviews: "recenzí",
    viewDetails: "Zobrazit detaily",
    noResults: "Nebyl nalezen žádný salon odpovídající kritériím",
    noMasters: "Nebyl nalezen žádný mistr odpovídající kritériím",
    viewSalons: "Salony",
    viewMasters: "Mistři",
    freelancer: "🏠 Samostatný pracovník",
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
    step3Desc: "Váš profil bude zobrazen na vrcholu",
    premiumFeatures: "Prémiové funkce",
    premiumDescription: "Zvyšte svou viditelnost a přilákejte více klientů",
    purchaseNow: "Koupit nyní",
    purchaseConfirm: "Zakoupeno",
    day: "den",
    week: "týden",
    month: "měsíc",
    benefit1: "Zobrazení na vrcholu výsledků",
    benefit2: "Zvýrazněný profil",
    benefit3: "Více zákazníků",
    benefit4: "Statistiky a analýzy",
    step1Title: "Vyberte balíček",
    step1Description: "Zvolte si délku prémiového zobrazení",
    step2Title: "Zaplaťte",
    step2Description: "Bezpečná platba kartou nebo převodem",
    step3Title: "Začněte získávat klienty",
    step3Description: "Váš profil bude zobrazen na vrcholu",
    back: "← Zpět na vyhledávání",
    contact: "Kontakt",
    services: "Služby",
    book: "Rezervovat termín",
    // Booking translations
    bookWith: "Rezervovat u",
    selectService: "Vyberte službu",
    selectDateAndTime: "Vyberte datum a čas",
    selectTime: "Vyberte čas",
    contactDetails: "Kontaktní údaje",
    bookingSummary: "Shrnutí rezervace",
    master: "Mistr",
    salon: "Salon",
    service: "Služba",
    selectMaster: "Vyberte mistra",
    selectMasterForService: "Vyberte mistra pro službu",
    selectedService: "Vybraná služba",
    availableMasters: "Dostupní mistři",
    noMastersAvailable: "Pro tuto službu nejsou dostupní žádní mistři",
    duration: "Doba trvání",
    date: "Datum",
    time: "Čas",
    price: "Cena",
    minutes: "minut",
    fullName: "Celé jméno",
    phoneNumber: "Telefonní číslo",
    emailAddress: "Emailová adresa",
    additionalNotes: "Dodatečné poznámky",
    enterFullName: "Zadejte celé jméno",
    enterPhoneNumber: "Zadejte telefonní číslo",
    enterEmailAddress: "Zadejte emailovou adresu",
    enterAdditionalNotes: "Zadejte dodatečné poznámky",
    confirmBooking: "Potvrdit rezervaci",
    bookingSuccess: "Rezervace byla úspěšně vytvořena!",
    bookingError: "Chyba při vytváření rezervace",
    pleaseEnterName: "Prosím zadejte jméno",
    pleaseEnterPhone: "Prosím zadejte telefonní číslo",
    pleaseEnterEmail: "Prosím zadejte emailovou adresu",
    loading: "Načítání",
    addReview: "Přidat recenzi",
    writeReview: "Napsat recenzi",
    yourName: "Vaše jméno",
    comment: "Komentář",
    commentPlaceholder: "Napište svůj komentář...",
    submitReview: "Odeslat recenzi",
    noReviews: "Zatím nejsou žádné recenze",
    salonName: "Název salonu",
    city: "Město",
    address: "Adresa",
    phone: "Telefon",
    email: "Email",
    website: "Webové stránky",
    openHours: "Otevírací doba",
    openHoursPlaceholder: "Po-Pá: 9:00-20:00, So: 10:00-18:00",
    description: "Popis",
    descriptionPlaceholder: "Popište váš salon a služby...",
    servicesLabel: "Služby",
    photos: "Fotografie",
    photosHelp: "Nahrajte fotografie vašeho salonu (max 5)",
    selectFiles: "Vybrat soubory",
    noFileSelected: "Soubor není vybrán",
    filesSelected: "souborů vybráno",
    fileSelected: "soubor vybrán",
    cancel: "Zrušit",
    register: "Registrovat",
    registrationSuccess: "Registrace byla úspěšná!",
    masterName: "Jméno mistra",
    specialty: "Specializace",
    experienceLabel: "Zkušenosti",
    freelancerLabel: "Samostatný pracovník",
    selectCity: "Vyberte město",
    selectSalon: "Vyberte salon",
    photo: "Fotografie",
    photoHelp: "Nahrajte svou profesionální fotografii"
  },
  en: {
    title: "BeautyFind.cz",
    subtitle: "Find your perfect beauty salon in Czech Republic",
    searchPlaceholder: "Search for salons, services, or cities...",
    allCities: "All Cities",
    allServices: "All Services",
    foundSalons: "Found {count} salons",
    foundMasters: "Found {count} masters",
    addressIcon: "📍",
    ratingIcon: "⭐",
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
    step3Desc: "Your profile will be displayed at the top",
    premiumFeatures: "Premium Features",
    premiumDescription: "Increase your visibility and attract more clients",
    purchaseNow: "Purchase Now",
    purchaseConfirm: "Purchased",
    day: "day",
    week: "week",
    month: "month",
    benefit1: "Top search results display",
    benefit2: "Highlighted profile",
    benefit3: "More customers",
    benefit4: "Statistics and analytics",
    step1Title: "Choose package",
    step1Description: "Select the duration of premium display",
    step2Title: "Pay",
    step2Description: "Secure payment by card or transfer",
    step3Title: "Start getting clients",
    step3Description: "Your profile will be displayed at the top",
    back: "← Back to search",
    contact: "Contact",
    services: "Services",
    book: "Book Appointment",
    // Booking translations
    bookWith: "Book with",
    selectService: "Select Service",
    selectDateAndTime: "Select Date and Time",
    selectTime: "Select Time",
    contactDetails: "Contact Details",
    bookingSummary: "Booking Summary",
    master: "Master",
    salon: "Salon",
    service: "Service",
    selectMaster: "Select Master",
    selectMasterForService: "Select Master for Service",
    selectedService: "Selected Service",
    availableMasters: "Available Masters",
    noMastersAvailable: "No masters available for this service",
    duration: "Duration",
    date: "Date",
    time: "Time",
    price: "Price",
    minutes: "minutes",
    fullName: "Full Name",
    phoneNumber: "Phone Number",
    emailAddress: "Email Address",
    additionalNotes: "Additional Notes",
    enterFullName: "Enter full name",
    enterPhoneNumber: "Enter phone number",
    enterEmailAddress: "Enter email address",
    enterAdditionalNotes: "Enter additional notes",
    confirmBooking: "Confirm Booking",
    bookingSuccess: "Booking created successfully!",
    bookingError: "Error creating booking",
    pleaseEnterName: "Please enter name",
    pleaseEnterPhone: "Please enter phone number",
    pleaseEnterEmail: "Please enter email address",
    loading: "Loading",
    addReview: "Add Review",
    writeReview: "Write Review",
    yourName: "Your Name",
    comment: "Comment",
    commentPlaceholder: "Write your comment...",
    submitReview: "Submit Review",
    noReviews: "No reviews yet",
    salonName: "Salon Name",
    city: "City",
    address: "Address",
    phone: "Phone",
    email: "Email",
    website: "Website",
    openHours: "Opening Hours",
    openHoursPlaceholder: "Mon-Fri: 9:00-20:00, Sat: 10:00-18:00",
    description: "Description",
    descriptionPlaceholder: "Describe your salon and services...",
    servicesLabel: "Services",
    photos: "Photos",
    photosHelp: "Upload photos of your salon (max 5)",
    selectFiles: "Select Files",
    noFileSelected: "No file selected",
    filesSelected: "files selected",
    fileSelected: "file selected",
    cancel: "Cancel",
    register: "Register",
    registrationSuccess: "Registration successful!",
    masterName: "Master Name",
    specialty: "Specialty",
    experienceLabel: "Experience",
    freelancerLabel: "Freelancer",
    selectCity: "Select City",
    selectSalon: "Select Salon",
    photo: "Photo",
    photoHelp: "Upload your professional photo"
  }
};

function AppContent() {
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('cs');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const [currentViewMode, setCurrentViewMode] = useState<'salons' | 'masters'>('salons');
  const navigate = useNavigate();

  const handleSalonSelect = (salon: Salon) => {
    console.log('Salon selected:', salon);
    setSelectedSalon(salon);
    setCurrentViewMode('salons');
    navigate(`/salon/${salon.id}`);
  };


  const handleMasterSelect = (master: Master) => {
    console.log('Master selected:', master);
    setSelectedMaster(master);
    setCurrentViewMode('masters');
    navigate(`/master/${master.id}`);
  };

  const handleBack = () => {
    setSelectedSalon(null);
    setSelectedMaster(null);
    setCurrentViewMode('salons');
    navigate('/');
  };

  const handleBackFromMaster = () => {
    setSelectedMaster(null);
    setCurrentViewMode('masters');
    navigate('/');
  };

  const handleAdminPanel = () => {
    setShowAdminPanel(true);
  };

  const handleBackFromAdmin = () => {
    setShowAdminPanel(false);
  };

  const handlePremiumFeatures = () => {
    setShowPremiumFeatures(true);
  };

  const handleBackFromPremium = () => {
    setShowPremiumFeatures(false);
  };

  if (showAdminPanel) {
    return (
      <AdminPanel
        language={currentLanguage}
        translations={{
          cs: {
            adminPanel: "Admin Panel",
            back: "← Zpět",
            backToHome: "← Zpět na hlavní stránku",
            registerSalon: "Registrovat salon",
            registerMaster: "Registrovat mistra",
            salonRegistrationInfo: "Registrace nového salonu",
            masterRegistrationInfo: "Registrace nového mistra",
            salonRegistrationDescription: "Zaregistrujte svůj salon a získejte více klientů",
            masterRegistrationDescription: "Zaregistrujte se jako mistr a najděte nové klienty",
            benefits: "Výhody",
            benefit1: "Více klientů a zákazníků",
            benefit2: "Profesionální prezentace",
            benefit3: "Snadné řízení rezervací",
            benefit4: "Marketing a reklama",
            requirements: "Požadavky",
            requirement1: "Licence na provozování",
            requirement2: "Profesionální vybavení",
            requirement3: "Kvalifikované zaměstnance",
            requirement4: "Dodržování hygienických standardů",
            startSalonRegistration: "Začít registraci salonu",
            startMasterRegistration: "Začít registraci mistra",
            salonName: "Název salonu",
            city: "Město",
            address: "Adresa",
            phone: "Telefon",
            email: "Email",
            website: "Webové stránky",
            openHours: "Otevírací doba",
            openHoursPlaceholder: "Po-Pá: 9:00-20:00, So: 10:00-18:00",
            description: "Popis",
            descriptionPlaceholder: "Popište váš salon a služby...",
            services: "Služby",
            photos: "Fotografie",
            photosHelp: "Nahrajte fotografie vašeho salonu (max 5)",
            selectFiles: "Vybrat soubory",
            noFileSelected: "Soubor není vybrán",
            filesSelected: "souborů vybráno",
            fileSelected: "soubor vybrán",
            cancel: "Zrušit",
            register: "Registrovat",
            registrationSuccess: "Registrace byla úspěšná!",
            masterName: "Jméno mistra",
            specialty: "Specializace",
            experience: "Zkušenosti",
            freelancer: "Samostatný pracovník",
            selectCity: "Vyberte město",
            selectSalon: "Vyberte salon",
            photo: "Fotografie",
            photoHelp: "Nahrajte svou profesionální fotografii"
          },
          en: {
            adminPanel: "Admin Panel",
            back: "← Back",
            backToHome: "← Back to Home",
            registerSalon: "Register Salon",
            registerMaster: "Register Master",
            salonRegistrationInfo: "New Salon Registration",
            masterRegistrationInfo: "New Master Registration",
            salonRegistrationDescription: "Register your salon and get more clients",
            masterRegistrationDescription: "Register as a master and find new clients",
            benefits: "Benefits",
            benefit1: "More clients and customers",
            benefit2: "Professional presentation",
            benefit3: "Easy booking management",
            benefit4: "Marketing and advertising",
            requirements: "Requirements",
            requirement1: "Business license",
            requirement2: "Professional equipment",
            requirement3: "Qualified staff",
            requirement4: "Hygiene standards compliance",
            startSalonRegistration: "Start Salon Registration",
            startMasterRegistration: "Start Master Registration",
            salonName: "Salon Name",
            city: "City",
            address: "Address",
            phone: "Phone",
            email: "Email",
            website: "Website",
            openHours: "Opening Hours",
            openHoursPlaceholder: "Mon-Fri: 9:00-20:00, Sat: 10:00-18:00",
            description: "Description",
            descriptionPlaceholder: "Describe your salon and services...",
            services: "Services",
            photos: "Photos",
            photosHelp: "Upload photos of your salon (max 5)",
            selectFiles: "Select Files",
            noFileSelected: "No file selected",
            filesSelected: "files selected",
            fileSelected: "file selected",
            cancel: "Cancel",
            register: "Register",
            registrationSuccess: "Registration successful!",
            masterName: "Master Name",
            specialty: "Specialty",
            experience: "Experience",
            freelancer: "Freelancer",
            selectCity: "Select City",
            selectSalon: "Select Salon",
            photo: "Photo",
            photoHelp: "Upload your professional photo"
          }
        }}
        onBack={handleBackFromAdmin}
      />
    );
  }

  if (showPremiumFeatures) {
    return (
      <PremiumFeaturesPage
        language={currentLanguage}
        translations={translations}
        onBack={handleBackFromPremium}
      />
    );
  }

  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onSalonSelect={handleSalonSelect}
              onMasterSelect={handleMasterSelect}
              onAdminPanel={handleAdminPanel}
              onPremiumFeatures={handlePremiumFeatures}
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              translations={translations}
              initialViewMode={currentViewMode}
            />
          }
          />
        <Route
          path="/salon/:id"
          element={
            selectedSalon ? (
              <SalonDetailPage
                salon={selectedSalon}
                language={currentLanguage}
                translations={translations}
                  onBack={handleBack}
                  onMasterSelect={handleMasterSelect}
                />
              ) : (
                <div>Salon not found</div>
              )
            }
          />
          <Route
            path="/master/:id"
            element={
              selectedMaster ? (
                <MasterDetailPage
                  master={selectedMaster}
                  language={currentLanguage}
                  translations={translations}
                  onBack={handleBackFromMaster}
                  onSalonSelect={handleSalonSelect}
                  salons={mockSalons}
                />
              ) : (
                <div>Master not found</div>
              )
            }
          />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;