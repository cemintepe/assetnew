import tr from './tr';
import en from './en'; 
import ru from './ru';
import ro from './ro';

const translations = { TR: tr, EN: en, RU: ru, RO: ro };

export const translate = (lang, key) => {
  const keys = key.split('.');
  // translations[lang] üzerinden objeyi bulup derinlere iniyoruz
  const result = keys.reduce((obj, k) => obj && obj[k], translations[lang]);
  
  // Eğer sonuç bulunamazsa anahtarın kendisini döndür (Örn: "auth.new_button")
  return result || key;
};