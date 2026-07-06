# Parcours Utilisateur : Niveau 7 d'une Leçon (Section /learn)

Ce document décrit étape par étape le parcours complet d'un utilisateur lorsqu'il effectue le Niveau 7 d'une leçon dans la section Apprentissage (`/learn`).

## 1. Déclenchement de la leçon (La Timeline)
- **Où se trouve l'utilisateur ?** Sur la page d'accueil de la section `/learn`.
- **Ce qu'il voit :** L'utilisateur voit le nœud de la leçon, qui affiche déjà un avancement partiel (6/10).
- **Action :** L'utilisateur clique sur le nœud de la leçon.
- **Résultat :** Une carte d'information se déploie (le composant `SharedLessonCard`).
- **Boutons disponibles :**
  - Le bouton principal d'action affiche **"Continuer"** (car l'utilisateur a déjà complété des niveaux précédents).
- **Action :** L'utilisateur clique sur **"Continuer"**. L'application le redirige vers l'URL de la leçon correspondante (`/lesson/ID_DE_LA_LECON?level=7`).

## 2. Pendant l'exercice (Le cœur de la leçon)
- **Interface globale :** 
  - Toujours composée de la barre de progression en haut, la croix pour quitter, la zone de question (`QuestionArea`) au centre, et la zone de réponse en bas.
  
- **Types d'exercices et Objectifs (Spécificité du Niveau 7) :**
  - L'utilisateur révise l'ensemble du vocabulaire et des phrases de la leçon avec très peu d'indices. L'exercice principal reste le Sentence Builder complexe.
  
- **Les choix de l'utilisateur (Étape par Étape) :**
  - L'utilisateur lit la question ou écoute l'audio.
  - Il sélectionne, glisse-dépose ou **tape** sa réponse (selon l'exercice).
  - Le bouton principal en bas de l'écran s'active.
  - **Action :** Il clique sur **"Vérifier"**.
  
- **Résolution et Feedback :**
  - **Cas A (Bonne réponse) :** Un bandeau de succès vert (footer) apparaît depuis le bas. Un son de succès retentit. Le bouton affiche **"Continuer"**.
  - **Cas B (Mauvaise réponse) :** Un bandeau d'erreur rouge apparaît en bas, et affiche explicitement la **Solution correcte**. Un son d'erreur retentit. Le bouton affiche **"Continuer"**.
  
- **Action :** L'utilisateur clique sur **"Continuer"** pour passer à l'exercice suivant.

## 3. Fin de la leçon (Écran de Récapitulatif)
- Une fois la barre de progression remplie (dernier exercice validé), l'écran de fin (`LessonComplete`) apparaît.
- **Ce qu'il voit (Écran de Complétion) :**
  - Une animation visuelle de succès.
  - Un message célébrant la fin du niveau 7.
  - **Gain d'XP :** Le chiffre **+30 XP** s'affiche en grand (la récompense standard de l'application pour avoir complété le Niveau 7 pour la toute première fois de la journée).
  
- **Boutons disponibles à la fin :**
  - Un gros bouton principal d'action : **"Continuer"**.
  
- **Action :** L'utilisateur clique sur le bouton **"Continuer"** pour valider son score, sauvegarder en base de données et retourner à la carte principale.

## 4. Retour au parcours (Conséquences sur l'interface)
- **Retour sur la Timeline :** L'utilisateur est redirigé vers `/learn`.
- **Ce qu'il voit :**
  - L'application gère le défilement et centre l'écran sur le nœud de la leçon qu'il vient de terminer (Auto-Scroll).
  - **Progression Visuelle :** La bordure de la carte de la leçon (`SegmentedProgressBorder`) affiche désormais 7/10 segments colorés.
- **Prochaine Action possible :**
  - S'il clique à nouveau sur la leçon, la carte se déploie. Le bouton affiche toujours **"Continuer"** pour l'inviter à démarrer le Niveau 8.