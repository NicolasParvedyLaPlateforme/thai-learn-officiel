import { Lesson, Exercise, Word, Phrase } from '../types';

export function shuffle<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * Splits a Thai string into typing characters and their logical groupings.
 */
export function getWritingClustersAndGroups(text: string): { characters: string[], groups: number[] } {
  const characters: string[] = [];
  const groups: number[] = [];
  let currentGroupIndex = -1;

  const wordBoundaries = new Set<number>();
  try {
    const segmenter = new (globalThis as any).Intl.Segmenter('th', { granularity: 'word' });
    let offset = 0;
    for (const segment of segmenter.segment(text)) {
      offset += segment.segment.length;
      wordBoundaries.add(offset);
    }
  } catch (e) {
    // Ignore if not supported
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const code = char.charCodeAt(0);

    const isPreposed = code >= 0x0E40 && code <= 0x0E44;
    const isPostposed = code === 0x0E30 || code === 0x0E32 || code === 0x0E33 || code === 0x0E45; // ะ, า, ำ, ๅ
    const isNonBase = 
      (code >= 0x0E31 && code <= 0x0E3A) || // top/bottom vowels, mai han-akat
      (code >= 0x0E47 && code <= 0x0E4E) || // tone marks & others
      (code === 0x0E3C); // korakot
      
    const isWordStart = i > 0 && wordBoundaries.has(i);

    if (isPreposed) {
      currentGroupIndex++;
    } else if (!isNonBase && !isPostposed) {
      if (isWordStart) {
        currentGroupIndex++;
      } else {
        const prevCode = i > 0 ? text[i-1].charCodeAt(0) : 0;
        const prevIsPreposed = prevCode >= 0x0E40 && prevCode <= 0x0E44;
        
        let formsCluster = false;
        const isCurrentConsonant = code >= 0x0E01 && code <= 0x0E2E;
        let hasVowelInGroup = false;
        let isFinalConsonant = false;
        
        if (isCurrentConsonant) {
          let lastConsonantCode = 0;
          let lastConsonantGroup = -1;
          
          for (let j = characters.length - 1; j >= 0; j--) {
             const c = characters[j].charCodeAt(0);
             if (groups[j] === currentGroupIndex) {
                 if ((c >= 0x0E40 && c <= 0x0E44) || // preposed
                     (c === 0x0E30 || c === 0x0E32 || c === 0x0E33 || c === 0x0E45) || // postposed
                     (c >= 0x0E31 && c <= 0x0E3A) || // top/bottom
                     (c === 0x0E47)) { // maitaikhu
                     hasVowelInGroup = true;
                 }
             }
             if (c >= 0x0E01 && c <= 0x0E2E && lastConsonantCode === 0) {
                lastConsonantCode = c;
                lastConsonantGroup = groups[j];
             }
          }
          
          if (lastConsonantCode !== 0 && (lastConsonantGroup === currentGroupIndex)) {
              // Ho Nam
              if (lastConsonantCode === 0x0E2B && [0x0E07, 0x0E0D, 0x0E19, 0x0E21, 0x0E22, 0x0E23, 0x0E25, 0x0E27].includes(code)) {
                formsCluster = true;
              }
              // O Nam
              else if (lastConsonantCode === 0x0E2D && code === 0x0E22) {
                formsCluster = true;
              }
              // True clusters
              else if ([0x0E01, 0x0E02, 0x0E04, 0x0E15, 0x0E1B, 0x0E1E].includes(lastConsonantCode) && [0x0E23, 0x0E25, 0x0E27].includes(code)) {
                formsCluster = true;
              }
              // ทร 
              else if (lastConsonantCode === 0x0E17 && code === 0x0E23) {
                formsCluster = true;
              }
          }

          if (hasVowelInGroup && !formsCluster) {
              const nextCode = i + 1 < text.length ? text[i+1].charCodeAt(0) : 0;
              const isNextVowelOrTone = 
                (nextCode === 0x0E30 || nextCode === 0x0E32 || nextCode === 0x0E33 || nextCode === 0x0E45) ||
                (nextCode >= 0x0E31 && nextCode <= 0x0E3A) || 
                (nextCode >= 0x0E47 && nextCode <= 0x0E4E);
              
              if (!isNextVowelOrTone) {
                  let nextFormsClusterWithCurrent = false;
                  if (nextCode >= 0x0E01 && nextCode <= 0x0E2E) {
                      if (code === 0x0E2B && [0x0E07, 0x0E0D, 0x0E19, 0x0E21, 0x0E22, 0x0E23, 0x0E25, 0x0E27].includes(nextCode)) nextFormsClusterWithCurrent = true;
                      else if (code === 0x0E2D && nextCode === 0x0E22) nextFormsClusterWithCurrent = true;
                      else if ([0x0E01, 0x0E02, 0x0E04, 0x0E15, 0x0E1B, 0x0E1E].includes(code) && [0x0E23, 0x0E25, 0x0E27].includes(nextCode)) nextFormsClusterWithCurrent = true;
                      else if (code === 0x0E17 && nextCode === 0x0E23) nextFormsClusterWithCurrent = true;
                  }
                  
                  if (code !== 0x0E2B && code !== 0x0E2D && !nextFormsClusterWithCurrent) {
                      isFinalConsonant = true;
                  }
              }
          }
        }

        if (!prevIsPreposed && !formsCluster && !isFinalConsonant) {
          currentGroupIndex++;
        }
      }
    }

    if (currentGroupIndex === -1) currentGroupIndex = 0;

    characters.push(char);
    groups.push(currentGroupIndex);
  }

  return { characters, groups };
}

export function generateWritingExercises(
  allLessons: Lesson[], 
  completedLessonIds: string[], 
  language: string = 'fr',
  selectedWordIds: string[] | null = null
): Exercise[] {
  const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
  if (completedLessons.length === 0) return [];

  const candidateItems: { fr: string, th: string, id: string, imageUrl?: string }[] = [];
  completedLessons.forEach(l => {
    l.words.filter(w => w.id !== 'w_dots').forEach(w => candidateItems.push({ fr: language === 'en' ? (w.en || w.fr) : w.fr, th: w.th, id: w.id, imageUrl: w.imageUrl }));
    l.phrases.forEach(p => candidateItems.push({ fr: language === 'en' ? (p.en || p.fr) : p.fr, th: p.th, id: p.id, imageUrl: p.imageUrl }));
  });

  const filteredItems = selectedWordIds 
    ? candidateItems.filter(item => selectedWordIds.includes(item.id))
    : candidateItems;

  if (filteredItems.length === 0) return [];

  const shuffledCandidates = shuffle(filteredItems).slice(0, 20);
  
  return shuffledCandidates.map((item, idx) => {
    const { characters, groups } = getWritingClustersAndGroups(item.th.replace(/\s+/g, ''));
    return {
      id: `writing-${idx}-${Date.now()}`,
      type: 'writing' as any,
      question: item.fr,
      answer: item.th,
      options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
      correctComponents: characters, // Representing the order of individual characters
      componentGroups: groups,
      hideHints: false,
      imageUrl: item.imageUrl
    };
  });
}

export interface ReviewOptions {
  showWordHints: boolean;
  showUsefulVocab: boolean;
  includeDistractors: boolean;
  limitDistractors: number;
}

export function generateEndlessReviewExercises(
  allLessons: Lesson[], 
  completedLessonIds: string[], 
  language: string = 'fr',
  options?: ReviewOptions
): Exercise[] {
  const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
  if (completedLessons.length === 0) return [];

  const defaultOptions: ReviewOptions = {
    showWordHints: true,
    showUsefulVocab: true,
    includeDistractors: true,
    limitDistractors: 2,
    ...options
  };

  let exercises: Exercise[] = [];
  const globalWords = allLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');
  
  // Create collections of number words
  const numberLessons = allLessons.filter(l => l.title.toLowerCase().includes('nombre') || l.titleEn?.toLowerCase().includes('number'));
  const numberWords = numberLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');

  completedLessons.forEach(prevLesson => {
    const isNumberLesson = prevLesson.title.toLowerCase().includes('nombre') || prevLesson.titleEn?.toLowerCase().includes('number');
    const distractorPool = isNumberLesson ? numberWords : globalWords;
    const numDistractors = defaultOptions.includeDistractors ? defaultOptions.limitDistractors : 0;

    // word match
    prevLesson.words.filter(w => w.id !== 'w_dots').forEach(word => {
      // Word match always has 3 distractors (4 options total)
      const distractors = shuffle(distractorPool.filter(w => w.id !== word.id)).slice(0, 3);
      exercises.push({
        id: `endless-wm-${word.id}-${Date.now()}-${Math.random()}`,
        type: 'word-match',
        question: language === 'en' ? (word.en || word.fr) : word.fr,
        answer: word.th,
        options: shuffle([word, ...distractors]),
        hideHints: !defaultOptions.showUsefulVocab,
        disableTooltips: !defaultOptions.showWordHints,
        imageUrl: word.imageUrl
      } as any); // Type assertion for now since we'll add these options to Exercise interface
    });
    // sentence builder
    prevLesson.phrases.forEach(phrase => {
      const phraseWords = phrase.components.map(id => globalWords.find(w => w.id === id)).filter(Boolean) as Word[];
      // Distractors for sentence builder: shouldn't use number words unless it's a number lesson
      const sbDistractorPool = isNumberLesson ? numberWords : globalWords;
      const distractors = shuffle(sbDistractorPool.filter(w => !phrase.components.includes(w.id))).slice(0, numDistractors);
      exercises.push({
        id: `endless-sb-${phrase.id}-${Date.now()}-${Math.random()}`,
        type: 'sentence-builder',
        question: language === 'en' ? (phrase.en || phrase.fr) : phrase.fr,
        answer: phrase.th,
        options: shuffle([...phraseWords, ...distractors]),
        correctComponents: phrase.components,
        hideHints: !defaultOptions.showUsefulVocab,
        disableTooltips: !defaultOptions.showWordHints,
        imageUrl: phrase.imageUrl
      } as any);
    });
  });

  const finalBatch = shuffle(exercises).slice(0, 20); // Return a batch of 20 random exercises
  
  // Prevent consecutive word-match exercises from having the correct answer at the same index
  let lastCorrectIndex = -1;
  for (const ex of finalBatch) {
    if (ex.type === 'word-match' && !ex.isFillInBlank && ex.options && ex.options.length > 1) {
      let correctIndex = ex.options.findIndex((o: any) => o.th === ex.answer);
      if (correctIndex !== -1) {
        if (correctIndex === lastCorrectIndex) {
          let newIdx;
          do {
            newIdx = Math.floor(Math.random() * ex.options.length);
          } while (newIdx === correctIndex);
          const newOptions = [...ex.options];
          [newOptions[correctIndex], newOptions[newIdx]] = [newOptions[newIdx], newOptions[correctIndex]];
          ex.options = newOptions;
          correctIndex = newIdx;
        }
        lastCorrectIndex = correctIndex;
      }
    }
  }
  
  return finalBatch;
}

function generateMisspelledWords(word: Word, count: number): {id: string, th: string, fr: string, phonetic: string}[] {
  const chars = Array.from(word.th);
  // A few common Thai consonants to use for swapping
  const consonants = ['ก','ข','ค','ง','จ','ฉ','ช','ซ','ด','ต','ถ','ท','น','บ','ป','ผ','พ','ฟ','ม','ย','ร','ล','ว','ส','ห','อ'];
  const res = [];
  
  // Find a single valid index to mutate across all distractors
  let targetIdx = 0;
  let attempts = 0;
  while(attempts < 10) {
    const idx = Math.floor(Math.random() * chars.length);
    const code = chars[idx].charCodeAt(0);
    // only replace base consonants if possible to avoid breaking vowels
    if (code >= 0x0E01 && code <= 0x0E2E) {
      targetIdx = idx;
      break;
    }
    attempts++;
  }

  // Create unique replacements
  const usedConsonants = new Set([chars[targetIdx]]);
  
  for (let i=0; i<count; i++) {
    let newChars = [...chars];
    let rc = consonants[Math.floor(Math.random() * consonants.length)];
    
    // Ensure we pick a consonant we haven't used yet in this position
    let pickAttempts = 0;
    while (usedConsonants.has(rc) && pickAttempts < 20) {
       rc = consonants[Math.floor(Math.random() * consonants.length)];
       pickAttempts++;
    }
    usedConsonants.add(rc);
    
    newChars[targetIdx] = rc;
    
    res.push({
      id: `fake-${word.id}-${i}-${Date.now()}`,
      th: newChars.join(''),
      fr: '',
      phonetic: ''
    });
  }
  return res;
}

export function generateExercises(lesson: Lesson, allLessons: Lesson[], level: number = 0, language: string = 'fr'): Exercise[] {
  let exercises: Exercise[] = [];
  const globalWords = allLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');
  const validLessonWords = lesson.words.filter(w => w.id !== 'w_dots');

  if (lesson.isReview) {
    const currentIdx = allLessons.findIndex(l => l.id === lesson.id);
    let unitStartIdx = 0;
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (allLessons[i].isReview) {
        unitStartIdx = i + 1;
        break;
      }
    }
    const unitLessons = allLessons.slice(unitStartIdx, currentIdx);
    const unitWords = unitLessons.flatMap(l => l.words).filter(w => w.id !== 'w_dots');
    const unitPhrases = unitLessons.flatMap(l => l.phrases);
    
    let reviewExercises: Exercise[] = [];
    
    // 1. Word Match (6 exercises)
    const shuffledWordsForWM = shuffle(unitWords).slice(0, 6);
    shuffledWordsForWM.forEach(word => {
        const distractors = shuffle(unitWords.filter(w => w.id !== word.id)).slice(0, 3);
        reviewExercises.push({
          id: `rev-wm-${word.id}-${Math.random()}`,
          type: 'word-match',
          question: language === 'en' ? (word.en || word.fr) : word.fr,
          answer: word.th,
          options: shuffle([word, ...distractors]),
          hideHints: true,
          disableTooltips: true,
          imageUrl: word.imageUrl
        });
    });
    
    // Combine words and phrases for the rest
    const allUnitItems = shuffle([...unitWords, ...unitPhrases]);
    
    // 2. Sentence Builder (8 exercises)
    const itemsForSB = shuffle(unitPhrases).slice(0, 8);
    const globalWords = allLessons.flatMap(l => l.words || []);
    itemsForSB.forEach(item => {
        const phrase = item as Phrase;
        const phraseWords = phrase.components.map(id => globalWords.find(w => w.id === id)).filter(Boolean) as Word[];
        
        // Add distractors to make it challenging and avoid single-card issues
        const isNumberLesson = item.id.includes('num') || item.th.match(/[๐-๙]/);
        const sbDistractorPool = isNumberLesson ? allLessons.find(l => l.id === 'lesson-3')?.words || globalWords : globalWords;
        const distractors = shuffle(sbDistractorPool.filter(w => !phrase.components.includes(w.id))).slice(0, 3);
        
        reviewExercises.push({
            id: `rev-sb-${item.id}-${Math.random()}`,
            type: 'sentence-builder',
            question: language === 'en' ? (item.en || item.fr) : item.fr,
            answer: item.th,
            options: shuffle([...phraseWords, ...distractors]),
            correctComponents: phrase.components,
            hideHints: true,
            disableTooltips: true,
            imageUrl: item.imageUrl
        });
    });

    // 3. Writing (8 exercises)
    const itemsForWriting = shuffle(allUnitItems).slice(0, 8);
    itemsForWriting.forEach(item => {
        const { characters, groups } = getWritingClustersAndGroups(item.th.replace(/\s+/g, ''));
        reviewExercises.push({
            id: `rev-wr-${item.id}-${Math.random()}`,
            type: 'writing',
            question: language === 'en' ? (item.en || item.fr) : item.fr,
            answer: item.th,
            options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
            correctComponents: characters,
            componentGroups: groups,
            hideHints: true,
            disableTooltips: true,
            blindMode: false,
            imageUrl: item.imageUrl
        });
    });

    // 4. Free typing (8 exercises)
    const itemsForFT = shuffle(allUnitItems).slice(0, 8);
    itemsForFT.forEach(item => {
        reviewExercises.push({
            id: `rev-ft-${item.id}-${Math.random()}`,
            type: 'free-typing',
            question: language === 'en' ? (item.en || item.fr) : item.fr,
            answer: item.th,
            options: [],
            hideHints: true,
            disableTooltips: true,
            imageUrl: item.imageUrl
        });
    });
    
    // Total is exactly 30: 6 + 8 + 8 + 8 = 30.
    return reviewExercises;
  }

  // Normal lesson logic
  let wmExercises: Exercise[] = [];
  let sbExercises: Exercise[] = [];

  validLessonWords.forEach(word => {
    // For all levels, 4 options (1 correct, 3 distractors)
    const distractors = shuffle(globalWords.filter(w => w.id !== word.id)).slice(0, 3);
    wmExercises.push({
      id: `wm-${word.id}-${Date.now()}-${Math.random()}`,
      type: 'word-match',
      question: language === 'en' ? (word.en || word.fr) : word.fr,
      answer: word.th,
      options: shuffle([word, ...distractors]),
      hideHints: false,
      imageUrl: word.imageUrl
    });
  });

  lesson.phrases.forEach(phrase => {
    const phraseWords = phrase.components.map(id => globalWords.find(w => w.id === id)).filter(Boolean) as Word[];
    const numDistractors = level >= 3 ? 1 : 0;
    const distractors = shuffle(globalWords.filter(w => !phrase.components.includes(w.id))).slice(0, numDistractors);
    sbExercises.push({
      id: `sb-${phrase.id}-${Date.now()}-${Math.random()}`,
      type: 'sentence-builder',
      question: language === 'en' ? (phrase.en || phrase.fr) : phrase.fr,
      answer: phrase.th,
      options: shuffle([...phraseWords, ...distractors]),
      correctComponents: phrase.components,
      hideHints: false,
      imageUrl: phrase.imageUrl
    });
  });

  let finalExercises: Exercise[] = [];
  wmExercises = shuffle(wmExercises);
  sbExercises = shuffle(sbExercises);

  if (level === 0) {
    // Level 1 logic requested by the user
    let level0Exercises: Exercise[] = [];
    validLessonWords.forEach(word => {
      // 1: Intro
      level0Exercises.push({
          id: `intro-${word.id}-${Math.random()}`,
          type: 'intro',
          question: language === 'en' ? (word.en || word.fr) : word.fr,
          answer: word.th,
          options: [],
          introItem: word,
          hideHints: false
      });
      
      // 2: Word match with only 2 options (1 correct, 1 wrong), 0 retry (maxMistakes = 1)
      const step2Distractor = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, 1);
      if (step2Distractor.length === 0) {
        step2Distractor.push(...shuffle(globalWords.filter(w => w.id !== word.id)).slice(0, 1));
      }
      level0Exercises.push({
          id: `wm2-${word.id}-${Date.now()}-${Math.random()}`,
          type: 'word-match',
          question: language === 'en' ? (word.en || word.fr) : word.fr,
          answer: word.th,
          options: shuffle([word, ...step2Distractor]),
          hideHints: false,
          imageUrl: word.imageUrl,
          maxMistakes: 1
      });
      
      // 3: Word match with 4 options (1 correct, 3 wrong from the exercise), maxMistakes = 2
      let step3Distractors = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, 3);
      if (step3Distractors.length < 3) {
         step3Distractors.push(...shuffle(globalWords.filter(w => w.id !== word.id && !step3Distractors.find(sw => sw.id === w.id))).slice(0, 3 - step3Distractors.length));
      }
      level0Exercises.push({
          id: `wm4-${word.id}-${Date.now()}-${Math.random()}`,
          type: 'word-match',
          question: language === 'en' ? (word.en || word.fr) : word.fr,
          answer: word.th,
          options: shuffle([word, ...step3Distractors]),
          hideHints: false,
          imageUrl: word.imageUrl,
          maxMistakes: 2
      });
      
      // 4: Word match with 4 options (1 correct, 3 misspelled distractors), maxMistakes = 2
      const step4Distractors = generateMisspelledWords(word, 3);
      level0Exercises.push({
          id: `wm-misspelled-${word.id}-${Date.now()}-${Math.random()}`,
          type: 'word-match',
          question: language === 'en' ? (word.en || word.fr) : word.fr,
          answer: word.th,
          options: shuffle([word, ...step4Distractors]) as any,
          hideHints: false,
          imageUrl: word.imageUrl,
          maxMistakes: 2
      });
    });
    return level0Exercises;
  } else if (level === 1) {
    // Level 2: First half word-match, second half sentence-builder
    let level1WmExercises: Exercise[] = [];
    validLessonWords.forEach(word => {
      // Create 2 exercises per word
      for (let i = 0; i < 2; i++) {
        const rand = Math.random();
        
        let type: 'distractors' | 'misspelled' | 'reverse';
        if (rand < 0.33) type = 'distractors';
        else if (rand < 0.66) type = 'misspelled';
        else type = 'reverse';
        
        if (type === 'distractors') {
          let stepDistractors = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, 3);
          if (stepDistractors.length < 3) {
             stepDistractors.push(...shuffle(globalWords.filter(w => w.id !== word.id && !stepDistractors.find(sw => sw.id === w.id))).slice(0, 3 - stepDistractors.length));
          }
          level1WmExercises.push({
              id: `wm2-dist-${word.id}-${i}-${Date.now()}-${Math.random()}`,
              type: 'word-match',
              question: language === 'en' ? (word.en || word.fr) : word.fr,
              answer: word.th,
              options: shuffle([word, ...stepDistractors]),
              hideHints: false,
              imageUrl: word.imageUrl,
              maxMistakes: 2
          });
        } else if (type === 'misspelled') {
          const stepDistractors = generateMisspelledWords(word, 3);
          level1WmExercises.push({
              id: `wm2-misspelled-${word.id}-${i}-${Date.now()}-${Math.random()}`,
              type: 'word-match',
              question: language === 'en' ? (word.en || word.fr) : word.fr,
              answer: word.th,
              options: shuffle([word, ...stepDistractors]) as any,
              hideHints: false,
              imageUrl: word.imageUrl,
              maxMistakes: 2
          });
        } else {
          // reverse: native strings displayed, question is Thai
          let stepDistractors = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, 3);
          if (stepDistractors.length < 3) {
             stepDistractors.push(...shuffle(globalWords.filter(w => w.id !== word.id && !stepDistractors.find(sw => sw.id === w.id))).slice(0, 3 - stepDistractors.length));
          }
          level1WmExercises.push({
              id: `wm2-reverse-${word.id}-${i}-${Date.now()}-${Math.random()}`,
              type: 'word-match',
              question: word.th,
              answer: word.th,
              options: shuffle([word, ...stepDistractors]),
              hideHints: false,
              imageUrl: word.imageUrl,
              maxMistakes: 2,
              reverse: true
          });
        }
      }
    });

    let wmPool = shuffle(level1WmExercises);

    let fillInBlankPool: Exercise[] = [];
    sbExercises.forEach((sbEx) => {
       if (!sbEx.correctComponents || sbEx.correctComponents.length <= 1) {
           fillInBlankPool.push(sbEx);
           return;
       }
       const validIndices = sbEx.correctComponents.map((c, i) => c !== 'w_dots' ? i : -1).filter(i => i !== -1);
       if (validIndices.length === 0) {
           fillInBlankPool.push(sbEx);
           return;
       }
       
       const blankIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
       const blankWordId = sbEx.correctComponents[blankIndex];
       
       const blankWord = allLessons.flatMap(l => l.words).find(w => w.id === blankWordId) || {id: blankWordId, th: blankWordId, fr: '', en: ''};
       const misspelledOptions = generateMisspelledWords(blankWord as any, 1);
       
       const prefilledComponents = sbEx.correctComponents.map((id, i) => {
           if (i === blankIndex) return '';
           if (id === 'w_dots') return '...';
           const w = allLessons.flatMap(l => l.words).find(w => w.id === id);
           return w ? w.th : id;
       });
       
       const missingWordFr = language === 'en' ? (blankWord.en || blankWord.fr) : blankWord.fr;
       const blankHint = language === 'en' ? `(Missing: ${missingWordFr})` : `(Mot manquant : ${missingWordFr})`;

       fillInBlankPool.push({
          ...sbEx,
          id: `fill-blank-2-${sbEx.id}-${Date.now()}-${Math.random()}`,
          question: sbEx.question,
          blankHint: blankHint,
          isFillInBlank: true,
          blankIndex: blankIndex,
          prefilledComponents: prefilledComponents,
          options: shuffle([blankWord, ...misspelledOptions]) as any,
          maxMistakes: 2
       });
    });

    let sbPool = fillInBlankPool;

    // Attempt to pad sbPool to have some sentences if available
    if (sbPool.length === 0) {
      sbPool = globalWords.slice(0, 2).map((w, i) => ({
        id: `fallback-sb-${Date.now()}-${i}`,
        type: 'sentence-builder',
        question: language === 'en' ? (w.en || w.fr) : w.fr,
        answer: w.th,
        options: [w],
        correctComponents: [w.th]
      }));
    }

    finalExercises = [...wmPool, ...sbPool];
  } else if (level === 2) {
    // Level 3: 4 word-match (1 per word, randomized type), rest sentence-builder
    let level2WmExercises: Exercise[] = [];
    validLessonWords.forEach(word => {
      const rand = Math.random();
      let type: 'distractors' | 'misspelled' | 'reverse';
      if (rand < 0.33) type = 'distractors';
      else if (rand < 0.66) type = 'misspelled';
      else type = 'reverse';
      
      if (type === 'distractors') {
        let stepDistractors = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, 3);
        if (stepDistractors.length < 3) {
           stepDistractors.push(...shuffle(globalWords.filter(w => w.id !== word.id && !stepDistractors.find(sw => sw.id === w.id))).slice(0, 3 - stepDistractors.length));
        }
        level2WmExercises.push({
            id: `wm3-dist-${word.id}-${Date.now()}-${Math.random()}`,
            type: 'word-match',
            question: language === 'en' ? (word.en || word.fr) : word.fr,
            answer: word.th,
            options: shuffle([word, ...stepDistractors]),
            hideHints: false,
            imageUrl: word.imageUrl,
            maxMistakes: 2
        });
      } else if (type === 'misspelled') {
        const stepDistractors = generateMisspelledWords(word, 3);
        level2WmExercises.push({
            id: `wm3-misspelled-${word.id}-${Date.now()}-${Math.random()}`,
            type: 'word-match',
            question: language === 'en' ? (word.en || word.fr) : word.fr,
            answer: word.th,
            options: shuffle([word, ...stepDistractors]) as any,
            hideHints: false,
            imageUrl: word.imageUrl,
            maxMistakes: 2
        });
      } else {
        let stepDistractors = shuffle(validLessonWords.filter(w => w.id !== word.id)).slice(0, 3);
        if (stepDistractors.length < 3) {
           stepDistractors.push(...shuffle(globalWords.filter(w => w.id !== word.id && !stepDistractors.find(sw => sw.id === w.id))).slice(0, 3 - stepDistractors.length));
        }
        level2WmExercises.push({
            id: `wm3-reverse-${word.id}-${Date.now()}-${Math.random()}`,
            type: 'word-match',
            question: word.th,
            answer: word.th,
            options: shuffle([word, ...stepDistractors]),
            hideHints: false,
            imageUrl: word.imageUrl,
            maxMistakes: 2,
            reverse: true
        });
      }
    });

    let wmPool = shuffle(level2WmExercises);
    
    // Create fill-in-the-blank for each sentence builder exercise
    let fillInBlankPool: Exercise[] = [];
    sbExercises.forEach((sbEx) => {
       if (!sbEx.correctComponents || sbEx.correctComponents.length <= 1) return;
       // Pick a random word to blank (exclude w_dots)
       const validIndices = sbEx.correctComponents.map((c, i) => c !== 'w_dots' ? i : -1).filter(i => i !== -1);
       if (validIndices.length === 0) return;
       
       const blankIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
       const blankWordId = sbEx.correctComponents[blankIndex];
       
       const blankWord = allLessons.flatMap(l => l.words).find(w => w.id === blankWordId) || {id: blankWordId, th: blankWordId, fr: '', en: ''};
       const misspelledOptions = generateMisspelledWords(blankWord as any, 1);
       
       const prefilledComponents = sbEx.correctComponents.map((id, i) => {
           if (i === blankIndex) return '';
           if (id === 'w_dots') return '...';
           const w = allLessons.flatMap(l => l.words).find(w => w.id === id);
           return w ? w.th : id;
       });
       
       const missingWordFr = language === 'en' ? (blankWord.en || blankWord.fr) : blankWord.fr;
       const blankHint = language === 'en' ? `(Missing: ${missingWordFr})` : `(Mot manquant : ${missingWordFr})`;

       fillInBlankPool.push({
          ...sbEx,
          id: `fill-blank-${sbEx.id}-${Date.now()}-${Math.random()}`,
          question: sbEx.question,
          blankHint: blankHint,
          isFillInBlank: true,
          blankIndex: blankIndex,
          prefilledComponents: prefilledComponents,
          options: shuffle([blankWord, ...misspelledOptions]) as any,
          maxMistakes: 2
       });
    });

    let sbPool = [...sbExercises];
    if (sbPool.length === 0) {
      sbPool = globalWords.slice(0, 2).map((w, i) => ({
        id: `fallback-sb-3-${Date.now()}-${i}`,
        type: 'sentence-builder',
        question: language === 'en' ? (w.en || w.fr) : w.fr,
        answer: w.th,
        options: [w],
        correctComponents: [w.th]
      }));
    }
    finalExercises = [...wmPool, ...fillInBlankPool, ...sbPool];
  } else if (level === 3) {
    // Level 4: Mixture of sentence builder types
    // 1. Fill in the blank
    let fillInBlankPool: Exercise[] = [];
    sbExercises.forEach((sbEx) => {
       if (!sbEx.correctComponents || sbEx.correctComponents.length <= 1) return;
       // Pick a random word to blank (exclude w_dots)
       const validIndices = sbEx.correctComponents.map((c, i) => c !== 'w_dots' ? i : -1).filter(i => i !== -1);
       if (validIndices.length === 0) return;
       
       const blankIndex = validIndices[Math.floor(Math.random() * validIndices.length)];
       const blankWordId = sbEx.correctComponents[blankIndex];
       
       const blankWord = allLessons.flatMap(l => l.words).find(w => w.id === blankWordId) || {id: blankWordId, th: blankWordId, fr: '', en: ''};
       
       // Just grab 1 misspelled distractor so we have 2 options
       const misspelledOptions = generateMisspelledWords(blankWord as any, 1);
       
       const prefilledComponents = sbEx.correctComponents.map((id, i) => {
           if (i === blankIndex) return '';
           if (id === 'w_dots') return '...';
           const w = allLessons.flatMap(l => l.words).find(w => w.id === id);
           return w ? w.th : id;
       });
       
       const missingWordFr = language === 'en' ? (blankWord.en || blankWord.fr) : blankWord.fr;
       const blankHint = language === 'en' ? `(Missing: ${missingWordFr})` : `(Mot manquant : ${missingWordFr})`;

       fillInBlankPool.push({
          ...sbEx,
          id: `fill-blank-4-${sbEx.id}-${Date.now()}-${Math.random()}`,
          question: sbEx.question,
          blankHint: blankHint,
          isFillInBlank: true,
          blankIndex: blankIndex,
          prefilledComponents: prefilledComponents,
          options: shuffle([blankWord, ...misspelledOptions]) as any,
          maxMistakes: 1
       });
    });

    // 2. Regular sentence builder
    let sbPool = [...sbExercises];

    // 3. New: Translate this phrase (Word Match style with full phrases)
    let phraseMatchPool: Exercise[] = [];
    const allPhrases = allLessons.flatMap(l => l.phrases);
    lesson.phrases.forEach(phrase => {
       // Find a similar phrase
       const similar = allPhrases.filter(p => p.id !== phrase.id && p.components.some(c => phrase.components.includes(c)));
       const distractorPhrase = similar.length > 0 ? shuffle(similar)[0] : (shuffle(allPhrases.filter(p => p.id !== phrase.id))[0] || phrase);
       
       phraseMatchPool.push({
          id: `pmatch-${phrase.id}-${Date.now()}-${Math.random()}`,
          type: 'word-match',
          question: language === 'en' ? (phrase.en || phrase.fr) : phrase.fr,
          answer: phrase.th,
          options: shuffle([
            { id: phrase.id, th: phrase.th, fr: phrase.fr, phonetic: phrase.phonetic },
            { id: distractorPhrase.id, th: distractorPhrase.th, fr: distractorPhrase.fr, phonetic: distractorPhrase.phonetic }
          ]) as any,
          hideHints: false,
          imageUrl: phrase.imageUrl,
          maxMistakes: 1
       });
    });

    // Combine them and ensure at least 15 exercises
    let mixedPool = shuffle([...fillInBlankPool, ...sbPool, ...phraseMatchPool]);
    while (mixedPool.length < 15 && mixedPool.length > 0) {
      mixedPool = [...mixedPool, ...shuffle(mixedPool)];
    }
    
    // Fallback if no phrase exercises can be generated
    if (mixedPool.length === 0) mixedPool = [...wmExercises];
    
    finalExercises = mixedPool.slice(0, 15).map((ex, i) => ({
      ...ex,
      forceHideRomanization: i >= Math.floor(mixedPool.length / 2) // Hide romanization for half of them
    }));
  } else if (level >= 4 && level <= 6) {
    // Level 5 (index 4): Normal pair-matching
    // Level 6 (index 5): Pair-matching audio-only
    // Level 7 (index 6): Pair-matching script-only
    let pmExercises: Exercise[] = [];
    const allItemsRaw = [...validLessonWords, ...lesson.phrases];
    const allGlobalItemsRaw = [...globalWords, ...allLessons.flatMap(l => l.phrases)];
    const allItemsForPairsRaw = allItemsRaw.length >= 4 ? allItemsRaw : allGlobalItemsRaw;
    const allItemsForPairs = Array.from(new Map(allItemsForPairsRaw.map(w => [w.id, w])).values());
    
    let pairMatchMode: 'normal' | 'audio-only' | 'script-only' = 'normal';
    if (level === 5) pairMatchMode = 'audio-only';
    if (level === 6) pairMatchMode = 'script-only';

    for (let i = 0; i < 5; i++) {
      const selectedPairs = shuffle(allItemsForPairs).slice(0, 4);
      pmExercises.push({
        id: `pm-${Date.now()}-${Math.random()}`,
        type: 'pair-matching',
        question: language === 'en' ? 'Match the pairs' : 'Reliez les paires correspondantes',
        answer: '',
        options: selectedPairs as any,
        pairs: selectedPairs as any,
        hideHints: true,
        pairMatchMode,
        forceHideRomanization: level === 4 ? (i >= Math.floor(5 / 3)) : false // 1/3 have it, 2/3 don't
      });
    }
    finalExercises = pmExercises;
  } else if (level === 7) {
    // Level 8: Blind writing words
    let wrPool: Exercise[] = [];
    validLessonWords.forEach(w => {
       const { characters, groups } = getWritingClustersAndGroups(w.th.replace(/\s+/g, ''));
       wrPool.push({
          id: `wr-blind-word-${w.id}-${Date.now()}-${Math.random()}`,
          type: 'writing',
          question: language === 'en' ? (w.en || w.fr) : w.fr,
          answer: w.th,
          options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
          correctComponents: characters,
          componentGroups: groups,
          hideHints: true,
          blindMode: true,
          forceHideRomanization: true,
          imageUrl: w.imageUrl
       });
    });
    wrPool = shuffle(wrPool);
    while (wrPool.length < 10 && wrPool.length > 0) wrPool = [...wrPool, ...shuffle(wrPool)];
    finalExercises = wrPool.slice(0, 10);
  } else if (level === 8) {
    // Level 9: Blind writing phrases
    let wrPool: Exercise[] = [];
    lesson.phrases.forEach(p => {
       const { characters, groups } = getWritingClustersAndGroups(p.th.replace(/\s+/g, ''));
       wrPool.push({
          id: `wr-blind-phrase-${p.id}-${Date.now()}-${Math.random()}`,
          type: 'writing',
          question: language === 'en' ? (p.en || p.fr) : p.fr,
          answer: p.th,
          options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
          correctComponents: characters,
          componentGroups: groups,
          hideHints: true,
          blindMode: true,
          forceHideRomanization: true,
          imageUrl: p.imageUrl
       });
    });
    wrPool = shuffle(wrPool);
    while (wrPool.length < 10 && wrPool.length > 0) wrPool = [...wrPool, ...shuffle(wrPool)];
    if (wrPool.length === 0) { // Fallback if no phrases
       validLessonWords.forEach(w => {
         const { characters, groups } = getWritingClustersAndGroups(w.th.replace(/\s+/g, ''));
         wrPool.push({
            id: `wr-blind-word-${w.id}-${Date.now()}-${Math.random()}`,
            type: 'writing',
            question: language === 'en' ? (w.en || w.fr) : w.fr,
            answer: w.th,
            options: shuffle(characters.map((c, i) => ({ id: `c-${i}`, th: c, fr: '', phonetic: '' }))),
            correctComponents: characters,
            componentGroups: groups,
            hideHints: true,
            blindMode: true,
            forceHideRomanization: true,
            imageUrl: w.imageUrl
         });
       });
       wrPool = shuffle(wrPool);
       while (wrPool.length < 10 && wrPool.length > 0) wrPool = [...wrPool, ...shuffle(wrPool)];
    }
    finalExercises = wrPool.slice(0, 10);
  } else if (level === 9) {
    // Level 10 combined: First run levels 0-8, then append free typing test
    let previousLevels: Exercise[] = [];
    for (let l = 0; l <= 8; l++) {
      // Collect exercises from levels 1-9 (indices 0-8)
      previousLevels.push(...generateExercises(lesson, allLessons, l, language));
    }
    
    // Now generate the free typing words and phrases
    let ftPool: Exercise[] = [];
    
    // First add words
    validLessonWords.forEach(w => {
      ftPool.push({
        id: `ft-word-${w.id}-${Date.now()}-${Math.random()}`,
        type: 'free-typing',
        question: language === 'en' ? (w.en || w.fr) : w.fr,
        answer: w.th,
        options: [],
        hideHints: true,
        imageUrl: w.imageUrl
      });
    });

    // Then add phrases
    let ftPhrases: Exercise[] = [];
    lesson.phrases.forEach(p => {
      ftPhrases.push({
        id: `ft-phrase-${p.id}-${Date.now()}-${Math.random()}`,
        type: 'free-typing',
        question: language === 'en' ? (p.en || p.fr) : p.fr,
        answer: p.th,
        options: [],
        hideHints: true,
        imageUrl: p.imageUrl
      });
    });

    ftPool = shuffle(ftPool);
    ftPhrases = shuffle(ftPhrases);
    
    let combinedPool = [...ftPool, ...ftPhrases];
    while (combinedPool.length < 10 && combinedPool.length > 0) combinedPool = [...combinedPool, ...shuffle(combinedPool)];
    
    // Return all previous levels followed by free typing test
    return [...previousLevels, ...combinedPool.slice(0, 10)].map(ex => ({
      ...ex,
      forceHideRomanization: true
    }));
  }


  // Prevent same questions consecutively
  const result: Exercise[] = [];
  const waitlist: Exercise[] = [];
  
  for (let i = 0; i < finalExercises.length; i++) {
     const current = finalExercises[i];
     const lastInResult = result[result.length - 1];
     
     if (!lastInResult || lastInResult.answer !== current.answer) {
         result.push(current);
         let w = 0;
         while (w < waitlist.length) {
            if (result[result.length - 1].answer !== waitlist[w].answer) {
                result.push(waitlist.splice(w, 1)[0]);
            } else {
                w++;
            }
         }
     } else {
         waitlist.push(current);
     }
  }
  
  const finalResult = [...result, ...waitlist];
  
  const exercisesWithIntros: Exercise[] = [];
  const introducedIds = new Set<string>();

  for (const ex of finalResult) {
    if (level === 0 && !lesson.isReview && ex.type === 'word-match') {
      const word = validLessonWords.find(w => w.th === ex.answer);
      if (word && !introducedIds.has(word.id)) {
        introducedIds.add(word.id);
        exercisesWithIntros.push({
          id: `intro-${word.id}-${Math.random()}`,
          type: 'intro',
          question: language === 'en' ? (word.en || word.fr) : word.fr,
          answer: word.th,
          options: [],
          introItem: word,
          hideHints: false
        });
      }
    } else if (level === 1 && !lesson.isReview && ex.type === 'sentence-builder') {
      const phrase = lesson.phrases.find(p => p.th === ex.answer);
      if (phrase && !introducedIds.has(phrase.id)) {
        introducedIds.add(phrase.id);
        exercisesWithIntros.push({
          id: `intro-${phrase.id}-${Math.random()}`,
          type: 'intro',
          question: language === 'en' ? (phrase.en || phrase.fr) : phrase.fr,
          answer: phrase.th,
          options: [],
          introItem: phrase,
          hideHints: false
        });
      }
    }
    exercisesWithIntros.push(ex);
  }

  // Prevent consecutive word-match exercises from having the correct answer at the same index
  let lastCorrectIndex = -1;
  for (const ex of exercisesWithIntros) {
    if (ex.type === 'word-match' && !ex.isFillInBlank && ex.options && ex.options.length > 1) {
      let correctIndex = ex.options.findIndex((o: any) => o.th === ex.answer);
      if (correctIndex !== -1) {
        if (correctIndex === lastCorrectIndex) {
          let newIdx;
          do {
            newIdx = Math.floor(Math.random() * ex.options.length);
          } while (newIdx === correctIndex);
          const newOptions = [...ex.options];
          [newOptions[correctIndex], newOptions[newIdx]] = [newOptions[newIdx], newOptions[correctIndex]];
          ex.options = newOptions;
          correctIndex = newIdx;
        }
        lastCorrectIndex = correctIndex;
      }
    }
  }

  return exercisesWithIntros;
}

export function generateEndlessPairMatching(
  allLessons: Lesson[],
  completedLessonIds: string[],
  language: string = 'fr'
): Exercise[] {
  const completedLessons = allLessons.filter(l => completedLessonIds.includes(l.id));
  if (completedLessons.length === 0) return [];
  const globalItemsRaw = completedLessons.flatMap(l => [...l.words.filter(w => w.id !== 'w_dots'), ...l.phrases]);
  const globalItems = Array.from(new Map(globalItemsRaw.map(w => [w.id, w])).values());
  if (globalItems.length < 4) return [];

  let exercises: Exercise[] = [];
  for (let i = 0; i < 20; i++) {
    const selectedPairs = shuffle(globalItems).slice(0, 4);
    
    // Pick a random mode for review
    const modeRoll = Math.random();
    let mode: 'normal' | 'audio-only' | 'script-only' = 'normal';
    if (modeRoll < 0.33) {
      mode = 'audio-only';
    } else if (modeRoll < 0.66) {
      mode = 'script-only';
    }

    exercises.push({
      id: `endless-pm-${Date.now()}-${Math.random()}`,
      type: 'pair-matching',
      question: language === 'en' ? 'Match the pairs' : 'Reliez les paires correspondantes',
      answer: '',
      options: selectedPairs as any,
      pairs: selectedPairs as any,
      hideHints: true,
      pairMatchMode: mode
    });
  }
  return exercises;
}
