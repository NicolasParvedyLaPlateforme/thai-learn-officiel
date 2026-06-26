import courseData from "@/data/course.json";

export interface RequiredVocabLesson {
  lessonId: string;
  lessonTitle: string;
  lessonTitleEn: string;
  matchedWords: { th: string; fr: string; en: string }[];
}

let allWordsCache: any[] | null = null;

export function initWordsCache() {
  if (!allWordsCache) {
    allWordsCache = [];
    courseData.lessons.forEach((l: any) => {
      const items = [...(l.words || []), ...(l.phrases || [])];
      items.forEach((w: any) => {
        allWordsCache!.push({
          text: w.th,
          fr: w.fr,
          en: w.en,
          syllabe: w.syllabe,
          lessonId: l.id,
          lessonTitle: l.title,
          lessonTitleEn: l.titleEn || l.title
        });
      });
    });
    // Sort longest words first to prevent sub-word matching
    allWordsCache.sort((a, b) => b.text.length - a.text.length);
  }
}

export function getPredefinedSyllables(thText: string): number[] | null {
  initWordsCache();
  const exactMatch = allWordsCache!.find(w => w.text === thText);
  if (exactMatch && exactMatch.syllabe) {
    try {
      const parts = exactMatch.syllabe.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
      if (parts.length > 0) return parts;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function getRequiredLessonsForConv(convDialogs: { th: string }[]): RequiredVocabLesson[] {
  initWordsCache();

  const lessonMap = new Map<string, RequiredVocabLesson>();

  convDialogs.forEach(d => {
    let text = d.th;
    allWordsCache!.forEach(w => {
      if (text.includes(w.text)) {
        if (!lessonMap.has(w.lessonId)) {
          lessonMap.set(w.lessonId, {
            lessonId: w.lessonId,
            lessonTitle: w.lessonTitle,
            lessonTitleEn: w.lessonTitleEn,
            matchedWords: []
          });
        }
        
        const req = lessonMap.get(w.lessonId)!;
        if (!req.matchedWords.find(mw => mw.th === w.text)) {
           req.matchedWords.push({ th: w.text, fr: w.fr, en: w.en });
        }

        // remove the matched word from the string so it won't trigger sub-matches
        text = text.split(w.text).join(' ');
      }
    });
  });

  return Array.from(lessonMap.values());
}

export const getAliases = (word: string): string[] => {
   const aliases: Record<string, string[]> = {
      'ฉัน': ['ชั้น'],
      'เขา': ['เค้า'],
      'ไหม': ['มั้ย', 'มั๊ย'],
      'หรือ': ['หรอ', 'เหรอ'],
      'หรือเปล่า': ['รึเปล่า', 'ป่าว'],
      'เปล่า': ['ป่าว'],
      'อย่างไร': ['ยังไง'],
      'เท่าไร': ['เท่าไหร่'],
      'ทำไม': ['ทําไม'],
      'ก็': ['ก้อ'],
import courseData from "@/data/course.json";

export interface RequiredVocabLesson {
  lessonId: string;
  lessonTitle: string;
  lessonTitleEn: string;
  matchedWords: { th: string; fr: string; en: string }[];
}

let allWordsCache: any[] | null = null;

export function initWordsCache() {
  if (!allWordsCache) {
    allWordsCache = [];
    courseData.lessons.forEach((l: any) => {
      const items = [...(l.words || []), ...(l.phrases || [])];
      items.forEach((w: any) => {
        allWordsCache!.push({
          text: w.th,
          fr: w.fr,
          en: w.en,
          syllabe: w.syllabe,
          lessonId: l.id,
          lessonTitle: l.title,
          lessonTitleEn: l.titleEn || l.title
        });
      });
    });
    // Sort longest words first to prevent sub-word matching
    allWordsCache.sort((a, b) => b.text.length - a.text.length);
  }
}

export function getPredefinedSyllables(thText: string): number[] | null {
  initWordsCache();
  const exactMatch = allWordsCache!.find(w => w.text === thText);
  if (exactMatch && exactMatch.syllabe) {
    try {
      const parts = exactMatch.syllabe.split(',').map((s: string) => parseInt(s.trim(), 10)).filter((n: number) => !isNaN(n));
      if (parts.length > 0) return parts;
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function getRequiredLessonsForConv(convDialogs: { th: string }[]): RequiredVocabLesson[] {
  initWordsCache();

  const lessonMap = new Map<string, RequiredVocabLesson>();

  convDialogs.forEach(d => {
    let text = d.th;
    allWordsCache!.forEach(w => {
      if (text.includes(w.text)) {
        if (!lessonMap.has(w.lessonId)) {
          lessonMap.set(w.lessonId, {
            lessonId: w.lessonId,
            lessonTitle: w.lessonTitle,
            lessonTitleEn: w.lessonTitleEn,
            matchedWords: []
          });
        }
        
        const req = lessonMap.get(w.lessonId)!;
        if (!req.matchedWords.find(mw => mw.th === w.text)) {
           req.matchedWords.push({ th: w.text, fr: w.fr, en: w.en });
        }

        // remove the matched word from the string so it won't trigger sub-matches
        text = text.split(w.text).join(' ');
      }
    });
  });

  return Array.from(lessonMap.values());
}

export const getAliases = (word: string): string[] => {
   const aliases: Record<string, string[]> = {
      'ฉัน': ['ชั้น'],
      'เขา': ['เค้า'],
      'ไหม': ['มั้ย', 'มั๊ย'],
      'หรือ': ['หรอ', 'เหรอ'],
      'หรือเปล่า': ['รึเปล่า', 'ป่าว'],
      'เปล่า': ['ป่าว'],
      'อย่างไร': ['ยังไง'],
      'เท่าไร': ['เท่าไหร่'],
      'ทำไม': ['ทําไม'],
      'ก็': ['ก้อ'],
      'หนึ่ง': ['นึง'],
      'ค่ะ': ['คะ', 'คา', 'ค่า', 'ขะ', 'ข่า'],
      'คะ': ['ค่ะ', 'ค้า', 'ขะ', 'คา'],
      'ครับ': ['คับ', 'ครัช', 'ฮะ'],
      'อะไร': ['อัลไล']
   };
   return aliases[word] || [];
};

export const replaceNumbersWithThai = (text: string) => {
   const map: Record<string, string> = {
      '0': 'ศูนย์', '1': 'หนึ่ง', '2': 'สอง', '3': 'สาม', '4': 'สี่',
      '5': 'ห้า', '6': 'หก', '7': 'เจ็ด', '8': 'แปด', '9': 'เก้า',
      '10': 'สิบ', '11': 'สิบเอ็ด', '20': 'ยี่สิบ', '100': 'ร้อย'
   };
   let res = text;
   for (const num of ['100', '20', '11', '10', '9', '8', '7', '6', '5', '4', '3', '2', '1', '0']) {
      const re = new RegExp(`(?<!\\d)${num}(?!\\d)`, 'g');
      res = res.replace(re, map[num]);
   }
   return res;
};
