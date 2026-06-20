export function calculateExpectedXp(
  lessonId: string, 
  levelIndex: number, 
  isBilan: boolean, 
  isPart: boolean = false, 
  isFullLongLevel: boolean = false, 
  partIndex: number | null = null, 
  completedToday: string[] = []
) {
  let isFirstTime = false;
  let xp = 0;
  let maxXp = 0;
  let key = '';

  if (lessonId.startsWith('detective_')) {
     key = lessonId;
     isFirstTime = !completedToday.includes(key);
     xp = isFirstTime ? 50 : 20;
     maxXp = 50;
  } else if (lessonId.startsWith('speak_')) {
     key = `${lessonId}_level-${levelIndex}`;
     if (isPart) {
        if (partIndex !== null && partIndex !== undefined) {
           key += `_part_${partIndex}`;
        } else {
           key += `_part`;
        }
     }
     isFirstTime = !completedToday.includes(key);
     if (isFullLongLevel) {
        xp = isFirstTime ? 500 : 100;
        maxXp = 500;
     } else if (isPart) {
        xp = isFirstTime ? 50 : 10;
        maxXp = 50;
     } else {
        if (levelIndex === 0) { xp = isFirstTime ? 50 : 15; maxXp = 50; }
        else if (levelIndex === 1) { xp = isFirstTime ? 100 : 30; maxXp = 100; }
        else if (levelIndex === 2) { xp = isFirstTime ? 100 : 30; maxXp = 100; }
        else if (levelIndex === 3) { xp = isFirstTime ? 150 : 45; maxXp = 150; }
        else if (levelIndex === 4) { xp = isFirstTime ? 300 : 90; maxXp = 300; }
        else { xp = isFirstTime ? 50 : 15; maxXp = 50; }
     }
  } else if (levelIndex === 10) {
     key = `learn_${lessonId}_level-10`;
     isFirstTime = !completedToday.includes(key);
     xp = isFirstTime ? 1000 : 200;
     maxXp = 1000;
  } else if (isBilan) {
     key = `learn_${lessonId}_level-${levelIndex}`;
     isFirstTime = !completedToday.includes(key);
     xp = isFirstTime ? 50 : 25;
     maxXp = 50;
  } else {
     const type = (lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) ? 'alphabet' : 'learn';
     key = `${type}_${lessonId}_level-${levelIndex}`;
     if (isPart) {
        if (partIndex !== null && partIndex !== undefined) {
           key += `_part_${partIndex}`;
        } else {
           key += `_part`;
        }
     }
     isFirstTime = !completedToday.includes(key);
     if (type === 'learn') {
        if (isPart) {
           if (levelIndex <= 6) { xp = isFirstTime ? 10 : 5; maxXp = 10; }
           else if (levelIndex === 7) { xp = isFirstTime ? 20 : 5; maxXp = 20; }
           else if (levelIndex === 8) { xp = isFirstTime ? 30 : 5; maxXp = 30; }
           else if (levelIndex === 9) { xp = isFirstTime ? 50 : 5; maxXp = 50; }
           else { xp = isFirstTime ? 10 : 5; maxXp = 10; }
        } else {
           if (levelIndex <= 6) { xp = isFirstTime ? 30 : 5; maxXp = 30; }
           else if (levelIndex === 7) { xp = isFirstTime ? 50 : 5; maxXp = 50; }
           else if (levelIndex === 8) { xp = isFirstTime ? 100 : 25; maxXp = 100; }
           else if (levelIndex === 9) { xp = isFirstTime ? 300 : 50; maxXp = 300; }
           else { xp = isFirstTime ? 30 : 5; maxXp = 30; }
        }
     } else {
        if (isPart) {
           xp = isFirstTime ? 10 : 5; maxXp = 10;
        } else {
           xp = isFirstTime ? 30 : 5; maxXp = 30;
        }
     }
  }

  return { xp, maxXp, isFirstTime, key };
}
