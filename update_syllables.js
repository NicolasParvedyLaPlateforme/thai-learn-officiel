const fs = require('fs');
const path = require('path');

const coursePath = path.join(__dirname, 'app/data/course.json');
const courseData = JSON.parse(fs.readFileSync(coursePath, 'utf-8'));

let countWords = 0;
let countPhrases = 0;

for (const lesson of courseData.lessons) {
    if (lesson.words) {
        for (const word of lesson.words) {
            if (word.syllabe === undefined) {
                word.syllabe = word.id === 'w_sawatdee' ? "1, 4" : "";
                countWords++;
            }
        }
    }
    if (lesson.phrases) {
        for (const phrase of lesson.phrases) {
            if (phrase.syllabe === undefined) {
                phrase.syllabe = "";
                countPhrases++;
            }
        }
    }
}

fs.writeFileSync(coursePath, JSON.stringify(courseData, null, 2), 'utf-8');
console.log(`Added syllabe to ${countWords} words and ${countPhrases} phrases.`);
