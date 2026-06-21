const fs = require('fs');
const course = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));
const convs = JSON.parse(fs.readFileSync('./app/data/conversations.json', 'utf8'));

let allWords = [];
course.lessons.forEach(l => {
  (l.words || []).forEach(w => {
    allWords.push({ text: w.th, lessonId: l.id, wordData: w });
  });
});
allWords.sort((a, b) => b.text.length - a.text.length);

const requiredLessons = new Set();
const matchedWords = [];
const conv = convs.conversations[0];

conv.dialogs.forEach(d => {
   let text = d.th;
   allWords.forEach(w => {
      if (text.includes(w.text)) {
         requiredLessons.add(w.lessonId);
         matchedWords.push({ word: w.text, lessonId: w.lessonId });
         text = text.split(w.text).join(' '); // remove to prevent sub-matching
      }
   });
});

console.log("Matched Words:", matchedWords);
console.log("Required Lessons:", Array.from(requiredLessons));
