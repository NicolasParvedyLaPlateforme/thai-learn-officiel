# 🎤 Guide : Ajouter de nouveaux exercices sur `/speak`

> **À lire IMPÉRATIVEMENT** avant d'ajouter une nouvelle leçon sur la page `/speak`.  
> Ce fichier décrit exactement la structure, les règles et les fichiers à modifier.

---

## 📁 Fichiers à modifier (et UNIQUEMENT ceux-là)

| Fichier | Rôle |
|--------|------|
| `app/data/speak_course.json` | Définit les leçons et leurs 10 phrases de vocabulaire (niveau 1) |
| `app/data/speak_dialogues.json` | Définit le dialogue pour le niveau 2 de chaque leçon |
| `app/data/speak_answer_me.json` | Définit les exercices Q/R pour le niveau 3 de chaque leçon |

> ⚠️ **INTERDIT** de modifier tout autre fichier sans accord explicite de l'utilisateur.  
> En particulier : `app/data/course.json`, `app/data/units.json`, `app/data/speak_units.json`, tout fichier `.tsx`/`.ts`.

---

## 🏗️ Architecture d'une leçon (5 niveaux)

Chaque leçon de `/speak` contient **5 niveaux** gérés automatiquement par `SpeakLessonClient.tsx` :

| Niveau | Type | Source de données | Description |
|--------|------|------------------|-------------|
| **1** | 🎤 Prononciation | `speak_course.json → phraseIds` | L'utilisateur prononce chaque phrase une par une (max 10) |
| **2** | 💬 Dialogue | `speak_dialogues.json` | Conversation à répéter, ligne par ligne |
| **3** | ❓ Réponds-moi | `speak_answer_me.json` | Choisir la bonne réponse parmi 4 options |
| **4** | 🔨 Construire la phrase | `speak_course.json → phraseIds` | Drag & Drop des mots pour former la phrase |
| **5** | ✍️ Écrire lettre par lettre | `speak_course.json → phraseIds` | Saisir le thaï caractère par caractère |

> **Les niveaux 4 et 5 utilisent automatiquement les mêmes `phraseIds` que le niveau 1.**  
> Il n'y a pas de fichier séparé à remplir pour eux.

---

## 🔑 Règles obligatoires

### 1. Les IDs de phrases doivent exister dans course.json

Tous les `phraseId` utilisés dans les 3 fichiers **doivent impérativement** correspondre à des `id` existants dans `app/data/course.json` (dans les tableaux `phrases` de chaque leçon).

**Lister toutes les phrases disponibles avec leur traduction :**
```js
// Exécuter avec : node app/scripts/list_phrases.js
const d = require('./app/data/course.json');
const phrases = [];
d.lessons.forEach(l => {
  if (l.phrases) l.phrases.forEach(p => {
    phrases.push({ id: p.id, fr: p.fr, th: p.th });
  });
});
console.log(JSON.stringify(phrases, null, 2));
```

**Chercher des phrases par mot-clé (ex: "taxi", "hôtel", "restaurant") :**
```js
const d = require('./app/data/course.json');
const mot = 'taxi'; // ← changer ici
const results = [];
d.lessons.forEach(l => {
  if (l.phrases) l.phrases.forEach(p => {
    if (p.fr && p.fr.includes(mot)) results.push({ id: p.id, fr: p.fr, th: p.th });
  });
});
console.log(JSON.stringify(results, null, 2));
```

**Vérifier que des IDs existent (zéro erreur MISSING = OK) :**
```js
const d = require('./app/data/course.json');
const ids = ['p_hello_m', 'p_mon_id_a_tester']; // ← remplacer
const found = [];
d.lessons.forEach(l => {
  if (l.phrases) l.phrases.forEach(p => {
    if (ids.includes(p.id)) found.push(p.id);
  });
});
console.log('FOUND:', found.join(', '));
console.log('MISSING:', ids.filter(id => !found.includes(id)).join(', '));
```

### 2. Maximum 10 phrases par leçon (niveau 1)

Le tableau `phraseIds` dans `speak_course.json` doit contenir **entre 5 et 10 phrases**.

### 3. IDs de leçons séquentiels

- Leçons existantes : `speak-1`, `speak-2`, `speak-3`, `speak-4`, `speak-5`
- La prochaine sera `speak-6`, puis `speak-7`, etc.
- **L'ID doit être identique dans les 3 fichiers.**

### 4. Logique dialogues (niveau 2)

- Le dialogue utilise des speakers définis dans `app/data/speakers.json`
- **Speakers disponibles :**

| Nom | Avatar | Position | Couleur bulle |
|-----|--------|----------|---------------|
| `Tom` | `/tom.png` | droite | bleu |
| `Kanya` | `/Kanya.png` | gauche | orange |
| `Marchand` | `/un-marchand.png` | gauche | vert |
| `Vendor` | `/femme-old.png` | gauche | violet |
| `Aran` | `/moine.png` | gauche | violet |

- Chaque ligne du dialogue doit référencer un `phraseId` valide dans `course.json`
- Le dialogue doit être **narrativement cohérent** : question → réponse, action → réaction
- **Entre 6 et 10 lignes** par dialogue

### 5. Logique Q/R (niveau 3)

- Chaque exercice a : `promptId` (phrase affichée en question), `options` (exactement **4** IDs), `correctOptions` (1 ou 2 bonnes réponses)
- Les `options` doivent toutes être des IDs valides dans `course.json`
- Si 2 `correctOptions`, les 2 **doivent apparaître** dans `options`
- **Minimum 5 exercices** par leçon dans `speak_answer_me.json`
- Les distracteurs (mauvaises réponses) doivent être thématiquement proches pour ne pas rendre la réponse trop évidente

### 6. Cohérence thématique

- Toutes les leçons actuelles : `"unit": "unit-1"` → Voyage en Thaïlande
- Les phrases doivent être utiles pour un débutant voyageant en Thaïlande
- Situations cibles : salutations, restaurant, transport, marché, hôtel, politesse, santé, orientation

---

## 📋 Schémas JSON complets

### `speak_course.json` — ajouter dans le tableau `"lessons"`

```json
{
  "id": "speak-6",
  "title": "Titre en français",
  "titleEn": "Title in English",
  "titleDe": "Titel auf Deutsch",
  "titleEs": "Título en español",
  "titleIt": "Titolo in italiano",
  "description": "Description courte en français",
  "descriptionEn": "Short description in English",
  "descriptionDe": "Kurze Beschreibung auf Deutsch",
  "descriptionEs": "Descripción corta en español",
  "descriptionIt": "Breve descrizione in italiano",
  "unit": "unit-1",
  "isReview": false,
  "imageUrl": "/nom-image.webp",
  "phraseIds": [
    "p_id_1", "p_id_2", "p_id_3", "p_id_4", "p_id_5",
    "p_id_6", "p_id_7", "p_id_8", "p_id_9", "p_id_10"
  ]
}
```

**Images disponibles dans `/public/` :**  
`achat-gateau.webp`, `achat-ticket-train.webp`, `au-marche.webp`, `decouvre-moine.webp`,  
`kanya-rencontre.webp`, `aniversaire.webp`, `bousolle-bleu.webp`, `tom-et-sa-bossole.webp`

---

### `speak_dialogues.json` — ajouter dans `"dialogues"`

```json
"speak-6": [
  { "speaker": "Tom",      "phraseId": "p_id_A" },
  { "speaker": "Kanya",    "phraseId": "p_id_B" },
  { "speaker": "Tom",      "phraseId": "p_id_C" },
  { "speaker": "Kanya",    "phraseId": "p_id_D" },
  { "speaker": "Tom",      "phraseId": "p_id_E" },
  { "speaker": "Kanya",    "phraseId": "p_id_F" }
]
```

---

### `speak_answer_me.json` — ajouter dans `"exercises"`

```json
"speak-6": [
  {
    "promptId": "p_id_question_1",
    "options": ["p_id_correcte", "p_distractor_1", "p_distractor_2", "p_distractor_3"],
    "correctOptions": ["p_id_correcte"]
  },
  {
    "promptId": "p_id_question_2",
    "options": ["p_correcte_A", "p_correcte_B", "p_distractor_1", "p_distractor_2"],
    "correctOptions": ["p_correcte_A", "p_correcte_B"]
  }
]
```

---

## 📚 Leçons existantes (état au 14/06/2026)

| ID | Titre | Phrases clés (niveau 1) |
|----|-------|------------------------|
| `speak-1` | Se présenter | `p_hello_m`, `p_hello_f`, `p_how_are_you`, `p_name_ask`, `p_and_you` |
| `speak-2` | Au restaurant | `p_eat_rice`, `p_not_spicy`, `p_very_delicious`, `p_glass_of_water`, `p_bill_please_eng` |
| `speak-3` | Prendre un taxi | `p_nang_taeksi`, `p_go_airport`, `p_go_left`, `p_go_right`, `p_how_much` |
| `speak-4` | Au marché et à l'hôtel | `p_go_market`, `p_discount`, `p_cannot_reduce`, `p_where_hotel`, `p_price_how_much` |
| `speak-5` | Comprendre et communiquer | `p_understand_q`, `p_not_understand_well`, `p_speak_slowly`, `p_please_help`, `p_sorry_f` |

---

## 💡 Idées de prochaines leçons

| Thème | Phrases utiles (IDs existants dans course.json) |
|-------|------------------------------------------------|
| 🏥 Urgences / Santé | `p_health_injured`, `p_go_hospital`, `p_hospital_near`, `p_health_dizzy`, `p_health_breathe` |
| 📅 Jours et rendez-vous | `p_monday` → `p_sunday`, `p_see_you_tuesday`, `p_work_monday`, `p_holiday_sunday` |
| 🌍 Nationalité / Langue | `p_french_person`, `p_english_language`, `p_how_old`, `p_thirty_years_old` |
| ✈️ À l'aéroport | `p_go_airport`, `p_plane_ticket`, `p_two_tickets`, `p_dont_forget_buy_ticket`, `p_buy_ticket` |
| 🗺️ Se repérer | `p_lost_way`, `p_where_is_it`, `p_market_far_mai`, `p_go_left`, `p_go_right`, `p_go_together` |
| 🛍️ Shopping avancé | `p_buy_shoes`, `p_pay_money`, `p_give_money`, `p_this_shop_is_cheap`, `p_new_l8_3` |
| 🍜 Goûts alimentaires | `p_vegetarian`, `p_allergic_shrimp`, `p_not_sweet`, `p_salty_meat`, `p_spicy_chicken` |
| 🏨 À l'hôtel (détails) | `p_sleep_room`, `p_clean_room`, `p_enter_hotel`, `p_hotel_good`, `p_where_hotel` |

---

## ✅ Checklist de validation finale

Avant de valider les modifications, vérifier :

- [ ] L'ID `speak-N` est présent dans les **3 fichiers** JSON
- [ ] Tous les `phraseId` vérifiés → zéro MISSING
- [ ] `phraseIds` contient entre 5 et 10 phrases
- [ ] Le dialogue est cohérent et narratif (6-10 lignes)
- [ ] Chaque exercice Q/R a exactement **4 options**
- [ ] Les `correctOptions` sont toutes incluses dans `options`
- [ ] Minimum **5 exercices** dans `speak_answer_me.json` pour la leçon
- [ ] JSON valide (aucune erreur de parsing)
- [ ] Thème en lien avec "Voyage en Thaïlande"
- [ ] **Aucun autre fichier modifié**

**Validation rapide des 3 fichiers (copier-coller dans un fichier .js et exécuter) :**
```js
const a = require('./app/data/speak_course.json');
const b = require('./app/data/speak_dialogues.json');
const c = require('./app/data/speak_answer_me.json');
console.log('speak_course lessons:', a.lessons.map(l => l.id));
console.log('speak_dialogues keys:', Object.keys(b.dialogues));
console.log('speak_answer_me keys:', Object.keys(c.exercises));
console.log('All JSON valid!');
```

---

*Dernière mise à jour : 2026-06-14 — Leçons speak-1 à speak-5 en place.*
