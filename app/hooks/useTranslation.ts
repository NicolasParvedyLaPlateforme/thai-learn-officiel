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

export function useTranslation() {
  const language = useProgressStore(state => state.language);
  
  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  return { t, language };
}
