const c = require("./app/data/course.json");
for(let i of [0, 9, 10, 11]) {
  console.log(`Lesson ${i}: ${c.lessons[i]?.title} - isReview: ${!!c.lessons[i]?.isReview}`);
}
