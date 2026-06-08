import { createContext, useContext, useState } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    appName: 'Special Kids Therapy Center',
    welcome: 'Welcome',
    welcomeBack: 'Welcome Back',
    signIn: 'Sign In',
    register: 'Register',
    sessions: 'Sessions',
    reports: 'Reports',
    bookNew: 'Book New',
    payments: 'Payments',
    logout: 'Logout',
    language: 'Language',
  },
  es: {
    appName: 'Centro de Terapia Infantil',
    welcome: 'Bienvenido',
    welcomeBack: 'Bienvenido de nuevo',
    signIn: 'Iniciar sesión',
    register: 'Registrarse',
    sessions: 'Sesiones',
    reports: 'Informes',
    bookNew: 'Reservar nueva',
    payments: 'Pagos',
    logout: 'Cerrar sesión',
    language: 'Idioma',
  }
};

export const LanguageProvider = ({ children }) => {
  const [locale, setLocale] = useState(() => {
    return localStorage.getItem('locale') || 'en';
  });

  const changeLanguage = (newLocale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key) => {
    return translations[locale]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
