import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Salon, Master, Language } from './types';
import HomePage from './pages/HomePage';
import SalonDetailPage from './pages/SalonDetailPage';
import MasterDetailPage from './pages/MasterDetailPage';
import AdminPanel from './pages/AdminPanel';
import PremiumFeaturesPage from './pages/PremiumFeaturesPage';
import DashboardRouter from './pages/dashboards/DashboardRouter';
import AuthModal from './components/auth/AuthModal';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { useSalonsData } from './hooks/useAppData';
import { salonService, masterService } from './firebase/services';
import { useLanguage, useSetLanguage, useCurrentViewMode, useSetCurrentViewMode } from './store/useStore';
import './App.css';

// Импортируем mock данные
// Убраны тестовые данные - теперь используются только реальные данные из Firebase
const mockSalons: Salon[] = [];

const translations = {
  cs: {
    title: "BeautyFind.cz",
    subtitle: "Váš průvodce světem krásy v Česku",
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
    back: "← Zpět",
    contact: "Kontakty",
    services: "Služby",
    languages: "Jazyky",
    location: "Umístění",
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
    rating: "Hodnocení",
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
    photosHelp: "Nahrajte fotografie vašeho salonu (max 10)",
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
    photoHelp: "Nahrajte svou profesionální fotografii (max 1)"
  },
  en: {
    title: "BeautyFind.cz",
    subtitle: "The Czech Beauty Guide",
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
    back: "← Back",
    contact: "Contact",
    services: "Services",
    languages: "Languages",
    location: "Location",
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
    rating: "Rating",
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
    photosHelp: "Upload photos of your salon (max 10)",
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
    photoHelp: "Upload your professional photo (max 1)"
  }
};

function AppContent() {
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [prevPathForPremium, setPrevPathForPremium] = useState<string | null>(null);
  const [prevPathForAdmin, setPrevPathForAdmin] = useState<string | null>(null);
  const [premiumFromAdmin, setPremiumFromAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Используем глобальное состояние
  const currentLanguage = useLanguage();
  const setCurrentLanguage = useSetLanguage();
  const currentViewMode = useCurrentViewMode();
  const setCurrentViewMode = useSetCurrentViewMode();
  
  // Используем аутентификацию
  const { currentUser, userProfile } = useAuth();
  
  // Загружаем реальные данные салонов
  const salonsData = useSalonsData();
  const salons = salonsData?.salons && salonsData.salons.length > 0 ? salonsData.salons : mockSalons;

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
    setCurrentViewMode('salons');
    navigate(`/salon/${salon.id}`);
  };


  const handleMasterSelect = (master: Master) => {
    setSelectedMaster(master);
    setCurrentViewMode('masters');
    navigate(`/master/${master.id}`);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      setSelectedSalon(null);
      setSelectedMaster(null);
      setCurrentViewMode('salons');
      navigate('/');
    }
  };

  const handleBackFromMaster = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      setSelectedMaster(null);
      setCurrentViewMode('masters');
      navigate('/');
    }
  };

  const handleBackFromMap = () => {
    setCurrentViewMode('map');
    navigate('/');
  };

  const handleAdminPanel = () => {
    setPrevPathForAdmin(location.pathname);
    setShowAdminPanel(true);
  };

  const goToRegistration = () => {
    setPrevPathForAdmin(location.pathname);
    setShowAdminPanel(true);
  };

  const handleBackFromAdmin = () => {
    const target = prevPathForAdmin;
    setShowAdminPanel(false);
    if (target) {
      setPrevPathForAdmin(null);
      navigate(target);
    }
  };

  const handleGoToHome = () => {
    setShowAdminPanel(false);
    setShowDashboard(false);
    setShowAuthModal(false);
    setShowPremiumFeatures(false);
    setPrevPathForAdmin(null);
    setPrevPathForPremium(null);
    setPremiumFromAdmin(false);
    navigate('/');
  };


  const handlePremiumFeatures = () => {
    setPrevPathForPremium(location.pathname);
    setShowPremiumFeatures(true);
  };

  const handleBackFromPremium = () => {
    if (premiumFromAdmin) {
      setShowPremiumFeatures(false);
      setShowAdminPanel(true);
      setPremiumFromAdmin(false);
      return;
    }
    const target = prevPathForPremium;
    setShowPremiumFeatures(false);
    if (target) {
      setPrevPathForPremium(null);
      if (target !== location.pathname) navigate(target);
    }
  };

  const handleBackFromAdminHeader = () => {
    setShowAdminPanel(false);
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      handleGoToHome();
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowDashboard(true);
  };

  const handleAuthSuccessFromAdmin = () => {
    setShowAuthModal(false);
    setShowAdminPanel(false);
    setPrevPathForAdmin(null);
    setShowDashboard(true);
  };

  const handleAuthSuccessFromPremium = () => {
    setShowAuthModal(false);
    setShowPremiumFeatures(false);
    setPrevPathForPremium(null);
    setShowDashboard(true);
  };

  const handleBackFromDashboard = () => {
    setShowDashboard(false);
    setCurrentViewMode('salons'); // Устанавливаем режим списка салонов при возврате
  };

  const handleOpenAuth = () => {
    // Если пользователь уже залогинен, переходим в кабинет
    if (currentUser && userProfile) {
      setShowDashboard(true);
    } else {
      // Если не залогинен, показываем форму входа
      setShowAuthModal(true);
    }
  };

  // Route components that support direct URL access without prior selection
  const SalonDetailRoute: React.FC = () => {
    const params = useParams();
    const id = params.id as string | undefined;
    const [entity, setEntity] = React.useState<Salon | null>(
      selectedSalon && selectedSalon.id === id ? selectedSalon : null
    );
    const [showLoading, setShowLoading] = React.useState(false);
    React.useEffect(() => {
      let active = true;
      const t = setTimeout(() => setShowLoading(true), 150);
      (async () => {
        if (!entity && id) {
          try {
            const fetched = await salonService.getById(id);
            if (active && fetched) setEntity(fetched);
          } catch {}
        }
      })();
      return () => { active = false; clearTimeout(t); };
    }, [id, entity]);
    if (!id) return <div>Salon not found</div>;
    if (!entity) return showLoading ? <div>Loading...</div> : null;
    return (
      <SalonDetailPage
        salon={entity}
        language={currentLanguage}
        translations={translations}
        onBack={handleBack}
        onMasterSelect={handleMasterSelect}
        onLanguageChange={setCurrentLanguage}
        onNavigateToDashboard={() => {
          navigate('/');
          setShowDashboard(true);
        }}
      />
    );
  };

  const MasterDetailRoute: React.FC = () => {
    const params = useParams();
    const id = params.id as string | undefined;
    const [entity, setEntity] = React.useState<Master | null>(
      selectedMaster && selectedMaster.id === id ? selectedMaster : null
    );
    const [showLoading, setShowLoading] = React.useState(false);
    React.useEffect(() => {
      let active = true;
      const t = setTimeout(() => setShowLoading(true), 150);
      (async () => {
        if (!entity && id) {
          try {
            const fetched = await masterService.getById(id);
            if (active && fetched) setEntity(fetched);
          } catch {}
        }
      })();
      return () => { active = false; clearTimeout(t); };
    }, [id, entity]);
    if (!id) return <div>Master not found</div>;
    if (!entity) return showLoading ? <div>Loading...</div> : null;
    return (
      <MasterDetailPage
        master={entity}
        language={currentLanguage}
        translations={translations}
        onBack={handleBackFromMaster}
        onSalonSelect={handleSalonSelect}
        salons={salons}
        onLanguageChange={setCurrentLanguage}
        onNavigateToDashboard={() => {
          navigate('/');
          setShowDashboard(true);
        }}
      />
    );
  };

  // При выходе скрываем кабинет/модалки, но не уводим гостя с детальных страниц
  React.useEffect(() => {
    if (!currentUser) {
      const wasDashboardOpen = showDashboard;
      setShowDashboard(false);
      // Keep AdminPanel open when logging out from Registrace to start a new registration
      // setShowAdminPanel(false); // removed to stay on Registrace
      setShowAuthModal(false);
      setSelectedSalon(null);
      setSelectedMaster(null);
      if (wasDashboardOpen) {
        setCurrentViewMode('salons');
        navigate('/');
      }
    }
  }, [currentUser, navigate, setCurrentViewMode, showDashboard]);

  if (showAdminPanel) {
    return (
      <>
        <AdminPanel
          language={currentLanguage}
          onLanguageChange={setCurrentLanguage}
          translations={{
            cs: {
              adminPanel: "Admin Panel",
              back: "← Zpět",
              backToHome: "← Zpět",
              registerSalon: "Zaregistrovat salon",
              registerMaster: "Registrovat mistra",
              salonRegistrationInfo: "Registrace nového salonu",
              masterRegistrationInfo: "Registrace nového mistra",
              salonRegistrationDescription: "Zaregistrujte svůj salon a získejte více klientů",
              masterRegistrationDescription: "Zaregistrujte se jako mistr a najděte nové klienty",
              clientRegistrationDescription: "Zaregistrujte se jako klient a najděte nejlepší salony a mistry",
              benefits: "Výhody",
              benefit1: "Všechny salony a mistři na jednom místě",
              benefit2: "Najděte mistra poblíž vás",
              benefit3: "Rychlé rezervace",
              benefit4: "Vyhledávání podle recenzí",
              benefit5: "Snadné porovnání cen",
              masterBenefit1: "Nové klienty a zákazníky",
              masterBenefit2: "Profesionální prezentace",
              masterBenefit3: "Snadné řízení rezervací",
              masterBenefit4: "Marketing a reklama",
              masterRequirement3: "Kvalifikace a certifikáty",
              salonBenefit1: "Zvýšení viditelnosti salonu",
              salonBenefit2: "Více klientů a zákazníků",
              salonBenefit3: "Snadné řízení rezervací",
              salonBenefit4: "Prezentace všech služeb a mistrů",
              paymentMethods: "Způsoby platby",
              paymentCash: "Platba v hotovosti",
              paymentCard: "Platba kartou",
              paymentQR: "QR kód",
              paymentAccount: "Platba na účet",
              paymentVoucher: "Dárkový poukaz",
              paymentBenefit: "Benefitní karty",
              selectPaymentMethods: "Způsoby platby *",
              atLeastOnePayment: "Vyberte alespoň jeden způsob platby",
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
              photosHelp: "Nahrajte fotografie vašeho salonu (max 10)",
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
              photoHelp: "Nahrajte svou profesionální fotografii (max 1)"
            },
            en: {
              adminPanel: "Admin Panel",
              back: "← Back",
              backToHome: "← Back",
              registerSalon: "Register Salon",
              registerMaster: "Register Master",
              salonRegistrationInfo: "New Salon Registration",
              masterRegistrationInfo: "New Master Registration",
              salonRegistrationDescription: "Register your salon and get more clients",
              masterRegistrationDescription: "Register as a master and find new clients",
              clientRegistrationDescription: "Register as a client and find the best salons and masters",
              benefits: "Benefits",
              benefit1: "All salons and masters in one place",
              benefit2: "Find a master near you",
              benefit3: "Quick booking",
              benefit4: "Search by reviews",
              benefit5: "Easy price comparison",
              masterBenefit1: "New clients and customers",
              masterBenefit2: "Professional presentation",
              masterBenefit3: "Easy booking management",
              masterBenefit4: "Marketing and advertising",
              masterRequirement3: "Qualifications and certificates",
              salonBenefit1: "Increase salon visibility",
              salonBenefit2: "More clients and customers",
              salonBenefit3: "Easy booking management",
              salonBenefit4: "Showcase all services and masters",
              paymentMethods: "Payment methods",
              paymentCash: "Cash payment",
              paymentCard: "Card payment",
              paymentQR: "QR code",
              paymentAccount: "Bank transfer",
              paymentVoucher: "Gift voucher",
              paymentBenefit: "Benefit cards",
              selectPaymentMethods: "Select payment methods *",
              atLeastOnePayment: "Select at least one payment method",
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
              photosHelp: "Upload photos of your salon (max 10)",
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
              photoHelp: "Upload your professional photo (max 1)"
            }
          }}
          onBack={handleBackFromAdmin}
          onGoToHome={handleGoToHome}
          onOpenAuth={handleOpenAuth}
          onOpenPremium={() => { setShowAdminPanel(false); setPrevPathForPremium('/admin'); setShowPremiumFeatures(true); setPremiumFromAdmin(true); }}
          onOpenDashboard={() => { setShowAdminPanel(false); setShowPremiumFeatures(false); setPrevPathForAdmin(null); setPrevPathForPremium(null); setShowDashboard(true); }}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccessFromAdmin}
          language={currentLanguage}
          onGoToRegistration={goToRegistration}
        />
      </>
    );
  }

  if (showPremiumFeatures) {
    return (
      <>
        <PremiumFeaturesPage
          language={currentLanguage}
          translations={translations}
          onBack={handleBackFromPremium}
          onLanguageChange={setCurrentLanguage}
          onOpenAuth={handleOpenAuth}
          onOpenRegistration={handleAdminPanel}
          isLoggedIn={!!(currentUser && userProfile)}
          userName={userProfile?.name}
          onOpenDashboard={() => { setShowPremiumFeatures(false); setShowDashboard(true); }}
          onGoHome={handleGoToHome}
        />
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccessFromPremium}
          language={currentLanguage}
          onGoToRegistration={goToRegistration}
        />
      </>
    );
  }

  // Проверяем, находимся ли мы на детальных страницах
  const isOnDetailPage = location.pathname.startsWith('/salon/') || location.pathname.startsWith('/master/');
  
  if (showDashboard && !isOnDetailPage) {
    return (
      <DashboardRouter
        language={currentLanguage}
        onBack={handleBackFromDashboard}
        onLanguageChange={setCurrentLanguage}
        onNavigate={(path: string) => navigate(path)}
        onOpenRegistration={handleAdminPanel}
        onOpenPremium={handlePremiumFeatures}
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
              onOpenAuth={handleOpenAuth}
              currentLanguage={currentLanguage}
              onLanguageChange={setCurrentLanguage}
              translations={translations}
              initialViewMode={currentViewMode}
              isLoggedIn={!!(currentUser && userProfile)}
              userProfile={userProfile}
            />
          }
          />
        <Route path="/salon/:id" element={<SalonDetailRoute />} />
        <Route path="/master/:id" element={<MasterDetailRoute />} />
      </Routes>
      
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
        language={currentLanguage}
        onGoToRegistration={goToRegistration}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;