import { Exercise, Phrase, Word } from "@/types";
import { getTranslation } from '@/hooks/useTranslation';

export function buildWordPosition(
  phrase: Phrase,
  language: string,
  options: { pool: Word[] }
): Exercise | null {
  if (!phrase.components || phrase.components.length < 2) return null;

  // Filter out any space components to only count real words
  const validComponents = phrase.components.map(cId => {
    return options.pool.find(w => w.id === cId);
  }).filter(Boolean) as Word[];

  if (validComponents.length < 2) return null;

  // Pick a random word from the phrase as the target
  const targetIndex = Math.floor(Math.random() * validComponents.length);
  const targetWord = validComponents[targetIndex];

  // The correct answer is 1-indexed position
  const correctAnswer = (targetIndex + 1).toString();

  // Generate options (1, 2, 3, etc.)
  const exerciseOptions = validComponents.map((_, i) => ({
    id: `pos-${i + 1}`,
    th: (i + 1).toString(),
    fr: '',
    phonetic: ''
  }));

  let questionText = targetWord.fr;
  if (language === 'en' && targetWord.en) questionText = targetWord.en;
  if (language === 'es' && targetWord.es) questionText = targetWord.es;
  if (language === 'de' && targetWord.de) questionText = targetWord.de;
  if (language === 'it' && targetWord.it) questionText = targetWord.it;

  return {
    id: `wp-${phrase.id}-${Date.now()}-${Math.random()}`,
    type: 'word-position',
    question: questionText,
    answer: correctAnswer,
    options: exerciseOptions,
    targetSound: phrase.th, // We store the full Thai phrase here to play the audio
    displayWord: targetWord.th,
    maxMistakes: 2
  };
}
