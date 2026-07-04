export interface Word {
  id: string;
  th: string;
  fr: string;
  en?: string;
  de?: string;
  es?: string;
  it?: string;
  phonetic: string;
  explanation?: string;
  imageUrl?: string;
}

export interface Phrase {
  id: string;
  th: string;
  fr: string;
  en?: string;
  de?: string;
  es?: string;
  it?: string;
  phonetic: string;
  components: string[]; // array of word ids
  explanation?: string;
  imageUrl?: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleEn?: string;
  titleDe?: string;
  titleEs?: string;
  titleIt?: string;
  description: string;
  descriptionEn?: string;
  descriptionDe?: string;
  descriptionEs?: string;
  descriptionIt?: string;
  imageUrl?: string;
  words: Word[];
  phrases: Phrase[];
  isReview?: boolean;
  part?: Record<string, string | number>;
}

export interface CourseData {
  lessons: Lesson[];
}

export type ExerciseType = 'word-match' | 'sentence-builder' | 'writing' | 'intro' | 'composition' | 'pair-matching' | 'free-typing' | 'missing-letter' | 'sound-to-letter' | 'true-false' | 'one-letter-difference' | 'word-position' | 'phrase-order';
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
  missingLetterText?: string;
  targetLetter?: string;
  targetLetterPhonetic?: string;
  showPhoneticHint?: boolean;
  originalWord?: string;
  missingIndex?: number;
  placeholderType?: 'normal' | 'above' | 'below';
  targetSound?: string;
  targetSoundKey?: string;
  displayWord?: string;
  isCorrectSpelling?: boolean;
  phonetic?: string;
  translation?: string;
  oneLetterHintType?: 'sound' | 'image' | 'pronunciation';
  diffReveal?: boolean;
  presentedOrder?: string[];
  correctOrder?: string[];
  isCorrectOrder?: boolean;
}
