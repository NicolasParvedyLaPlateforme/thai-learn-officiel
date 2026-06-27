export interface AlphabetItem {
  letter: string;
  type: 'consonant' | 'vowel';
  consonantClass?: 'low' | 'mid' | 'high';
  exampleWord: string;
  exampleTranslation: string;
  exampleTranslationEn?: string;
  pronunciation: string; // The pronunciation of the example word, e.g. "ko kai"
  mnemonicHintFr?: string;
  mnemonicHintEn?: string;
  mnemonicHintDe?: string;
  mnemonicHintEs?: string;
  mnemonicHintIt?: string;
  exampleTranslationDe?: string;
  exampleTranslationEs?: string;
  exampleTranslationIt?: string;
  mnemonicEmoji?: string;
}

export interface AlphabetLessonDef {
  id: string; // 'c-1'
  title: string;
  titleEn: string;
  type: 'consonant' | 'vowel';
  items: AlphabetItem[];
  imageUrl?: string;
}

export type AlphabetExerciseType = 'intro' | 'word-match' | 'phrase-match' | 'review' | 'phonetic-match' | 'audio-match';

export interface AlphabetExercise {
  id: string;
  type: AlphabetExerciseType;
  item: AlphabetItem;
  options: AlphabetItem[]; // For choices
  targetText: string; // The phrase or word
  targetTranslation: string; // FR/EN translation
  letterToPick?: string; // The correct answer
  phonetic: string;
  explanation?: string; // Optional explanation for hints
  pairMatchMode?: 'th-en' | 'th-th' | 'audio-th';
  forceHideRomanization?: boolean;
}
