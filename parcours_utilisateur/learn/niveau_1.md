# Parcours Utilisateur : Niveau 1 d'une Leçon (Section /learn)

Ce document décrit étape par étape le parcours complet d'un utilisateur lorsqu'il effectue le Niveau 1 d'une leçon dans la section Apprentissage (`/learn`).

## 1. Déclenchement de la leçon (La Timeline)
- **Où se trouve l'utilisateur ?** Sur la page d'accueil de la section `/learn`.
- **Ce qu'il voit :** Une frise chronologique (timeline) affichant différentes unités et des nœuds de leçons circulaires. L'écran de fond ou les détails peuvent être légèrement floutés lors des chargements via l'écran d'initialisation.
- **Action :** L'utilisateur clique sur le nœud de la première leçon.
- **Résultat :** Une carte d'information se déploie (le composant `SharedLessonCard`).
  - La carte affiche le titre de la leçon, une description, une icône de représentation.
  - Un aperçu du vocabulaire en thaï et sa traduction défilent automatiquement en temps réel dans un petit carrousel texte pour donner un avant-goût du contenu.
- **Boutons disponibles :**
  - Le bouton principal d'action (stylisé en "gamified" avec un effet 3D) affiche **"Commencer l'apprentissage"** (car le joueur est au niveau 0 de cette leçon).
- **Action :** L'utilisateur clique sur **"Commencer l'apprentissage"**. L'application le redirige vers l'URL de la leçon correspondante.

## 2. Pendant l'exercice (Le cœur de la leçon)
- **Interface globale :** 
  - En haut : Une barre de progression qui se remplit au fur et à mesure des réussites, et une icône "Croix" (X) en haut à gauche pour abandonner et quitter la leçon.
  - Au centre : La zone de question (`QuestionArea`), contenant les consignes.
  - En bas : Les options de réponse (boutons, mots à glisser/cliquer).
  
- **Types d'exercices possibles (générés dynamiquement) :**
  - **QCM (Word Match) :** L'utilisateur voit un mot en français et doit choisir la bonne traduction en thaï parmi plusieurs étiquettes.
  - **Construction de phrase (Sentence Builder) :** L'utilisateur doit remettre des mots-étiquettes dans le bon ordre pour traduire une phrase.
  - **Paires (Pair Matching) :** Relier des mots thaïs à leurs équivalents français.
  
- **Les choix de l'utilisateur (Étape par Étape) :**
  - L'utilisateur peut parfois écouter la prononciation en cliquant sur l'icône de haut-parleur (TTS).
  - Il sélectionne sa réponse.
  - Le gros bouton principal en bas de l'écran, initialement grisé ("Vérifier"), s'active et devient cliquable.
  - **Action :** Il clique sur **"Vérifier"**.
  
- **Résolution et Feedback :**
  - **Cas A (Bonne réponse) :** Un bandeau de succès vert (footer) apparaît depuis le bas. Un son de "ding" positif retentit. Le bouton affiche **"Continuer"**.
  - **Cas B (Mauvaise réponse) :** Un bandeau d'erreur rouge apparaît en bas, et affiche explicitement la **Solution correcte**. Un son d'erreur retentit. L'utilisateur a l'obligation de lire la correction. Le bouton affiche **"Continuer"**.
  
- **Action :** L'utilisateur clique sur **"Continuer"**. L'exercice suivant apparaît. S'il a eu bon, la barre de progression avance.

## 3. Fin de la leçon (Écran de Récapitulatif)
- Une fois la barre de progression remplie (dernier exercice validé), un écran de succès et de récapitulatif (`LessonComplete` ou écran de fin) apparaît.
- **Ce qu'il voit (Écran de Complétion) :**
  - Une animation visuelle de succès.
  - Un message célébrant la fin du niveau.
  - **Gain d'XP :** Le chiffre **+30 XP** s'affiche en grand (c'est la récompense standard de l'application pour avoir complété un Niveau de 1 à 7 pour la toute première fois de la journée). *Note : si la leçon est découpée en "Parts", cela peut être +10 XP.*
  
- **Boutons disponibles à la fin :**
  - Un gros bouton principal d'action : **"Continuer"**.
  
- **Action :** L'utilisateur clique sur le bouton **"Continuer"** pour valider son score, sauvegarder en base de données et retourner à la carte principale.

## 4. Retour au parcours (Conséquences sur l'interface)
- **Retour sur la Timeline :** L'utilisateur est redirigé vers `/learn`.
- **Ce qu'il voit :**
  - L'application gère le défilement et centre l'écran sur le nœud de la leçon qu'il vient de terminer (Auto-Scroll).
  - **Progression Visuelle :** La bordure de la carte de la leçon (`SegmentedProgressBorder`) affiche un segment coloré sur les 10 disponibles (indiquant 1/10 niveaux terminés).
- **Prochaine Action possible :**
  - S'il clique à nouveau sur la leçon, la carte se déploie à nouveau. Cette fois-ci, le bouton principal n'indique plus "Commencer l'apprentissage" mais **"Continuer"** (l'invitant implicitement à démarrer le Niveau 2). Il peut aussi voir un badge indiquant "En cours".
