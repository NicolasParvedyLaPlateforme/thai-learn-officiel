import fs from 'fs';
import path from 'path';

const localesDir = path.join(process.cwd(), 'app', 'locales');
const locales = ['fr', 'en', 'es', 'it', 'de'];
const translations = {
  fr: 'Pensez au moyen mnémotechnique : "{0}"',
  en: 'Think of the visual mnemonic: "{0}"',
  es: 'Piensa en la mnemotecnia visual: "{0}"',
  it: 'Pensa alla mnemonica visiva: "{0}"',
  de: 'Denk an die visuelle Eselsbrücke: "{0}"'
};

locales.forEach(l => {
  const file = path.join(localesDir, l + '.json');
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  data['alphabet.think_mnemonic'] = translations[l];
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
});
