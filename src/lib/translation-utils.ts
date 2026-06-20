import { AppLanguage } from './store';

interface TranslatableItem {
  fr: string;
  en?: string;
  de?: string;
  es?: string;
  it?: string;
}

/**
 * Retrieves the translation for an exercise item (Word or Phrase).
 * Fallback logic: 
 * 1. Tries the requested language.
 * 2. If not found, falls back to English ('en').
 * 3. If English is not found, falls back to French ('fr').
 */
export function getExerciseTranslation(item: TranslatableItem, language: AppLanguage | string): string {
  if (language === 'fr') return item.fr;
  
  if (language === 'de') return item.de || item.en || item.fr;
  if (language === 'es') return item.es || item.en || item.fr;
  if (language === 'it') return item.it || item.en || item.fr;
  
  // Default to english
  return item.en || item.fr;
}

export function getMissingWordHint(wordText: string, language: AppLanguage | string): string {
  if (language === 'fr') return `(Mot manquant : ${wordText})`;
  if (language === 'de') return `(Fehlendes Wort: ${wordText})`;
  if (language === 'es') return `(Palabra que falta: ${wordText})`;
  if (language === 'it') return `(Parola mancante: ${wordText})`;
  
  return `(Missing: ${wordText})`;
}
