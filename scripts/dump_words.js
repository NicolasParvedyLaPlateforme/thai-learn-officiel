const fs = require('fs');
const course = JSON.parse(fs.readFileSync('app/data/course.json', 'utf8'));
const words = course.lessons.flatMap(l => l.words).map(w => w.th);
console.log(JSON.stringify(words, null, 2));
