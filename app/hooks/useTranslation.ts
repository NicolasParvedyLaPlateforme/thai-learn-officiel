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

export function useTranslation() {
  const language = useProgressStore(state => state.language);
  
  const t = (key: string): string => {
    const dict = dictionaries[language] || dictionaries['en'];
    // Fallback to english if key is empty or missing in the current language
    if (!dict[key] || dict[key].trim() === '') {
      return dictionaries['en'][key] || key;
    }
    return dict[key];
  };

  return { t, language };
}
