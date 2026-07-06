const fs = require('fs');
const data = JSON.parse(fs.readFileSync('c:\\xampp\\htdocs\\thai-learn-officiel\\src\\data\\course.json', 'utf8'));
let total = 0;
let missingEn = 0;
data.lessons.forEach(l => {
  l.words?.forEach(w => {
    total++;
    if (!w.en || w.en.trim() === '') missingEn++;
  });
  l.phrases?.forEach(p => {
    total++;
    if (!p.en || p.en.trim() === '') missingEn++;
  });
});
console.log(`Total items: ${total}`);
console.log(`Missing en: ${missingEn}`);
