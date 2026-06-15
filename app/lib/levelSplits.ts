export const getLevelSplit = (levelIndex: number): number => {
  if (levelIndex === 7) return 3; // Niveau 8: 3 mini-niveaux
  if (levelIndex === 8) return 3; // Niveau 9: 3 mini-niveaux
  return 1; // Classique: 1 partie entière
};
