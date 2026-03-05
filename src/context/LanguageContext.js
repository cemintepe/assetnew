import React, { createContext, useState, useContext } from 'react';
import { translate } from '../languages';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [selectedLang, setSelectedLang] = useState('TR');

  // Yardımcı fonksiyon: Hem dili hem çeviri fonksiyonunu tek paket yapıyoruz
  const t = (key) => translate(selectedLang, key);

  return (
    <LanguageContext.Provider value={{ selectedLang, setSelectedLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom Hook: Sayfaların içinde kullanmak için kolay yol
export const useLanguage = () => useContext(LanguageContext);