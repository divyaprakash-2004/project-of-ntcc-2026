import React, { createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

const LanguageContext = createContext();

/**
 * Refactored LanguageProvider to leverage the official i18next engine internally,
 * maintaining full backward compatibility with the useLanguage context hook interface.
 */
export function LanguageProvider({ children }) {
  const { t } = useTranslation();

  /**
   * Switches the active locale in i18next and caches the preference in session storage.
   * @param {string} lang Language code ('en', 'hi', 'te')
   */
  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    sessionStorage.setItem('preferred_lang', lang);
  };

  // Get active locale from the i18next engine
  const currentLang = i18n.language || 'en';

  return (
    <LanguageContext.Provider value={{ currentLang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Hook to consume dynamic translations, mapped directly to i18next translation resolvers.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
