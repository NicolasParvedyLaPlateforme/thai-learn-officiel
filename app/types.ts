export interface Word {
  id: string;
  th: string;
  fr: string;
  en?: string;
  phonetic: string;
  explanation?: string;
  imageUrl?: string;
}

export interface Phrase {
  id: string;
  th: string;
  fr: string;
  en?: string;
  phonetic: string;
  components: string[]; // array of word ids
  explanation?: string;
  imageUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleEn?: string;
  description: string;
  descriptionEn?: string;
  imageUrl?: string;
  words: Word[];
  phrases: Phrase[];
  isReview?: boolean;
}

export interface CourseData {
  lessons: Lesson[];
}

export type ExerciseType = 'word-match' | 'sentence-builder' | 'writing' | 'intro' | 'pair-matching' | 'free-typing';

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string; // The French text
  answer: string; // The Thai text
  options: Word[] | {id: string, th: string, fr: string, phonetic: string}[]; // Words to select from
  pairs?: Word[]; // For pair-matching
  correctComponents?: string[]; // For sentence builder
  componentGroups?: number[]; // To logically group correctComponents for visual display
  hideHints?: boolean; // If true, tooltips won't be shown
  disableTooltips?: boolean;
  forceHideRomanization?: boolean; // If true, romanization is not shown unless checking
  hideColors?: boolean; // If true, tone colors will be hidden
  blindMode?: boolean; // If true, Thai sentence is hidden and sound hint is provided
  introItem?: Word | Phrase; // For intro exercises
  imageUrl?: string; // Optional image url for word exercises
  pairMatchMode?: 'normal' | 'audio-only' | 'script-only';
  maxMistakes?: number; // How many mistakes allowed before failing the exercise 
  reverse?: boolean; // For word-match: if true, options show FR/EN instead of TH
  isFillInBlank?: boolean;
  blankIndex?: number;
  blankHint?: string;
  prefilledComponents?: string[];
}
