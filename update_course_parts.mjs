import fs from 'fs';

const path = 'app/data/course.json';
const data = JSON.parse(fs.readFileSync(path, 'utf-8'));

data.lessons.forEach(lesson => {
  lesson.part = {
    "niveau-1": "1",
    "niveau-2": "1",
    "niveau-3": "1",
    "niveau-4": "1",
    "niveau-5": "1",
    "niveau-6": "1",
    "niveau-7": "1",
    "niveau-8": "3",
    "niveau-9": "3",
    "niveau-10": "1"
  };
});

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
console.log('Updated course.json with parts object');
