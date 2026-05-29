const fs = require('fs');
const course = JSON.parse(fs.readFileSync('./app/data/course.json', 'utf8'));
const convs = JSON.parse(fs.readFileSync('./app/data/conversations.json', 'utf8'));

const required = new Set();
const conv = convs.conversations[0];
for (const d of conv.dialogs) {
  for (const l of course.lessons) {
    for (const w of (l.words || [])) {
      if (d.th.includes(w.th)) {
        required.add({
          lesson: l.id,
          word: w.th,
          dialog: d.th
        });
      }
    }
  }
}
console.log(Array.from(required));
