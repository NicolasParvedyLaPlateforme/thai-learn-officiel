# 🤖 Guide et Documentation de Développement (ThaiLearn)

Ce fichier est mon "cerveau" et guide principal pour intervenir sur ce projet de manière rapide et efficace. Il recense les règles de développement, l'architecture du projet, les points d'attention cruciaux et toutes les conventions à respecter.

> **Note pour l'IA (Moi-même) :** 
> 🔴 À lire IMPÉRATIVEMENT avant toute intervention majeure.
> 🔄 À mettre à jour au fur et à mesure que de nouvelles règles ou subtilités apparaissent.

---

## 🏗️ Architecture Principale (Les Piliers de l'App)

L'application est divisée en sections principales, chacune accessible via son URL et disposant de sa propre logique d'apprentissage.

1. **Parcours (`/learn`)**
   - **But :** Apprendre le vocabulaire et les phrases de base via une progression balisée (unités et niveaux).
   - **Système :** 10 niveaux (levels) de progression entre chaque exercice majeur pour valider les acquis.
   - **Fichiers clés :** `app/learn/page.tsx`, `app/lesson/[id]` (gère la mécanique de la leçon en elle-même).

2. **Alphabet (`/alphabet`)**
   - **But :** Apprentissage spécifique de l'alphabet thaï (consonnes, voyelles, tons).
   - **Système :** Exercices similaires à "Parcours" mais dédiés aux lettres et phonétique.
   - **Fichiers clés :** `app/alphabet/page.tsx`, `app/alphabet/lesson/[id]`.

3. **Dialogues (`/conversations`)**
   - **But :** Histoires et dialogues concrets pour mettre en pratique le vocabulaire appris dans le parcours.
   - **Système :** Lecture et écoute de conversations réelles, découpage par bulles de dialogue, vérification de compréhension.
   - **Fichiers clés :** `app/conversations/` (liste et logique de lecture des dialogues).

4. **Détective (`/detective`)**
   - **But :** Jeu immersif d'objets cachés pour apprendre le vocabulaire en contexte visuel.
   - **Système :** L'utilisateur clique sur des zones de l'image correspondant aux mots thaïs demandés, avec système de zoom et d'erreurs (perte d'étoiles). Récompense de 50 XP à la première complétion **de la journée**, 20 XP ensuite (se réinitialise chaque jour).
   - **Fichiers clés :** `app/detective/page.tsx`, `app/components/detective/DetectiveGame.tsx`.

5. **Pratique (`/practice`)**
   - **But :** Entraînement libre et à l'infini.
   - **Système :** 3 types d'exercices d'entraînement générés dynamiquement.
   - **Fichiers clés :** `app/practice/page.tsx` et ses sous-dossiers.

6. **Comptes, Profil & Classement (`/login`, `/profile`, `/leaderboard`)**
   - **But :** Authentification via NextAuth, sauvegarde en base de données Prisma, gestion des XP et pseudos.
   - **Système :** Système de classement des joueurs. Sauvegarde du pseudo et gestion du profil.
   - **Fichiers clés :** `app/profile/page.tsx`, `app/api/auth/...`, `app/leaderboard/page.tsx`, `prisma/schema.prisma`.

---

## 🚨 RÈGLES STRICTES ET INTERDITS

### 1. Fichiers de données (Intouchables 🚫)
Les fichiers JSON suivants situés dans `app/data/` sont formellement interdits de modification par moi-même (sauf autorisation EXPLICITE de l'utilisateur). Ces fichiers sont gérés automatiquement par le CMS de l'utilisateur.
- `app/data/course.json`
- `app/data/emoji_mapping.json` (et dérivés d'emojis)
- `app/data/units.json` (et dérivés `alphabet_units.json`, `conversation_units.json`)
- `app/data/conversations.json`

### 2. Multilinguisme & Traduction (⚠️ TRÈS IMPORTANT 🌍)
L'application est entièrement multilingue via le système de locales.
- **Règle d'or :** Si j'ajoute un bouton, un texte, une infobulle ou tout élément d'interface utilisateur, **je DOIS systématiquement le traduire** dans les fichiers JSON du dossier `app/locales/` (`fr.json`, `en.json`, `de.json`, `it.json`, etc.).
- **Aucun texte en dur :** Ne JAMAIS laisser de texte en dur (ex: `<div>Bonjour</div>`) dans un composant. Je dois utiliser le hook `useTranslation` :
  ```tsx
  import { useTranslation } from '../hooks/useTranslation';
  const { t } = useTranslation();
  // ...
  <div>{t('section.key')}</div>
  ```
- Si je mets à jour un composant qui contient encore du texte en dur, je **dois** le refactoriser pour utiliser les fichiers de traduction.

### 3. Respect du périmètre des consignes 🎯
- Ne **JAMAIS** ajouter de fonctionnalités non sollicitées par le développeur (moi).
- Ne **JAMAIS** supprimer de fonctionnalités sans avoir posé la question et obtenu l'accord de l'utilisateur.
- Si une idée d'amélioration pertinente me vient à l'esprit, je dois la *proposer* d'abord.

### 4. Architecture & Performances ⚡
- **Modulatité (Petits composants) :** Un composant React ne devrait idéalement pas dépasser 300-400 lignes. S'il grossit, diviser le visuel en sous-composants "bêtes" (ex: `app/components/learn/`) tout en gardant la logique d'état complexe dans le parent.
- **Lazy Loading (next/dynamic) :** Toutes les Modales, Tiroirs (Drawers) et composants lourds non visibles au chargement initial doivent **impérativement** être importés via `next/dynamic({ ssr: false })`. Cela est critique pour réduire la consommation de RAM sur mobile et alléger le bundle de `layout.tsx`.

---

## 🛠️ Types et Modèles de Données (`app/types.ts` & Prisma)

Pour comprendre la structure des leçons et exercices, il faut se référer à `app/types.ts`.
- **`Word`** : Unité de base (id, th, fr, en, phonetic, imageUrl).
- **`Phrase`** : Unité composée de mots (contient `components` qui est un tableau d'ids de `Word`).
- **`Lesson`** : Contient une liste de mots et de phrases.
- **`Exercise`** : L'objet fondamental de l'apprentissage (word-match, sentence-builder, writing, intro, pair-matching, free-typing).
- **Base de Données (`prisma/schema.prisma`)** : Modèle `User` pour l'authentification et le classement (stockage des XP et du `pseudo`).

---

## 🧠 Composants Clés et Logique d'Interface

- **`QuestionArea.tsx`** : Affiche la question, gère la prononciation via l'icône de son, conditionne l'affichage selon le type d'exercice.
- **`Hints.tsx` (`SentenceWithHints`)** : Le moteur d'affichage des textes. Gère la détection des mots, l'affichage du texte en couleur, et les infobulles (tooltips).
- **Lecteur Audio (TTS)** : `playThaiTTS(text)` est utilisé partout pour lire le thaï.
- **`store.ts` (Zustand)** : `useProgressStore` gère la session utilisateur locale, les XP (`addXp`), la complétion des leçons (`completeLesson`), la langue, et les quêtes journalières.

---

## 📝 Historique des Apprentissages et Notes (À remplir au fil de l'eau)

- **[31/05/2026] Gestion des tooltips (Hints.tsx)** : Ne pas inclure de boutons cliquables à l'intérieur du déclencheur `TooltipHint`, sinon le survol du bouton déclenche la révélation de la réponse par inadvertance.
- **[05/06/2026] Viewport sur iOS (PWA)** : Attention à ne pas mettre `viewportFit: 'cover'` de façon globale dans `app/layout.tsx` car cela crée un bug de "bounce" / décalage de l'interface en bas d'écran. Ce paramètre doit être restreint aux pages qui en ont expressément besoin (ex: `app/detective/layout.tsx` pour le mode horizontal).
- **[05/06/2026] NextAuth sur Vercel** : Toujours importer `authOptions` depuis `app/lib/auth.ts` et non depuis la route API pour éviter des erreurs de build.
- **[06/06/2026] SyncProgress et Zustand** : Lors de l'ajout de variables journalières dans `store.ts` (comme `completedToday` ou `dailyQuests`), il faut impérativement s'assurer qu'elles sont incluses dans le payload de synchronisation vers la BDD dans `SyncProgress.tsx`, sinon ces variables resteront strictement locales à l'appareil et provoqueront des désynchronisations de progression ou d'XP journalier entre mobile et ordinateur.
