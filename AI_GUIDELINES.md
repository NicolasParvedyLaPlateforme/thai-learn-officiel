# 🤖 Guide et Documentation de Développement (ThaiLearn)

Ce fichier est mon "cerveau" et guide principal pour intervenir sur ce projet de manière rapide et efficace. Il recense les règles de développement, l'architecture du projet, les points d'attention cruciaux et toutes les conventions à respecter.

> **Note pour l'IA (Moi-même) :** 
> 🔴 À lire IMPÉRATIVEMENT avant toute intervention majeure.
> 🔄 À mettre à jour au fur et à mesure que de nouvelles règles ou subtilités apparaissent.

---

## 📂 Organisation des Dossiers (Architecture `src/`)

Pour garantir la clarté et la maintenabilité du projet, le code source respecte une séparation stricte des responsabilités au sein du dossier `src/` :

- **`src/app/`** : **Exclusivement réservé au routage Next.js.** Ne contient que les pages (`page.tsx`), layouts (`layout.tsx`), et routes API (`route.ts`). Aucun composant UI global ou logique métier ne doit s'y trouver. Les composants strictement spécifiques à une seule page complexe peuvent y rester en sous-dossiers locaux, mais le code partagé doit en sortir.
- **`src/components/`** : Contient tous les composants d'interface utilisateur, bien triés par fonctionnalité (ex: `learn/`, `detective/`, `modals/`, `ui/` pour les composants réutilisables type bouton, icône).
- **`src/lib/`** : Le cœur logique. Regroupe les utilitaires, la configuration `prisma`, l'authentification, les générateurs d'exercices, le TTS, et le gestionnaire d'état global Zustand (`src/lib/store/`).
- **`src/hooks/`** : Les React hooks personnalisés (ex: `useTranslation.ts`, `use-mobile.ts`).
- **`src/actions/`** : Les Server Actions de Next.js pour la communication sécurisée avec la base de données.
- **`src/data/` & `src/locales/`** : Fichiers statiques JSON des cours (`course.json`, `units.json`) et traductions de l'interface.
- **`scripts/`** (à la racine) : Fichiers de test, scripts de migration et petits utilitaires de maintenance, en dehors du périmètre de l'application Next.js.

> **Règle d'import :** Utiliser systématiquement l'alias `@/` pour importer un fichier situé dans `src/` (ex: `import Button from '@/components/ui/Button'`) au lieu de chemins relatifs illisibles (`../../../`).

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
- `src/data/course.json`
- `src/data/emoji_mapping.json` (et dérivés d'emojis)
- `src/data/units.json` (et dérivés `alphabet_units.json`, `conversation_units.json`)
- `src/data/conversations.json`

### 2. Multilinguisme & Traduction (⚠️ TRÈS IMPORTANT 🌍)
L'application est entièrement multilingue via le système de locales.
- **Règle d'or :** Si j'ajoute un bouton, un texte, une infobulle ou tout élément d'interface utilisateur, **je DOIS systématiquement le traduire** dans les fichiers JSON du dossier `src/locales/` (`fr.json`, `en.json`, `de.json`, `es.json`, `it.json`). Penser impérativement à mettre à jour **tous** ces fichiers.
- **Aucun texte en dur ou condition "bricolée" :** Ne JAMAIS laisser de texte en dur (ex: `<div>Bonjour</div>`) et ne JAMAIS utiliser de conditions simplistes de type `language === 'en' ? 'Yes' : 'Oui'` pour court-circuiter le système.
- **Pour l'UI statique** : Je dois utiliser le hook `useTranslation` ou la fonction `getTranslation` :
  ```tsx
  import { useTranslation, getTranslation } from '../hooks/useTranslation';
  // ...
  <div>{getTranslation('section.key', language)}</div>
  ```
- **Pour les données d'objets (dynamique)** : Si un objet contient des champs `title`, `titleEn`, etc., je dois utiliser `getLocalizedField` :
  ```tsx
  import { getLocalizedField } from '../hooks/useTranslation';
  // ...
  <div>{getLocalizedField(item, 'title', language)}</div>
  ```

### 3. Réutilisation des composants et Cohérence UI (DRY ♻️)
- Avant de créer un composant complexe de A à Z (ex: bouton de micro interactif, modale de succès/erreur, pied de page de validation), je dois **systématiquement** vérifier comment cela a été implémenté dans les autres modules existants (ex: `/learn`, `/alphabet`).
- L'objectif est de calquer ou réutiliser le code, l'animation et les mêmes variables CSS (couleurs, ombres) pour garantir une expérience utilisateur **100% cohérente** à travers l'application. Ne pas réinventer la roue !

### 4. Respect du périmètre des consignes 🎯
- Ne **JAMAIS** ajouter de fonctionnalités non sollicitées par le développeur (moi).
- Ne **JAMAIS** supprimer de fonctionnalités sans avoir posé la question et obtenu l'accord de l'utilisateur.
- Si une idée d'amélioration pertinente me vient à l'esprit, je dois la *proposer* d'abord.

### 4. Architecture & Performances ⚡
- **Modulatité et Fichiers courts :** Un fichier (composant React ou store Zustand) ne doit idéalement pas dépasser 300 lignes. S'il grossit, diviser le visuel en sous-composants "bêtes". La logique métier complexe (calculs d'XP, montées de niveau) doit systématiquement être extraite dans `src/lib/` sous forme de fonctions pures (ex: `xp-utils.ts`), laissant le store Zustand s'occuper uniquement de la sauvegarde de l'état (setters purs).
- **Lazy Loading (next/dynamic) :** Toutes les Modales, Tiroirs (Drawers) et composants lourds non visibles au chargement initial doivent **impérativement** être importés via `next/dynamic({ ssr: false })`. Cela est critique pour réduire la consommation de RAM sur mobile et alléger le bundle de `layout.tsx`.
  - **Exception (Mode Hors-ligne) :** Les composants d'exercices au sein d'une leçon (`WordMatch`, `SentenceBuilder`, etc.) doivent utiliser des imports **statiques** et non dynamiques. Cela garantit qu'une perte de connexion réseau au milieu d'une leçon ne provoque pas de crash (`ChunkLoadError`).

---

## 🛠️ Types et Modèles de Données (`src/types.ts` & Prisma)

Pour comprendre la structure des leçons et exercices, il faut se référer à `src/types.ts`.
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
- **[05/06/2026] Viewport sur iOS (PWA)** : Attention à ne pas mettre `viewportFit: 'cover'` de façon globale dans `src/app/layout.tsx` car cela crée un bug de "bounce" / décalage de l'interface en bas d'écran. Ce paramètre doit être restreint aux pages qui en ont expressément besoin (ex: `src/app/detective/layout.tsx` pour le mode horizontal).
- **[05/06/2026] NextAuth sur Vercel** : Toujours importer `authOptions` depuis `@/lib/auth` (ou `src/lib/auth.ts`) et non depuis la route API pour éviter des erreurs de build.
- **[06/06/2026] SyncProgress et Zustand** : Lors de l'ajout de variables journalières dans `store.ts` (comme `completedToday` ou `dailyQuests`), il faut impérativement s'assurer qu'elles sont incluses dans le payload de synchronisation vers la BDD dans `SyncProgress.tsx`, sinon ces variables resteront strictement locales à l'appareil et provoqueront des désynchronisations de progression ou d'XP journalier entre mobile et ordinateur.
- **[09/06/2026] Résilience Hors-ligne (Leçons & Images)** : Pour garantir qu'un utilisateur puisse finir sa leçon même en perdant le réseau (ex: dans le tramway) : (1) Ne pas utiliser `next/dynamic` pour les sous-composants d'exercices. (2) Pré-charger en arrière-plan toutes les images et sons dès l'affichage du premier exercice via un `useEffect` (en utilisant `new Image().src` et un simple `fetch(url)` pour l'audio). (3) Utiliser la propriété `unoptimized={true}` sur les balises `<Image>` de Next.js (notamment dans `IconImage.tsx`) pour les petites icônes. Sinon, le cache de l'image brute téléchargée en arrière-plan ne correspondra pas à l'URL `/_next/image?...` générée par Next.js, rendant l'image inaccessible hors ligne. L'optimisation Next.js reste active pour les gros décors (ex: `/detective`).
- **[12/06/2026] Cohérence UI & Traduction stricte** : Toujours vérifier si un composant UI équivalent existe déjà (ex: bouton micro, pied de page d'erreur/succès, modale) avant de l'implémenter de zéro. De plus, bannir les conditions "bricolées" de type `language === 'en'`. Utiliser systématiquement `getTranslation` (UI statique) et `getLocalizedField` (données), tout en pensant à mettre à jour **tous** les fichiers du dossier `locales/` lors de la création d'une nouvelle clé.
- **[21/06/2026] Design System & Boutons (Gamified vs Flat)** : L'interface est un subtil mélange de "Flat Design" et de "Gamified Design". Règle d'or pour la hiérarchie visuelle : L'action **principale** doit toujours ressortir avec un style gamifié (variante `gamified` avec effet 3D "push" et couleur d'unité), tandis que les actions **secondaires** doivent se fondre dans la masse (variante `flat` en design plat et tons neutres). Ne jamais recréer de boutons avec des classes Tailwind en dur (copier-coller) : utiliser systématiquement le composant réutilisable `<Button>` ou `buttonVariants({ variant: '...' })` (`src/components/ui/Button.tsx`).
- **[21/06/2026] Nombre d'étapes (Pré-calcul)** : Afin de garantir 100% de fiabilité entre le nombre d'exercices affiché dans l'UI (ex: Modale de leçon, Sidebar) et la réalité du jeu sans impacter les performances, l'application lit un fichier JSON statique généré à l'avance. **RÈGLE CRUCIALE :** Dès qu'une modification est apportée à la logique des générateurs d'exercices (`src/lib/generators/...`), il faut IMPÉRATIVEMENT lancer la commande `npx tsx scripts/generate-steps.ts` pour mettre à jour le fichier `src/data/steps_metadata.json` avec les nouveaux comptes d'étapes.
