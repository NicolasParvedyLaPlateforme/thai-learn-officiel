# Logique de Progression des Niveaux (Basée sur /next)

Ce document centralise la logique stricte de progression d'une leçon, qui doit être identique entre le mode automatique (`/next`) et le mode manuel (`/learn`).

## 1. Structure des Niveaux
Une leçon classique contient 10 niveaux (Level 1 à Level 10) plus un niveau "Ultime".
- **Parts** : Les niveaux sont divisés en plusieurs parties (Part 1, Part 2, etc.).
- **Full Level (Niveau Entier)** : Représente la complétion globale du niveau.

## 2. L'ordre Strict (runSequence)
La progression ne permet plus d'ascension verticale libre. Elle force une complétion méthodique "horizontale" (partie par partie) et impose de terminer les Niveaux Entiers pour débloquer les niveaux supérieurs.

### Phase 1 : Remplissage Horizontal des Niveaux 1 à 4
- **Objectif** : Terminer toutes les parties des Niveaux 1 à 4 (index 0 à 3).
- **Règle de déblocage vertical** : Pour accéder à un Niveau `N`, il faut **uniquement** avoir validé la **Partie 1 du Niveau `N-1`** (`isVerticallyAccessible = prevDone.includes(0)`).
- **Règle de remplissage (Priorité)** : Le système propose d'abord la Partie 1 de tous les niveaux accessibles, puis redescend pour proposer la Partie 2 du Niveau 1, puis Partie 2 du Niveau 2, etc. (Boucle `while` sur `targetPartIndex`).
  
*Note pour l'UI (/learn) : L'UI doit refléter cette disponibilité. Si la Partie 1 du Niv 1 est faite, le Niv 2 est "débloqué". Mais le système suggère par défaut le prochain élément logique (remplissage des parties manquantes).*

### Phase 2 et 3 : Intercalage des "Full Levels" (Niveaux 5 à 10)
- **Objectif** : Débloquer les Niveaux 5 à 10 en validant les "Full Levels" (Révisions).
- **Mécanique** :
  - Le Full Niveau 1 (index 0) doit être terminé pour débloquer les parties du Niveau 5 (index 4).
  - Le Full Niveau 2 (index 1) doit être terminé pour débloquer les parties du Niveau 6 (index 5).
  - ... et ainsi de suite jusqu'au Full Niveau 6 débloquant le Niveau 10.
- **Règle stricte de niveau (lessonLevels)** : Pour débloquer la suite, il ne suffit pas d'avoir fait la Partie 1 du Niveau 5. Le système requiert que **TOUTES les parties** du niveau précédent soient terminées (ce qui correspond à l'incrémentation de `lessonLevel`).
  *Exemple : Impossible d'accéder au Niveau 6 si `lessonLevels < 5` (signifiant que toutes les parties du Niveau 5 ne sont pas faites).*

### Phase 4 : Niveau Ultime
- Accessible uniquement si le `lessonLevel` global de la leçon a atteint 10 (c'est-à-dire que toutes les parties des 10 niveaux sont terminées).

## 3. Gestion des Bilans
- Les leçons de type "Bilan" (Review) d'une unité sont bloquées jusqu'à ce que **toutes les leçons normales de l'unité** aient leur Niveau Ultime de terminé.

## 4. Règles d'UI pour `/learn` (Adaptation)
Pour que `/learn` s'adapte à cette logique sans perdre en ergonomie :
1. **Déblocage Visuel (Cadenas)** : 
   - Niveaux 1 à 4 : Débloqués verticalement dès que la Partie 1 du niveau précédent est faite.
   - Niveaux 5 à 10 : Débloqués **uniquement** si le "Full Level" correspondant est terminé ET que le niveau global de progression (`lessonLevel`) permet d'y accéder (toutes les parties du niveau précédent finies).
2. **Auto-Scroll / Focus** :
   - Plutôt que de pointer systématiquement sur le niveau le plus haut (l'ancienne logique de "maxAccessibleLevel"), le focus automatique doit cibler **le prochain niveau logique** dicté par l'algorithme `computeNextLesson` (Phase 1, 2, 3), tout en laissant à l'utilisateur la liberté de cliquer sur n'importe quel autre niveau visuellement "débloqué".
3. **Bulles de blocage (Tooltips)** :
   - Si l'utilisateur clique sur un niveau bloqué :
     - Pour les Niv 2 à 4 : "Terminez la Partie 1 du Niveau X pour débloquer."
     - Pour les Niv 5 à 10 : "Terminez le Niveau Entier X et complétez toutes les parties précédentes pour débloquer."
