# 🧠 Fonctionnement de la section /learn (Parcours d'Apprentissage)

Ce document explique en détail la logique complète de génération des exercices, la composition de chaque niveau, le fonctionnement du "Niveau Ultime" (Maîtrise), et la mécanique spécifique des "Bilans" (Review Levels).

Toute cette logique métier se trouve centralisée dans le fichier : `app/lib/exercise-generator.ts`.

---

## 1. La Logique d'une Leçon "Classique"

Une leçon standard contient une liste de "Mots" (`words`) et de "Phrases" (`phrases`). L'apprentissage se veut très progressif : l'algorithme génère des exercices différents en fonction du niveau actuel de l'utilisateur (le niveau correspond à l'index `level` passé à la fonction `generateExercises`, allant de 0 à 10).

Voici la décomposition exhaustive niveau par niveau :

### Niveau 1 (Code interne : `level 0`) - Découverte et Initiation
- **Objectif :** Introduire les nouveaux mots en douceur.
- **Logique :** Pour chaque mot de la leçon, l'algorithme génère 4 étapes :
  1. **Intro :** Affichage du mot en gros avec audio et traduction (pas de question).
  2. **Word Match (2 options) :** Le mot avec 1 seul distracteur. L'utilisateur n'a droit à aucune erreur (`maxMistakes: 1`).
  3. **Word Match (4 options) :** Le mot avec 3 distracteurs. (`maxMistakes: 2`).
  4. **Word Match (Fautes d'orthographe) :** Le mot avec 3 distracteurs générés via `generateMisspelledWords()`. Ces distracteurs sont des mots thaïs qui ressemblent au vrai mot mais contiennent des fautes subtiles de consonnes.

### Niveau 2 (Code interne : `level 1`) - Transition vers les phrases
- **Objectif :** Renforcer le vocabulaire et introduire les phrases simples.
- **Logique :** 
  - **Moitié Vocabulaire (Word Match) :** L'algorithme pioche aléatoirement parmi 3 variantes (1/3 distracteurs classiques, 1/3 fautes d'orthographe, 1/3 "Reverse" où la question est en thaï et les options sont en français/anglais).
  - **Moitié Phrases (Fill-in-the-blank) :** Des exercices à trous sur les phrases de la leçon. L'utilisateur doit trouver le mot manquant. S'il n'y a pas de phrase applicable, des exercices de construction de phrases (Sentence Builder) sont utilisés à la place.

### Niveau 3 (Code interne : `level 2`) - Construction de phrases
- **Objectif :** S'entraîner à la syntaxe thaïlandaise.
- **Logique :** 
  - 1 Word Match par mot de la leçon (généré aléatoirement entre classique, orthographe ou reverse).
  - Exercices à trous (Fill-in-the-blank) pour toutes les phrases.
  - Sentence Builder "classique" (remettre tous les mots d'une phrase dans l'ordre).

### Niveau 4 (Code interne : `level 3`) - Traduction et disparition des aides
- **Objectif :** Compréhension globale et début de l'effacement de la romanisation.
- **Logique :** Mélange de Fill-in-the-blank, de Sentence Builder, et de **Phrase Match** (une nouveauté où il faut traduire une phrase entière en choisissant parmi des phrases entières similaires).
- **Particularité :** La moitié de ces exercices cache la prononciation (romanisation), obligeant l'utilisateur à lire l'alphabet thaï.

### Niveaux 5, 6 et 7 (Code interne : `level 4, 5, 6`) - Association Rapide (Pair-matching)
- **Objectif :** Mécanisation de l'association Thaï / Langue maternelle.
- **Niveau 5 :** Pair-matching classique (relier les paires). 1/3 des questions masquent la romanisation.
- **Niveau 6 :** Pair-matching **Audio uniquement**. L'utilisateur doit relier le son à la traduction.
- **Niveau 7 :** Pair-matching **Script uniquement**. L'utilisateur relie le texte thaï à la traduction, mais n'a ni audio, ni romanisation pour s'aider.

### Niveaux 8 et 9 (Code interne : `level 7 et 8`) - Écriture aveugle (Writing)
- **Objectif :** Construire les mots soi-même avec le clavier virtuel de l'application.
- **Niveau 8 :** Écriture des mots (Writing). Les consonnes/voyelles sont mélangées. Mode aveugle (pas de romanisation).
- **Niveau 9 :** Écriture des phrases (Writing). Pareil, mais pour des phrases entières.

### Niveau 10 (Code interne : `level 9`) - Saisie Libre (Free Typing)
- **Objectif :** Écrire avec son propre clavier d'ordinateur ou de téléphone.
- **Logique :** 10 mots/phrases tirés au sort. L'utilisateur doit les taper au clavier (Free typing). Plus de boutons, plus de romanisation.

---

## 2. Le Niveau Ultime / Maîtrise (Code interne : `level 10`)

Le Niveau Ultime (ou Maîtrise) est le test de fin de leçon le plus difficile.
- **Fonctionnement :** L'algorithme boucle et génère l'ensemble des exercices des Niveaux 1 à 9 (du niveau index 0 à 8). Il crée donc un test d'une très longue durée. À cela, il ajoute les 10 exercices de "Free typing" du niveau 10 à la toute fin.
- **La particularité absolue du mode Ultime :** Tous les exercices générés se voient appliquer `forceHideRomanization: true`. La romanisation phonétique est donc **complètement absente** du début à la fin de ce niveau.

---

## 3. La Logique des "Bilans" (Review Units)

Toutes les quelques leçons, un "Bilan" est proposé (`lesson.isReview` ou titre contenant "bilan").
Le but d'un Bilan n'est pas d'apprendre des nouveaux mots, mais de réviser **tout le vocabulaire et toutes les phrases de l'Unité entière** (c'est-à-dire toutes les leçons depuis le dernier Bilan).

Pour un Bilan, la mécanique d'accumulation par niveau est complètement différente :
- L'algorithme identifie la dernière leçon Bilan et récupère tout le contenu des leçons qui se trouvent entre les deux bilans (le contenu de l'Unité).
- À chaque montée en niveau, l'algorithme n'efface pas les exercices du niveau précédent, **il les additionne !**

Voici l'accumulation de la difficulté dans un Bilan :
- **Niveau 1 (`level 0`) :** 5 Word Match.
- **Niveau 2 (`level 1`) :** Les précédents **+** 5 Fill-in-the-blank. (Total = 10 exercices)
- **Niveau 3 (`level 2`) :** Les précédents **+** 5 Sentence Builder. (Total = 15 exercices)
- **Niveau 4 (`level 3`) :** Les précédents **+** 5 Phrase Match (Traductions de phrases). (Total = 20)
- **Niveau 5 (`level 4`) :** Les précédents **+** 3 Pair-matching normaux. (Total = 23)
- **Niveau 6 (`level 5`) :** Les précédents **+** 3 Pair-matching audio. (Total = 26)
- **Niveau 7 (`level 6`) :** Les précédents **+** 3 Pair-matching script. (Total = 29)
- **Niveau 8 (`level 7`) :** Les précédents **+** 3 Écritures de mots. (Total = 32)
- **Niveau 9 (`level 8`) :** Les précédents **+** 3 Écritures de phrases. **(Total = 35 exercices. Le Niveau 9 d'un Bilan est donc un test colossal de 35 questions couvrant tous les formats existants).**

*Exception :*
- **Niveau 10 du Bilan (`level 9`) :** L'accumulation s'arrête. L'algorithme propose uniquement 10 exercices aléatoires en **Free Typing**, tous sans aucune romanisation.

---

## 4. Mécanismes de qualité intégrés (Waitlist et Randomisation)

Pour assurer une expérience fluide et non frustrante :
1. **La Waitlist (File d'attente) :** À la fin de la génération des exercices, l'algorithme effectue un balayage. Si deux exercices consécutifs demandent la même réponse, le deuxième est mis en "Waitlist" pour être affiché plus tard. Il est impossible d'avoir deux questions ayant la même réponse à la suite.
2. **L'index de bonne réponse :** Pour les QCM (Word Match), l'algorithme vérifie que la bonne réponse ne tombe jamais deux fois de suite au même emplacement (ex: si la bonne réponse était le bouton 3, la question d'après placera sa bonne réponse ailleurs). Cela empêche le joueur de spammer le même emplacement.
3. **Fautes d'orthographe dynamiques :** L'application utilise une fonction mathématique (`generateMisspelledWords`) qui analyse les consonnes d'un mot et les remplace dynamiquement par d'autres consonnes similaires de l'alphabet thaï pour créer des distracteurs très difficiles.
