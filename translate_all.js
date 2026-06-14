const fs = require('fs');

const translate = async (text, targetLang) => {
  if (!text) return "";
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=fr&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Translation failed for text: ${text} with status: ${response.status}`);
      return "";
    }
    const json = await response.json();
    return json[0].map(item => item[0]).join('');
  } catch (err) {
    console.error(`Error translating: ${text}`, err);
    return "";
  }
};

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  const path = './app/data/course.json';
  const rawData = fs.readFileSync(path, 'utf8');
  let data;
  try {
    data = JSON.parse(rawData);
  } catch(e) {
    console.error("Invalid JSON:", e);
    return;
  }
  
  // It could be an array or an object containing an array.
  let lessons = Array.isArray(data) ? data : data.lessons;
  if (!lessons) {
    console.error("Could not find lessons array.");
    return;
  }

  let startIndex = lessons.findIndex(l => l.id === 'lesson-15');
  if (startIndex === -1) {
    console.log("Could not find lesson-15, starting from where id includes '15' or just index 0...");
    startIndex = lessons.findIndex(l => l.id && l.id.includes('15'));
    if (startIndex === -1) startIndex = 0;
  }
  
  console.log(`Starting translation from index ${startIndex} (Lesson ID: ${lessons[startIndex].id})`);

  let count = 0;

  for (let i = startIndex; i < lessons.length; i++) {
    const lesson = lessons[i];
    console.log(`Processing lesson ${lesson.id}...`);

    // Translate lesson titles and descriptions
    if (lesson.title && (!lesson.titleEs || lesson.titleEs.trim() === "")) {
      lesson.titleEs = await translate(lesson.title, 'es');
      await delay(200); count++;
    }
    if (lesson.title && (!lesson.titleDe || lesson.titleDe.trim() === "")) {
      lesson.titleDe = await translate(lesson.title, 'de');
      await delay(200); count++;
    }
    if (lesson.title && (!lesson.titleIt || lesson.titleIt.trim() === "")) {
      lesson.titleIt = await translate(lesson.title, 'it');
      await delay(200); count++;
    }

    if (lesson.description && (!lesson.descriptionEs || lesson.descriptionEs.trim() === "")) {
      lesson.descriptionEs = await translate(lesson.description, 'es');
      await delay(200); count++;
    }
    if (lesson.description && (!lesson.descriptionDe || lesson.descriptionDe.trim() === "")) {
      lesson.descriptionDe = await translate(lesson.description, 'de');
      await delay(200); count++;
    }
    if (lesson.description && (!lesson.descriptionIt || lesson.descriptionIt.trim() === "")) {
      lesson.descriptionIt = await translate(lesson.description, 'it');
      await delay(200); count++;
    }

    // Translate words
    for (const word of lesson.words || []) {
      if (word.fr && (!word.es || word.es.trim() === "")) {
        word.es = await translate(word.fr, 'es');
        await delay(200); count++;
      }
      if (word.fr && (!word.de || word.de.trim() === "")) {
        word.de = await translate(word.fr, 'de');
        await delay(200); count++;
      }
      if (word.fr && (!word.it || word.it.trim() === "")) {
        word.it = await translate(word.fr, 'it');
        await delay(200); count++;
      }
    }

    // Translate phrases
    for (const phrase of lesson.phrases || []) {
      if (phrase.fr && (!phrase.es || phrase.es.trim() === "")) {
        phrase.es = await translate(phrase.fr, 'es');
        await delay(200); count++;
      }
      if (phrase.fr && (!phrase.de || phrase.de.trim() === "")) {
        phrase.de = await translate(phrase.fr, 'de');
        await delay(200); count++;
      }
      if (phrase.fr && (!phrase.it || phrase.it.trim() === "")) {
        phrase.it = await translate(phrase.fr, 'it');
        await delay(200); count++;
      }
    }

    // Periodically save to avoid losing data in case of error
    if (i % 5 === 0) {
      if (Array.isArray(data)) {
        fs.writeFileSync(path, JSON.stringify(data, null, 2));
      } else {
        fs.writeFileSync(path, JSON.stringify({ ...data, lessons }, null, 2));
      }
      console.log(`Saved progress at lesson ${lesson.id}`);
    }
  }

  // Final save
  if (Array.isArray(data)) {
    fs.writeFileSync(path, JSON.stringify(data, null, 2));
  } else {
    fs.writeFileSync(path, JSON.stringify({ ...data, lessons }, null, 2));
  }
  
  console.log(`Finished! Performed ${count} translation requests.`);
}

main();
