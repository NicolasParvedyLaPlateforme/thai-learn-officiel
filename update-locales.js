const fs = require('fs');
const locales = ['fr', 'en', 'es', 'de', 'it'];
for (const locale of locales) {
  const path = `./src/locales/${locale}.json`;
  const data = JSON.parse(fs.readFileSync(path, 'utf8'));
  data['auto.exercise.trueFalse'] = locale === 'fr' ? 'Le mot est-il correctement écrit ?' : locale === 'en' ? 'Is the word spelled correctly?' : locale === 'es' ? '¿Está bien escrita la palabra?' : locale === 'de' ? 'Ist das Wort richtig geschrieben?' : 'La parola è scritta correttamente?';
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}
