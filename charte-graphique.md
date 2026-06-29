# Charte Graphique - ThaiLearn (Pages /learn)

*Date de création : 29 juin 2026*
*Version : 1.0*

Cette charte graphique documente les éléments visuels principaux utilisés dans les pages d'apprentissage (/learn) de l'application ThaiLearn. Elle servira de référence pour maintenir la cohérence visuelle et faciliter les futurs développements.

---

## Table des matières

1. [Polices Typographiques](#1-polices-typographiques)
2. [Palette de Couleurs](#2-palette-de-couleurs)
3. [Couleurs des Unités](#3-couleurs-des-units)
4. [Boutons](#4-boutons)
5. [Cartes et Conteneurs](#5-cartes-et-conteneurs)
6. [Typographie et Textes](#6-typographie-et-textes)
7. [Effets et Ombres](#7-effets-et-ombres)
8. [Espacements et Tailles](#8-espacements-et-tailles)
9. [Éléments Spécifiques aux Pages Learn](#9-éléments-spécifiques-aux-pages-learn)
10. [Animations](#10-animations)

---

## 1. Polices Typographiques

### Polices Principales

| Usage | Police | Variable CSS | Poids disponibles |
|-------|--------|--------------|-------------------|
| Texte latin (principal) | Inter | `--font-sans` | 400, 500, 600, 700 |
| Texte thaï | Sarabun | `--font-thai` | 400, 500, 600, 700 |
| Fallback | system-ui, sans-serif | - | - |

### Déclaration dans le layout
```html
<html lang="en" class="${inter.variable} ${sarabun.variable}">
  <body class="font-sans antialiased text-slate-900 bg-slate-50">
```

---

## 2. Palette de Couleurs

### Couleurs de Base (Tailwind CSS)

#### Couleurs Neutres
| Couleur | Code Hex | Usage Tailwind | Utilisation |
|---------|----------|---------------|-------------|
| Blanc | #FFFFFF | `bg-white`, `text-white` | Arrière-plans principaux, textes sur fond sombre |
| Noir | #000000 | `bg-black`, `text-black` | Textes principaux (rare) |
| Gris très clair | #F8FAFC | `bg-slate-50` | Arrière-plan de la page |
| Gris clair | #F1F5F9 | `bg-slate-100` | Bordures légères, cartes secondaires |
| Gris moyen | #E2E8F0 | `bg-slate-200` | Bordures, séparateurs |
| Gris foncé | #334155 | `text-slate-700` | Textes principaux |
| Gris très foncé | #1E293B | `text-slate-800` | Textes titres |
| Gris bleuâtre | #64748B | `text-slate-500` | Textes secondaires, descriptions |
| Gris clair | #94A3B8 | `text-slate-400` | Textes désactivés, placeholder |

#### Couleurs Primaires
| Couleur | Code Tailwind | Code Hex | Utilisation |
|---------|--------------|----------|-------------|
| **Émeraude** | `emerald-500` | #10B981 | Couleur principale de l'unité 1, boutons principaux |
| Émeraude clair | `emerald-50` | #ECFDF5 | Arrière-plans secondaires |
| Émeraude foncé | `emerald-600` | #059669 | Bordures, survol |
| Émeraude très foncé | `emerald-700` | #047857 | Textes sur fond émeraude |

#### Couleurs d'Accent
| Couleur | Code Tailwind | Utilisation |
|---------|--------------|-------------|
| Ambre | `amber-400`, `amber-500` | Étoiles, XP, récompenses |
| Rose | `rose-500`, `rose-600` | Boutons dangereux, erreurs |
| Indigo | `indigo-500`, `indigo-600` | Unité 10, éléments d'interface |
| Orange | `orange-500` | Unité 3, boutons secondaires |
| Violet | `violet-500` | Unité 15 |

#### Couleurs Sémantiques
| Couleur | Code Tailwind | Utilisation |
|---------|--------------|-------------|
| Vert | `text-emerald-500` | Succès, validation |
| Rouge | `text-rose-500` | Erreurs, danger |
| Ambre | `text-amber-500` | Avertissements, XP |
| Bleu | `text-blue-500` | Informations |
| Gris | `text-slate-500` | Texte secondaire |

---

## 3. Couleurs des Unités

Chaque unité du parcours d'apprentissage a sa propre palette de couleurs :

### Liste complète des unités

| ID | Titre | Couleur principale | Couleur de bordure | Couleur de texte |
|----|-------|-------------------|-------------------|------------------|
| unit-1 | Les bases | `bg-emerald-500` | `border-emerald-700` | `text-emerald-500` |
| unit-2 | Quantités et Nourriture | `bg-blue-500` | `border-blue-700` | `text-blue-500` |
| unit-3 | Autour de moi | `bg-orange-500` | `border-orange-700` | `text-orange-500` |
| unit-4 | Premiers déplacements | `bg-purple-500` | `border-purple-700` | `text-purple-500` |
| unit-5 | S'orienter | `bg-red-500` | `border-red-700` | `text-red-500` |
| unit-6 | Au Restaurant | `bg-cyan-500` | `border-cyan-700` | `text-cyan-500` |
| unit-7 | La Cuisine et l'Action | `bg-sky-500` | `border-sky-700` | `text-sky-500` |
| unit-8 | Maison et Quotidien | `bg-pink-500` | `border-pink-700` | `text-pink-500` |
| unit-9 | Le Temps et la Météo | `bg-yellow-500` | `border-yellow-700` | `text-yellow-500` |
| unit-10 | La Ville | `bg-indigo-500` | `border-indigo-700` | `text-indigo-500` |
| unit-11 | En Voyage | `bg-rose-500` | `border-rose-700` | `text-rose-500` |
| unit-12 | Mode et Achats | `bg-teal-500` | `border-teal-700` | `text-teal-500` |
| unit-13 | Apparence et Famille | `bg-fuchsia-500` | `border-fuchsia-700` | `text-fuchsia-500` |
| unit-14 | Santé et Corps | `bg-amber-500` | `border-amber-700` | `text-amber-500` |
| unit-15 | Émotions et Nuances | `bg-violet-500` | `border-violet-700` | `text-violet-500` |
| unit-16 | Le Grand Bilan A1 | `bg-lime-500` | `border-lime-700` | `text-lime-500` |

### Structure des couleurs par unité
Chaque unité possède :
- `colorClass`: Couleur de fond principale (ex: `bg-emerald-500`)
- `borderClass`: Couleur de bordure (ex: `border-emerald-700`)
- `textClass`: Couleur de texte (ex: `text-emerald-500`)
- `hoverClass`: Couleur au survol (ex: `hover:bg-emerald-400`)
- `lightTextClass`: Texte clair (ex: `text-emerald-100`)
- `bgMutedClass`: Arrière-plan atténué (ex: `bg-emerald-700/50`)
- `shades`: 4 niveaux de teintes (l1 à l4)

---

## 4. Boutons

### Hiérarchie des boutons

#### Bouton Principal (Default)
```
Classes: bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm hover:shadow-md active:scale-95
```
- **Couleur de fond**: Émeraude 500 (#10B981)
- **Texte**: Blanc
- **Survol**: Émeraude 600
- **Ombre**: Ombre légère (shadow-sm), moyenne au survol (shadow-md)
- **Animation**: Réduction à 95% de la taille au clic (active:scale-95)
- **Forme**: Bordure arrondie (rounded-2xl)
- **Taille par défaut**: h-12 px-6 py-2

#### Bouton Secondaire
```
Classes: bg-emerald-50 text-emerald-600 hover:bg-emerald-100 active:scale-95
```
- **Couleur de fond**: Émeraude 50 (très clair)
- **Texte**: Émeraude 600
- **Survol**: Émeraude 100

#### Bouton Outline
```
Classes: border-2 border-slate-200 bg-transparent hover:bg-slate-50 text-slate-700 active:scale-95
```
- **Bordure**: Gris 200, 2px
- **Fond**: Transparent
- **Texte**: Gris 700

#### Bouton Ghost
```
Classes: hover:bg-slate-100 text-slate-600 active:scale-95
```
- **Fond**: Transparent (survol: gris 100)
- **Texte**: Gris 600

#### Bouton Danger
```
Classes: bg-rose-500 text-white hover:bg-rose-600 shadow-sm active:scale-95
```
- **Couleur**: Rose 500 (#F43F5E)

#### Bouton Danger Outline
```
Classes: border-2 border-rose-200 bg-transparent hover:bg-rose-50 text-rose-600 active:scale-95
```

### Boutons Gamifiés

Les boutons gamifiés ont un effet 3D avec une bordure inférieure épaisse :

```
Classes: bg-{color}-500 text-white border-b-4 border-{color}-600 active:border-b-0 active:translate-y-1 hover:bg-{color}-400
```

**Variantes disponibles** :
- `gamified`: Émeraude 500, bordure émeraude 600
- `dangerGamified`: Rose 500, bordure rose 600
- `blueGamified`: Bleu 500, bordure bleu 600
- `amberGamified`: Ambre 500, bordure ambre 700
- `indigoGamified`: Indigo 500, bordure indigo 700
- `purpleGamified`: Violet 500, bordure violet 700
- `orangeGamified`: Orange 500, bordure orange 700
- `fuchsiaGamified`: Fuchsia 500, bordure fuchsia 700
- `darkGamified`: Gris foncé 900, bordure gris 950
- `gamifiedSecondary`: Gris clair 100, bordure gris 200
- `validation`: Émeraude 500, bordure émeraude 600 (identique à gamified)

**Effet spécial** :
- Au clic: la bordure inférieure disparaît (`active:border-b-0`) et le bouton se déplace vers le bas (`active:translate-y-1`)

### Boutons de Retour
```
Classes: bg-slate-50 border-2 border-slate-200 text-slate-500 hover:bg-slate-100 active:scale-95 shadow-none font-bold uppercase tracking-widest
```
- **Texte**: MAJUSCULES, gras, espacement large
- **Couleurs**: Fond gris 50, bordure gris 200, texte gris 500

### Boutons Flat
```
Classes: bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100 active:scale-95 shadow-none
```

### Tailles de Boutons

| Taille | Classes | Dimensions |
|--------|---------|------------|
| default | `h-12 px-6 py-2` | 48px × padding horizontal |
| xs | `h-auto rounded-md px-2 py-1 text-xs` | Variable, texte très petit |
| sm | `h-9 rounded-xl px-4` | 36px × padding 16px |
| lg | `h-14 rounded-2xl px-8 text-base font-bold` | 56px × padding 32px |
| xl | `h-auto py-6 rounded-2xl px-8 text-lg font-bold` | Grande hauteur, texte large |
| icon | `h-12 w-12` | 48px × 48px (carré) |
| icon-sm | `h-10 w-10 rounded-full` | 40px × 40px (rond) |
| glass | `min-w-[240px] p-3.5 pr-4 rounded-[1.25rem]` | Menu transparent |

### Classes communes à tous les boutons
```
inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 disabled:pointer-events-none disabled:opacity-50
```

---

## 5. Cartes et Conteneurs

### Carte Standard (Card)
```
Classes: rounded-3xl bg-white/80 backdrop-blur-sm shadow-sm border border-slate-100/50
```
- **Forme**: Bordure très arrondie (3xl = 1.5rem)
- **Fond**: Blanc avec opacité 80%
- **Effet**: Flou arrière (backdrop-blur-sm)
- **Ombre**: Légère (shadow-sm)
- **Bordure**: Gris 100 à 50% d'opacité, 1px

#### Structure d'une carte
```
Card (conteneur principal)
├── CardHeader: flex flex-col space-y-1.5 p-6
├── CardTitle: text-xl font-bold leading-none tracking-tight text-slate-800
├── CardContent: p-6 pt-0
└── CardFooter: flex items-center p-6 pt-0
```

### Carte de Niveau (LessonPathNode)

#### Niveau standard (non complété)
```
w-28 h-28 md:w-36 md:h-36 rounded-full bg-slate-100 border-b-[8px] border-slate-200 text-slate-300 shadow-sm
```
- **Taille**: 112px × 112px (mobile), 144px × 144px (desktop)
- **Forme**: Cercle parfait
- **Bordure inférieure**: 8px, gris 200
- **Texte**: Gris 300, taille 4xl (text-4xl), gras (font-black)

#### Niveau en cours
```
w-28 h-28 md:w-36 md:h-36 rounded-full bg-white border-[6px] border-b-[10px] {unitColor} shadow-md {unitText}
```
- **Bordure**: 6px standard, 10px en bas
- **Couleur de bordure**: Couleur de l'unité (ex: border-emerald-500)
- **Couleur de texte**: Couleur de l'unité (ex: text-emerald-500)
- **Ombre**: Moyenne (shadow-md)

#### Niveau complété
```
w-28 h-28 md:w-36 md:h-36 rounded-full {unitColor} border-b-[8px] {unitBorder} shadow-sm text-white
```
- **Fond**: Couleur de l'unité (ex: bg-emerald-500)
- **Bordure inférieure**: 8px, couleur de bordure de l'unité (ex: border-emerald-700)
- **Texte**: Blanc, gras

#### Niveau Maîtrise (Mastery)
```
w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 border-b-[8px] border-amber-600 shadow-md text-white
```
- **Dégradé**: Ambre 300 → Ambre 500
- **Bordure**: Ambre 600
- **Icône**: Couronne (Crown) remplie

### Bulle de Partie (PartNodeBubble)
```
w-[180px] bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)] border border-slate-100 flex flex-col gap-3 p-3.5
```
- **Largeur**: 180px fixe
- **Ombre**: Personnalisée [0 8px 32px rgba(0,0,0,0.14)]
- **Bordure**: Gris 100, 1px
- **Espacement intérieur**: 3.5 (14px)

---

## 6. Typographie et Textes

### Hiérarchie Typographique

#### Titres
| Niveau | Classes | Taille | Poids | Couleur |
|--------|---------|--------|-------|---------|
| h1 | `text-4xl font-extrabold tracking-tight lg:text-5xl` | 56px (32px mobile) | Extrabold | slate-800 |
| h2 | `text-3xl font-bold tracking-tight` | 48px | Bold | slate-800 |
| h3 | `text-2xl font-bold tracking-tight` | 40px | Bold | slate-800 |
| h4 | `text-xl font-bold tracking-tight` | 32px | Bold | slate-800 |

#### Textes
| Type | Classes | Taille | Couleur |
|------|---------|--------|---------|
| Paragraphe standard | `text-base leading-7 text-slate-600` | 16px | slate-600 |
| Petit texte | `text-sm font-medium leading-none text-slate-500` | 14px | slate-500 |
| Texte atténué | `text-sm text-slate-500` | 14px | slate-500 |
| Overline | `text-xs sm:text-sm font-black uppercase tracking-widest text-indigo-500` | 12-14px | indigo-500 |

### Variantes Spécifiques

#### Dans les modales
- **h3-modal**: `text-2xl font-extrabold text-slate-800 mb-2 leading-tight font-sans tracking-tight`
- **p-modal**: `text-slate-500 text-sm leading-relaxed mb-6 font-medium`

#### Dans les bannières
- **h2-hero-banner**: `text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm`
- **p-hero-banner**: `mb-8 font-medium text-lg leading-snug drop-shadow-sm max-w-xl`

#### Dans la timeline
- **timeline-unit-title**: `text-[20px] sm:text-3xl font-extrabold text-white tracking-tight break-words drop-shadow-sm`
- **timeline-unit-desc**: `text-white w-[70%] mb-0 font-medium text-sm sm:text-base leading-snug drop-shadow-sm`

### Poids de police
- **font-extrabold**: 800 (très gras)
- **font-bold**: 700 (gras)
- **font-semibold**: 600 (demi-gras)
- **font-medium**: 500 (moyen)
- **font-normal**: 400 (normal)
- **font-black**: 900 (noir) - utilisé pour les petits textes (ex: "P1", "ENTIER")

### Effets de texte
- **tracking-tight**: Espacement serré entre les lettres
- **tracking-widest**: Espacement très large (utilisé pour les textes en majuscules)
- **leading-7**: Interligne de 28px
- **leading-relaxed**: Interligne relâché
- **leading-none**: Aucun interligne
- **drop-shadow-sm**: Ombre portée légère sur le texte (utilisé sur fond coloré)
- **uppercase**: Majuscules
- **truncate**: Texte tronqué avec ...

---

## 7. Effets et Ombres

### Ombres

| Classe | Valeur | Utilisation |
|--------|--------|-------------|
| `shadow-sm` | 0 1px 2px 0 rgb(0 0 0 / 0.05) | Boutons, cartes au repos |
| `shadow-md` | 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) | Boutons au survol, cartes |
| `shadow-lg` | 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) | Modales, popups |
| `shadow-xl` | 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) | Bulles sélectionnées |
| Personnalisée | `shadow-[0_8px_32px_rgba(0,0,0,0.14)]` | Bulles PartNodeBubble |
| Personnalisée | `shadow-[0_4px_20px_rgba(0,0,0,0.08)]` | Titres stickys |

### Glow Effects
```css
.glow-emerald {
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.4);
}
```
- Utilisé pour les éléments mis en avant

### Backdrop Blur
- `backdrop-blur-sm`: Flou léger (utilisé sur les cartes)
- `backdrop-blur-md`: Flou moyen (utilisé sur les bannières stickys)
- `backdrop-blur-lg`: Flou fort

### Opacité
| Classe | Valeur | Utilisation |
|--------|--------|-------------|
| `opacity-50` | 0.5 | Éléments désactivés |
| `opacity-90` | 0.9 | Texte légèrement atténué |
| `opacity-100` | 1.0 | Opacité totale |

---

## 8. Espacements et Tailles

### Espacements Standards

#### Padding
| Classe | Valeur | Utilisation |
|--------|--------|-------------|
| `p-3` | 12px | Espacement interne petit |
| `p-3.5` | 14px | Espacement interne des bulles |
| `p-6` | 24px | Espacement interne des cartes |
| `py-3` | 12px (haut/bas) | Padding vertical |
| `px-6` | 24px (gauche/droite) | Padding horizontal |
| `pt-0` | 0px (haut) | Suppression padding haut |

#### Margin
| Classe | Valeur | Utilisation |
|--------|--------|-------------|
| `mb-4` | 16px | Marge bas standard |
| `mb-6` | 24px | Marge bas moyenne |
| `mb-8` | 32px | Marge bas grande |
| `mb-10` | 40px | Marge bas entre niveaux |
| `mb-[80px]` | 80px | Marge bas personnalisée (niveaux) |
| `mb-[160px]` | 160px | Marge bas pour niveau en cours |
| `-mt-10` | -40px | Marge négative (cheauchement d'éléments) |

### Tailles Fixes

#### Largeurs
| Classe | Valeur | Utilisation |
|--------|--------|-------------|
| `w-full` | 100% | Pleine largeur |
| `w-28` | 112px | Niveau (mobile) |
| `w-36` | 144px | Niveau (desktop) |
| `w-48` | 192px | Niveau avec parties |
| `w-72` | 288px | Images des niveaux |
| `w-[180px]` | 180px | Bulles PartNodeBubble |
| `max-w-6xl` | 72rem (1152px) | Largeur maximale des conteneurs |

#### Hauteurs
| Classe | Valeur | Utilisation |
|--------|--------|-------------|
| `h-12` | 48px | Bouton standard |
| `h-14` | 56px | Bouton large |
| `h-28` | 112px | Niveau (mobile) |
| `h-36` | 144px | Niveau (desktop) |
| `h-48` | 192px | Niveau avec parties |
| `h-[160px]` | 160px | Hauteur du conteneur de niveau |
| `h-[240px]` | 240px | Hauteur du conteneur de niveau (desktop) |

#### Bannières
| Élément | Hauteur mobile | Hauteur desktop |
|---------|----------------|-----------------|
| Bannière immersive | 220px | 360px |
| Bannière sticky titre | variable | variable |

---

## 9. Éléments Spécifiques aux Pages Learn

### Timeline des Unités

#### Conteneur Principal
```
w-[94%] md:w-[98%] max-w-6xl mx-auto flex items-center justify-center
```
- **Largeur**: 94% mobile, 98% desktop
- **Largeur max**: 6xl (1152px)
- **Positionnement**: Centré horizontalement

#### Nœud de Niveau (Level Node)

**Structure** :
```
┌─────────────────────────────────────────┐
│  [Image Objectif] (optionnelle, desktop)   │
│  [Arc d'étoiles] (si complété)             │
│  [Pizza Chart] (si plusieurs parties)      │
│  [Bouton Niveau] (cercle avec numéro)      │
│  [Indicateur Maîtrise] (si applicable)     │
└─────────────────────────────────────────┘
```

**Bouton Niveau** :
- **Non déverrouillé**: `bg-slate-100 border-b-[8px] border-slate-200 text-slate-300` + icône Lock
- **En cours**: `bg-white border-[6px] border-b-[10px] {unitColor} {unitText}` + numéro
- **Complété**: `{unitColor} border-b-[8px] {unitBorder} text-white` + numéro
- **Maîtrise**: `bg-gradient-to-br from-amber-300 to-amber-500 border-b-[8px] border-amber-600` + icône Crown

#### Pizza Chart (Partie des Niveaux)

La "pizza" représente les différentes parties d'un niveau :

```
<svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-xl overflow-visible">
  {parts.map(...) => (
    <path d="M 50 50 L x1 y1 A 48 48 0 largeArc 1 x2 y2 Z" />
    <text x="tx" y="ty">P{i+1}</text>
  )}
  <circle cx="50" cy="50" r="18" />
  <text x="50" y="50">ENTIER</text>
</svg>
```

**Couleurs des segments** :
- `fill-slate-100`: Non accessible
- `{unitText} fill-current`: Sélectionné
- `{unitText} fill-current opacity-40`: Sélection totale

**Texte des segments** :
- `fill-slate-400`: Non complété
- `fill-slate-300`: Complété
- `fill-white`: Sélectionné

#### Indicateur "La Suite"

Animation qui indique la prochaine partie à faire :
```
<div class="animate-bounce flex items-center justify-center relative">
  <div class="absolute w-2.5 h-2.5 bg-[#10B981] rounded-[1px]" style={position} />
  <div class="relative z-10 bg-[#10B981] text-white font-black text-[9px] uppercase px-2.5 py-1 rounded-md tracking-wider">
    La Suite
  </div>
</div>
```
- **Couleur**: Vert émeraude (#10B981)
- **Animation**: Rebondissement (animate-bounce)
- **Texte**: "La Suite" en majuscules, gras, très petit

### Bannière Immersive

```
<div class="w-[calc(100%+2rem)] md:w-full -mx-4 md:mx-0 -mt-2 md:-mt-8 relative">
  <div class="w-full h-[220px] md:h-[360px] {unitColor} relative overflow-hidden rounded-none">
    <IconImage src={lesson.imageUrl} alt="" fill class="object-cover object-center opacity-100" />
    <div class="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#FAFAFA] to-transparent z-10"></div>
  </div>
</div>
```
- **Hauteur**: 220px mobile, 360px desktop
- **Couleur de fond**: Couleur de l'unité
- **Image**: Recouvre toute la surface (object-cover)
- **Dégradé**: En bas, blanc → transparent pour fondre avec le contenu

### Titre Sticky

```
<div class="sticky top-4 z-50 px-6 -mt-10 md:-mt-12 flex justify-center w-full pointer-events-none">
  <div class="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 rounded-[1.25rem] py-3 px-6 max-w-[90%] pointer-events-auto">
    <h2 class="text-lg md:text-xl font-extrabold {titleTextColor} text-center leading-tight">
      {lessonTitle}
    </h2>
  </div>
</div>
```
- **Position**: Sticky à 4px du haut
- **Arrière-plan**: Blanc à 95% d'opacité
- **Effet**: Flou arrière (backdrop-blur-md)
- **Ombre**: Personnalisée [0 4px 20px rgba(0,0,0,0.08)]
- **Bordure**: Gris 100, 1px
- **Forme**: Arrondie (1.25rem)

---

## 10. Animations

### Animations CSS

#### @keyframes shimmer
```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```
- Utilisée pour les effets de chargement

### Classes d'animation Tailwind

| Classe | Animation | Durée | Utilisation |
|--------|-----------|-------|-------------|
| `transition-all` | Transition sur toutes les propriétés | 150ms | Boutons, cartes |
| `transition-colors` | Transition sur les couleurs | 150ms | Changements de couleur |
| `transition-transform` | Transition sur la transformation | 150ms | Redimensionnement |
| `duration-300` | 300ms | Boutons, niveaux |
| `duration-500` | 500ms | Niveaux, images |
| `ease-out` | Décélération | Images |
| `animate-spin` | Rotation infinie | Icônes de chargement |
| `animate-bounce` | Rebondissement | Indicateur "La Suite" |
| `hover:scale-105` | Agrandissement de 5% au survol | Boutons, niveaux |
| `active:scale-95` | Réduction de 5% au clic | Boutons |
| `active:translate-y-1` | Déplacement vers le bas de 4px au clic | Boutons gamifiés |

### Animations personnalisées

#### Animation des étoiles (stars arc)
- Positionnement circulaire autour du niveau
- Angles calculés: `-90 + (i - 2) * 35` degrés
- Effet de remplissage basé sur le nombre d'étoiles gagnées

#### Animation de la pizza chart
- Rotation des segments
- Mise à l'échelle au survol (`hover:scale-105`)
- Sélection visuelle avec changement de couleur

---

## Résumé des Bonnes Pratiques

### Couleurs
1. **Utiliser les couleurs des unités** pour maintenir la cohérence thématique
2. **Émeraude 500** (#10B981) comme couleur principale de la marque
3. **Ambre** pour les récompenses (étoiles, XP)
4. **Rose** pour les erreurs et actions dangereuses
5. **Gris (slate)** pour les textes et arrière-plans neutres

### Typographie
1. **Inter** pour le texte latin
2. **Sarabun** pour le texte thaï
3. **Hiérarchie claire** : h1(4xl) > h2(3xl) > h3(2xl) > h4(xl)
4. **Couleurs de texte** : slate-800 (principal), slate-600 (secondaire), slate-500 (atténué)

### Boutons
1. **Style principal** : `bg-emerald-500 text-white` avec effet de survol
2. **Style secondaire** : `bg-emerald-50 text-emerald-600` ou outline
3. **Boutons gamifiés** : utiliser les variantes `gamified*` avec effet 3D
4. **Toujours inclure** : `transition-all`, `active:scale-95`, `focus-visible:ring-2 focus-visible:ring-emerald-500`

### Cartes
1. **Arrière-plan** : `bg-white/80 backdrop-blur-sm`
2. **Bordure** : `border border-slate-100/50`
3. **Ombre** : `shadow-sm` au repos
4. **Forme** : `rounded-3xl` pour les cartes principales

### Espacements
1. **Conteneurs principaux** : `max-w-6xl mx-auto`
2. **Espacement interne** : p-6 pour les cartes, p-3.5 pour les bulles
3. **Marges verticales** : mb-4, mb-6, mb-8 selon l'importance

---

## Exemple de Code Complet

### Bouton Principal Gamifié

```tsx
import { Button } from '@/components/ui/Button';

<Button 
  variant="gamified"
  size="lg"
  className="w-full"
>
  Commencer le niveau
</Button>
```

### Carte de Niveau

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card className="w-full max-w-md">
  <CardHeader>
    <CardTitle className="text-emerald-600">
      Niveau 1 : Les bases
    </CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-slate-600 leading-7">
      Apprenez les salutations et les présentations de base.
    </p>
  </CardContent>
</Card>
```

### Structure d'une Page Learn

```tsx
<div className="flex flex-col gap-6 w-full">
  {/* Bannière immersive */}
  <div className="w-[calc(100%+2rem)] md:w-full -mx-4 md:mx-0 -mt-2 md:-mt-8">
    <div className="w-full h-[220px] md:h-[360px] bg-emerald-500 relative overflow-hidden">
      {/* Contenu de la bannière */}
    </div>
  </div>
  
  {/* Titre sticky */}
  <div className="sticky top-4 z-50">
    <div className="bg-white/95 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 rounded-[1.25rem] py-3 px-6 max-w-[90%] mx-auto">
      <h2 className="text-xl font-extrabold text-emerald-800 text-center">
        Les bases
      </h2>
    </div>
  </div>
  
  {/* Contenu principal */}
  <div className="w-full relative">
    {/* Timeline des niveaux */}
  </div>
</div>
```

---

*Document généré par analyse automatique du codebase ThaiLearn - Pages /learn*
*Pour toute modification, veuillez mettre à jour ce document et les fichiers source correspondants.*
