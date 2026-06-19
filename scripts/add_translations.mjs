import fs from 'fs';
import path from 'path';

const localesDir = 'app/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json'));

const newTranslations = {
  fr: {
    "auto.words": "Mots",
    "auto.phrases": "Phrases",
    "auto.access_levels": "Accéder aux niveaux",
    "auto.start_learning": "Commencer",
    "auto.unlock_levels_for_words": "Débloquez plus de niveaux pour voir les mots.",
    "auto.unlock_levels_for_phrases": "Débloquez plus de niveaux pour voir les phrases."
  },
  en: {
    "auto.words": "Words",
    "auto.phrases": "Phrases",
    "auto.access_levels": "Access Levels",
    "auto.start_learning": "Start",
    "auto.unlock_levels_for_words": "Unlock more levels to see the words.",
    "auto.unlock_levels_for_phrases": "Unlock more levels to see the phrases."
  },
  de: {
    "auto.words": "Wörter",
    "auto.phrases": "Sätze",
    "auto.access_levels": "Level aufrufen",
    "auto.start_learning": "Starten",
    "auto.unlock_levels_for_words": "Schalte weitere Level frei, um Wörter zu sehen.",
    "auto.unlock_levels_for_phrases": "Schalte weitere Level frei, um Sätze zu sehen."
  },
  es: {
    "auto.words": "Palabras",
    "auto.phrases": "Frases",
    "auto.access_levels": "Acceder a niveles",
    "auto.start_learning": "Empezar",
    "auto.unlock_levels_for_words": "Desbloquea más niveles para ver las palabras.",
    "auto.unlock_levels_for_phrases": "Desbloquea más niveles para ver las frases."
  },
  it: {
    "auto.words": "Parole",
    "auto.phrases": "Frasi",
    "auto.access_levels": "Accedi ai livelli",
    "auto.start_learning": "Inizia",
    "auto.unlock_levels_for_words": "Sblocca altri livelli per vedere le parole.",
    "auto.unlock_levels_for_phrases": "Sblocca altri livelli per vedere le frasi."
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
