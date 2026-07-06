const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'src', 'locales');
const files = [
  { file: 'fr.json', translation: '(Mot manquant : {word})' },
  { file: 'en.json', translation: '(Missing: {word})' },
  { file: 'de.json', translation: '(Fehlendes Wort: {word})' },
  { file: 'es.json', translation: '(Palabra que falta: {word})' },
  { file: 'it.json', translation: '(Parola mancante: {word})' }
];

for (const { file, translation } of files) {
  const filePath = path.join(localesDir, file);
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    const json = JSON.parse(data);
    json['exercise.missing_word'] = translation;
    fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
    console.log(`Updated ${file}`);
  } catch (err) {
    console.error(`Error updating ${file}:`, err);
  }
}
