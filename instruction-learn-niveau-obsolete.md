# Système de Progression et Niveaux (Section /learn)

Ce document décrit en détail la logique de progression des niveaux dans la section **Apprentissage** (`/learn`) de l'application, ainsi que le fonctionnement du système de "Parts" (découpage en tranches).

---

## 1. Structure Globale des Niveaux

Chaque leçon (ex: *Salutations et Politesse*) est composée de **10 niveaux standards** plus **1 niveau Ultime** (Maîtrise). Le joueur doit débloquer les niveaux un par un. 

La récompense en expérience (XP) augmente drastiquement dans les derniers niveaux pour récompenser l'effort et la difficulté. Le système distingue la **première réussite de la journée** (qui rapporte beaucoup) et la **répétition le même jour** (qui rapporte moins pour éviter l'abus).

### Détail des XP par Niveau (Mode Complet)

| Niveau | Index technique | XP (1ère fois du jour) | XP (Répétition le même jour) |
| :--- | :---: | :---: | :---: |
| **Niveau 1 à 7** | `0` à `6` | **30 XP** | 5 XP |
| **Niveau 8** | `7` | **50 XP** | 5 XP |
| **Niveau 9** | `8` | **100 XP** | 25 XP |
| **Niveau 10** | `9` | **300 XP** | 50 XP |
| **Niveau Ultime** | `10` | **1000 XP** | 200 XP |

> **Note :** Les leçons de type "Bilan" (révision globale) rapportent **50 XP** la première fois, puis **25 XP**.

---

## 2. Le Système de "Parts" (Découpage)

Afin d'éviter que les niveaux ne soient trop longs ou indigestes (surtout quand il y a beaucoup de vocabulaire ou de phrases), un niveau peut être découpé en plusieurs **Parts** (tranches). 
Ce paramétrage est défini directement dans le fichier `course.json` (ex: `"niveau-1": "3"` signifie que le niveau 1 est coupé en 3 parts).

### A. Comment ça fonctionne pour le joueur ?

1. **Découverte (En cours)** : 
   - Le bouton "Commencer la leçon" lance automatiquement la **Partie 1**.
   - Une fois la Partie 1 terminée, la progression est sauvegardée. Le joueur peut faire une pause.
   - En recliquant, il lancera automatiquement la **Partie 2**, et ainsi de suite.
   - Le niveau n'est considéré comme "Terminé" (passé au niveau supérieur) que lorsque **toutes les parts** ont été complétées.

2. **Niveau Terminé (Révision)** :
   - Une fois le niveau fini, le bouton "Commencer la leçon" se transforme visuellement en **"Camembert" (Slices)**.
   - Le bouton est visuellement découpé en autant de tranches qu'il y a de parts (ex: 3 tranches).
   - Le joueur peut cliquer sur **une tranche spécifique** pour ne réviser que cette partie (très utile pour cibler ses faiblesses).

3. **Mode "Niveau Entier" (Toggle Camembert)** :
   - Quand le niveau est terminé, une petite icône "Camembert/Cercle" apparaît au-dessus du bouton.
   - Elle permet de basculer entre le mode **"Slices" (réviser par part)** et le mode **"Entier" (jouer tout le niveau d'un coup sans découpage)**.

### B. L'XP avec le Système de Parts

Lorsqu'un joueur fait une part individuelle, l'XP gagné est adapté pour ne pas déséquilibrer l'économie du jeu :

| Niveau | XP par Part (1ère fois) | XP par Part (Répétition) |
| :--- | :---: | :---: |
| **Niveau 1 à 7** | **10 XP** | 5 XP |
| **Niveau 8** | **20 XP** | 5 XP |
| **Niveau 9** | **30 XP** | 5 XP |
| **Niveau 10** | **50 XP** | 5 XP |
| **Niveau Ultime** | *Non applicable* | *Non applicable* |

> **Important (Logique de la Journée) :** Le système garde en mémoire chaque part individuellement. Si un joueur fait la *Partie 1* le matin, il gagne 10 XP. S'il fait la *Partie 2* le soir, **c'est la première fois qu'il fait la Partie 2 aujourd'hui**, il gagne donc bien 10 XP à nouveau.

---

## 3. Logique de Réinitialisation (Reset)

Le joueur a la possibilité de réinitialiser complètement une leçon. Dans ce cas :
1. Sa progression retombe au Niveau 1.
2. Toutes les étoiles (Mastery) de cette leçon sont remises à zéro.
3. Le statut des *Parts* terminées est effacé.
4. **La mémoire de la journée est purgée** pour cette leçon : Si le joueur avait déjà gagné l'XP "Première fois" aujourd'hui avant de réinitialiser, il pourra le **gagner à nouveau** en refaisant les niveaux, car le système considère que les compteurs sont remis à zéro.

---

## 4. Résumé Technique des Variables (Pour le Code)

- `levelIndex` : L'index du niveau (0 = Niv 1, 9 = Niv 10, 10 = Ultime).
- `partIndex` : L'index de la part en cours (ex: 0 pour la première part).
- `totalParts` : Le nombre total de parts pour le niveau ciblé.
- `isPlayingPart` : Booléen (`totalParts > 1 && !playFullLevel`). Indique à l'interface et au store qu'on s'attend à recevoir l'XP d'une part, et qu'il faut enregistrer la complétion de cette sous-partie.
- `completedToday` : Tableau stockant des clés uniques (ex: `learn_lesson-1_level-0_part_1` ou `learn_lesson-1_level-1`) pour savoir si l'utilisateur a déjà récupéré la grosse récompense XP aujourd'hui. Ces clés sont purgées à minuit (ou lors d'un Reset).
