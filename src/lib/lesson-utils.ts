export function calculateLessonLevelAndStars(
  currentLevel: number,
  playedLevel: number | undefined,
  earnedStars: number,
  currentStarsArray: number[] | undefined
) {
  let newLevel = currentLevel;
  if (playedLevel !== undefined) {
    if (playedLevel >= currentLevel) {
       newLevel = Math.max(currentLevel, Math.min(playedLevel + 1, 10));
    }
  } else {
     newLevel = Math.min(currentLevel + 1, 10);
  }
  
  const currentStars = currentStarsArray ? [...currentStarsArray] : Array(10).fill(0);
  if (playedLevel !== undefined && playedLevel >= 0 && playedLevel < 10) {
     currentStars[playedLevel] = Math.max(currentStars[playedLevel], earnedStars);
  }
  
  return { newLevel, newStars: currentStars };
}

export function computeUnits(baseUnits: any[], lessons: any[]) {
    const computedUnits = [];
    let currentStartIndex = 0;

    for (let i = 0; i < baseUnits.length; i++) {
      const baseUnit = baseUnits[i];
      let endIndex = currentStartIndex;

      for (let j = currentStartIndex; j < lessons.length; j++) {
        const title = lessons[j].title || "";
        const titleEn = lessons[j].titleEn || "";
        if (title.toLowerCase().includes("bilan") || titleEn.toLowerCase().includes("review")) {
          endIndex = j + 1;
          break;
        }
      }

      if (endIndex === currentStartIndex && currentStartIndex < lessons.length) {
        endIndex = lessons.length;
      }

      computedUnits.push({
        ...baseUnit,
        startIndex: currentStartIndex,
        endIndex: endIndex
      });

      currentStartIndex = endIndex;
    }
    return computedUnits;
}
