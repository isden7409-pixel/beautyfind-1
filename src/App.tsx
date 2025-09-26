import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Salon, Master, Language } from './types';
import HomePage from './pages/HomePage';
import SalonDetailPage from './pages/SalonDetailPage';
import MasterDetailPage from './pages/MasterDetailPage';
import AdminPanel from './pages/AdminPanel';
import './App.css';

function App() {
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedMaster, setSelectedMaster] = useState<Master | null>(null);
  const [currentLanguage] = useState<Language>('cs');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const handleSalonSelect = (salon: Salon) => {
    setSelectedSalon(salon);
  };

  const handleMasterSelect = (master: Master) => {
    setSelectedMaster(master);
  };

  const handleBack = () => {
    setSelectedSalon(null);
    setSelectedMaster(null);
  };

  const handleAdminPanel = () => {
    setShowAdminPanel(true);
  };

  const handleBackFromAdmin = () => {
    setShowAdminPanel(false);
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
            description: "Popis",
            descriptionPlaceholder: "Popište váš salon a služby...",
            services: "Služby",
            photos: "Fotografie",
            photosHelp: "Nahrajte fotografie vašeho salonu (max 5)",
            cancel: "Zrušit",
            register: "Registrovat",
            registrationSuccess: "Registrace byla úspěšná!",
            masterName: "Jméno mistra",
            specialty: "Specializace",
            experience: "Zkušenosti",
            freelancer: "Frikancer",
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
            description: "Description",
            descriptionPlaceholder: "Describe your salon and services...",
            services: "Services",
            photos: "Photos",
            photosHelp: "Upload photos of your salon (max 5)",
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

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                onSalonSelect={handleSalonSelect}
                onMasterSelect={handleMasterSelect}
                onAdminPanel={handleAdminPanel}
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
                  translations={{
                    cs: {
                      back: "← Zpět na vyhledávání",
                      contact: "Kontakt",
                      services: "Služby",
                      book: "Rezervovat termín",
                      reviews: "recenzí",
                      experience: "zkušeností",
                      addReview: "Přidat recenzi",
                      writeReview: "Napsat recenzi",
                      yourName: "Vaše jméno",
                      rating: "Hodnocení",
                      comment: "Komentář",
                      commentPlaceholder: "Napište svůj komentář...",
                      submitReview: "Odeslat recenzi",
                      noReviews: "Zatím nejsou žádné recenze",
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
                      howItWorks: "Jak to funguje",
                      step1Title: "Vyberte balíček",
                      step1Description: "Zvolte si délku prémiového zobrazení",
                      step2Title: "Zaplaťte",
                      step2Description: "Bezpečná platba kartou nebo převodem",
                      step3Title: "Začněte získávat klienty",
                      step3Description: "Váš profil bude zobrazen na vrcholu"
                    },
                    en: {
                      back: "← Back to search",
                      contact: "Contact",
                      services: "Services",
                      book: "Book Appointment",
                      reviews: "reviews",
                      experience: "experience"
                    }
                  }}
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
                  translations={{
                    cs: {
                      back: "← Zpět na vyhledávání",
                      contact: "Kontakt",
                      services: "Služby",
                      book: "Rezervovat termín",
                      reviews: "recenzí",
                      experience: "zkušeností",
                      freelancer: "🏠 Frikancer",
                      inSalon: "🏢 V salonu"
                    },
                    en: {
                      back: "← Back to search",
                      contact: "Contact",
                      services: "Services",
                      book: "Book Appointment",
                      reviews: "reviews",
                      experience: "experience",
                      freelancer: "🏠 Freelancer",
                      inSalon: "🏢 In Salon",
                      addReview: "Add Review",
                      writeReview: "Write Review",
                      yourName: "Your Name",
                      rating: "Rating",
                      comment: "Comment",
                      commentPlaceholder: "Write your comment...",
                      submitReview: "Submit Review",
                      noReviews: "No reviews yet",
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
                      howItWorks: "How it works",
                      step1Title: "Choose package",
                      step1Description: "Select the duration of premium display",
                      step2Title: "Pay",
                      step2Description: "Secure payment by card or transfer",
                      step3Title: "Start getting clients",
                      step3Description: "Your profile will be displayed at the top"
                    }
                  }}
                  onBack={handleBack}
                />
              ) : (
                <div>Master not found</div>
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;