const fs = require('fs');
const data = JSON.parse(fs.readFileSync('./src/data/course.json', 'utf8'));
const userData = JSON.parse(fs.readFileSync('./scripts/user-progress-data.json', 'utf8'));

const pd = userData.progressData;
const lessonLevels = pd.lessonLevels || {};
const lessonPartsCompleted = pd.lessonPartsCompleted || {};
const fullLevelsCompleted = pd.fullLevelsCompleted || {};

// getLevelSplit equivalent
function getLevelSplit(levelIndex, lesson) {
  if (!lesson) return 1;
  const isBilan = lesson.isReview === true || 
    lesson.id?.startsWith('bilan-') || 
    lesson.id?.includes('-bilan') || 
    lesson.title?.toLowerCase().includes('bilan');
  if (isBilan) return 1;
  if (lesson.part) {
    const val = lesson.part[`niveau-${levelIndex + 1}`];
    if (val !== undefined) return Number(val);
  }
  if (levelIndex === 7) return 3;
  if (levelIndex === 8) return 3;
  return 1;
}

// Simulate the maxAccessibleLevel logic from LessonPathMap
function computeMaxAccessibleLevel(lessonId, lesson, maxLevel = 10) {
  const currentFullLevels = fullLevelsCompleted[lessonId] || [];
  
  const isPartCompleted = (l, p) => {
    const key = `${lessonId}_level-${l}`;
    const parts = lessonPartsCompleted[key] || [];
    return parts.includes(p);
  };

  let maxAccessibleLevel = 0;
  let blockedByLevel = null;

  for (let l = 1; l <= maxLevel; l++) {
    const isVerticalMet = isPartCompleted(l - 1, 0);
    if (!isVerticalMet) break;

    let isBlocked = false;
    if (l >= 4) {
      for (let i = 4; i <= l; i++) {
        if (!currentFullLevels.includes(i - 4)) {
          isBlocked = true;
          blockedByLevel = blockedByLevel === null ? i : blockedByLevel;
          break;
        }
      }
      
      if (l === 4) {
        const partsL3 = lesson ? getLevelSplit(3, lesson) : 1;
        const completedL3 = lessonPartsCompleted[`${lessonId}_level-3`] || [];
        if (completedL3.length < partsL3) {
          isBlocked = true;
        }
      }
    }

    if (isBlocked) break;
    maxAccessibleLevel = l;
  }

  return { maxAccessibleLevel, blockedByLevel, currentFullLevels };
}

// Analyze the key lessons from the screenshot
const targetLessons = ['l_nouveau_001', 'l_nouveau_002', 'l_nouveau_003', 'l_nouveau_004', 'l_nouveau_005', 'l_nouveau_006', 'l_nouveau_007'];
const lessons = data.lessons;

console.log('=== ANALYSIS OF LEVEL UNLOCK CONDITIONS ===\n');

targetLessons.forEach(lessonId => {
  const lesson = lessons.find(l => l.id === lessonId);
  if (!lesson) {
    console.log(`Lesson ${lessonId} not found in course data\n`);
    return;
  }

  const currentLevel = lessonLevels[lessonId] || 0;
  const { maxAccessibleLevel, blockedByLevel, currentFullLevels } = computeMaxAccessibleLevel(lessonId, lesson);

  console.log(`\n=== ${lessonId} ===`);
  console.log(`lessonLevel (from DB): ${currentLevel}`);
  console.log(`maxAccessibleLevel (computed): ${maxAccessibleLevel}`);
  console.log(`blockedByLevel: ${blockedByLevel}`);
  console.log(`fullLevelsCompleted: [${currentFullLevels.join(', ')}]`);
  
  // For each level, show what parts are completed
  for (let l = 0; l <= Math.min(currentLevel + 1, 9); l++) {
    const key = `${lessonId}_level-${l}`;
    const parts = lessonPartsCompleted[key] || [];
    const totalParts = getLevelSplit(l, lesson);
    const p0 = parts.includes(0);
    console.log(`  Level ${l}: parts done=[${parts.join(',')}] of ${totalParts} | isPartCompleted(l,0)=${p0}`);
  }

  // Identify "La Suite" bubble issue
  const renderedNodes = [];
  for (let levelIndex = 0; levelIndex <= (blockedByLevel !== null ? blockedByLevel : maxAccessibleLevel); levelIndex++) {
    const partsKey = `${lessonId}_level-${levelIndex}`;
    const currentCompletedParts = lessonPartsCompleted[partsKey] || [];
    const currentPartsTotal = getLevelSplit(levelIndex, lesson);
    const isCompleted = currentFullLevels.includes(levelIndex);
    const isAccessible = levelIndex <= maxAccessibleLevel;
    const isBlockedByFullLevel = blockedByLevel !== null && levelIndex >= blockedByLevel;
    const effectiveAccessible = isAccessible && !isBlockedByFullLevel;
    
    const showLaSuite = !isCompleted && effectiveAccessible;
    if (showLaSuite && currentPartsTotal > 1) {
      // Check vertical condition
      const nextPart = currentCompletedParts.length;
      let isVerticalMet = true;
      if (levelIndex > 0) {
        const prevPartsKey = `${lessonId}_level-${levelIndex - 1}`;
        const prevCompletedParts = lessonPartsCompleted[prevPartsKey] || [];
        const prevLevelPartsTotal = getLevelSplit(levelIndex - 1, lesson);
        const requiredPrevPart = Math.min(nextPart, prevLevelPartsTotal - 1);
        isVerticalMet = prevCompletedParts.includes(requiredPrevPart);
      }
      if (isVerticalMet) {
        renderedNodes.push(levelIndex);
      }
    }
  }
  
  console.log(`  ==> "La Suite" would appear at nodes: [${renderedNodes.join(', ')}]`);
  if (renderedNodes.length > 1) {
    console.log(`  *** BUG: Multiple "La Suite" bubbles shown! ***`);
  }
});

// Now let's check the core issue with l_nouveau_004 specifically
console.log('\n\n=== DETAILED ANALYSIS: l_nouveau_004 (level 3 issue) ===');
const lesson4 = lessons.find(l => l.id === 'l_nouveau_004');
const l4Id = 'l_nouveau_004';
console.log('lessonLevel:', lessonLevels[l4Id]);
for (let l = 0; l <= 4; l++) {
  const key = `${l4Id}_level-${l}`;
  const parts = lessonPartsCompleted[key] || [];
  const totalParts = getLevelSplit(l, lesson4);
  console.log(`  Level ${l}: parts=[${parts.join(',')}] / total=${totalParts} | fullLevel=${(fullLevelsCompleted[l4Id] || []).includes(l)}`);
}
