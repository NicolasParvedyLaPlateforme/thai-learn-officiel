const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/course.json', 'utf8'));

const targetIds = ['l_nouveau_001', 'l_nouveau_002', 'l_nouveau_003', 'l_nouveau_004', 'l_nouveau_005', 'l_nouveau_006', 'l_nouveau_007', 'lesson-3-quantities', 'lesson-1', 'lesson-2', 'lesson-3', 'lesson-5'];

// data.lessons is likely an object map or array
const lessons = data.lessons;
console.log('lessons type:', Array.isArray(lessons) ? 'array' : typeof lessons);
if (Array.isArray(lessons)) {
  lessons.forEach(l => {
    if (targetIds.includes(l.id)) {
      console.log('\n--- Lesson:', l.id);
      console.log('part config:', JSON.stringify(l.part));
      console.log('isReview:', l.isReview);
    }
  });
} else {
  Object.entries(lessons).forEach(([key, l]) => {
    if (targetIds.includes(key) || targetIds.includes(l.id)) {
      console.log('\n--- Lesson:', key, '(id:', l.id, ')');
      console.log('part config:', JSON.stringify(l.part));
      console.log('isReview:', l.isReview);
    }
  });
}
