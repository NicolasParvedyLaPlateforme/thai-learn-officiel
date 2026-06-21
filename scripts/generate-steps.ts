import fs from 'fs';
import path from 'path';
import { getExactStepsCountServer } from '../src/actions/course';
import courseData from '../src/data/course.json';
import speakCourseData from '../src/data/speak_course.json';
import { getAlphabetLessons } from '../src/lib/alphabet-utils';
import { getLevelSplit } from '../src/lib/levelSplits';

async function generateMetadata() {
  console.log("Generating steps metadata...");
  const metadata: Record<string, any> = {
    learn: {},
    alphabet: {},
    speak: {}
  };

  // 1. Learn lessons
  console.log("Processing Learn lessons...");
  for (const lesson of courseData.lessons) {
    metadata.learn[lesson.id] = {};
    for (let level = 0; level <= 10; level++) {
      metadata.learn[lesson.id][level] = {};
      const totalParts = getLevelSplit(level, lesson);
      
      // Full level (playFullLevel = true, so partIndex = null, totalParts = null)
      const fullCount = await getExactStepsCountServer('learn', lesson.id, level, 'fr', null, null);
      metadata.learn[lesson.id][level]['full'] = fullCount;

      // Parts
      if (totalParts > 1) {
        for (let part = 0; part < totalParts; part++) {
          const partCount = await getExactStepsCountServer('learn', lesson.id, level, 'fr', part, totalParts);
          metadata.learn[lesson.id][level][`part_${part}`] = partCount;
        }
      }
    }
  }

  // 2. Alphabet lessons
  console.log("Processing Alphabet lessons...");
  const rawLessons = getAlphabetLessons();
  const allAlphaLessons = [...rawLessons.consonants, ...rawLessons.vowels];
  for (const lesson of allAlphaLessons) {
    metadata.alphabet[lesson.id] = {};
    for (let level = 0; level <= 10; level++) {
      metadata.alphabet[lesson.id][level] = {};
      const totalParts = getLevelSplit(level, lesson);
      const fullCount = await getExactStepsCountServer('alphabet', lesson.id, level, 'fr', null, null);
      metadata.alphabet[lesson.id][level]['full'] = fullCount;

      if (totalParts > 1) {
        for (let part = 0; part < totalParts; part++) {
          const partCount = await getExactStepsCountServer('alphabet', lesson.id, level, 'fr', part, totalParts);
          metadata.alphabet[lesson.id][level][`part_${part}`] = partCount;
        }
      }
    }
  }

  // 3. Speak lessons
  console.log("Processing Speak lessons...");
  for (const lesson of speakCourseData.lessons) {
    metadata.speak[lesson.id] = {};
    for (let level = 0; level <= 4; level++) {
      metadata.speak[lesson.id][level] = {};
      const totalParts = getLevelSplit(level, lesson);
      const fullCount = await getExactStepsCountServer('speak', lesson.id, level, 'fr', null, null);
      metadata.speak[lesson.id][level]['full'] = fullCount;

      if (totalParts > 1) {
        for (let part = 0; part < totalParts; part++) {
          const partCount = await getExactStepsCountServer('speak', lesson.id, level, 'fr', part, totalParts);
          metadata.speak[lesson.id][level][`part_${part}`] = partCount;
        }
      }
    }
  }

  const outLearn = path.join(process.cwd(), 'src/data/steps_metadata_learn.json');
  fs.writeFileSync(outLearn, JSON.stringify(metadata.learn, null, 2));

  const outAlpha = path.join(process.cwd(), 'src/data/steps_metadata_alphabet.json');
  fs.writeFileSync(outAlpha, JSON.stringify(metadata.alphabet, null, 2));

  const outSpeak = path.join(process.cwd(), 'src/data/steps_metadata_speak.json');
  fs.writeFileSync(outSpeak, JSON.stringify(metadata.speak, null, 2));

  console.log(`Metadata successfully saved to src/data/steps_metadata_*.json`);
}

generateMetadata().catch(err => {
  console.error("Error generating metadata:", err);
  process.exit(1);
});
