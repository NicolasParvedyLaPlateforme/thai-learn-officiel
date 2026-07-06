const fs = require('fs');
const path = require('path');

const dir = 'c:/xampp/htdocs/thai-learn-officiel/parcours_utilisateur/learn';

const levelsData = {
  2: { xp: 30, fraction: '2/10', exercises: "L'utilisateur fait face à des QCM avancés (WordMatch avec des distracteurs trompeurs) et des phrases à trous (FillInTheBlank) basiques. Il commence à voir les mots en contexte dans des phrases simples." },
  3: { xp: 30, fraction: '3/10', exercises: "L'utilisateur consolide ses acquis avec des QCM et des phrases à trous. C'est aussi l'apparition de la construction de phrases simples (Sentence Builder sans mots parasites), où il doit remettre les mots dans l'ordre." },
  4: { xp: 30, fraction: '4/10', exercises: "L'utilisateur travaille principalement sur la construction de phrases (Sentence Builder). La difficulté augmente car des mots parasites (distracteurs) sont introduits parmi les étiquettes de mots." },
  5: { xp: 30, fraction: '5/10', exercises: "L'utilisateur s'entraîne sur des constructions de phrases plus complexes et des traductions inversées. L'accent est mis sur la mémorisation auditive et visuelle avec des distracteurs phonétiquement similaires." },
  6: { xp: 30, fraction: '6/10', exercises: "L'utilisateur fait face à une combinaison d'exercices exigeants : QCM chronométrés mentalement, phrases à trous avec plusieurs mots manquants et constructions de phrases avec de nombreux distracteurs." },
  7: { xp: 30, fraction: '7/10', exercises: "L'utilisateur révise l'ensemble du vocabulaire et des phrases de la leçon avec très peu d'indices. L'exercice principal reste le Sentence Builder complexe." },
  8: { xp: 50, fraction: '8/10', exercises: "C'est un cap de difficulté. L'utilisateur commence à faire face à des exercices d'écriture libre (FreeTyping) où il doit taper la réponse directement au clavier sans l'aide d'étiquettes, testant sa mémoire profonde." },
  9: { xp: 100, fraction: '9/10', exercises: "L'utilisateur est testé presque exclusivement via l'écriture libre (Free Typing) et la traduction complète. Il doit pouvoir formuler les phrases et mots de la leçon de tête." },
  10: { xp: 300, fraction: '10/10', exercises: "C'est l'examen final (Maîtrise). L'utilisateur doit compléter une longue série d'exercices d'écriture libre (Free Typing) sans droit à l'erreur (ou très peu). Il doit prouver sa maîtrise parfaite du vocabulaire et des phrases." },
};

for (let level = 2; level <= 10; level++) {
  const data = levelsData[level];
  const isMaxLevel = level === 10;
  
  let md = `# Parcours Utilisateur : Niveau ${level} d'une Leçon (Section /learn)

Ce document décrit étape par étape le parcours complet d'un utilisateur lorsqu'il effectue le Niveau ${level} d'une leçon dans la section Apprentissage (\`/learn\`).

## 1. Déclenchement de la leçon (La Timeline)
- **Où se trouve l'utilisateur ?** Sur la page d'accueil de la section \`/learn\`.
- **Ce qu'il voit :** L'utilisateur voit le nœud de la leçon, qui affiche déjà un avancement partiel (${level - 1}/10).
- **Action :** L'utilisateur clique sur le nœud de la leçon.
- **Résultat :** Une carte d'information se déploie (le composant \`SharedLessonCard\`).
- **Boutons disponibles :**
  - Le bouton principal d'action affiche **"Continuer"** (car l'utilisateur a déjà complété des niveaux précédents).
- **Action :** L'utilisateur clique sur **"Continuer"**. L'application le redirige vers l'URL de la leçon correspondante (\`/lesson/ID_DE_LA_LECON?level=${level}\`).

## 2. Pendant l'exercice (Le cœur de la leçon)
- **Interface globale :** 
  - Toujours composée de la barre de progression en haut, la croix pour quitter, la zone de question (\`QuestionArea\`) au centre, et la zone de réponse en bas.
  
- **Types d'exercices et Objectifs (Spécificité du Niveau ${level}) :**
  - ${data.exercises}
  
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
- Une fois la barre de progression remplie (dernier exercice validé), l'écran de fin (\`LessonComplete\`) apparaît.
- **Ce qu'il voit (Écran de Complétion) :**
  - Une animation visuelle de succès.
  - Un message célébrant la fin du niveau ${level}.
  - **Gain d'XP :** Le chiffre **+${data.xp} XP** s'affiche en grand (la récompense standard de l'application pour avoir complété le Niveau ${level} pour la toute première fois de la journée).`;

  if (isMaxLevel) {
    md += `\n  - 🎉 **Mention spéciale :** Comme c'est le niveau 10, le joueur voit un message de **Maîtrise totale** de la leçon.`;
  }

  md += `
  
- **Boutons disponibles à la fin :**
  - Un gros bouton principal d'action : **"Continuer"**.
  
- **Action :** L'utilisateur clique sur le bouton **"Continuer"** pour valider son score, sauvegarder en base de données et retourner à la carte principale.

## 4. Retour au parcours (Conséquences sur l'interface)
- **Retour sur la Timeline :** L'utilisateur est redirigé vers \`/learn\`.
- **Ce qu'il voit :**
  - L'application gère le défilement et centre l'écran sur le nœud de la leçon qu'il vient de terminer (Auto-Scroll).`;

  if (isMaxLevel) {
    md += `\n  - **Progression Visuelle :** La bordure est maintenant 100% remplie (${data.fraction}). Un badge **"Maîtrisé"** ou une **Couronne** apparaît sur le nœud. Le bouton principal change d'état et affiche désormais **"Réviser"**.`;
  } else {
    md += `\n  - **Progression Visuelle :** La bordure de la carte de la leçon (\`SegmentedProgressBorder\`) affiche désormais ${data.fraction} segments colorés.`;
  }

  md += `\n- **Prochaine Action possible :**`;

  if (isMaxLevel) {
    md += `\n  - S'il clique à nouveau sur la leçon, la carte se déploie. Le bouton indique maintenant **"Réviser"**. S'il y a un Niveau Ultime, il peut également s'y attaquer pour gagner la récompense suprême (1000 XP).`;
  } else {
    md += `\n  - S'il clique à nouveau sur la leçon, la carte se déploie. Le bouton affiche toujours **"Continuer"** pour l'inviter à démarrer le Niveau ${level + 1}.`;
  }

  fs.writeFileSync(path.join(dir, `niveau_${level}.md`), md, 'utf8');
}
console.log('Fichiers réécrits avec succès !');
