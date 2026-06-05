import fs from 'fs';

const filePath = 'c:\\xampp\\htdocs\\thai-learn-officiel\\app\\data\\course.json';
const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

function addLanguages(obj) {
  if (obj.fr !== undefined && obj.en !== undefined) {
    if (obj.es === undefined) obj.es = "";
    if (obj.de === undefined) obj.de = "";
    if (obj.it === undefined) obj.it = "";
  }
}

if (data.lessons) {
  data.lessons.forEach(lesson => {
    // Lesson titles and descriptions
    if (lesson.titleEs === undefined) lesson.titleEs = "";
    if (lesson.titleDe === undefined) lesson.titleDe = "";
    if (lesson.titleIt === undefined) lesson.titleIt = "";
    
    if (lesson.descriptionEs === undefined) lesson.descriptionEs = "";
    if (lesson.descriptionDe === undefined) lesson.descriptionDe = "";
    if (lesson.descriptionIt === undefined) lesson.descriptionIt = "";

    if (lesson.words) {
      lesson.words.forEach(word => {
        addLanguages(word);
      });
    }

    if (lesson.phrases) {
      lesson.phrases.forEach(phrase => {
        addLanguages(phrase);
      });
    }
  });
}

// Ensure formatting is preserved nicely
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
console.log('course.json updated successfully!');
