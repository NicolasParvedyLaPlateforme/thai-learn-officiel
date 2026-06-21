const fs = require('fs');

const path = './app/data/course.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

let startIndex = data.findIndex(lesson => lesson.id === 'lesson-15');
if (startIndex === -1) startIndex = 0; // fallback if not found

const toTranslate = [];

for (let i = startIndex; i < data.length; i++) {
  const lesson = data[i];
  
  if (!lesson.titleEs || !lesson.titleDe || !lesson.titleIt) {
    toTranslate.push({
      type: 'lesson',
      lessonId: lesson.id,
      fr_title: lesson.title,
      en_title: lesson.titleEn,
      fr_description: lesson.description,
      en_description: lesson.descriptionEn
    });
  }

  for (const word of lesson.words || []) {
    if (!word.es || !word.de || !word.it) {
      toTranslate.push({
        type: 'word',
        lessonId: lesson.id,
        wordId: word.id,
        fr: word.fr,
        en: word.en
      });
    }
  }

  for (const phrase of lesson.phrases || []) {
    if (!phrase.es || !phrase.de || !phrase.it) {
      toTranslate.push({
        type: 'phrase',
        lessonId: lesson.id,
        phraseId: phrase.id,
        fr: phrase.fr,
        en: phrase.en
      });
    }
  }
}

fs.writeFileSync('to_translate.json', JSON.stringify(toTranslate, null, 2));
console.log(`Found ${toTranslate.length} items to translate.`);
