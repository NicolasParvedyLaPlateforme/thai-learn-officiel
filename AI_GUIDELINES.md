# 🤖 Guide et Documentation de Développement (ThaiLearn)

Ce fichier est mon "cerveau" et guide principal pour intervenir sur ce projet de manière rapide et efficace. Il recense les règles de développement, l'architecture du projet, les points d'attention cruciaux et toutes les conventions à respecter.

> **Note pour l'IA (Moi-même) :** 
> 🔴 À lire IMPÉRATIVEMENT avant toute intervention majeure.
> 🔄 À mettre à jour au fur et à mesure que de nouvelles règles ou subtilités apparaissent.

---

## 🏗️ Architecture Principale (Les 4 Piliers)

L'application est divisée en 4 sections principales, chacune accessible via son URL et disposant de sa propre logique d'apprentissage.

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

4. **Pratique (`/practice`)**
   - **But :** Entraînement libre et à l'infini.
   - **Système :** 3 types d'exercices d'entraînement générés dynamiquement.
   - **Fichiers clés :** `app/practice/page.tsx` et ses sous-dossiers.

---

## 🚨 RÈGLES STRICTES ET INTERDITS

### 1. Fichiers de données (Intouchables 🚫)
Les fichiers JSON suivants situés dans `app/data/` sont formellement interdits de modification par moi-même (sauf autorisation EXPLICITE de l'utilisateur). Ces fichiers sont gérés automatiquement par le CMS de l'utilisateur.
- `app/data/course.json`
- `app/data/emoji_mapping.json` (et dérivés d'emojis)
- `app/data/units.json` (et dérivés `alphabet_units.json`, `conversation_units.json`)
- `app/data/conversations.json`

### 2. Multilinguisme (FR & EN 🌍)
L'application est bilingue (Français et Anglais).
- **Règle d'or :** Si j'ajoute un bouton, un texte, une infobulle ou tout élément d'interface utilisateur, je DOIS systématiquement prévoir et intégrer la traduction anglaise.
- Utiliser la variable `language` (souvent récupérée via `useProgressStore()` ou en props) pour conditionner l'affichage : `language === 'en' ? 'English text' : 'Texte français'`.

### 3. Respect du périmètre des consignes 🎯
- Ne **JAMAIS** ajouter de fonctionnalités non sollicitées par le développeur (moi).
- Ne **JAMAIS** supprimer de fonctionnalités, même si elles semblent inutiles, sans avoir posé la question et obtenu l'accord de l'utilisateur.
- Si une idée d'amélioration pertinente me vient à l'esprit, je dois la *proposer* d'abord.

---

## 🛠️ Types et Modèles de Données (`app/types.ts`)

Pour comprendre la structure des leçons et exercices, il faut se référer à `app/types.ts`.
- **`Word`** : Unité de base (id, th, fr, en, phonetic, imageUrl).
- **`Phrase`** : Unité composée de mots (contient `components` qui est un tableau d'ids de `Word`).
- **`Lesson`** : Contient une liste de mots et de phrases.
- **`Exercise`** : L'objet fondamental de l'apprentissage. 
  - *Types d'exercices :* `word-match`, `sentence-builder`, `writing`, `intro`, `pair-matching`, `free-typing`.
  - Contient de nombreux flags pour modifier la difficulté (ex: `blindMode`, `hideHints`, `disableTooltips`, `reverse`, etc.).

---

## 🧠 Composants Clés et Logique d'Interface

- **`QuestionArea.tsx`** : Affiche la question (souvent en français/anglais), gère la prononciation via l'icône de son, et conditionne l'affichage selon le type d'exercice.
- **`Hints.tsx` (`SentenceWithHints`)** : Le moteur d'affichage des textes. Gère la détection des mots, l'affichage du texte en couleur, et les infobulles (tooltips) révélant la traduction thaï au survol. *Attention aux événements de survol (hover) qui peuvent interférer avec d'autres éléments.*
- **Lecteur Audio (TTS)** : `playThaiTTS(text)` est utilisé partout pour lire le thaï.

---

## 📝 Historique des Apprentissages et Notes (À remplir au fil de l'eau)

- **[31/05/2026] Gestion des tooltips (Hints.tsx)** : Ne pas inclure de boutons cliquables (comme l'icône de son) à l'intérieur du déclencheur `TooltipHint`, sinon le survol du bouton déclenche la révélation de la réponse par inadvertance.
- *(Ajouter ici toute nouvelle leçon technique apprise pendant le développement)*

---

*Fichier créé et maintenu par Antigravity.*
