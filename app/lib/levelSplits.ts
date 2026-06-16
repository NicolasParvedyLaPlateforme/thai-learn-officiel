export const getLevelSplit = (levelIndex: number, lesson?: any): number => {
  if (lesson && lesson.part) {
    const val = lesson.part[`niveau-${levelIndex + 1}`];
    if (val !== undefined) {
      return Number(val);
    }
  }

  // Fallback for older lessons or missing part object
  if (levelIndex === 7) return 3; // Niveau 8: 3 mini-niveaux
  if (levelIndex === 8) return 3; // Niveau 9: 3 mini-niveaux
  return 1; // Classique: 1 partie entière
};
