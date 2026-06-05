import { useProgressStore, AppLanguage } from '../lib/store';
import fr from '../locales/fr.json';
import en from '../locales/en.json';
import de from '../locales/de.json';
import es from '../locales/es.json';
import it from '../locales/it.json';

const dictionaries: Record<AppLanguage, Record<string, string>> = {
  fr,
  en,
  de,
  es,
  it
};

export function getTranslation(key: string, currentLanguage: AppLanguage | string): string {
  const dict = dictionaries[currentLanguage as AppLanguage] || dictionaries['en'];
  if (!dict[key] || dict[key].trim() === '') {
    return dictionaries['en'][key] || key;
  }
  return dict[key];
}

export function getLocalizedField(item: any, fieldBase: string, currentLanguage: string): string {
  if (!item) return '';

  if (fieldBase === '') {
     if (item[currentLanguage] && item[currentLanguage].trim() !== '') return item[currentLanguage];
     if (item['en'] && item['en'].trim() !== '') return item['en'];
     return item['fr'] || '';
  }

  const capLang = currentLanguage.charAt(0).toUpperCase() + currentLanguage.slice(1);
  const localizedKey = currentLanguage === 'fr' ? fieldBase : `${fieldBase}${capLang}`;

  if (item[localizedKey] && item[localizedKey].trim() !== '') {
    return item[localizedKey];
  }

  const enKey = `${fieldBase}En`;
  if (item[enKey] && item[enKey].trim() !== '') {
    return item[enKey];
  }

  return item[fieldBase] || '';
}

export function useTranslation() {
  const language = useProgressStore(state => state.language);
  
  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  return { t, language };
}
