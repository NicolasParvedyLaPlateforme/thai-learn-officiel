export function calculateLessonLevelAndStars(
  currentLevel: number,
  playedLevel: number | undefined,
  earnedStars: number,
  currentStarsArray: number[] | undefined
) {
  let newLevel = currentLevel;
  if (playedLevel !== undefined) {
    if (playedLevel === currentLevel) {
       newLevel = Math.min(currentLevel + 1, 10);
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
