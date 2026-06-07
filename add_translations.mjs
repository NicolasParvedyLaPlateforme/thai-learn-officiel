import fs from 'fs';
import path from 'path';

const localesDir = 'app/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newTranslations = {
  fr: {
    "auto.your_progress_will_be_saved": "Votre progression est sauvegardée. Vous pourrez revenir à tout moment pour terminer cet exercice.",
    "auto.quit_lesson": "Quitter la leçon ?",
    "auto.resume_lesson": "Partie en cours",
    "auto.resume_lesson_desc": "Vous avez commencé ce niveau précédemment. Voulez-vous reprendre là où vous en étiez ?",
    "auto.resume_button": "Reprendre la partie",
    "auto.restart_button": "Recommencer à zéro"
  },
  en: {
    "auto.your_progress_will_be_saved": "Your progress is saved. You can return at any time to finish this exercise.",
    "auto.quit_lesson": "Quit lesson?",
    "auto.resume_lesson": "Lesson in progress",
    "auto.resume_lesson_desc": "You started this level previously. Do you want to resume where you left off?",
    "auto.resume_button": "Resume lesson",
    "auto.restart_button": "Start over"
  },
  de: {
    "auto.your_progress_will_be_saved": "Dein Fortschritt wird gespeichert. Du kannst jederzeit zurückkehren, um diese Übung zu beenden.",
    "auto.quit_lesson": "Lektion verlassen?",
    "auto.resume_lesson": "Lektion in Bearbeitung",
    "auto.resume_lesson_desc": "Du hast dieses Level bereits begonnen. Möchtest du dort weitermachen, wo du aufgehört hast?",
    "auto.resume_button": "Lektion fortsetzen",
    "auto.restart_button": "Neu starten"
  },
  es: {
    "auto.your_progress_will_be_saved": "Tu progreso se ha guardado. Puedes volver en cualquier momento para terminar este ejercicio.",
    "auto.quit_lesson": "¿Salir de la lección?",
    "auto.resume_lesson": "Lección en progreso",
    "auto.resume_lesson_desc": "Comenzaste este nivel anteriormente. ¿Quieres reanudar donde lo dejaste?",
    "auto.resume_button": "Reanudar lección",
    "auto.restart_button": "Empezar de nuevo"
  },
  it: {
    "auto.your_progress_will_be_saved": "I tuoi progressi sono salvati. Puoi tornare in qualsiasi momento per finire questo esercizio.",
    "auto.quit_lesson": "Uscire dalla lezione?",
    "auto.resume_lesson": "Lezione in corso",
    "auto.resume_lesson_desc": "Hai iniziato questo livello in precedenza. Vuoi riprendere da dove eri rimasto?",
    "auto.resume_button": "Riprendi lezione",
    "auto.restart_button": "Ricomincia"
  }
};

files.forEach(file => {
  const lang = path.basename(file, '.json');
  const filePath = path.join(localesDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  
  if (newTranslations[lang]) {
    let changed = false;
    for (const [key, value] of Object.entries(newTranslations[lang])) {
      if (!data[key]) {
        data[key] = value;
        changed = true;
      }
    }
    if (changed) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`Updated ${file}`);
    }
  }
});
