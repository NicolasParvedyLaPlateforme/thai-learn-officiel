// Simulate what SyncProgress will now compute for fullLevelsCompleted
const lessonLevels = {
  "speak-1": 0, "lesson-1": 10, "lesson-2": 10, "lesson-3": 10,
  "lesson-5": 1, "alpha-c-1": 6, "alpha-c-2": 4, "alpha-c-3": 1,
  "alpha-c-5": 1, "lesson-13": 1, "lesson-26": 1, "lesson-27": 1,
  "lesson-28": 1, "lesson-53": 1, "lesson-61": 1, "bilan-unit-1": 9,
  "lesson-34-a2": 3, "lesson-39-a1": 1, "review-dummy": 1,
  "l_nouveau_001": 10, "l_nouveau_002": 10, "l_nouveau_003": 7,
  "l_nouveau_004": 3, "l_nouveau_005": 1, "l_nouveau_006": 1,
  "writing-dummy": 10, "lesson-3-quantities": 8,
  "detective_bureau-1_diff1": 1
};

const dbFullLevels = { "lesson-3-quantities": [0,1,2,3,4] };

const rebuiltFullLevels = { ...dbFullLevels };

Object.entries(lessonLevels).forEach(([lessonId, level]) => {
  if (lessonId.startsWith('speak_') || lessonId.startsWith('alphabet_') || lessonId.startsWith('alpha-')) return;
  const numLevel = Number(level);
  if (numLevel <= 0) return;
  const existing = rebuiltFullLevels[lessonId] || [];
  const levelsToAdd = [];
  for (let i = 0; i < numLevel; i++) {
    if (!existing.includes(i)) levelsToAdd.push(i);
  }
  if (levelsToAdd.length > 0) {
    rebuiltFullLevels[lessonId] = [...existing, ...levelsToAdd];
  }
});

console.log('=== fullLevelsCompleted AFTER migration ===');
Object.entries(rebuiltFullLevels).forEach(([k,v]) => {
  console.log(`  ${k}: [${v.join(',')}]`);
});
