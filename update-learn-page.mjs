import fs from 'fs';

const filePath = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app\\components\\LearnClientPage.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

// Ensure import
if (!content.includes('getLocalizedField')) {
  content = content.replace(
    `import { getTranslation } from '../hooks/useTranslation';`,
    `import { getTranslation, getLocalizedField } from '../hooks/useTranslation';`
  );
}

// Unit title
content = content.replace(/mounted && language === 'en' \? unit\.titleEn : unit\.title/g, `mounted ? getLocalizedField(unit, 'title', language) : unit.title`);
content = content.replace(/language === 'en' \? unit\.titleEn : unit\.title/g, `getLocalizedField(unit, 'title', language)`);

// Unit description
content = content.replace(/mounted && language === 'en' \? unit\.descriptionEn : unit\.description/g, `mounted ? getLocalizedField(unit, 'description', language) : unit.description`);
content = content.replace(/language === 'en' \? unit\.descriptionEn : unit\.description/g, `getLocalizedField(unit, 'description', language)`);

// Lesson title
content = content.replace(/mounted && language === 'en' \? \(lesson\.titleEn \|\| lesson\.title\) : lesson\.title/g, `mounted ? getLocalizedField(lesson, 'title', language) : lesson.title`);
content = content.replace(/language === 'en' \? \(lesson\.titleEn \|\| lesson\.title\) : lesson\.title/g, `getLocalizedField(lesson, 'title', language)`);

// Lesson description
content = content.replace(/mounted && language === 'en' \? \(lesson\.descriptionEn \|\| lesson\.description\) : lesson\.description/g, `mounted ? getLocalizedField(lesson, 'description', language) : lesson.description`);
content = content.replace(/language === 'en' \? \(lesson\.descriptionEn \|\| lesson\.description\) : lesson\.description/g, `getLocalizedField(lesson, 'description', language)`);

// Selected Lesson
content = content.replace(/language === 'en' \? \(selectedLesson\.lesson\.titleEn \|\| selectedLesson\.lesson\.title\) : selectedLesson\.lesson\.title/g, `getLocalizedField(selectedLesson.lesson, 'title', language)`);
content = content.replace(/language === 'en' \? \(selectedLesson\.lesson\.descriptionEn \|\| selectedLesson\.lesson\.description\) : selectedLesson\.lesson\.description/g, `getLocalizedField(selectedLesson.lesson, 'description', language)`);

// Words
content = content.replace(/language === 'en' \? w\.en : w\.fr/g, `getLocalizedField(w, '', language)`);

// Stats
content = content.replace(/language === 'en' \? \`Stats \(LVL \$\{modalLevel \+ 1\}\) :\` : \`Statistiques \(NIV\. \$\{modalLevel \+ 1\}\) :\`\)/g, `getTranslation('auto.stats_lvl', language).replace('{level}', String(modalLevel + 1)))`);
content = content.replace(/language === 'en' \? \`Vocabulary \(LVL \$\{modalLevel \+ 1\}\) :\` : \`Vocabulaire \(NIV\. \$\{modalLevel \+ 1\}\) :\`\)/g, `getTranslation('auto.vocabulary_lvl', language).replace('{level}', String(modalLevel + 1)))`);


fs.writeFileSync(filePath, content, 'utf-8');
console.log('LearnClientPage updated');
